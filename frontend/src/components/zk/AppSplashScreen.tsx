"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MidnightGlyph } from "./MidnightGlyph";

export function AppSplashScreen({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(20);
  const [stage, setStage] = useState("Loading Compact VM Runtime…");

  useEffect(() => {
    const t1 = setTimeout(() => {
      setProgress(65);
      setStage("Pairing Halo2-BN254 Circuits…");
    }, 200);

    const t2 = setTimeout(() => {
      setProgress(100);
      setStage("Midnight Preprod Synchronized");
    }, 500);

    const t3 = setTimeout(() => {
      setLoading(false);
    }, 800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <>
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#07090e] px-4"
          >
            <div className="relative flex flex-col items-center max-w-xs w-full text-center">
              <div className="relative flex size-16 items-center justify-center rounded-2xl border border-white/10 bg-[#0d111a] shadow-2xl">
                <MidnightGlyph className="size-9" />
              </div>

              <h2 className="mt-5 text-sm font-semibold text-white tracking-wide">
                Midnight <span className="text-cyan-400">zk-Bounty</span>
              </h2>

              {/* High-Visibility Animated Progress Bar */}
              <div className="mt-5 w-full rounded-full bg-slate-800/80 h-2 overflow-hidden border border-white/10 p-[1px]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-indigo-400 to-emerald-400 shadow-[0_0_12px_rgba(0,242,254,0.7)] transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="mt-3 flex items-center justify-between w-full text-[11px] font-mono text-slate-400">
                <span className="truncate">{stage}</span>
                <span className="text-cyan-400 font-bold ml-2 tabular-nums">{progress}%</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={loading ? "opacity-0" : "opacity-100 transition-opacity duration-300"}>
        {children}
      </div>
    </>
  );
}
