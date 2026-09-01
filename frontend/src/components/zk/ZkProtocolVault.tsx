"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Lock,
  Unlock,
  Zap,
  ShieldCheck,
  Cpu,
  ArrowRight,
  RefreshCw,
  AlertOctagon,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { MidnightGlyph } from "./MidnightGlyph";

export function ZkProtocolVault() {
  const [simulationState, setSimulationState] = useState<"idle" | "proving" | "verified" | "invalid">("idle");
  const [activeGateIndex, setActiveGateIndex] = useState(0);

  const sampleSecret = "preimage_bounty_42";
  const sampleNonce = "salt_8f90c1";
  const sampleCommit = "0x7e8b91a0c4f8...39d1";

  const gates = [
    { label: "Gate 1: persistentCommit(S, N)", expr: "Hash(S ⊕ N) == C", status: "ok" },
    { label: "Gate 2: Range & Nonce Soundness", expr: "N ∈ F_q (256-bit entropy)", status: "ok" },
    { label: "Gate 3: Equality Constraint", expr: "C_circuit == C_ledger", status: simulationState === "invalid" ? "failed" : "ok" },
    { label: "Gate 4: Nullifier Non-Replay", expr: "Nullifier ∉ SpentMap", status: "ok" },
  ];

  async function runProofSimulation(valid: boolean = true) {
    if (simulationState === "proving") return;
    setSimulationState("proving");
    setActiveGateIndex(0);

    for (let i = 0; i < gates.length; i++) {
      setActiveGateIndex(i);
      await new Promise((r) => setTimeout(r, 450));
    }

    if (valid) {
      setSimulationState("verified");
    } else {
      setSimulationState("invalid");
    }
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-primary/40 bg-background/60 p-6 backdrop-blur-2xl shadow-[0_0_40px_rgba(108,92,231,0.18)]">
      {/* Subtle top header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl border border-cyan/40 bg-cyan/10 shadow-[0_0_15px_rgba(0,242,254,0.3)]">
            <MidnightGlyph className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-mono text-sm font-bold tracking-wide text-foreground">
                Zero-Knowledge Proof Circuit Visualizer
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full border border-signal/40 bg-signal/10 px-2 py-0.5 font-mono text-[10px] text-signal">
                <span className="pulse-dot size-1.5 rounded-full bg-signal" />
                BN254 Pairing Ready
              </span>
            </div>
            <p className="font-mono text-xs text-muted-foreground">
              Simulates how client-side witnesses verify on Midnight without exposing secrets
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => runProofSimulation(true)}
            disabled={simulationState === "proving"}
            className="inline-flex items-center gap-1.5 rounded-xl border border-cyan/40 bg-cyan/15 px-3 py-1.5 font-mono text-xs font-semibold text-cyan transition-all hover:bg-cyan hover:text-background hover:shadow-[0_0_20px_rgba(0,242,254,0.4)] disabled:opacity-50"
          >
            <Zap className="size-3.5" />
            <span>Simulate Valid Proof</span>
          </button>
          <button
            onClick={() => runProofSimulation(false)}
            disabled={simulationState === "proving"}
            className="glass inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-mono text-xs text-destructive hover:border-destructive/50 transition-colors disabled:opacity-50"
          >
            <AlertOctagon className="size-3.5" />
            <span>Test Invalid Secret</span>
          </button>
        </div>
      </div>

      {/* 3-Step Zero-Knowledge Flow Architecture */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {/* Stage 1: Private Witness */}
        <div className="rounded-2xl border border-border/80 bg-background/50 p-4 transition-all hover:border-cyan/40">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-cyan">
              1. Private Witness
            </span>
            <span className="rounded-md border border-signal/30 bg-signal/10 px-1.5 py-0.5 font-mono text-[10px] text-signal">
              Client Memory Only
            </span>
          </div>

          <div className="mt-3 space-y-2 font-mono text-xs">
            <div className="rounded-xl border border-border/50 bg-background/70 p-2.5">
              <p className="text-[10px] text-muted-foreground">Secret Pre-image (S):</p>
              <p className="text-foreground font-semibold truncate">"{sampleSecret}"</p>
            </div>
            <div className="rounded-xl border border-border/50 bg-background/70 p-2.5">
              <p className="text-[10px] text-muted-foreground">Salt Nonce (N):</p>
              <p className="text-violet font-semibold truncate">{sampleNonce}</p>
            </div>
            <div className="rounded-xl border border-cyan/30 bg-cyan/5 p-2 text-[11px] text-cyan">
              C = persistentCommit(S, N)
            </div>
          </div>
        </div>

        {/* Stage 2: ZK Circuit Constraints */}
        <div className="rounded-2xl border border-primary/50 bg-primary/5 p-4 shadow-[0_0_25px_rgba(108,92,231,0.12)]">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-primary">
              2. Halo2 ZK Circuit
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">16,384 Gates</span>
          </div>

          <div className="mt-3 space-y-1.5">
            {gates.map((g, idx) => {
              const isEvaluating = simulationState === "proving" && activeGateIndex === idx;
              const isPassed =
                (simulationState === "verified" || (simulationState === "proving" && activeGateIndex > idx)) &&
                g.status === "ok";
              const isFailed = simulationState === "invalid" && g.status === "failed";

              return (
                <div
                  key={idx}
                  className={`flex items-center justify-between rounded-xl border p-2 font-mono text-[11px] transition-all ${
                    isEvaluating
                      ? "border-cyan bg-cyan/15 text-cyan animate-pulse"
                      : isFailed
                        ? "border-destructive/60 bg-destructive/15 text-destructive"
                        : isPassed
                          ? "border-signal/40 bg-signal/10 text-signal"
                          : "border-border/40 bg-background/50 text-muted-foreground"
                  }`}
                >
                  <span className="truncate">{g.expr}</span>
                  {isFailed ? (
                    <AlertOctagon className="size-3.5 shrink-0 text-destructive" />
                  ) : isPassed ? (
                    <CheckCircle2 className="size-3.5 shrink-0 text-signal" />
                  ) : isEvaluating ? (
                    <RefreshCw className="size-3.5 shrink-0 animate-spin text-cyan" />
                  ) : (
                    <div className="size-2 rounded-full border border-border" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Stage 3: Midnight Shielded Ledger */}
        <div className="rounded-2xl border border-border/80 bg-background/50 p-4 transition-all hover:border-signal/40">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-signal">
              3. Shielded Escrow
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">Midnight Ledger</span>
          </div>

          <div className="mt-3 space-y-2 font-mono text-xs">
            <div className="rounded-xl border border-border/50 bg-background/70 p-2.5">
              <p className="text-[10px] text-muted-foreground">Public Commitment on Chain:</p>
              <p className="text-cyan truncate">{sampleCommit}</p>
            </div>

            <div
              className={`rounded-xl border p-2.5 text-center transition-all ${
                simulationState === "verified"
                  ? "border-signal/50 bg-signal/15 text-signal"
                  : simulationState === "invalid"
                    ? "border-destructive/50 bg-destructive/15 text-destructive"
                    : "border-border/50 bg-background/70 text-muted-foreground"
              }`}
            >
              <div className="flex items-center justify-center gap-2 font-bold">
                {simulationState === "verified" ? (
                  <>
                    <Unlock className="size-4 text-signal" />
                    <span>Reward Payout Released!</span>
                  </>
                ) : simulationState === "invalid" ? (
                  <>
                    <Lock className="size-4 text-destructive" />
                    <span>Assertion Failed · Reverted</span>
                  </>
                ) : (
                  <>
                    <Lock className="size-4 text-cyan" />
                    <span>Locked in Escrow</span>
                  </>
                )}
              </div>
              <p className="mt-1 text-[10px] text-muted-foreground">
                {simulationState === "verified"
                  ? "+1,250 tDUST transferred to recipient"
                  : simulationState === "invalid"
                    ? "Plaintext secret never touched ledger"
                    : "Awaiting valid client zk-SNARK"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Protocol Telemetry Footer */}
      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border/60 pt-4 sm:grid-cols-4 font-mono text-xs">
        <div className="rounded-xl border border-border/50 bg-background/40 p-2.5">
          <p className="text-[10px] uppercase text-muted-foreground">Zero-Knowledge Type</p>
          <p className="font-bold text-cyan mt-0.5">Halo2-BN254</p>
        </div>
        <div className="rounded-xl border border-border/50 bg-background/40 p-2.5">
          <p className="text-[10px] uppercase text-muted-foreground">Commitment Hash</p>
          <p className="font-bold text-violet mt-0.5">persistentCommit</p>
        </div>
        <div className="rounded-xl border border-border/50 bg-background/40 p-2.5">
          <p className="text-[10px] uppercase text-muted-foreground">Secret Leakage</p>
          <p className="font-bold text-signal mt-0.5">0.00% (Mathematically 0)</p>
        </div>
        <div className="rounded-xl border border-border/50 bg-background/40 p-2.5">
          <p className="text-[10px] uppercase text-muted-foreground">Proof Server</p>
          <p className="font-bold text-primary mt-0.5">Docker :6300 Active</p>
        </div>
      </div>
    </div>
  );
}
