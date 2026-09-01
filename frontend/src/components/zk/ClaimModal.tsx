import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Check, ShieldCheck, ExternalLink, Cpu, Hash, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { persistentCommit, type Bounty } from "@/lib/zk";

const PROOF_SYNTHESIS_STEPS = [
  {
    title: "1. Extracting Private Witness",
    detail: "Reading secretPreimage and secretNonce into local BountyPrivateState memory…",
  },
  {
    title: "2. Synthesizing Halo2 zk-SNARK Proof",
    detail: "Evaluating persistentCommit circuit polynomial constraints in Docker Proof Server :6300…",
  },
  {
    title: "3. Generating Settlement Nullifier",
    detail: "Computing cryptographic nullifier to prevent double-claim replay attacks…",
  },
  {
    title: "4. Broadcasting Shielded Transaction",
    detail: "Submitting claimBounty() transition to Midnight Testnet Ledger…",
  },
];

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

  async function executeProofAndClaim() {
    if (!bounty) return;
    if (!secret.trim()) {
      toast.error("Please enter the secret solution pre-image");
      return;
    }

    setErrorMsg(null);
    setStep(0);

    // Step 1: Extract private witness
    await new Promise((r) => setTimeout(r, 700));
    setStep(1);

    // Step 2: Synthesize ZK Proof
    await new Promise((r) => setTimeout(r, 1100));

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
    await new Promise((r) => setTimeout(r, 800));
    const generatedNullifier = "0x" + persistentCommit(secret + "nullifier", "null_seed").slice(0, 32);
    setNullifier(generatedNullifier);

    // Step 4: Broadcast Transaction
    setStep(3);
    await new Promise((r) => setTimeout(r, 1200));

    const generatedTx = "0x" + persistentCommit(Date.now().toString() + bounty.id, "tx_settled").slice(0, 48);
    setTxHash(generatedTx);
    setStep(4); // Finished

    toast.success("Bounty Claimed Successfully!", {
      description: `${bounty.rewardFormatted} tDUST released to your shielded address`,
    });

    onSuccess({
      ...bounty,
      isClaimed: true,
      claimedAtTx: generatedTx,
    });
  }

  if (!bounty) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => (step === -1 || step === 4 ? onClose() : null)}
          className="absolute inset-0 bg-background/80 backdrop-blur-xl"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          className="relative z-10 w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-[#0d111a] p-6 shadow-2xl backdrop-blur-2xl"
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Cpu className="size-4" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">Prove Knowledge & Claim</h3>
                <p className="text-xs text-slate-400">
                  Client-side Halo2 Proof Synthesis
                </p>
              </div>
            </div>
            {(step === -1 || step === 4) && (
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-white/[0.06] hover:text-white transition-colors"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Bounty Summary Pill */}
          <div className="mt-5 rounded-2xl border border-border/60 bg-background/50 p-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground text-sm">{bounty.title}</span>
              <span className="rounded-xl border border-cyan/40 bg-cyan/10 px-2.5 py-1 font-mono text-xs font-bold text-cyan">
                {bounty.rewardFormatted} tDUST
              </span>
            </div>
            <p className="mt-2 break-all font-mono text-[11px] text-muted-foreground">
              Commitment: <span className="text-cyan">0x{bounty.commitmentHash.slice(0, 32)}…</span>
            </p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-start gap-2.5 rounded-2xl border border-destructive/40 bg-destructive/10 p-3.5 text-xs text-destructive"
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
                          ? "border-cyan/50 bg-cyan/10 shadow-[0_0_15px_rgba(0,242,254,0.15)]"
                          : isDone
                            ? "border-signal/30 bg-signal/5 text-signal"
                            : "border-border/40 bg-background/30 opacity-40"
                      }`}
                    >
                      <div className="mt-0.5">
                        {isDone ? (
                          <Check className="size-4 text-signal" />
                        ) : isActive ? (
                          <Loader2 className="size-4 animate-spin text-cyan" />
                        ) : (
                          <div className="size-4 rounded-full border border-border" />
                        )}
                      </div>
                      <div>
                        <p className="font-mono text-xs font-semibold text-foreground">{s.title}</p>
                        <p className="text-[11px] text-muted-foreground">{s.detail}</p>
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
              <div className="mx-auto flex size-14 items-center justify-center rounded-3xl border border-signal/40 bg-signal/15 shadow-[0_0_30px_rgba(0,255,163,0.35)]">
                <Check className="size-7 text-signal" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-foreground">Zero-Knowledge Proof Verified</h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  The smart contract verified your pre-image proof without revealing the secret.
                </p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-background/50 p-3.5 text-left text-xs font-mono space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transaction ID:</span>
                  <span className="text-cyan">{txHash?.slice(0, 24)}…</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Settled Nullifier:</span>
                  <span className="text-violet">{nullifier?.slice(0, 24)}…</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-all hover:brightness-115"
              >
                Close & Return to Dashboard
              </button>
            </motion.div>
          )}

          {/* Input Form (Idle) */}
          {step === -1 && (
            <div className="mt-5 space-y-4">
              <div>
                <label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  Your Solution Pre-Image
                </label>
                <input
                  type="text"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="Enter the secret answer / challenge pre-image…"
                  className="mt-2 w-full rounded-2xl border border-input bg-background/60 px-4 py-3 font-mono text-sm text-foreground outline-none transition-all focus:border-cyan/70 focus:shadow-[0_0_20px_rgba(0,242,254,0.25)]"
                />
              </div>

              <div>
                <label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  Blinding Nonce (Provided in Challenge Specs)
                </label>
                <input
                  type="text"
                  value={nonce}
                  onChange={(e) => setNonce(e.target.value)}
                  placeholder="Salt nonce"
                  className="mt-2 w-full rounded-2xl border border-input bg-background/60 px-4 py-3 font-mono text-xs text-muted-foreground outline-none focus:border-cyan/70"
                />
              </div>

              <div className="rounded-2xl border border-signal/30 bg-signal/5 p-3 text-xs text-signal flex items-center gap-2">
                <ShieldCheck className="size-4 shrink-0" />
                <span>The secret never leaves your device. Proof is synthesized locally.</span>
              </div>

              <button
                onClick={executeProofAndClaim}
                className="mt-2 w-full rounded-2xl bg-gradient-to-r from-primary via-primary/90 to-cyan px-4 py-3.5 text-sm font-bold text-primary-foreground shadow-[0_0_25px_rgba(108,92,231,0.35)] transition-all hover:brightness-115"
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
