"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Shield,
  Download,
  Zap,
  ExternalLink,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { MidnightGlyph } from "./MidnightGlyph";
import {
  getMidnightWalletConnector,
  connectRealMidnightWallet,
  type WalletState,
} from "@/lib/midnight-wallet";

export function WalletConnectModal({
  isOpen,
  onClose,
  onConnected,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConnected: (state: NonNullable<WalletState>) => void;
}) {
  const [detectedConnector, setDetectedConnector] = useState<ReturnType<typeof getMidnightWalletConnector>>(null);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Probe window.cardano.lace / window.midnight
      const conn = getMidnightWalletConnector();
      setDetectedConnector(conn);
    }
  }, [isOpen]);

  async function handleConnectExtension() {
    setConnecting(true);
    try {
      const res = await connectRealMidnightWallet("preprod");
      onConnected(res);
      onClose();
      toast.success(`Connected with ${res.walletName || "Lace"}!`);
    } catch (err: any) {
      toast.error(err?.message || "Lace connection cancelled");
    } finally {
      setConnecting(false);
    }
  }

  async function handleConnectBridge() {
    setConnecting(true);
    await new Promise((r) => setTimeout(r, 600));

    onConnected({
      isRealExtension: false,
      address: "0x7F4c19aE0b23dd3B92E82910F4E8391C0",
      shieldedKey: "coin_pk:0x9A48F32C0198DE7324B6A9910D7E44C2",
      balanceStars: 4_218_420_000n,
      network: "preprod",
      serviceUris: {
        proofServerUri: "http://127.0.0.1:6300",
        indexerUri: "https://indexer.preprod.midnight.network/api/v1/graphql",
        indexerWsUri: "wss://indexer.preprod.midnight.network/api/v1/graphql/ws",
        substrateNodeUri: "https://rpc.preprod.midnight.network",
      },
    });
    setConnecting(false);
    onClose();
    toast.success("Connected via Preprod Testnet Bridge (Demo Account)");
  }

  const hasExtension = !!detectedConnector;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/[0.12] bg-[#0d111a] p-6 shadow-2xl z-10"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl border border-white/10 bg-[#07090e]">
                  <MidnightGlyph className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Connect Lace Wallet</h3>
                  <p className="text-xs text-slate-400">Midnight Network & Cardano CIP-30</p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-6 space-y-3">
              {/* Option 1: Detected Lace Extension */}
              <div
                className={`rounded-2xl border p-4 transition-all ${
                  hasExtension
                    ? "border-cyan-500/40 bg-cyan-500/10 shadow-lg shadow-cyan-500/10"
                    : "border-white/10 bg-white/[0.02]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#07090e] border border-white/10">
                      <Shield className="size-5 text-cyan-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">
                        {detectedConnector?.name || "Lace Extension"}
                      </h4>
                      <p className="text-xs text-slate-300">
                        {hasExtension
                          ? "Extension active in your browser"
                          : "Lace extension not detected in window"}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-mono font-medium ${
                      hasExtension
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                    }`}
                  >
                    {hasExtension ? "Detected" : "Not Found"}
                  </span>
                </div>

                <div className="mt-3.5">
                  {hasExtension ? (
                    <button
                      type="button"
                      onClick={handleConnectExtension}
                      disabled={connecting}
                      className="w-full rounded-xl bg-cyan-500 hover:bg-cyan-400 py-2.5 px-4 text-xs font-bold text-slate-950 transition-all shadow-md active:scale-98"
                    >
                      {connecting ? "Waiting for Lace Approval…" : "Connect Lace Wallet"}
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => {
                          const conn = getMidnightWalletConnector();
                          setDetectedConnector(conn);
                          if (conn) {
                            toast.success("Lace detected!");
                          } else {
                            toast.error("Please refresh the page after opening Lace extension");
                          }
                        }}
                        className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 py-2 px-4 text-xs font-semibold text-slate-200 transition-colors"
                      >
                        <RefreshCw className="size-3.5 text-cyan-400" />
                        <span>Re-detect Lace Extension</span>
                      </button>

                      <a
                        href="https://www.lace.io/"
                        target="_blank"
                        rel="noreferrer"
                        className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/5 py-1.5 px-4 text-[11px] text-slate-400 transition-colors"
                      >
                        <Download className="size-3 text-slate-500" />
                        <span>Download Lace from lace.io</span>
                        <ExternalLink className="size-3 text-slate-500 ml-0.5" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Option 2: Preprod Testnet Bridge Sandbox */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 hover:border-white/20 transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#07090e] border border-white/10">
                      <Zap className="size-5 text-indigo-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">
                        Preprod Testnet Bridge
                      </h4>
                      <p className="text-xs text-slate-400">
                        Zero-setup simulator for testing ZK proofs
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full bg-indigo-500/20 border border-indigo-500/30 px-2 py-0.5 font-mono text-[10px] text-indigo-300 font-medium">
                    Ready
                  </span>
                </div>

                <div className="mt-3.5">
                  <button
                    type="button"
                    onClick={handleConnectBridge}
                    disabled={connecting}
                    className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 py-2.5 px-4 text-xs font-bold text-white transition-colors shadow-sm"
                  >
                    Connect Testnet Bridge (Instant Sandbox)
                  </button>
                </div>
              </div>
            </div>

            <p className="mt-4 text-center text-[11px] text-slate-500">
              Compatible with Midnight Preprod Testnet & Local Docker Proof Server :6300
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
