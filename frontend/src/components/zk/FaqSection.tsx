"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const FAQS = [
  {
    q: "How does the contract verify a bounty solution without seeing the secret?",
    a: "The bounty creator stores a commitment hash C = persistentCommit(secret, nonce) on the Midnight ledger. When a solver claims the bounty, their local client executes the Halo2 zero-knowledge circuit, which proves they possess the correct preimage (secret, nonce) that produces C. Only the cryptographic proof and nullifier are submitted on-chain—the plaintext secret remains 100% private in client memory.",
  },
  {
    q: "What token economics and units are used?",
    a: "Midnight represents base currency units as Stars (or tDUST on Preprod Testnet). 1 NIGHT = 1,000,000 Stars / tDUST. All reward values in the Compact smart contract are typed as Uint<64> (JavaScript BigInt), ensuring precision and overflow safety.",
  },
  {
    q: "What is the role of the Docker Proof Server (:6300)?",
    a: "The Midnight Proof Server runs locally via Docker (ghcr.io/midnight-ntwrk/proof-server:latest) on port :6300. It performs the heavy polynomial arithmetic and elliptic curve pairings needed to synthesize Halo2 zk-SNARK proving keys and witness circuits rapidly in ~400ms.",
  },
  {
    q: "Can an attacker front-run or double-claim a solved bounty?",
    a: "No. The claimBounty circuit requires the solver's shielded recipient address as a public input bound into the proof transcript. Furthermore, upon first claim, the contract asserts !isClaimed and marks isClaimed = true in ledger state, permanently preventing replay attacks.",
  },
];

export function FaqSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section className="py-12">
      <div className="text-center max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-400">
          <HelpCircle className="size-3.5" />
          Technical FAQ
        </span>
        <h2 className="mt-4 text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
          Frequently Asked Questions
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          Everything you need to know about Zero-Knowledge escrows on Midnight.
        </p>
      </div>

      <div className="mt-10 max-w-3xl mx-auto space-y-3">
        {FAQS.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="rounded-2xl border border-white/[0.08] bg-[#0d111a]/80 overflow-hidden transition-colors hover:border-white/20"
            >
              <button
                type="button"
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full flex items-center justify-between p-5 text-left text-sm font-semibold text-white gap-4"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`size-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                    isOpen ? "rotate-180 text-cyan-400" : ""
                  }`}
                />
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="px-5 pb-5 text-xs leading-relaxed text-slate-400 border-t border-white/[0.06] pt-3">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
