import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { ShieldCheck, PlusCircle, Terminal, Box, Sparkles, Lock, ArrowUpRight } from "lucide-react";
import { Backdrop } from "@/components/zk/Backdrop";
import { Header, type WalletState } from "@/components/zk/Header";
import { Stats } from "@/components/zk/Stats";
import { BountyCard } from "@/components/zk/BountyCard";
import { ClaimModal } from "@/components/zk/ClaimModal";
import { CreateBounty } from "@/components/zk/CreateBounty";
import { Verifier } from "@/components/zk/Verifier";
import { ZkThreeManifold } from "@/components/zk/ZkThreeManifold";
import { BOUNTIES as DEFAULT_BOUNTIES, type Bounty } from "@/lib/zk";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Midnight zk-Bounty — Zero-Knowledge Bounty Protocol" },
      {
        name: "description",
        content:
          "Post and claim shielded bounties on the Midnight testnet. Client-side witnesses, zk-SNARK proofs, and private tDUST escrow.",
      },
      { property: "og:title", content: "Midnight zk-Bounty — Zero-Knowledge Bounty Protocol" },
      {
        property: "og:description",
        content: "Shielded bounty escrow with client-side zk proof generation on Midnight.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const TABS = [
  { id: "explore", label: "Explore Bounties", icon: ShieldCheck },
  { id: "create", label: "Create Shielded Bounty", icon: PlusCircle },
  { id: "manifold", label: "3D Circuit Manifold", icon: Box },
  { id: "verify", label: "ZK Verifier / Mempool", icon: Terminal },
] as const;

type TabId = (typeof TABS)[number]["id"];

function Index() {
  const [wallet, setWallet] = useState<WalletState>(null);
  const [tab, setTab] = useState<TabId>("explore");
  const [bounties, setBounties] = useState<Bounty[]>(DEFAULT_BOUNTIES);
  const [claiming, setClaiming] = useState<Bounty | null>(null);
  const [claimedIds, setClaimedIds] = useState<string[]>([]);

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

  return (
    <div className="min-h-screen text-foreground selection:bg-cyan/30 selection:text-cyan">
      <Backdrop />
      <Header wallet={wallet} setWallet={setWallet} />

      <main className="mx-auto max-w-7xl px-5 pb-24 pt-10">
        {/* Hero Section */}
        <section className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full border border-cyan/40 bg-cyan/10 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-cyan backdrop-blur-md shadow-[0_0_20px_rgba(0,242,254,0.25)]"
            >
              <span className="pulse-dot size-2 rounded-full bg-signal" />
              <span>Midnight Network · Compact v0.22+</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 }}
              className="mt-6 text-4xl font-extrabold leading-[1.12] tracking-tight sm:text-5xl lg:text-6xl"
            >
              Bounties that pay out{" "}
              <span className="text-brand-gradient">without revealing</span> a single secret.
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg"
            >
              Lock tDUST in persistent zero-knowledge commitments. Solvers synthesize client-side
              Halo2 zk-SNARK proofs and settle rewards on Midnight without disclosing sensitive
              pre-images.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
              className="mt-7 flex flex-wrap items-center gap-3.5"
            >
              <button
                onClick={() => setTab("explore")}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-primary via-primary/95 to-cyan px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-[0_0_30px_rgba(108,92,231,0.4)] transition-all hover:brightness-115 hover:shadow-[0_0_40px_rgba(0,242,254,0.5)]"
              >
                <ShieldCheck className="size-4" />
                <span>Explore Active Bounties</span>
              </button>

              <button
                onClick={() => setTab("create")}
                className="glass inline-flex items-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-semibold text-foreground transition-all hover:border-cyan/50 hover:bg-secondary/60"
              >
                <PlusCircle className="size-4 text-cyan" />
                <span>Deploy Bounty Escrow</span>
              </button>
            </motion.div>
          </div>

          {/* 3D Three.js Interactive Zero-Knowledge Manifold */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.6 }}
          >
            <ZkThreeManifold />
          </motion.div>
        </section>

        {/* Global Network Stats */}
        <div className="mt-14">
          <Stats />
        </div>

        {/* Navigation Tabs */}
        <div className="mt-14 flex items-center justify-between border-b border-border/60 pb-4">
          <nav className="glass inline-flex flex-wrap gap-1.5 rounded-2xl p-1.5">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`relative inline-flex items-center gap-2 rounded-xl px-4 py-2.5 font-mono text-xs font-semibold transition-all ${
                    active
                      ? "text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="tab-pill"
                      transition={{ type: "spring", stiffness: 420, damping: 32 }}
                      className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-primary to-cyan shadow-[0_0_20px_rgba(108,92,231,0.5)]"
                    />
                  )}
                  <Icon className="size-4" />
                  {t.label}
                </button>
              );
            })}
          </nav>

          <span className="hidden font-mono text-xs text-muted-foreground sm:inline-block">
            {bounties.length} Total Escrows Registered
          </span>
        </div>

        {/* Active Tab View */}
        <div className="mt-8">
          <AnimatePresence mode="wait">
            <motion.section
              key={tab}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              {tab === "explore" && (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {bounties.map((b, i) => (
                    <BountyCard
                      key={b.id}
                      bounty={b}
                      index={i}
                      onClaim={handleClaim}
                      claimed={claimedIds.includes(b.id) || b.isClaimed}
                    />
                  ))}
                </div>
              )}

              {tab === "create" && (
                <CreateBounty
                  connected={!!wallet}
                  onBountyCreated={handleBountyCreated}
                />
              )}

              {tab === "manifold" && (
                <div className="space-y-6">
                  <div className="glass rounded-3xl p-6 border border-border/80">
                    <h3 className="text-xl font-bold text-foreground">
                      Full Screen 3D Zero-Knowledge Constraint Manifold
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Interactive WebGL visualization of Halo2 BN254 circuit topology and persistent witness commitments.
                    </p>
                    <div className="mt-6">
                      <ZkThreeManifold />
                    </div>
                  </div>
                </div>
              )}

              {tab === "verify" && <Verifier />}
            </motion.section>
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60 bg-background/80 py-10 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 font-mono text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="pulse-dot size-2 rounded-full bg-signal" />
            <span>Midnight zk-Bounty · Preprod Testnet & Local Proof-Server :6300</span>
          </div>
          <div className="flex items-center gap-6">
            <a
              href="https://docs.midnight.network/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 hover:text-cyan transition-colors"
            >
              Midnight Docs <ArrowUpRight className="size-3" />
            </a>
            <a
              href="https://github.com/midnight-ntwrk"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 hover:text-cyan transition-colors"
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
  );
}
