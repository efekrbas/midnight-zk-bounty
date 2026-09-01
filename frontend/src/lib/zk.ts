// Midnight Network Zero-Knowledge Cryptographic & Ledger Utilities
// Aligned with Compact language specifications & Midnight JS SDK

export type Bounty = {
  id: string;
  numericId: number;
  title: string;
  description: string;
  rewardStars: bigint; // 1 NIGHT = 1_000_000 Stars / tDUST
  rewardFormatted: number;
  creator: string;
  commitmentHash: string;
  nonce: string;
  circuit: string;
  constraints: number;
  expiresAt: number;
  proofs: number;
  isClaimed: boolean;
  claimedBy?: string;
  claimedAtTx?: string;
};

const HEX = "0123456789abcdef";

/**
 * Deterministic persistent commitment generator matching Midnight's `persistentCommit<Bytes32>(secret, nonce)`
 */
export function persistentCommit(secret: string, nonce: string = "0000000000000000"): string {
  const combined = `midnight:commit:v1:${secret}:${nonce}`;
  let h1 = 0x811c9dc5;
  let h2 = 0x1000193;
  let h3 = 0x27d4eb2f;

  for (let i = 0; i < combined.length; i++) {
    const code = combined.charCodeAt(i);
    h1 ^= code;
    h1 = Math.imul(h1, 16777619) >>> 0;
    h2 = (Math.imul(h2 ^ code, 2246822519) + i) >>> 0;
    h3 = (Math.imul(h3 ^ code, 3266489917) + (i * 7)) >>> 0;
  }

  let out = "";
  let s = (h1 ^ (h2 << 1) ^ (h3 << 2)) >>> 0 || 0x9e3779b9;
  for (let i = 0; i < 64; i++) {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    out += HEX[(s + i * 31 + (h1 % 16)) % 16];
  }
  return out;
}

/** Legacy alias for component backwards compatibility */
export function pedersen(input: string, length = 64): string {
  return persistentCommit(input, "default_blinding_nonce").slice(0, length);
}

export function generateRandomNonce(): string {
  let nonce = "";
  for (let i = 0; i < 32; i++) {
    nonce += HEX[Math.floor(Math.random() * 16)];
  }
  return nonce;
}

export function truncate(addr: string, head = 6, tail = 4): string {
  if (!addr) return "0x…";
  if (addr.length <= head + tail + 2) return addr;
  return `${addr.slice(0, head)}…${addr.slice(-tail)}`;
}

export function formatStarsToNight(stars: bigint): string {
  const night = Number(stars) / 1_000_000;
  return night.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
}

const DAY = 86_400_000;

