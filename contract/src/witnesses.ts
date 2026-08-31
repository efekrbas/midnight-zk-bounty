// This file is part of the Midnight zk-Bounty contract.
// SPDX-License-Identifier: Apache-2.0

import type { WitnessContext } from "@midnight-ntwrk/compact-runtime";
import type { Ledger } from "./managed/bounty/contract/index.js";

// ----------------------------------------------------------------------------
// Private state
//
// Everything in here lives only in the caller's wallet / local storage. It is
// NEVER committed to the ledger. The solution pre-image (`secret`) and its
// blinding `nonce` exist solely here and are consumed inside the ZK circuit.
// ----------------------------------------------------------------------------
export type BountyPrivateState = {
  // The 32-byte coin public key / address of the caller driving the circuit.
  callerAddress: Uint8Array;
  // The plain-text solution pre-image. Kept private, never revealed on-chain.
  secret: Uint8Array;
  // A fresh random nonce used to blind the commitment (cannot be brute-forced).
  nonce: Uint8Array;
  // The uint64 key of the bounty the caller intends to claim.
  targetBountyId: number;
};

export const createBountyPrivateState = (
  partial: Partial<BountyPrivateState> = {},
): BountyPrivateState => ({
  callerAddress: new Uint8Array(32),
  secret: new Uint8Array(32),
  nonce: new Uint8Array(32),
  targetBountyId: 0,
  ...partial,
});

// ----------------------------------------------------------------------------
// Witness implementations
//
// Witness bodies are plain TypeScript. The signature is dictated by the
// Compact contract (`witness f(args): Return`), and the runtime supplies the
// leading `context` argument carrying the private state.
// ----------------------------------------------------------------------------
export const witnesses = {
  callerAddress: ({
    privateState,
  }: WitnessContext<Ledger, BountyPrivateState>): [BountyPrivateState, Uint8Array] => [
    privateState,
    privateState.callerAddress,
  ],

  secretPreimage: ({
    privateState,
  }: WitnessContext<Ledger, BountyPrivateState>): [BountyPrivateState, Uint8Array] => [
    privateState,
    privateState.secret,
  ],

  secretNonce: ({
    privateState,
  }: WitnessContext<Ledger, BountyPrivateState>): [BountyPrivateState, Uint8Array] => [
    privateState,
    privateState.nonce,
  ],

  targetBountyId: ({
    privateState,
  }: WitnessContext<Ledger, BountyPrivateState>): [BountyPrivateState, bigint] => [
    privateState,
    BigInt(privateState.targetBountyId),
  ],
};
