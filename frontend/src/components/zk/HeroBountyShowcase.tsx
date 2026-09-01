"use client";

import { useState, useMemo } from "react";
import {
  Lock,
  Unlock,
  CheckCircle2,
  Copy,
  Zap,
  Key,
  Shield,
  Loader2,
  Check,
  RefreshCw,
  Sparkles,
  ShieldAlert,
  ChevronRight,
} from "lucide-react";
import { persistentCommit, generateRandomNonce } from "@/lib/zk";
import { toast } from "sonner";

interface ShowcaseChallenge {
  id: string;
  targetId: string;
  title: string;
  description: string;
  reward: number;
  validSecret: string;
  nonce: string;
}

const SHOWCASE_CHALLENGES: ShowcaseChallenge[] = [
  {
    id: "challenge-1",
    targetId: "#001",
    title: "Halo2 Soundness Challenge",
    description:
      "Prove knowledge of the secret pre-image that yields the on-chain commitment below. The Compact smart contract verifies your proof without exposing the plaintext secret.",
    reward: 1250,
    validSecret: "halo2-soundness-break-seed-409",
    nonce: "nonce-c781a9f0",
  },
  {
    id: "challenge-2",
    targetId: "#002",
    title: "Nullifier Collision Resistance",
    description:
      "Provide cryptographic witness proving pre-image membership in the Midnight Shielded Pool without leaking private UTXO coin identifiers.",
    reward: 1850,
    validSecret: "nullifier-collision-target-99",
    nonce: "nonce-f8a1290b",
  },
  {
    id: "challenge-3",
    targetId: "#003",
    title: "Stealth Relay Node Attestation",
    description:
      "Verify zero-knowledge proof of validator enclave signature authenticity without disclosing relay IP routing metadata.",
    reward: 3400,
    validSecret: "stealth-node-attestation-2026",
    nonce: "nonce-48bb2201",
  },
];

