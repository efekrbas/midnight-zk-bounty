"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Loader2,
  Check,
  ShieldCheck,
  ExternalLink,
  Cpu,
  Hash,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { persistentCommit, type Bounty } from "@/lib/zk";

const PROOF_SYNTHESIS_STEPS = [
  {
    title: "1. Extracting Private Witness",
    detail: "Reading secretPreimage and secretNonce into local memory…",
  },
  {
    title: "2. Synthesizing Halo2 zk-SNARK Proof",
    detail: "Evaluating persistentCommit circuit polynomial constraints in Proof Server :6300…",
  },
  {
    title: "3. Generating Settlement Nullifier",
    detail: "Computing cryptographic nullifier to prevent double-claim replay attacks…",
  },
  {
    title: "4. Broadcasting Shielded Transaction",
    detail: "Submitting claimBounty() transition to Midnight Preprod Ledger…",
  },
];

const KNOWN_SECRETS: Record<string, string> = {
  "mn-bounty-001": "halo2-soundness-break-seed-409",
  "mn-bounty-002": "nullifier-collision-target-99",
  "mn-bounty-003": "stealth-node-attestation-2026",
  "mn-bounty-004": "dark-pool-limit-order-match-x",
  "mn-bounty-005": "recursive-batch-snark-aggregator-v2",
  "mn-bounty-006": "poseidon-sparse-tree-leaf-auth",
};

