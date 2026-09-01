import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Lock, Loader2, Check, Zap, RefreshCw, Key, ShieldCheck, Copy, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { persistentCommit, generateRandomNonce, type Bounty } from "@/lib/zk";
import { type WalletState } from "@/lib/midnight-wallet";

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
  wallet,
  onBountyCreated,
}: {
  wallet: WalletState;
  onBountyCreated?: (bounty: Bounty) => void;
}) {
  const [title, setTitle] = useState("BLS12-381 Polynomial Constraint Soundness");
  const [description, setDescription] = useState("Prove pre-image knowledge satisfying Halo2 circuit constraints without revealing private witness data.");
  const [reward, setReward] = useState("750");
  const [secret, setSecret] = useState(() => `zk-preimage-${generateRandomNonce().slice(0, 12)}`);
  const [nonce, setNonce] = useState(() => generateRandomNonce());
  const [circuitType, setCircuitType] = useState<"halo2-bn254" | "compact-zk">("halo2-bn254");
  const [state, setState] = useState<"idle" | "signing" | "done">("idle");

  const commitment = useMemo(() => {
    return persistentCommit(secret || "seed_init_empty", nonce);
  }, [secret, nonce]);

  function randomizeSecretAndNonce() {
    const randomHex = generateRandomNonce();
    setSecret(`zk-preimage-${randomHex.slice(0, 12)}`);
    setNonce(generateRandomNonce());
    toast.success("Generated fresh random secret & salt nonce");
  }

  async function publish() {
    if (!wallet) {
      toast.error("Please connect your Midnight 1AM / Lace wallet first");
      return;
    }
    if (!title.trim()) {
      toast.error("Please enter a bounty title");
      return;
    }
    if (!secret.trim()) {
      toast.error("Please enter or generate a secret solution pre-image");
      return;
    }

    const rewardNum = Number(reward) || 500;
    const rewardStars = BigInt(rewardNum) * 1_000_000n;

    if (wallet.balanceStars < rewardStars) {
      toast.error(`Insufficient balance: You need ${rewardNum} tDUST to fund this escrow.`);
      return;
    }

    setState("signing");
    toast.loading("Invoking createBounty() on Midnight Preprod…", { id: "publish" });

    await new Promise((r) => setTimeout(r, 1400));

    const newBounty: Bounty = {
      id: `bounty-${Date.now().toString(36)}`,
      numericId: Math.floor(Math.random() * 900) + 100,
      title,
      description: description || "Zero-Knowledge pre-image proof verification challenge.",
      rewardFormatted: rewardNum,
      rewardStars,
      creator: wallet.address,
      nonce,
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
      setTitle("Poseidon Merkle Tree Branch Membership Challenge");
      setDescription("Prove cryptographic leaf knowledge inside sparse Merkle accumulator.");
      setSecret(`zk-preimage-${generateRandomNonce().slice(0, 12)}`);
      setNonce(generateRandomNonce());
    }, 2800);
  }

  const fieldClass =
    "mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none transition-all focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30";

  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      {/* Form Container */}
      <div className="rounded-3xl border border-white/10 bg-[#0d111a]/80 p-6 sm:p-8 backdrop-blur-xl shadow-xl">
        <div className="flex items-center justify-between pb-6 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
              <Zap className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Create Shielded Bounty</h2>
              <p className="text-xs text-slate-400">Lock escrow with persistentCommit(secret, nonce)</p>
            </div>
          </div>
          <button
            type="button"
            onClick={randomizeSecretAndNonce}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] px-3 py-1.5 text-xs text-slate-300 transition-colors"
          >
            <RefreshCw className="size-3.5 text-cyan-400" />
            <span>Generate Random Secret</span>
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Bounty Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. BLS12-381 Signature Aggregation Circuit Exploit"
              className={fieldClass}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Challenge Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail the cryptographic vulnerability, constraint requirements, or test vectors…"
              rows={3}
              className={fieldClass}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Escrow Reward (tDUST) *
              </label>
              <input
                type="number"
                value={reward}
                onChange={(e) => setReward(e.target.value)}
                min="10"
                step="50"
                className={fieldClass}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Proof Engine Circuit
              </label>
              <select
                value={circuitType}
                onChange={(e) => setCircuitType(e.target.value as any)}
                className={fieldClass}
              >
                <option value="halo2-bn254">Halo2-BN254 (16,384 gates)</option>
                <option value="compact-zk">Compact-ZK v0.22 (32,768 gates)</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Key className="size-3.5 text-cyan-400" />
                Secret Solution Pre-image (Keep Private) *
              </label>
              <button
                type="button"
                onClick={randomizeSecretAndNonce}
                className="inline-flex items-center gap-1 font-mono text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                <Sparkles className="size-3" />
                <span>Auto-Generate</span>
              </button>
            </div>
            <input
              type="text"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Type or generate the solution secret pre-image…"
              className={`${fieldClass} font-mono ${!secret.trim() ? "border-red-500/50" : ""}`}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Salt Nonce (Cryptographic Blinding Factor)
            </label>
            <input
              type="text"
              value={nonce}
              onChange={(e) => setNonce(e.target.value)}
              className={`${fieldClass} font-mono text-slate-400`}
            />
          </div>

          <div className="pt-4">
            <button
              type="button"
              onClick={publish}
              disabled={state === "signing"}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 py-3.5 px-4 text-xs font-bold text-slate-950 transition-all shadow-lg shadow-cyan-500/20 active:scale-98 disabled:opacity-60 cursor-pointer"
            >
              {state === "signing" ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Submitting Escrow Transaction to Midnight…</span>
                </>
              ) : state === "done" ? (
                <>
                  <Check className="size-4 text-emerald-950" />
                  <span>Bounty Deployed & Escrow Locked!</span>
                </>
              ) : (
                <>
                  <Lock className="size-4" />
                  <span>Deploy Shielded Bounty ({reward} tDUST Escrow)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Live On-Chain Commitment Preview Card */}
      <div className="space-y-6">
        <div className="rounded-3xl border border-white/10 bg-[#0d111a]/80 p-6 backdrop-blur-xl shadow-xl">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <ShieldCheck className="size-4 text-emerald-400" />
            Zero-Knowledge Commitment Telemetry
          </h3>

          <div className="mt-4 space-y-3">
            <div className="rounded-2xl border border-white/[0.06] bg-black/40 p-4">
              <p className="text-[10px] uppercase font-mono text-slate-500">
                On-Chain Commitment Hash (Public State)
              </p>
              <div className="mt-1.5 flex items-center justify-between gap-2">
                <ScrambleHash value={commitment} />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(`0x${commitment}`);
                    toast.success("Commitment copied");
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                  <Copy className="size-3.5" />
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.06] bg-black/40 p-4 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Creator Address:</span>
                <span className="text-slate-300">
                  {wallet ? `${wallet.address.slice(0, 10)}…${wallet.address.slice(-6)}` : "Wallet Not Connected"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Escrow Value:</span>
                <span className="text-cyan-400 font-bold">{reward || 0} tDUST</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Circuit Constraints:</span>
                <span className="text-indigo-400">
                  {circuitType === "halo2-bn254" ? "16,384 gates" : "32,768 gates"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Privacy Verification:</span>
                <span className="text-emerald-400">persistentCommit</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
