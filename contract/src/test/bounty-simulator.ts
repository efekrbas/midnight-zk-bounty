// Simulator harness for the Midnight zk-Bounty contract.
//
// This drives the compiled JavaScript implementation of the Compact contract
// (produced by `compact compile`) directly, WITHOUT a live chain, node, or
// proof server. It is the same pattern used by the official
// midnightntwrk/example-counter reference app and lets us exercise the full
// bounty lifecycle off-chain in a fast, deterministic test.
//
// SPDX-License-Identifier: Apache-2.0

import {
  type CircuitContext,
  createConstructorContext,
  createCircuitContext,
  sampleContractAddress,
  persistentCommit,
  Bytes32Descriptor,
  type ChargedState,
  type EncodedZswapLocalState,
} from "@midnight-ntwrk/compact-runtime";
import {
  Contract,
  ledger,
  type Ledger,
} from "../managed/bounty/contract/index.js";
import { type BountyPrivateState, witnesses } from "../witnesses.js";

export class BountySimulator {
  readonly contract: Contract<BountyPrivateState>;
  circuitContext: CircuitContext<BountyPrivateState>;

  // A single ledger shared across every actor so that a bounty created by one
  // caller is visible to the others (as on a real chain). All actors live in
  // one process, so we keep one shared on-chain state here.
  private static sharedLedger: {
    state: ChargedState;
    zswap: EncodedZswapLocalState;
  } | undefined;

  constructor(privateState: BountyPrivateState) {
    // Build the contract. The first actor also runs the constructor against a
    // blank ledger; every actor afterwards builds on that same shared ledger.
    this.contract = new Contract<BountyPrivateState>(witnesses);
    if (BountySimulator.sharedLedger === undefined) {
      const {
        currentPrivateState,
        currentContractState,
        currentZswapLocalState,
      } = this.contract.initialState(
        createConstructorContext(privateState, "0".repeat(64)),
      );

      this.circuitContext = createCircuitContext(
        sampleContractAddress(),
        currentZswapLocalState,
        currentContractState,
        currentPrivateState,
      );

      BountySimulator.sharedLedger = {
        state: this.circuitContext.currentQueryContext.state,
        zswap: this.circuitContext.currentZswapLocalState,
      };
    } else {
      this.circuitContext = createCircuitContext(
        sampleContractAddress(),
        BountySimulator.sharedLedger.zswap,
        BountySimulator.sharedLedger.state,
        privateState,
      );
    }
  }

  private updateSharedLedger(context: CircuitContext<BountyPrivateState>) {
    BountySimulator.sharedLedger = {
      state: context.currentQueryContext.state,
      zswap: context.currentZswapLocalState,
    };
  }

  // Read the current public ledger (plaintext, on-chain-equivalent state).
  getLedger(): Ledger {
    return ledger(this.circuitContext.currentQueryContext.state);
  }

  // A fresh simulator whose witnesses act as a *different* caller (different
  // private state) but which still operates on the same shared ledger.
  static asActor(privateState: BountyPrivateState): BountySimulator {
    return new BountySimulator(privateState);
  }

  // Drop the shared ledger so a fresh test starts from an empty on-chain state.
  static reset() {
    BountySimulator.sharedLedger = undefined;
  }

  // Transition 1: createBounty(commitment, reward) -> returns the bounty id.
  createBounty(commitment: Uint8Array, reward: bigint): bigint {
    const { result, context } = this.contract.impureCircuits.createBounty(
      this.circuitContext,
      commitment,
      reward,
    );
    this.circuitContext = context;
    this.updateSharedLedger(context);
    return result;
  }

  // Transition 2: claimBounty(secretProof, recipientAddress).
  // `secretProof` is the re-blinded commitment produced from the private
  // pre-image + nonce; the circuit verifies it matches on-chain.
  claimBounty(secretProof: Uint8Array, recipientAddress: Uint8Array): bigint {
    const { result, context } = this.contract.impureCircuits.claimBounty(
      this.circuitContext,
      secretProof,
      recipientAddress,
    );
    this.circuitContext = context;
    this.updateSharedLedger(context);
    return result;
  }

  // Blind a solution: persistentCommit(secret, nonce) -> 32-byte commitment.
  // Mirrors the pure `makeCommitment` circuit so tests can build bounties
  // exactly as the contract expects.
  static makeCommitment(secret: Uint8Array, nonce: Uint8Array): Uint8Array {
    return persistentCommit(Bytes32Descriptor, secret, nonce);
  }
}
