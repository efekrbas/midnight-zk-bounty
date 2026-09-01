import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Shield, Cpu, Activity, Search, Filter, CheckCircle2, Copy } from "lucide-react";
import { randomLedgerEvent, type LedgerEvent } from "@/lib/zk";
import { toast } from "sonner";

export function Verifier() {
  const [events, setEvents] = useState<LedgerEvent[]>([]);
  const [filterAction, setFilterAction] = useState<string>("all");
  const [selectedTx, setSelectedTx] = useState<LedgerEvent | null>(null);

  useEffect(() => {
    setEvents(Array.from({ length: 8 }, (_, i) => randomLedgerEvent(i * 0.12)));
    const id = setInterval(() => {
      setEvents((prev) => [randomLedgerEvent(), ...prev].slice(0, 20));
    }, 2400);
    return () => clearInterval(id);
  }, []);

  const filteredEvents = filterAction === "all"
    ? events
    : events.filter((e) => e.action.toLowerCase().includes(filterAction.toLowerCase()));

  return (
    <div className="space-y-6">
      {/* Console Header Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="glass flex items-center gap-3.5 rounded-2xl p-4 border border-border/80">
          <div className="flex size-10 items-center justify-center rounded-xl border border-cyan/40 bg-cyan/10">
            <Cpu className="size-5 text-cyan" />
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase text-muted-foreground">Prover State</p>
            <p className="font-mono text-sm font-bold text-foreground">Docker Proof-Server :6300</p>
          </div>
        </div>

        <div className="glass flex items-center gap-3.5 rounded-2xl p-4 border border-border/80">
          <div className="flex size-10 items-center justify-center rounded-xl border border-violet/40 bg-violet/10">
            <Shield className="size-5 text-violet" />
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase text-muted-foreground">Halo2 Verification</p>
            <p className="font-mono text-sm font-bold text-foreground">100% Constraints Passed</p>
          </div>
        </div>

        <div className="glass flex items-center gap-3.5 rounded-2xl p-4 border border-border/80">
          <div className="flex size-10 items-center justify-center rounded-xl border border-signal/40 bg-signal/10">
            <Activity className="size-5 text-signal" />
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase text-muted-foreground">Ledger Sync Rate</p>
            <p className="font-mono text-sm font-bold text-foreground">~2.4s Settlement Block</p>
          </div>
        </div>
      </div>

      {/* Main Terminal Feed */}
      <div className="glass overflow-hidden rounded-3xl border border-border/80 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <Terminal className="size-5 text-cyan" />
            <div>
              <h3 className="font-mono text-sm font-bold text-foreground">
                midnight-ledger :: zk-verifier-stream
              </h3>
              <p className="font-mono text-[10px] text-muted-foreground">
                Live cryptographic transaction stream on Midnight Testnet
              </p>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2">
            {["all", "zk_snark", "nullifier", "escrow"].map((filter) => (
              <button
                key={filter}
                onClick={() => setFilterAction(filter)}
                className={`rounded-xl px-2.5 py-1 font-mono text-[11px] uppercase transition-colors ${
                  filterAction === filter
                    ? "bg-cyan/20 border border-cyan/40 text-cyan font-bold"
                    : "border border-border/50 bg-background/50 text-muted-foreground hover:text-foreground"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="max-h-[380px] overflow-y-auto p-4 font-mono text-xs space-y-1.5">
          <AnimatePresence initial={false}>
            {filteredEvents.map((e) => (
              <motion.div
                key={e.id}
                layout
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setSelectedTx(e)}
                className="group flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-border/40 bg-background/30 px-3.5 py-2.5 transition-all hover:border-cyan/50 hover:bg-secondary/40 cursor-pointer"
              >
                <span className="text-[11px] text-muted-foreground">
                  {new Date(e.at).toLocaleTimeString("en-GB")}
                </span>
                <span className="rounded-lg border border-primary/40 bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                  {e.action}
                </span>
                <span className="text-cyan">{e.tx.slice(0, 18)}…</span>
                <span className="text-violet">{e.circuit}</span>
                <span className="text-muted-foreground">{e.gasFormatted}</span>
                <span className="ml-auto inline-flex items-center gap-1.5 font-bold text-signal">
                  <CheckCircle2 className="size-3.5" />
                  {e.ms}ms
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Transaction Detail Inspector Modal */}
      <AnimatePresence>
        {selectedTx && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTx(null)}
              className="absolute inset-0 bg-background/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-border p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <h4 className="font-mono text-sm font-bold text-foreground">
                  Transaction Proof Telemetry
                </h4>
                <span className="font-mono text-[10px] text-signal uppercase">Verified</span>
              </div>

              <div className="space-y-2.5 font-mono text-xs">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Transaction Hash</p>
                  <p className="break-all text-cyan mt-0.5">{selectedTx.tx}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Cryptographic Nullifier</p>
                  <p className="break-all text-violet mt-0.5">{selectedTx.nullifier}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="rounded-xl border border-border bg-background/50 p-2.5">
                    <p className="text-[10px] text-muted-foreground">Gas Cost</p>
                    <p className="font-bold text-foreground mt-0.5">{selectedTx.gasFormatted}</p>
                  </div>
                  <div className="rounded-xl border border-border bg-background/50 p-2.5">
                    <p className="text-[10px] text-muted-foreground">Proving Time</p>
                    <p className="font-bold text-signal mt-0.5">{selectedTx.ms} ms</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedTx(null)}
                className="w-full rounded-2xl bg-secondary px-4 py-2.5 text-xs font-semibold text-foreground transition-colors hover:bg-secondary/80"
              >
                Close Inspector
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
