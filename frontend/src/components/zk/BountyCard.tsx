import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Key, Timer, Cpu, Hash, Lock, CheckCircle2, Copy, Check } from "lucide-react";
import { countdown, truncate, type Bounty } from "@/lib/zk";
import { toast } from "sonner";

export function BountyCard({
  bounty,
  index,
  onClaim,
  claimed,
}: {
  bounty: Bounty;
  index: number;
  onClaim: (b: Bounty) => void;
  claimed: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState<number>(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(t);
  }, []);

  function handleCopyHash() {
    navigator.clipboard.writeText(`0x${bounty.commitmentHash}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Commitment hash copied");
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35, ease: "easeOut" }}
      className="flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#0d111a]/80 p-5 transition-all duration-200 hover:border-white/[0.18] hover:bg-[#0d111a]"
    >
      <div>
        {/* Top Header / Badges */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                claimed
                  ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                  : "border-cyan-500/20 bg-cyan-500/10 text-cyan-400"
              }`}
            >
              <span
                className={`size-1.5 rounded-full ${
                  claimed ? "bg-emerald-400" : "bg-cyan-400 animate-pulse"
                }`}
              />
              {claimed ? "Claimed" : "Active"}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              #{bounty.numericId}
            </span>
          </div>

          <div className="flex items-center gap-1 rounded-xl bg-white/[0.04] border border-white/[0.08] px-2.5 py-1">
            <span className="text-xs font-bold font-mono text-cyan-400">
              {bounty.rewardFormatted.toLocaleString()} tDUST
            </span>
          </div>
        </div>

        {/* Title and Description */}
        <h3 className="mt-3.5 text-base font-semibold text-white leading-snug">
          {bounty.title}
        </h3>
        <p className="mt-1.5 text-xs leading-relaxed text-slate-400 line-clamp-2">
          {bounty.description}
        </p>

        {/* Circuit Badges */}
        <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
          <span className="rounded-lg bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 font-mono text-indigo-300">
            {bounty.circuit}
          </span>
          <span className="rounded-lg bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 font-mono text-slate-400">
            {bounty.constraints.toLocaleString()} Gates
          </span>
        </div>

        {/* Commitment Hash */}
        <div className="mt-3.5 rounded-xl bg-black/40 border border-white/[0.06] p-2.5 flex items-center justify-between gap-2">
          <div className="overflow-hidden">
            <span className="text-[10px] uppercase text-slate-500 block">Commitment</span>
            <code className="font-mono text-xs text-slate-300 truncate block">
              0x{bounty.commitmentHash.slice(0, 14)}…{bounty.commitmentHash.slice(-10)}
            </code>
          </div>
          <button
            type="button"
            onClick={handleCopyHash}
            className="shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
            title="Copy Hash"
          >
            {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
          </button>
        </div>

        {/* Metadata Grid */}
        <dl className="mt-3.5 space-y-1.5 border-t border-white/[0.06] pt-3 text-xs">
          <div className="flex items-center justify-between text-slate-400">
            <dt className="flex items-center gap-1.5">
              <Key className="size-3 text-slate-500" /> Creator:
            </dt>
            <dd className="font-mono text-slate-300">{truncate(bounty.creator, 6, 4)}</dd>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <dt className="flex items-center gap-1.5">
              <Timer className="size-3 text-slate-500" /> Time Left:
            </dt>
            <dd suppressHydrationWarning className="font-mono text-slate-300 tabular-nums">
              {mounted && now ? countdown(bounty.expiresAt, now) : "Calculating…"}
            </dd>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <dt className="flex items-center gap-1.5">
              <Cpu className="size-3 text-slate-500" /> Attempts:
            </dt>
            <dd className="font-mono text-slate-300">{bounty.proofs} proofs</dd>
          </div>
        </dl>
      </div>

      {/* Claim Action Button */}
      <div className="mt-5">
        <button
          onClick={() => onClaim(bounty)}
          disabled={claimed}
          className={`flex w-full items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-xs font-semibold transition-all duration-150 ${
            claimed
              ? "cursor-not-allowed bg-white/[0.03] border border-white/[0.06] text-slate-500"
              : "bg-white/10 hover:bg-cyan-500 hover:text-slate-950 text-white border border-white/15 hover:border-cyan-400 shadow-sm"
          }`}
        >
          {claimed ? (
            <>
              <CheckCircle2 className="size-3.5 text-emerald-400" />
              <span>Bounty Claimed</span>
            </>
          ) : (
            <>
              <Lock className="size-3.5" />
              <span>Prove & Claim Escrow</span>
            </>
          )}
        </button>
      </div>
    </motion.article>
  );
}
