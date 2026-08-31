# Midnight zk-Bounty — contract & lifecycle tests

Decentralized, anonymous bounty platform for the Midnight Network.

## Layout

```
contract/
├── src/
│   ├── bounty.compact        # Compact smart contract
│   ├── witnesses.ts          # BountyPrivateState + witness implementations
│   ├── index.ts              # Re-exports the compiled contract
│   ├── managed/              # `compact compile` output (gitignored)
│   └── test/
│       ├── bounty-simulator.ts   # Off-chain harness via @midnight-ntwrk/compact-runtime
│       └── bounty.test.ts        # Lifecycle tests (vitest)
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

## Prerequisites

- Node.js 22+
- The `compact` compiler CLI (`compact compile --version`)
- Install deps: `npm install`

## Compile the contract

The tests import the compiled JavaScript implementation of the Compact
contract, so it must be built first:

```bash
npm run compact
# -> compact compile src/bounty.compact src/managed/bounty
```

## Run the tests

Once the contract is compiled, run the lifecycle tests locally (no chain, no
proof server — the compact-runtime JavaScript implementation simulates the
circuits):

```bash
npm test
```

Or compile + test in one step:

```bash
npm run test:compile
```

## What the tests cover

1. **Initialize ledger state** — the constructor runs, yielding an empty
   `bounties` map (`bounties.size === 0`, `nextBountyId === 0n`).
2. **Create a bounty** — the creator posts a commitment created from a secret
   pre-image + fresh blinding nonce via `makeCommitment`, recording
   `{ creator, rewardAmount, commitmentHash, isClaimed: false }`.
3. **Claim with a valid proof** — a solver who knows the pre-image publishes a
   proof (the re-blinded commitment); the circuit recomputes it from the
   private witness and verifies it against the stored `commitmentHash`,
   flipping `isClaimed` to `true`. The plain-text secret never appears in the
   public ledger.
4. **Wrong secret reverts** — a wrongly-guessed pre-image produces a mismatch,
   so the `invalid solution proof` assertion throws and the ledger is
   unchanged.
5. **Double claim reverts** — a second claim of the same bounty fails with
   `bounty already claimed`.
