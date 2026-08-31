// Lifecycle tests for the Midnight zk-Bounty contract.
//
// Simulates, purely off-chain via the compact-runtime JavaScript
// implementation:
//   1. Initialize ledger state (constructor runs, empty bounty map).
//   2. Create a bounty committed to a hashed secret.
//   3. Claim it with a valid proof derived from the secret pre-image.
//   4. Assert a wrong secret makes the claim revert.
//
// SPDX-License-Identifier: Apache-2.0

import { beforeEach, describe, expect, it } from "vitest";
import { BountySimulator } from "./bounty-simulator.js";
import { createBountyPrivateState } from "../witnesses.js";

// Deterministic 32-byte helpers so tests are reproducible.
const bytes32 = (fill: number): Uint8Array => new Uint8Array(32).fill(fill);

describe("Midnight zk-Bounty lifecycle", () => {
  // Each test drives an independent ledger; reset the shared simulator state.
  beforeEach(() => {
    BountySimulator.reset();
  });

  it("initializes the ledger with an empty bounty map", () => {
    const sim = BountySimulator.asActor(createBountyPrivateState());
    const ledgerState = sim.getLedger();

    // Constructor ran: nextBountyId starts at 0, no bounties registered.
    expect(ledgerState.nextBountyId).toBe(0n);
    expect(ledgerState.bounties.size()).toBe(0n);
  });

  it("creates a bounty committed to a hashed secret", () => {
    const creatorState = createBountyPrivateState({
      callerAddress: bytes32(1),
      secret: bytes32(0x42), // "solution"
      nonce: bytes32(0xab), // fresh blinding nonce
    });
    const sim = BountySimulator.asActor(creatorState);

    const commitment = BountySimulator.makeCommitment(creatorState.secret, creatorState.nonce);
    const reward = 1_000_000n;
    const bountyId = sim.createBounty(commitment, reward);

    expect(bountyId).toBe(0n);
    const ledgerState = sim.getLedger();
    expect(ledgerState.nextBountyId).toBe(1n);

    const bounty = ledgerState.bounties.lookup(bountyId);
    expect(bounty).toBeDefined();
    expect(bounty!.creator).toEqual(creatorState.callerAddress);
    expect(bounty!.rewardAmount).toBe(reward);
    expect(bounty!.commitmentHash).toEqual(commitment);
    expect(bounty!.isClaimed).toBe(false);
  });

  it("claims a bounty with a valid proof generated from the secret pre-image", () => {
    const secret = bytes32(0x42);
    const nonce = bytes32(0xab);
    const recipient = bytes32(9);

    // The creator posts the bounty (they know the secret to build the commit).
    const creator = BountySimulator.asActor(
      createBountyPrivateState({ callerAddress: bytes32(1), secret, nonce, targetBountyId: 0 }),
    );
    const commitment = BountySimulator.makeCommitment(secret, nonce);
    const bountyId = creator.createBounty(commitment, 5_000_000n);
    expect(bountyId).toBe(0n);

    // A solver who has recovered the pre-image claims it. The proof is the
    // re-blinded commitment produced in-circuit from the private witness; the
    // plain-text secret never appears on-chain.
    const solver = BountySimulator.asActor(
      createBountyPrivateState({
        callerAddress: bytes32(2),
        secret,
        nonce,
        targetBountyId: Number(bountyId),
      }),
    );

    const validProof = BountySimulator.makeCommitment(secret, nonce);
    solver.claimBounty(validProof, recipient);

    const claimed = solver.getLedger().bounties.lookup(bountyId);
    expect(claimed!.isClaimed).toBe(true);
    // The recipient address is disclosed; the ledger reflects the claim.
    expect(claimed!.rewardAmount).toBe(5_000_000n);
  });

  it("reverts the claim when the secret does not match the commitment", () => {
    // Real secret used when the bounty was created...
    const secret = bytes32(0x42);
    const nonce = bytes32(0xab);
    const creator = BountySimulator.asActor(
      createBountyPrivateState({ callerAddress: bytes32(1), secret, nonce, targetBountyId: 0 }),
    );
    const commitment = BountySimulator.makeCommitment(secret, nonce);
    creator.createBounty(commitment, 3_000_000n);

    // ...but the claimant supplies a WRONG secret in their private state.
    const wrongSecret = bytes32(0x99);
    const wrongNonce = bytes32(0xcd);
    const attacker = BountySimulator.asActor(
      createBountyPrivateState({
        callerAddress: bytes32(2),
        secret: wrongSecret,
        nonce: wrongNonce,
        targetBountyId: 0,
      }),
    );

    // The proof they publish is the commitment of the wrong secret, so the
    // circuit's `stored.commitmentHash == recomputedHash` assert must fail.
    const invalidProof = BountySimulator.makeCommitment(wrongSecret, wrongNonce);
    expect(() => attacker.claimBounty(invalidProof, bytes32(9))).toThrow(
      "invalid solution proof",
    );

    // Ledger untouched: bounty still unclaimed.
    const after = attacker.getLedger().bounties.lookup(0n);
    expect(after!.isClaimed).toBe(false);
  });

  it("reverts a double claim of the same bounty", () => {
    const secret = bytes32(0x11);
    const nonce = bytes32(0x22);
    const creator = BountySimulator.asActor(
      createBountyPrivateState({ callerAddress: bytes32(1), secret, nonce, targetBountyId: 0 }),
    );
    const commitment = BountySimulator.makeCommitment(secret, nonce);
    creator.createBounty(commitment, 10_000n);

    const proof = BountySimulator.makeCommitment(secret, nonce);
    creator.claimBounty(proof, bytes32(9));

    const second = BountySimulator.asActor(
      createBountyPrivateState({
        callerAddress: bytes32(2),
        secret,
        nonce,
        targetBountyId: 0,
      }),
    );
    expect(() => second.claimBounty(proof, bytes32(8))).toThrow(
      "bounty already claimed",
    );
  });
});
