"use client";

import { Check, X, Shield, Eye, Lock, Zap } from "lucide-react";

const COMPARISON_ROWS = [
  {
    feature: "Vulnerability / Solution Disclosure",
    traditional: "Plaintext sent to triagers & platforms",
    midnight: "100% Zero-Knowledge (Plaintext never leaves client)",
  },
  {
    feature: "Escrow Trust Model",
    traditional: "Centralized intermediary or custodial multisig",
    midnight: "Compact on-chain immutable smart contract escrow",
  },
  {
    feature: "Hunter Identity & Anonymity",
    traditional: "Mandatory KYC, tax paperwork, identity doxxing",
    midnight: "Shielded Midnight UTXO address (fully anonymous)",
  },
  {
    feature: "Settlement Guarantee",
    traditional: "Subject to manual review dispute / refusal",
    midnight: "Mathematical ZK proof auto-releases reward",
  },
  {
    feature: "Double-Claim Prevention",
    traditional: "Manual database flag",
    midnight: "Cryptographic Nullifier set in ledger state",
  },
];

export function ComparisonTable() {
  return (
    <section className="py-12">
      <div className="text-center max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">
          <Zap className="size-3.5" />
          The Privacy Advantage
        </span>
        <h2 className="mt-4 text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
          Traditional Bounties vs. Midnight zk-Bounty
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          Why zero-knowledge smart contracts are the superior standard for high-stakes bug bounties and puzzle escrows.
        </p>
      </div>

      <div className="mt-10 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d111a]/80 shadow-2xl">
        <div className="grid grid-cols-3 border-b border-white/[0.08] bg-white/[0.02] p-4 text-xs font-semibold">
          <div className="text-slate-400">Capability</div>
          <div className="text-slate-400">Traditional Platforms (Web2 / EVM)</div>
          <div className="text-cyan-400 font-bold flex items-center gap-1.5">
            <Shield className="size-3.5" /> Midnight zk-Bounty
          </div>
        </div>

        <div className="divide-y divide-white/[0.06]">
          {COMPARISON_ROWS.map((row, i) => (
            <div
              key={i}
              className="grid grid-cols-3 p-4 text-xs items-center transition-colors hover:bg-white/[0.02]"
            >
              <div className="font-medium text-slate-200">{row.feature}</div>
              <div className="flex items-center gap-2 text-slate-400">
                <X className="size-4 shrink-0 text-red-400/80" />
                <span>{row.traditional}</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-300 font-medium">
                <Check className="size-4 shrink-0 text-emerald-400" />
                <span>{row.midnight}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
