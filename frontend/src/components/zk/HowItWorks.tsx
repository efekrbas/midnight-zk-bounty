"use client";

import { motion } from "framer-motion";
import { Lock, Cpu, CheckCircle2, ArrowRight, ShieldCheck, Key, Database } from "lucide-react";

const STEPS = [
  {
    step: "01",
    title: "Commitment & Escrow",
    subtitle: "Creator Locks Challenge",
    description:
      "The creator generates a private secret S and blinds it with a cryptographic salt nonce N. The resulting hash persistentCommit(S, N) is published on Midnight along with the locked tDUST reward.",
    icon: Lock,
    accent: "text-cyan-400 border-cyan-500/20 bg-cyan-500/10",
    codeSnippet: "persistentCommit<Bytes32>(secret, nonce)",
  },
  {
    step: "02",
    title: "Client ZK Proof Synthesis",
    subtitle: "Solver Generates zk-SNARK",
    description:
      "The solver computes the solution in their local browser / Docker proof server (:6300). A Halo2 zero-knowledge proof is synthesized proving equality without transmitting the plaintext secret.",
    icon: Cpu,
    accent: "text-indigo-400 border-indigo-500/20 bg-indigo-500/10",
    codeSnippet: "createCircuitContext() -> Proof + Nullifier",
  },
  {
    step: "03",
    title: "Trustless Settlement",
    subtitle: "Midnight Ledger Pays Out",
    description:
      "The Compact contract verifies the proof mathematically against the stored commitment. If valid, the escrowed tDUST is transferred to the recipient's shielded address and the nullifier is marked spent.",
    icon: CheckCircle2,
    accent: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
    codeSnippet: "claimBounty(secretProof, recipientAddress)",
  },
];

export function HowItWorks() {
  return (
    <section className="py-16">
      <div className="text-center max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-400">
          <ShieldCheck className="size-3.5" />
          Zero-Knowledge Protocol
        </span>
        <h2 className="mt-4 text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
          How Midnight zk-Bounty Works
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          A 3-step trustless lifecycle guaranteeing 100% pre-image privacy from commitment to settlement.
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {STEPS.map((s, idx) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
              className="relative rounded-2xl border border-white/[0.08] bg-[#0d111a]/80 p-6 flex flex-col justify-between hover:border-white/20 transition-all duration-200"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className={`flex size-10 items-center justify-center rounded-xl border ${s.accent}`}>
                    <Icon className="size-5" />
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-600">
                    STEP {s.step}
                  </span>
                </div>

                <h3 className="mt-4 text-base font-semibold text-white">
                  {s.title}
                </h3>
                <p className="text-xs font-medium text-slate-400">
                  {s.subtitle}
                </p>

                <p className="mt-3 text-xs leading-relaxed text-slate-400">
                  {s.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/[0.06]">
                <code className="block rounded-lg bg-black/40 px-2.5 py-1.5 font-mono text-[11px] text-cyan-300 truncate">
                  {s.codeSnippet}
                </code>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