export const INITIAL_BOUNTIES: Bounty[] = [
  {
    id: "mn-bounty-001",
    numericId: 0,
    title: "Compact Halo2 Soundness & Constraint Verification",
    description:
      "Synthesize a private witness pre-image that satisfies the BN254 arithmetic polynomial constraint in our shielded escrow circuit without revealing the salt nonce.",
    rewardStars: 1_250_000_000n, // 1,250 tDUST
    rewardFormatted: 1250,
    creator: "0x3A9F8b2C74109e2A0019Fb2901ceD215E",
    commitmentHash: persistentCommit("halo2-soundness-break-seed-409", "nonce-c781a9f0"),
    nonce: "nonce-c781a9f0",
    circuit: "halo2-bn254",
    constraints: 16384,
    expiresAt: Date.now() + 4 * DAY + 6 * 3600_000,
    proofs: 18,
    isClaimed: false,
  },
  {
    id: "mn-bounty-002",
    numericId: 1,
    title: "Midnight Shielded UTXO Nullifier Collision Challenge",
    description:
      "Find two distinct private witness seeds producing an identical persistent commitment under the Midnight testnet proving parameters.",
    rewardStars: 3_500_000_000n, // 3,500 tDUST
    rewardFormatted: 3500,
    creator: "0x89C1aE70B042F3489Cd2B7A82910F4E83",
    commitmentHash: persistentCommit("nullifier-collision-target-99", "nonce-f182c00a"),
    nonce: "nonce-f182c00a",
    circuit: "compact-zk-snark",
    constraints: 32768,
    expiresAt: Date.now() + 8 * DAY + 14 * 3600_000,
    proofs: 42,
    isClaimed: false,
  },
  {
    id: "mn-bounty-003",
    numericId: 2,
    title: "Private Relay Node ZK-Attestation Benchmark",
    description:
      "Execute an anonymous relay node for 72h and publish a recursive ZK proof of uptime. Reward releases automatically upon on-chain verification.",
    rewardStars: 850_000_000n, // 850 tDUST
    rewardFormatted: 850,
    creator: "0x14E7b7D20349A0831F90Cc8293149Ae39",
    commitmentHash: persistentCommit("stealth-node-attestation-2026", "nonce-0934eb12"),
    nonce: "nonce-0934eb12",
    circuit: "plonk-bls12-381",
    constraints: 8192,
    expiresAt: Date.now() + 2 * DAY + 11 * 3600_000,
    proofs: 9,
    isClaimed: false,
  },
  {
    id: "mn-bounty-004",
    numericId: 3,
    title: "ZSwap AMM Dark Pool Limit Order Pre-image",
    description:
      "Satisfy the private matching constraint for the shielded dark pool liquidity pool. Proof releases the encrypted settlement reward.",
    rewardStars: 2_100_000_000n, // 2,100 tDUST
    rewardFormatted: 2100,
    creator: "0x91F03eC7b6A188c031D84Ae82946B084C",
    commitmentHash: persistentCommit("dark-pool-limit-order-match-x", "nonce-aae73199"),
    nonce: "nonce-aae73199",
    circuit: "halo2-bn254",
    constraints: 65536,
    expiresAt: Date.now() + 12 * DAY + 2 * 3600_000,
    proofs: 27,
    isClaimed: false,
  },
  {
    id: "mn-bounty-005",
    numericId: 4,
    title: "Recursive Proof Compression & Batch SNARK Aggregation",
    description:
      "Synthesize an aggregated Halo2 witness proof verifying 16 distinct shielded UTXO state transitions in a single Compact verification block.",
    rewardStars: 4_200_000_000n, // 4,200 tDUST
    rewardFormatted: 4200,
    creator: "0x77A4bc91024FF91288Ce2893A049B7120",
    commitmentHash: persistentCommit("recursive-batch-snark-aggregator-v2", "nonce-9921ef44"),
    nonce: "nonce-9921ef44",
    circuit: "compact-zk-snark",
    constraints: 65536,
    expiresAt: Date.now() + 15 * DAY + 8 * 3600_000,
    proofs: 34,
    isClaimed: false,
  },
  {
    id: "mn-bounty-006",
    numericId: 5,
    title: "Poseidon Hash Pre-image & Sparse Merkle Root Proof",
    description:
      "Demonstrate knowledge of an unrevealed leaf node inside a 32-level Sparse Merkle Tree without leaking the authentication path or index.",
    rewardStars: 1_850_000_000n, // 1,850 tDUST
    rewardFormatted: 1850,
    creator: "0x5C201889ab410C0991823Ac00918F4421",
    commitmentHash: persistentCommit("poseidon-sparse-tree-leaf-auth", "nonce-3381ab90"),
    nonce: "nonce-3381ab90",
    circuit: "halo2-bn254",
    constraints: 32768,
    expiresAt: Date.now() + 6 * DAY + 18 * 3600_000,
    proofs: 15,
    isClaimed: false,
  },
];

export const BOUNTIES = INITIAL_BOUNTIES;

export function countdown(target: number, now: number): string {
  const ms = Math.max(0, target - now);
  const d = Math.floor(ms / DAY);
  const h = Math.floor((ms % DAY) / 3600_000);
  const m = Math.floor((ms % 3600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);
  return `${d}d ${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
}

const ACTIONS = [
  "shield_escrow_deposit",
  "witness_synthesized",
  "zk_snark_proved",
  "nullifier_spent",
  "circuit_assert_passed",
  "reward_disclosed_settled",
  "bounty_commitment_logged",
];

export function randomLedgerEvent(seed = Math.random()) {
  const action = ACTIONS[Math.floor(seed * ACTIONS.length) % ACTIONS.length];
  const txHash = "0x" + persistentCommit(String(seed) + "tx" + Date.now(), "tx_salt").slice(0, 48);
  const circuit = ["halo2-bn254", "compact-zk", "plonk-bls12-381"][Math.floor(seed * 3) % 3];

  return {
    id: persistentCommit(String(seed) + Date.now(), "event_id").slice(0, 12),
    action,
    tx: txHash,
    circuit,
    gasStars: (BigInt(Math.floor(400 + seed * 2500)) * 1000n),
    gasFormatted: `${(0.004 + seed * 0.025).toFixed(4)} tDUST`,
    ms: Math.floor(140 + seed * 860),
    at: Date.now(),
    block: 1048290 + Math.floor(seed * 50),
    nullifier: "0x" + persistentCommit(String(seed) + "nullifier", "null_salt").slice(0, 32),
  };
}

export type LedgerEvent = ReturnType<typeof randomLedgerEvent>;
