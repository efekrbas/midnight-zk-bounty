import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Cpu, Lock, Zap, Gauge } from "lucide-react";

const STATS = [
  {
    label: "Total Value Locked",
    subLabel: "184.92k NIGHT Escrowed",
    value: 184_920,
    suffix: " tDUST",
    icon: Lock,
    iconColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  },
  {
    label: "Active Escrows",
    subLabel: "bounty.compact Preprod",
    value: 48,
    icon: Zap,
    iconColor: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
  },
  {
    label: "ZK Proofs Settled",
    subLabel: "Halo2-BN254 Pairings",
    value: 14_920,
    icon: Cpu,
    iconColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  },
  {
    label: "Avg Prover Latency",
    subLabel: "Local Docker :6300",
    value: 418,
    suffix: " ms",
    icon: Gauge,
    iconColor: "text-violet-400 bg-violet-500/10 border-violet-500/20",
  },
];

function useCountUp(target: number, duration = 1000) {
  const [value, setValue] = useState(0);
  const raf = useRef(0);

  useEffect(() => {
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      setValue(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);

  return value;
}

function StatCard({
  stat,
  index,
}: {
  stat: (typeof STATS)[number];
  index: number;
}) {
  const value = useCountUp(stat.value);
  const Icon = stat.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index, duration: 0.35, ease: "easeOut" }}
      className="group relative rounded-2xl border border-white/[0.08] bg-[#0d111a]/70 p-5 transition-all duration-200 hover:border-white/[0.16] hover:bg-[#0d111a]/90"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400">
          {stat.label}
        </span>
        <div className={`flex size-8 items-center justify-center rounded-xl border ${stat.iconColor}`}>
          <Icon className="size-4" />
        </div>
      </div>
      <p className="mt-3 font-mono text-2xl font-bold tracking-tight text-white sm:text-3xl">
        {value.toLocaleString("en-US")}
        <span className="text-sm font-normal text-slate-400">{stat.suffix || ""}</span>
      </p>
      <p className="mt-1 text-xs text-slate-400">{stat.subLabel}</p>
    </motion.div>
  );
}

export function Stats() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {STATS.map((s, i) => (
        <StatCard key={s.label} stat={s} index={i} />
      ))}
    </div>
  );
}
