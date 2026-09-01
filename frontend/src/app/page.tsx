"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  PlusCircle,
  Terminal,
  Cpu,
  ArrowUpRight,
  Search,
  Filter,
  SlidersHorizontal,
} from "lucide-react";
import { Backdrop } from "@/components/zk/Backdrop";
import { Header, type WalletState } from "@/components/zk/Header";
import { MarqueeTicker } from "@/components/zk/MarqueeTicker";
import { Stats } from "@/components/zk/Stats";
import { BountyCard } from "@/components/zk/BountyCard";
import { ClaimModal } from "@/components/zk/ClaimModal";
import { CreateBounty } from "@/components/zk/CreateBounty";
import { Verifier } from "@/components/zk/Verifier";
import { ZkProtocolVault } from "@/components/zk/ZkProtocolVault";
import { HeroBountyShowcase } from "@/components/zk/HeroBountyShowcase";
import { HowItWorks } from "@/components/zk/HowItWorks";
import { ComparisonTable } from "@/components/zk/ComparisonTable";
import { FaqSection } from "@/components/zk/FaqSection";
import { MidnightGlyph } from "@/components/zk/MidnightGlyph";
import { AppSplashScreen } from "@/components/zk/AppSplashScreen";
import { BOUNTIES as DEFAULT_BOUNTIES, type Bounty } from "@/lib/zk";
import { toast } from "sonner";

