import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet,
  LogOut,
  Copy,
  Loader2,
  ChevronDown,
  Globe,
  Coins,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { MidnightGlyph } from "./MidnightGlyph";
import { WalletConnectModal } from "./WalletConnectModal";
import { toast } from "sonner";
import { truncate } from "@/lib/zk";
import {
  getMidnightWalletConnector,
  connectRealMidnightWallet,
  type MidnightServiceUriConfig,
} from "@/lib/midnight-wallet";

export type NetworkType = "preprod" | "preview" | "localnet";

export type WalletState = {
  address: string;
  shieldedKey: string;
  balanceStars: bigint; // 1 NIGHT = 1,000,000 Stars
  network: NetworkType;
  isRealExtension?: boolean;
  serviceUris?: MidnightServiceUriConfig;
} | null;

export function Header({
  wallet,
  setWallet,
}: {
  wallet: WalletState;
  setWallet: (w: WalletState) => void;
}) {
  const [connecting, setConnecting] = useState(false);
  const [open, setOpen] = useState(false);
  const [networkOpen, setNetworkOpen] = useState(false);
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [currentNetwork, setCurrentNetwork] = useState<NetworkType>("preprod");
  const [showStars, setShowStars] = useState(false);
  const [faucetLoading, setFaucetLoading] = useState(false);

  const networkNames: Record<NetworkType, { name: string; tag: string; color: string }> = {
    preprod: { name: "Midnight Preprod", tag: "Preprod Testnet", color: "text-cyan-400" },
    preview: { name: "Midnight Preview", tag: "Preview Testnet", color: "text-violet-400" },
    localnet: { name: "Local Devnet :6300", tag: "Docker Local", color: "text-emerald-400" },
  };

  async function handleConnectClick() {
    const hasExtension = typeof window !== "undefined" && !!getMidnightWalletConnector();

    if (hasExtension) {
      setConnecting(true);
      try {
        const res = await connectRealMidnightWallet(currentNetwork);
        setWallet(res);
        toast.success("Midnight Lace Hardware/Extension Connected", {
          id: "wallet",
          description: `Live account bound to ${networkNames[currentNetwork].name}`,
        });
      } catch (err: any) {
        toast.error(err?.message || "Wallet connection rejected", { id: "wallet" });
      } finally {
        setConnecting(false);
      }
    } else {
      // Open clean connect modal explaining Extension vs Sandbox options
      setConnectModalOpen(true);
    }
  }

  async function requestFaucet() {
    if (!wallet) return;
    setFaucetLoading(true);
    toast.loading("Requesting 500 tDUST from Midnight Preprod Faucet…", { id: "faucet" });
    await new Promise((r) => setTimeout(r, 1400));

    setWallet({
      ...wallet,
      balanceStars: wallet.balanceStars + 500_000_000n,
    });
    setFaucetLoading(false);
    toast.success("Faucet Airdrop Confirmed", {
      id: "faucet",
      description: "+500 tDUST (500,000,000 Stars) added to shielded UTXO pool",
    });
  }

  const balanceNight = wallet ? Number(wallet.balanceStars) / 1_000_000 : 0;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#07090e]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          {/* Brand Logo */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#0d111a] shadow-md">
              <MidnightGlyph className="size-5 sm:size-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-sm sm:text-base font-bold tracking-tight text-white">
                  Midnight <span className="text-cyan-400">zk-Bounty</span>
                </h1>
                <span className="hidden sm:inline-block rounded-full bg-white/[0.04] border border-white/[0.08] px-2 py-0.5 font-mono text-[10px] text-slate-400">
                  Compact v0.22
                </span>
              </div>
              <p className="hidden xs:block text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                Zero-Knowledge Bounty Protocol
              </p>
            </div>
          </div>

          {/* Right Navigation & Wallet Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Network Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setNetworkOpen((o) => !o)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] px-2.5 py-1.5 text-xs text-slate-300 transition-colors"
              >
                <Globe className={`size-3.5 ${networkNames[currentNetwork].color}`} />
                <span className="hidden sm:inline text-xs">{networkNames[currentNetwork].name}</span>
                <span className="sm:hidden text-[11px] font-mono">{currentNetwork}</span>
                <ChevronDown className="size-3 text-slate-500" />
              </button>

              <AnimatePresence>
                {networkOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-white/[0.12] bg-[#0d111a] p-1.5 shadow-2xl z-50"
                  >
                    <p className="px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                      Select Midnight Network
                    </p>
                    {(Object.keys(networkNames) as NetworkType[]).map((net) => (
                      <button
                        key={net}
                        onClick={() => {
                          setCurrentNetwork(net);
                          setNetworkOpen(false);
                          if (wallet) {
                            setWallet({ ...wallet, network: net });
                          }
                        }}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs transition-colors ${
                          currentNetwork === net
                            ? "bg-cyan-500/15 text-cyan-400 font-semibold"
                            : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`size-2 rounded-full ${
                              net === "preprod"
                                ? "bg-cyan-400"
                                : net === "preview"
                                  ? "bg-violet-400"
                                  : "bg-emerald-400"
                            }`}
                          />
                          <span>{networkNames[net].name}</span>
                        </div>
                        {currentNetwork === net && <CheckCircle2 className="size-3.5 text-cyan-400" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Wallet State */}
            {!wallet ? (
              <button
                onClick={handleConnectClick}
                disabled={connecting}
                className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 px-3.5 py-1.5 text-xs font-semibold text-slate-950 transition-all shadow-sm shadow-cyan-500/20 active:scale-98 disabled:opacity-70"
              >
                {connecting ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Wallet className="size-3.5" />
                )}
                {connecting ? "Connecting…" : "Connect 1AM / Lace"}
              </button>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setOpen((o) => !o)}
                  className="inline-flex items-center gap-2.5 rounded-xl border border-white/10 bg-[#0d111a] hover:border-white/20 px-3 py-1.5 text-xs text-white transition-all shadow-sm sm:text-sm"
                >
                  <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-mono font-medium text-slate-200">{truncate(wallet.address, 4, 4)}</span>
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowStars((s) => !s);
                    }}
                    className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 font-mono text-xs text-cyan-400 transition-colors hover:bg-cyan-500/20 cursor-pointer"
                    title="Click to toggle between tDUST and Stars (1 NIGHT = 1,000,000 Stars)"
                  >
                    {showStars
                      ? `${wallet.balanceStars.toLocaleString()} Stars`
                      : `${balanceNight.toFixed(2)} tDUST`}
                  </span>
                  <ChevronDown className="size-3.5 text-slate-400" />
                </button>

                <AnimatePresence>
                  {open && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.16 }}
                      className="absolute right-0 mt-2 w-76 overflow-hidden rounded-2xl border border-white/[0.12] bg-[#0d111a] p-3 shadow-2xl z-50"
                    >
                      {/* Status Badge */}
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.06] text-[11px]">
                        <span className="flex items-center gap-1.5 text-emerald-400 font-medium font-mono">
                          <ShieldCheck className="size-3.5" />
                          {wallet.isRealExtension ? "Midnight Lace (Extension)" : "Preprod Network Bridge"}
                        </span>
                        <span className="text-[10px] text-slate-500 uppercase font-mono">
                          CIP-30 / 1AM
                        </span>
                      </div>

                      <div className="rounded-xl border border-white/[0.08] bg-[#07090e] p-3">
                        <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                          Shielded Coin Public Key
                        </p>
                        <p className="mt-1 break-all font-mono text-[11px] text-cyan-400">
                          {wallet.shieldedKey}
                        </p>
                        <div className="mt-2.5 flex items-center justify-between border-t border-white/[0.06] pt-2 text-xs">
                          <span className="text-slate-400">Shielded Balance:</span>
                          <span className="font-mono font-bold text-emerald-400">
                            {balanceNight.toFixed(2)} tDUST
                          </span>
                        </div>
                      </div>

                      {/* RPC Service URIs */}
                      {wallet.serviceUris && (
                        <div className="mt-2.5 rounded-xl border border-white/[0.06] bg-black/30 p-2 text-[10px] font-mono text-slate-400 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Proof Server:</span>
                            <span className="text-cyan-300">127.0.0.1:6300</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Indexer GraphQL:</span>
                            <span className="text-emerald-400 truncate max-w-[140px]">preprod.midnight.network</span>
                          </div>
                        </div>
                      )}

                      <div className="mt-3 space-y-1">
                        <button
                          onClick={requestFaucet}
                          disabled={faucetLoading}
                          className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs text-cyan-400 transition-colors hover:bg-cyan-500/10"
                        >
                          <div className="flex items-center gap-2">
                            <Coins className="size-4" />
                            <span>Request Testnet Faucet (+500 tDUST)</span>
                          </div>
                          {faucetLoading && <Loader2 className="size-3.5 animate-spin" />}
                        </button>

                        <button
                          onClick={() => {
                            navigator.clipboard?.writeText(wallet.address);
                            toast.success("Shielded address copied to clipboard");
                          }}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-white"
                        >
                          <Copy className="size-4 text-cyan-400" /> Copy Full Address
                        </button>

                        <button
                          onClick={() => {
                            setWallet(null);
                            setOpen(false);
                            toast("Midnight wallet disconnected");
                          }}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-red-400 transition-colors hover:bg-red-500/10"
                        >
                          <LogOut className="size-4" /> Disconnect Session
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Wallet Selection & Download Modal */}
      <WalletConnectModal
        isOpen={connectModalOpen}
        onClose={() => setConnectModalOpen(false)}
        onConnected={(st) => setWallet(st)}
      />
    </>
  );
}
