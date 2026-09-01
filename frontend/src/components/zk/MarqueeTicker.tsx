"use client";

import { ShieldCheck, Cpu, Zap, Lock, Sparkles, CheckCircle2, Terminal } from "lucide-react";

const TICKER_ITEMS = [
  {
    icon: CheckCircle2,
    color: "text-emerald-400",
    text: "Bounty #089: Merkle Path Proof Settled · +1,250 tDUST",
  },
  {
    icon: Cpu,
    color: "text-cyan-400",
    text: "Halo2-BN254 Proof Synthesis: 418ms via Docker :6300",
  },
  {
    icon: Lock,
    color: "text-violet-400",
    text: "persistentCommit<Bytes32> State Verified on Midnight Preprod",
  },
  {
    icon: Sparkles,
    color: "text-amber-400",
    text: "New Escrow Locked: Poseidon Hash Soundness Challenge (2,500 tDUST)",
  },
  {
    icon: ShieldCheck,
    color: "text-emerald-400",
    text: "Nullifier Non-Replay: 100% Double-Claim Attack Resistance",
  },
  {
    icon: Terminal,
    color: "text-cyan-400",
    text: "Compact v0.22 Compiler Output: 0 Warnings · 16,384 Constraints",
  },
];

export function MarqueeTicker() {
  return (
    <div className="relative w-full overflow-hidden border-y border-white/[0.06] bg-[#0d111a]/60 py-2.5 backdrop-blur-md">
      {/* Edge blur gradients for infinite fade effect */}
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-[#07090e] to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-[#07090e] to-transparent" />

      <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
        {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="mx-4 flex items-center gap-2 font-mono text-xs text-slate-400 whitespace-nowrap select-none"
            >
              <Icon className={`size-3.5 shrink-0 ${item.color}`} />
              <span>{item.text}</span>
              <span className="ml-4 text-slate-700">·</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