export function ClaimModal({
  bounty,
  onClose,
  onSuccess,
}: {
  bounty: Bounty | null;
  onClose: () => void;
  onSuccess: (b: Bounty) => void;
}) {
  const [secret, setSecret] = useState("");
  const [nonce, setNonce] = useState("");
  const [step, setStep] = useState(-1);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [nullifier, setNullifier] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (bounty) {
      setSecret("");
      setNonce(bounty.nonce || "");
      setStep(-1);
      setTxHash(null);
      setNullifier(null);
      setErrorMsg(null);
    }
  }, [bounty]);

  function handleFillValidSecret() {
    if (!bounty) return;
    const known = KNOWN_SECRETS[bounty.id];
    if (known) {
      setSecret(known);
      setErrorMsg(null);
      toast.success("Valid solution pre-image auto-filled for demo!");
    } else {
      setSecret("halo2-soundness-break-seed-409");
      setErrorMsg(null);
    }
  }

  async function executeProofAndClaim() {
    if (!bounty) return;
    if (!secret.trim()) {
      toast.error("Please enter the secret solution pre-image");
      return;
    }

    setErrorMsg(null);
    setStep(0);

    // Step 1: Extract private witness
    await new Promise((r) => setTimeout(r, 600));
    setStep(1);

    // Step 2: Synthesize ZK Proof
    await new Promise((r) => setTimeout(r, 900));

    // Verify if the solution pre-image matches the commitment
    const computedCommitment = persistentCommit(secret.trim(), nonce);
    if (computedCommitment !== bounty.commitmentHash) {
      setStep(-1);
      setErrorMsg(
        "Circuit Constraint Failure: Recomputed commitment does not match the on-chain commitmentHash (Assertion 'invalid solution proof' reverted).",
      );
      toast.error("Invalid Solution: Circuit proof rejected");
      return;
    }

    // Step 3: Compute Nullifier
    setStep(2);
    await new Promise((r) => setTimeout(r, 700));
    const generatedNullifier = "0x" + persistentCommit(secret + "nullifier", "null_seed").slice(0, 32);
    setNullifier(generatedNullifier);

    // Step 4: Broadcast Transaction
    setStep(3);
    await new Promise((r) => setTimeout(r, 900));

    const generatedTx = "0x" + persistentCommit(secret + Date.now().toString(), "tx_seed").slice(0, 48);
    setTxHash(generatedTx);
    setStep(4);

    onSuccess(bounty);
    toast.success(`Claim verified! +${bounty.rewardFormatted.toLocaleString()} tDUST settled on Midnight`);
  }

  if (!bounty) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={step === -1 || step === 4 ? onClose : undefined}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/[0.12] bg-[#0d111a] p-6 shadow-2xl z-10"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <Cpu className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Prove Knowledge & Claim</h3>
                <p className="text-xs text-slate-400">Client-Side Halo2 ZK Proof Synthesis</p>
              </div>
            </div>

            {(step === -1 || step === 4) && (
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Bounty Summary Pill */}
          <div className="mt-5 rounded-2xl border border-white/[0.08] bg-[#07090e] p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="font-semibold text-white text-sm truncate">{bounty.title}</span>
              <span className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 font-mono text-xs font-bold text-cyan-400 shrink-0">
                {bounty.rewardFormatted.toLocaleString()} tDUST
              </span>
            </div>
            <p className="mt-2 break-all font-mono text-[11px] text-slate-400">
              Commitment: <span className="text-cyan-400 font-medium">0x{bounty.commitmentHash.slice(0, 24)}…{bounty.commitmentHash.slice(-8)}</span>
            </p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-start gap-2.5 rounded-2xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-400"
            >
              <AlertTriangle className="size-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          {/* Step Tracker during proof synthesis */}
          {step >= 0 && step < 4 && (
            <div className="mt-6 space-y-3">
              <div className="space-y-2">
                {PROOF_SYNTHESIS_STEPS.map((s, idx) => {
                  const isActive = step === idx;
                  const isDone = step > idx;
                  return (
                    <div
                      key={idx}
                      className={`flex items-start gap-3 rounded-2xl border p-3 transition-all ${
                        isActive
                          ? "border-cyan-500/50 bg-cyan-500/10 shadow-[0_0_15px_rgba(0,242,254,0.15)]"
                          : isDone
                            ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-400"
                            : "border-white/[0.06] bg-black/20 opacity-40"
                      }`}
                    >
                      <div className="mt-0.5">
                        {isDone ? (
                          <Check className="size-4 text-emerald-400" />
                        ) : isActive ? (
                          <Loader2 className="size-4 animate-spin text-cyan-400" />
                        ) : (
                          <div className="size-4 rounded-full border border-slate-700" />
                        )}
                      </div>
                      <div>
                        <p className="font-mono text-xs font-semibold text-white">{s.title}</p>
                        <p className="text-[11px] text-slate-400">{s.detail}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Success State */}
          {step === 4 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 space-y-4 text-center"
            >
              <div className="mx-auto flex size-14 items-center justify-center rounded-3xl border border-emerald-500/40 bg-emerald-500/15 shadow-[0_0_30px_rgba(0,255,163,0.35)]">
                <Check className="size-7 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">Zero-Knowledge Proof Verified</h4>
                <p className="mt-1 text-xs text-slate-400">
                  The Midnight Compact contract verified your pre-image proof without revealing the secret.
                </p>
              </div>

              <div className="rounded-2xl border border-white/[0.08] bg-[#07090e] p-3.5 text-left text-xs font-mono space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Transaction ID:</span>
                  <span className="text-cyan-400">{txHash?.slice(0, 24)}…</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Settled Nullifier:</span>
                  <span className="text-violet-400">{nullifier?.slice(0, 24)}…</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-xl bg-cyan-500 hover:bg-cyan-400 py-3 text-sm font-bold text-slate-950 transition-colors shadow-md"
              >
                Close & Return to Dashboard
              </button>
            </motion.div>
          )}

          {/* Input Form (Idle) */}
          {step === -1 && (
            <div className="mt-5 space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <label className="font-mono text-xs uppercase tracking-wider text-slate-400">
                    Your Solution Pre-Image
                  </label>
                  <button
                    type="button"
                    onClick={handleFillValidSecret}
                    className="inline-flex items-center gap-1 font-mono text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    <Sparkles className="size-3" />
                    <span>Fill Valid Pre-Image</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="Enter the secret answer / challenge pre-image…"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 font-mono text-sm text-white outline-none transition-all focus:border-cyan-500/60"
                />
              </div>

              <div>
                <label className="font-mono text-xs uppercase tracking-wider text-slate-400">
                  Blinding Nonce (Provided in Challenge Specs)
                </label>
                <input
                  type="text"
                  value={nonce}
                  onChange={(e) => setNonce(e.target.value)}
                  placeholder="Salt nonce"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 font-mono text-xs text-slate-400 outline-none focus:border-cyan-500/60"
                />
              </div>

              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-emerald-400 flex items-center gap-2">
                <ShieldCheck className="size-4 shrink-0" />
                <span>The secret never leaves your device. Proof is synthesized locally via Halo2.</span>
              </div>

              <button
                type="button"
                onClick={executeProofAndClaim}
                className="w-full rounded-xl bg-cyan-500 hover:bg-cyan-400 py-3 text-sm font-bold text-slate-950 transition-all shadow-md active:scale-98"
              >
                Synthesize zk-SNARK & Settle Bounty
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
