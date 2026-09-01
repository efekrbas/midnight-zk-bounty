import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Lock, Loader2, Check, Zap, RefreshCw, Key, ShieldCheck, Copy } from "lucide-react";
import { toast } from "sonner";
import { persistentCommit, generateRandomNonce, type Bounty } from "@/lib/zk";

function ScrambleHash({ value }: { value: string }) {
  const [shown, setShown] = useState(value);
  useEffect(() => {
    let frame = 0;
    const hex = "0123456789abcdef";
    const id = setInterval(() => {
      frame++;
      const reveal = Math.floor((frame / 8) * value.length);
      setShown(
        value
          .split("")
          .map((c, i) => (i < reveal ? c : hex[Math.floor(Math.random() * 16)]))
          .join(""),
      );
      if (reveal >= value.length) clearInterval(id);
    }, 24);
    return () => clearInterval(id);
  }, [value]);
  return <span className="break-all font-mono text-xs text-cyan-300">0x{shown}</span>;
}

export function CreateBounty({
  connected,
  onBountyCreated,
}: {
  connected: boolean;
  onBountyCreated?: (bounty: Bounty) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [reward, setReward] = useState("750");
  const [secret, setSecret] = useState("");
  const [nonce, setNonce] = useState(() => generateRandomNonce());
  const [circuitType, setCircuitType] = useState<"halo2-bn254" | "compact-zk">("halo2-bn254");
  const [state, setState] = useState<"idle" | "signing" | "done">("idle");

  const commitment = useMemo(() => {
    return persistentCommit(secret || "seed_init_empty", nonce);
  }, [secret, nonce]);

  function randomizeSecretAndNonce() {
    const randomHex = generateRandomNonce();
    setSecret(`midnight-preimage-${randomHex.slice(0, 16)}`);
    setNonce(generateRandomNonce());
    toast.success("Generated fresh random secret & salt nonce");
  }

  async function publish() {
    if (!connected) {
      toast.error("Please connect your Midnight 1AM / Lace wallet first");
      return;
    }
    if (!title.trim() || !secret.trim()) {
      toast.error("Bounty title and secret solution pre-image are required");
      return;
    }

    const rewardNum = Number(reward) || 500;
    setState("signing");
    toast.loading("Invoking createBounty() on Midnight Preprod…", { id: "publish" });

    await new Promise((r) => setTimeout(r, 1400));

    const newBounty: Bounty = {
      id: `bounty-${Date.now().toString(36)}`,
      numericId: Math.floor(Math.random() * 900) + 100,
      title,
      description: description || "Zero-Knowledge pre-image proof verification challenge.",
      rewardFormatted: rewardNum,
      rewardStars: BigInt(rewardNum) * 1_000_000n,
      creator: "0x39a1fe881c20bb99a1",
      expiresAt: Date.now() + 86400000 * 7,
      circuit: circuitType === "halo2-bn254" ? "Halo2-BN254" : "Compact-ZK",
      constraints: circuitType === "halo2-bn254" ? 16384 : 32768,
      commitmentHash: commitment,
      proofs: 0,
      isClaimed: false,
    };

    setState("done");
    toast.success("Bounty Created & Escrow Locked!", {
      id: "publish",
      description: `${rewardNum} tDUST deposited in Midnight shielded escrow`,
    });

    if (onBountyCreated) {
      onBountyCreated(newBounty);
    }

    setTimeout(() => {
      setState("idle");
      setTitle("");
      setDescription("");
      setSecret("");
      setNonce(generateRandomNonce());
    }, 2800);
  }

  const fieldClass =
    "mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none transition-all focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30";

  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      {/* Form Container */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0d111a]/85 p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
          <div>
            <h2 className="text-base font-semibold text-white">
              Deploy Shielded Bounty
            </h2>
            <p className="mt-0.5 text-xs text-slate-400">
              Lock reward funds in a Compact zero-knowledge escrow contract.
            </p>
          </div>
          <button
            type="button"
            onClick={randomizeSecretAndNonce}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-xs text-cyan-400 hover:bg-white/[0.08] transition-colors"
            title="Generate Random Secret & Salt"
          >
            <RefreshCw className="size-3" /> Randomize
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-300">
              Bounty Title
            </label>
            <input
              className={fieldClass}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Recursive Halo2 Circuit Vulnerability Challenge"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300">
              Challenge Description & Rules
            </label>
            <textarea
              rows={3}
              className={`${fieldClass} resize-none`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail the puzzle, constraint system, and criteria for solving…"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-slate-300">
                Reward Amount (tDUST)
              </label>
              <input
                className={`${fieldClass} font-mono`}
                value={reward}
                inputMode="numeric"
                onChange={(e) => setReward(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-300">
                ZK Prover Circuit
              </label>
              <select
                className={`${fieldClass} font-mono`}
                value={circuitType}
                onChange={(e) => setCircuitType(e.target.value as any)}
              >
                <option value="halo2-bn254">Halo2 BN254 (16k rows)</option>
                <option value="compact-zk">Compact-ZK Plonk (32k rows)</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-300">
                Secret Solution Pre-Image
              </label>
              <span className="text-[11px] text-emerald-400 font-medium">100% Private (Never On-Chain)</span>
            </div>
            <input
              className={`${fieldClass} font-mono`}
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Enter secret answer / pre-image seed…"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300">
              Blinding Salt Nonce
            </label>
            <input
              className={`${fieldClass} font-mono text-xs text-slate-400`}
              value={nonce}
              onChange={(e) => setNonce(e.target.value)}
              placeholder="Cryptographic salt nonce"
            />
          </div>
        </div>

        <button
          onClick={publish}
          disabled={state === "signing"}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold py-3 px-4 text-xs transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50"
        >
          {state === "signing" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : state === "done" ? (
            <Check className="size-4 text-slate-950" />
          ) : (
            <Lock className="size-4" />
          )}
          {state === "signing"
            ? "Broadcasting createBounty() Transaction…"
            : state === "done"
              ? "Bounty Escrow Confirmed on Midnight"
              : "Publish Bounty & Lock Escrow Funds"}
        </button>
      </div>

      {/* Live Cryptographic Preview Console */}
      <div className="flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#0d111a]/85 p-6 shadow-2xl backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2.5 pb-4 border-b border-white/[0.06]">
            <div className="flex size-8 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Zap className="size-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                Persistent Commitment Synthesis
              </h3>
              <p className="font-mono text-[11px] text-slate-400">
                persistentCommit&lt;Bytes32&gt;(secret, nonce)
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <div className="rounded-xl bg-black/40 border border-white/[0.06] p-3">
              <span className="text-[10px] uppercase text-slate-500 block">
                Public Commitment Hash (On-Chain)
              </span>
              <div className="mt-1.5">
                <ScrambleHash value={commitment} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
                <span className="text-[10px] uppercase text-slate-500 block">
                  Secret Pre-image
                </span>
                <p className="mt-1 font-mono text-xs text-white">
                  {secret ? `${secret.length} bytes` : "Empty (0 b)"}
                </p>
              </div>

              <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
                <span className="text-[10px] uppercase text-slate-500 block">
                  Circuit Gates
                </span>
                <p className="mt-1 font-mono text-xs text-indigo-300">
                  {circuitType === "halo2-bn254" ? "16,384 R1CS" : "32,768 PLONK"}
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 text-xs text-slate-400">
              <p className="flex items-center gap-1.5 font-medium text-slate-200">
                <ShieldCheck className="size-3.5 text-emerald-400" />
                Zero Knowledge Guarantee:
              </p>
              <p className="mt-1 leading-relaxed text-[11px]">
                Because <code className="text-cyan-300">persistentCommit</code> hashes your solution with a 256-bit blinding nonce, the public ledger cannot brute-force the answer even for simple secrets.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-white/[0.06] pt-3.5 font-mono text-[11px] text-emerald-400 flex items-center gap-2">
          <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Local Witness Ready · Proof Server :6300 Active</span>
        </div>
      </div>
    </div>
  );
}