const TABS = [
  { id: "explore", label: "Explore Bounties", icon: ShieldCheck },
  { id: "create", label: "Create Shielded Bounty", icon: PlusCircle },
  { id: "vault", label: "ZK Circuit Visualizer", icon: Cpu },
  { id: "verify", label: "ZK Verifier / Mempool", icon: Terminal },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function Home() {
  const [wallet, setWallet] = useState<WalletState>(null);
  const [tab, setTab] = useState<TabId>("explore");
  const [bounties, setBounties] = useState<Bounty[]>(DEFAULT_BOUNTIES);
  const [claiming, setClaiming] = useState<Bounty | null>(null);
  const [claimedIds, setClaimedIds] = useState<string[]>([]);

  // Search & Filters for Explore Tab
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "claimed">("all");
  const [circuitFilter, setCircuitFilter] = useState<"all" | "Halo2-BN254" | "Compact-ZK">("all");
  const [sortBy, setSortBy] = useState<"highest" | "lowest" | "newest">("highest");

  function handleClaim(b: Bounty) {
    if (!wallet) {
      toast.error("Please connect your Midnight 1AM / Lace wallet to claim");
      return;
    }
    setClaiming(b);
  }

  function handleBountyCreated(newBounty: Bounty) {
    setBounties((prev) => [newBounty, ...prev]);
    setTab("explore");
  }

  function handleClaimSuccess(claimedBounty: Bounty) {
    setClaimedIds((prev) => [...prev, claimedBounty.id]);
    setBounties((prev) =>
      prev.map((b) => (b.id === claimedBounty.id ? { ...b, isClaimed: true } : b)),
    );
  }

  // Filtered & Sorted Bounties
  const filteredBounties = useMemo(() => {
    return bounties
      .filter((b) => {
        const isClaimed = claimedIds.includes(b.id) || b.isClaimed;
        if (statusFilter === "active" && isClaimed) return false;
        if (statusFilter === "claimed" && !isClaimed) return false;
        if (circuitFilter !== "all" && b.circuit !== circuitFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = b.title.toLowerCase().includes(q);
          const matchDesc = b.description.toLowerCase().includes(q);
          const matchHash = b.commitmentHash.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchHash) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "highest") return b.rewardFormatted - a.rewardFormatted;
        if (sortBy === "lowest") return a.rewardFormatted - b.rewardFormatted;
        return b.numericId - a.numericId;
      });
  }, [bounties, claimedIds, searchQuery, statusFilter, circuitFilter, sortBy]);

  return (
    <AppSplashScreen>
      <div className="min-h-screen text-foreground selection:bg-cyan-500/30 selection:text-cyan-300">
        <Backdrop />
        <Header wallet={wallet} setWallet={setWallet} />
        <MarqueeTicker />

        <main className="mx-auto max-w-7xl px-4 sm:px-6 pb-24 pt-8 sm:pt-12">
          {/* Hero Section */}
          <section className="grid items-center gap-8 lg:gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-400 backdrop-blur-sm"
              >
                <MidnightGlyph className="size-3.5" />
                <span>Midnight Network · Compact v0.22</span>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 }}
                className="mt-5 text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.12]"
              >
                Bounties settled{" "}
                <span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
                  without exposing
                </span>{" "}
                the secret.
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
                className="mt-4 text-sm sm:text-base leading-relaxed text-slate-300 max-w-xl"
              >
                Lock tDUST in persistent zero-knowledge commitments. Solvers prove solutions
                client-side via Halo2 zk-SNARKs and claim rewards on Midnight without revealing sensitive pre-images.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 }}
                className="mt-6 sm:mt-8 flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs text-slate-300"
              >
                <div className="flex items-center gap-2 rounded-xl bg-white/[0.03] border border-white/[0.08] px-3 py-1.5 sm:px-3.5 sm:py-2">
                  <ShieldCheck className="size-4 text-cyan-400 shrink-0" />
                  <span>100% Client-Side ZK</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-white/[0.03] border border-white/[0.08] px-3 py-1.5 sm:px-3.5 sm:py-2">
                  <span className="size-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <span>Preprod Ready</span>
                </div>
                <a
                  href="https://docs.midnight.network/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] hover:text-cyan-400 px-3 py-1.5 sm:px-3.5 sm:py-2 transition-colors"
                >
                  <span>Docs</span>
                  <ArrowUpRight className="size-3.5" />
                </a>
              </motion.div>
            </div>

            {/* Interactive Live Bounty Showcase Card in Hero */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.12, duration: 0.4 }}
            >
              <HeroBountyShowcase />
            </motion.div>
          </section>

          {/* Global Network Stats */}
          <div className="mt-12 sm:mt-14">
            <Stats />
          </div>

          {/* Navigation Tabs (Mobile-Friendly Horizontal Scroll) */}
          <div className="mt-12 sm:mt-14 flex items-center justify-between border-b border-white/[0.08] pb-4">
            <div className="overflow-x-auto max-w-full pb-1 -mb-1">
              <nav className="inline-flex gap-1.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] p-1.5 whitespace-nowrap">
                {TABS.map((t) => {
                  const Icon = t.icon;
                  const active = tab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTab(t.id)}
                      className={`relative inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                        active
                          ? "text-slate-950 bg-cyan-500 shadow-md"
                          : "text-slate-400 hover:text-white hover:bg-white/[0.06]"
                      }`}
                    >
                      <Icon className="size-3.5 shrink-0" />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <span className="hidden lg:inline-block font-mono text-xs text-slate-500">
              {bounties.length} Escrows Registered
            </span>
          </div>

          {/* Active Tab View */}
          <div className="mt-6 sm:mt-8">
            <AnimatePresence mode="wait">
              <motion.section
                key={tab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
              >
                {tab === "explore" && (
                  <div className="space-y-6">
                    {/* Search & Filter Toolbar */}
                    <div className="flex flex-col gap-3 rounded-2xl border border-white/[0.08] bg-[#0d111a]/70 p-3.5 sm:flex-row sm:items-center sm:justify-between">
                      {/* Search input */}
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search bounties by title, circuit or commitment hash…"
                          className="w-full rounded-xl bg-black/40 border border-white/10 pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 outline-none focus:border-cyan-500/50"
                        />
                      </div>

                      {/* Filters */}
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <div className="flex items-center gap-1 rounded-xl bg-white/[0.03] border border-white/[0.08] p-1">
                          <button
                            type="button"
                            onClick={() => setStatusFilter("all")}
                            className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors ${
                              statusFilter === "all" ? "bg-white/10 text-white" : "text-slate-400 hover:text-slate-200"
                            }`}
                          >
                            All
                          </button>
                          <button
                            type="button"
                            onClick={() => setStatusFilter("active")}
                            className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors ${
                              statusFilter === "active" ? "bg-cyan-500/20 text-cyan-400" : "text-slate-400 hover:text-slate-200"
                            }`}
                          >
                            Active
                          </button>
                          <button
                            type="button"
                            onClick={() => setStatusFilter("claimed")}
                            className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors ${
                              statusFilter === "claimed" ? "bg-emerald-500/20 text-emerald-400" : "text-slate-400 hover:text-slate-200"
                            }`}
                          >
                            Claimed
                          </button>
                        </div>

                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value as any)}
                          className="rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-xs text-slate-300 outline-none"
                        >
                          <option value="highest">Reward: High to Low</option>
                          <option value="lowest">Reward: Low to High</option>
                          <option value="newest">Newest First</option>
                        </select>
                      </div>
                    </div>

                    {/* Bounty Card Grid */}
                    {filteredBounties.length > 0 ? (
                      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {filteredBounties.map((b, i) => (
                          <BountyCard
                            key={b.id}
                            bounty={b}
                            index={i}
                            onClaim={handleClaim}
                            claimed={claimedIds.includes(b.id) || b.isClaimed}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-white/[0.08] bg-[#0d111a]/60 p-12 text-center text-slate-400">
                        <p className="text-sm font-medium text-white">No bounties match your search filter</p>
                        <p className="mt-1 text-xs text-slate-500">Try searching with a different keyword or resetting filters.</p>
                      </div>
                    )}
                  </div>
                )}

                {tab === "create" && (
                  <CreateBounty
                    connected={!!wallet}
                    onBountyCreated={handleBountyCreated}
                  />
                )}

                {tab === "vault" && (
                  <div className="space-y-6">
                    <div className="rounded-2xl p-6 border border-white/[0.08] bg-[#0d111a]/80 shadow-2xl">
                      <h3 className="text-lg font-semibold text-white">
                        Midnight Shielded Protocol & Constraint Flow
                      </h3>
                      <p className="mt-1 text-xs text-slate-400">
                        Simulate client witness synthesis, Halo2 gate evaluation, and on-chain escrow unlocking with full constraint inspection.
                      </p>
                      <div className="mt-6">
                        <ZkProtocolVault />
                      </div>
                    </div>
                  </div>
                )}

                {tab === "verify" && <Verifier />}
              </motion.section>
            </AnimatePresence>
          </div>

          {/* Landing Page Features: How It Works */}
          <div className="mt-20">
            <HowItWorks />
          </div>

          {/* Landing Page Features: Traditional vs Midnight Comparison */}
          <div className="mt-12">
            <ComparisonTable />
          </div>

          {/* Landing Page Features: Technical FAQ */}
          <div className="mt-12">
            <FaqSection />
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/[0.08] bg-[#07090e] py-10">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 sm:px-6 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <MidnightGlyph className="size-4 shrink-0" />
              <span className="font-medium text-slate-300">Midnight zk-Bounty · Preprod Testnet & Local Proof-Server :6300</span>
            </div>
            <div className="flex items-center gap-6">
              <a
                href="https://docs.midnight.network/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 hover:text-cyan-400 transition-colors"
              >
                Midnight Docs <ArrowUpRight className="size-3" />
              </a>
              <a
                href="https://github.com/midnight-ntwrk"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 hover:text-cyan-400 transition-colors"
              >
                GitHub <ArrowUpRight className="size-3" />
              </a>
              <span>Apache 2.0 Licensed</span>
            </div>
          </div>
        </footer>

        {/* Proof Claim Modal */}
        <ClaimModal
          bounty={claiming}
          onClose={() => setClaiming(null)}
          onSuccess={handleClaimSuccess}
        />
      </div>
    </AppSplashScreen>
  );
}
