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
} from "lucide-react";
import { persistentCommit, generateRandomNonce } from "@/lib/zk";
import { toast } from "sonner";

export function HeroBountyShowcase() {
  const [secretInput, setSecretInput] = useState("halo2-soundness-break-seed-409");
  const [nonce] = useState("nonce-c781a9f0");
  const [isProving, setIsProving] = useState(false);
  const [isSolved, setIsSolved] = useState(false);
  const [copied, setCopied] = useState(false);

  const targetCommitment = useMemo(() => {
    return persistentCommit("halo2-soundness-break-seed-409", "nonce-c781a9f0");
  }, []);

  const liveCommitment = useMemo(() => {
    return persistentCommit(secretInput || "empty", nonce);
  }, [secretInput, nonce]);

  const isMatch = liveCommitment === targetCommitment;

  async function handleSimulateProof() {
    if (!secretInput.trim()) return;
    setIsProving(true);
    setIsSolved(false);

    await new Promise((r) => setTimeout(r, 1100));

    setIsProving(false);
    if (isMatch) {
      setIsSolved(true);
      toast.success("Zero-Knowledge Proof Verified on Midnight", {
        description: "Contract validated persistentCommit proof without seeing plaintext secret. +1,250 tDUST unlocked!",
      });
    } else {
      toast.error("Constraint Satisfaction Failed", {
        description: "The secret pre-image does not match the on-chain commitment hash.",
      });
    }
  }

  function handleQuickSolve() {
    setSecretInput("halo2-soundness-break-seed-409");
    setIsSolved(false);
    toast.info("Preset solution pre-image loaded");
  }

  function handleRandomize() {
    setSecretInput(`seed-${generateRandomNonce().slice(0, 10)}`);
    setIsSolved(false);
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
              Target ID: <span className="font-mono text-slate-300">#001</span> · Preprod Testnet
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] px-3 py-1.5">
          <span className="text-xs text-slate-400">Reward:</span>
          <span className="font-mono text-xs font-bold text-cyan-400">1,250 tDUST</span>
        </div>
      </div>

      {/* Challenge Description */}
      <div className="mt-4">
        <h4 className="text-base font-semibold text-white">
          Halo2 Soundness Challenge
        </h4>
        <p className="mt-1 text-xs leading-relaxed text-slate-400">
          Prove knowledge of the secret pre-image that yields the on-chain commitment below.
          The Compact smart contract verifies your proof without exposing the plaintext secret.
        </p>
      </div>

      {/* Target Commitment Bar */}
      <div className="mt-4 rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
          <span className="flex items-center gap-1.5 font-medium">
            <Lock className="size-3 text-cyan-400" />
            Locked Commitment Hash:
          </span>
          <span className="font-mono text-[10px] text-slate-500">persistentCommit</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <code className="font-mono text-[11.5px] text-cyan-300 truncate select-all tracking-tight" title={`0x${targetCommitment}`}>
            0x{targetCommitment.slice(0, 18)}…{targetCommitment.slice(-16)}
          </code>
          <button
            type="button"
            onClick={handleCopy}
            className="shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            title="Copy Full Hash"
          >
            {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
          </button>
        </div>
      </div>

      {/* Interactive Solver Input */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-1.5 font-medium text-slate-300">
            <Key className="size-3.5 text-violet-400" />
            Secret Pre-image Witness:
          </label>
          <div className="flex items-center gap-2 text-[11px]">
            <button
              type="button"
              onClick={handleQuickSolve}
              className="text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Fill Valid
            </button>
            <span className="text-slate-600">|</span>
            <button
              type="button"
              onClick={handleRandomize}
              className="text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1"
            >
              <RefreshCw className="size-2.5" /> Random
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
            placeholder="Enter pre-image string…"
            className="w-full rounded-xl bg-black/40 border border-white/10 px-3.5 py-2.5 pr-9 font-mono text-xs text-slate-100 placeholder:text-slate-600 outline-none transition-all focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {isMatch ? (
              <CheckCircle2 className="size-4 text-emerald-400" />
            ) : (
              <div className="size-2 rounded-full bg-amber-500/60" />
            )}
          </div>
        </div>

        {/* Real-time constraint indicator */}
        <div className="flex items-center justify-between text-[11px] font-mono pt-1">
          <span className="text-slate-500">Constraint Check:</span>
          {isMatch ? (
            <span className="text-emerald-400 font-medium">✓ Pre-image matches on-chain commitment</span>
          ) : (
            <span className="text-amber-400/80">✗ Hash mismatch (proof will revert)</span>
          )}
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={handleSimulateProof}
        disabled={isProving}
        className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-3 px-4 text-xs font-semibold transition-all duration-200 ${
          isSolved
            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
            : "bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30"
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isProving ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            <span>Computing Halo2 zk-SNARK Proof…</span>
          </>
        ) : isSolved ? (
          <>
            <Unlock className="size-4 text-emerald-400" />
            <span>ZK Proof Verified · Escrow Claimed!</span>
          </>
        ) : (
          <>
            <Zap className="size-4 fill-current" />
            <span>Generate Proof & Claim Escrow</span>
          </>
        )}
      </button>

      {/* Compact Telemetry Footer */}
      <div className="mt-4 pt-4 border-t border-white/[0.06] grid grid-cols-3 gap-2 text-[11px] text-slate-400">
        <div>
          <span className="text-slate-500 block text-[10px] uppercase">Proof Engine</span>
          <span className="font-medium text-slate-300">Halo2-BN254</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px] uppercase">Smart Contract</span>
          <span className="font-medium text-slate-300">Compact v0.22</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px] uppercase">Privacy Level</span>
          <span className="font-medium text-emerald-400">128-bit Zero-Knowledge</span>
        </div>
      </div>
    </div>
  );
}
