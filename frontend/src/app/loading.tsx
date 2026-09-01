import { MidnightGlyph } from "@/components/zk/MidnightGlyph";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#07090e] text-white">
      <div className="relative flex flex-col items-center">
        {/* Glowing aura */}
        <div className="absolute -inset-4 rounded-full bg-cyan-500/20 blur-2xl animate-pulse" />

        <div className="relative flex size-16 items-center justify-center rounded-2xl border border-white/10 bg-[#0d111a] shadow-2xl">
          <MidnightGlyph className="size-10" />
        </div>

        <div className="mt-6 flex items-center gap-2 font-mono text-xs text-cyan-400">
          <span className="size-2 rounded-full bg-cyan-400 animate-ping" />
          <span>Synchronizing Midnight Compact Circuits…</span>
        </div>

        <p className="mt-2 text-[11px] text-slate-500 font-mono">
          Pairing BN254 Curves · Proof Server :6300 Ready
        </p>
      </div>
    </div>
  );
}