export function HeroBountyShowcase({
  onRewardClaimed,
}: {
  onRewardClaimed?: (amountStars: bigint) => void;
}) {
  const [challengeIdx, setChallengeIdx] = useState(0);
  const challenge = SHOWCASE_CHALLENGES[challengeIdx];

  const [secretInput, setSecretInput] = useState(challenge.validSecret);
  const [isProving, setIsProving] = useState(false);
  const [isSolved, setIsSolved] = useState(false);
  const [copied, setCopied] = useState(false);

  const targetCommitment = useMemo(() => {
    return persistentCommit(challenge.validSecret, challenge.nonce);
  }, [challenge]);

  const liveCommitment = useMemo(() => {
    return persistentCommit(secretInput || "empty", challenge.nonce);
  }, [secretInput, challenge.nonce]);

  const isMatch = liveCommitment === targetCommitment;

  function switchChallenge(nextIdx: number) {
    const validNextIdx = (nextIdx + SHOWCASE_CHALLENGES.length) % SHOWCASE_CHALLENGES.length;
    setChallengeIdx(validNextIdx);
    const nextChallenge = SHOWCASE_CHALLENGES[validNextIdx];
    setSecretInput(nextChallenge.validSecret);
    setIsSolved(false);
  }

  async function handleSimulateProof() {
    if (!secretInput.trim()) return;
    setIsProving(true);
    setIsSolved(false);

    await new Promise((r) => setTimeout(r, 1100));

    setIsProving(false);
    if (isMatch) {
      setIsSolved(true);
      onRewardClaimed?.(BigInt(challenge.reward) * 1_000_000n);
      toast.success("Zero-Knowledge Proof Verified on Midnight", {
        description: `Contract validated persistentCommit proof without seeing plaintext secret. +${challenge.reward.toLocaleString()} tDUST unlocked!`,
      });
    } else {
      toast.error("Constraint Satisfaction Failed (Soundness Enforced)", {
        description:
          "Zero-Knowledge circuit rejected the wrong pre-image. The escrow reward remains safe in the smart contract.",
      });
    }
  }

  function handleAutoFillValid() {
    setSecretInput(challenge.validSecret);
    setIsSolved(false);
    toast.success("Loaded valid solution pre-image for this challenge");
  }

  function handleSimulateAttack() {
    const fakeSeed = `attacker-guess-${generateRandomNonce().slice(0, 8)}`;
    setSecretInput(fakeSeed);
    setIsSolved(false);
    toast.info("Simulating unauthorized attacker guess (wrong pre-image)", {
      description: "Click 'Verify Pre-image' to test that the ZK circuit rejects it.",
    });
  }

  function handleCopy() {
    navigator.clipboard.writeText(`0x${targetCommitment}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Commitment hash copied to clipboard");
  }

  return (
    <div className="relative rounded-2xl border border-white/10 bg-[#0d111a]/90 p-6 shadow-2xl backdrop-blur-xl">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4 pb-5 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Shield className="size-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">
                Live Bounty Escrow
              </h3>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400 border border-emerald-500/20">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Target ID: <span className="font-mono text-slate-300">{challenge.targetId}</span> · Preprod Testnet
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => switchChallenge(challengeIdx + 1)}
            className="rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/10 px-2 py-1 text-[11px] text-slate-300 transition-colors flex items-center gap-1"
            title="Switch Challenge"
          >
            <span>Next ({challengeIdx + 1}/3)</span>
            <ChevronRight className="size-3" />
          </button>
          <div className="flex items-center gap-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] px-3 py-1.5">
            <span className="text-xs text-slate-400">Reward:</span>
            <span className="font-mono text-xs font-bold text-cyan-400">
              {challenge.reward.toLocaleString()} tDUST
            </span>
          </div>
        </div>
      </div>

      {/* Challenge Description */}
      <div className="mt-5">
        <h4 className="text-base font-bold text-white">
          {challenge.title}
        </h4>
        <p className="mt-1.5 text-xs leading-relaxed text-slate-300">
          {challenge.description}
        </p>
      </div>

      {/* Target Commitment Display */}
      <div className="mt-5 rounded-xl bg-black/40 border border-white/[0.06] p-3.5">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5 font-medium">
            <Lock className="size-3.5 text-cyan-400" />
            Locked Commitment Hash:
          </span>
          <span className="font-mono text-[11px] text-slate-500">persistentCommit</span>
        </div>
        <div className="mt-2 flex items-center justify-between gap-2 overflow-hidden">
          <code className="font-mono text-xs text-cyan-300 truncate max-w-[calc(100%-40px)]">
            0x{targetCommitment.slice(0, 16)}…{targetCommitment.slice(-16)}
          </code>
          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors shrink-0"
            title="Copy Full Commitment Hash"
          >
            {copied ? (
              <Check className="size-3.5 text-emerald-400" />
            ) : (
              <Copy className="size-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Secret Input with Dynamic Match Indicator */}
      <div className="mt-5 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-1.5 font-medium text-slate-300">
            <Key className="size-3.5 text-indigo-400" />
            Secret Pre-image Witness:
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAutoFillValid}
              className="inline-flex items-center gap-1 font-mono text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <Sparkles className="size-3" />
              <span>Fill Valid</span>
            </button>
            <span className="text-slate-600">|</span>
            <button
              type="button"
              onClick={handleSimulateAttack}
              className="inline-flex items-center gap-1 font-mono text-[11px] text-amber-400 hover:text-amber-300 transition-colors"
              title="Test invalid guess to show ZK circuit protection"
            >
              <ShieldAlert className="size-3" />
              <span>Test Wrong Guess</span>
            </button>
          </div>
        </div>

        <div className="relative">
          <input
            type="text"
            value={secretInput}
            onChange={(e) => {
              setSecretInput(e.target.value);
              setIsSolved(false);
            }}
            placeholder="Type secret solution pre-image…"
            className="w-full rounded-xl bg-black/40 border border-white/10 px-3.5 py-2.5 font-mono text-xs text-white placeholder:text-slate-600 outline-none transition-all focus:border-cyan-500/60"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {isMatch ? (
              <CheckCircle2 className="size-4 text-emerald-400" />
            ) : (
              <Lock className="size-3.5 text-slate-600" />
            )}
          </div>
        </div>

        {/* Live Constraint Verification State */}
        <div className="flex items-center justify-between text-[11px] font-mono pt-1">
          <span className="text-slate-400">Constraint Check:</span>
          {isMatch ? (
            <span className="text-emerald-400 font-medium">✓ Pre-image matches on-chain commitment</span>
          ) : (
            <span className="text-amber-400/90 font-medium">✕ Pre-image does not match commitment</span>
          )}
        </div>
      </div>

      {/* Action CTA */}
      <div className="mt-6">
        <button
          type="button"
          onClick={handleSimulateProof}
          disabled={isProving || !secretInput.trim()}
          className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-xs font-bold transition-all shadow-md active:scale-98 disabled:opacity-50 ${
            isSolved
              ? "bg-emerald-500/15 border border-emerald-500/40 text-emerald-400"
              : isMatch
                ? "bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20 cursor-pointer"
                : "bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10 cursor-pointer"
          }`}
        >
          {isProving ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Evaluating Halo2 Constraints in Proof Server :6300…</span>
            </>
          ) : isSolved ? (
            <>
              <Unlock className="size-4 text-emerald-400" />
              <span>ZK Proof Verified · Escrow Claimed! (+{challenge.reward.toLocaleString()} tDUST)</span>
            </>
          ) : isMatch ? (
            <>
              <Zap className="size-4" />
              <span>Synthesize Halo2 Proof & Claim Escrow (+{challenge.reward.toLocaleString()} tDUST)</span>
            </>
          ) : (
            <>
              <Lock className="size-4" />
              <span>Verify Pre-image & Test ZK Constraint Rejection</span>
            </>
          )}
        </button>
      </div>

      {/* Protocol Telemetry Mini-Footer */}
      <div className="mt-5 grid grid-cols-3 gap-2 border-t border-white/[0.06] pt-4 text-center font-mono text-[10px] text-slate-400">
        <div>
          <span className="text-slate-500 block uppercase">Proof Engine</span>
          <span className="text-slate-300 font-semibold">Halo2-BN254</span>
        </div>
        <div>
          <span className="text-slate-500 block uppercase">Smart Contract</span>
          <span className="text-slate-300 font-semibold">Compact v0.22</span>
        </div>
        <div>
          <span className="text-slate-500 block uppercase">Privacy Level</span>
          <span className="text-emerald-400 font-semibold">100% Client-Side</span>
        </div>
      </div>
    </div>
  );
}
