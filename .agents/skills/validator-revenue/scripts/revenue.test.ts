import { describe, expect, test } from "bun:test";
import { PublicKey } from "@solana/web3.js";

import {
  deriveBamBoostClaimStatusAddress,
  verifyBamBoostClaimStatusAccount,
} from "./revenue";

const BAM_PROGRAM = "BoostxbPp2ENYHGcTLYt1obpcY13HE4NojdqNWdzqSSb";
const CLAIM_STATUS_DISCRIMINATOR = Buffer.from([
  22, 183, 249, 157, 247, 95, 150, 96,
]);
const R2D2_IDENTITY = "R2D2imoV8nXk1ngT9v4dEK65We4uLNyUarTBdWbFruq";

function claimStatusAccount(identity: string, amount: bigint) {
  const data = Buffer.alloc(48);
  CLAIM_STATUS_DISCRIMINATOR.copy(data, 0);
  new PublicKey(identity).toBuffer().copy(data, 8);
  data.writeBigUInt64LE(amount, 40);
  return {
    data: [data.toString("base64"), "base64"] as [string, string],
    owner: BAM_PROGRAM,
  };
}

describe("BAM Boost claim status", () => {
  test("derives the official R2D2 claim status PDA", () => {
    expect(deriveBamBoostClaimStatusAddress(R2D2_IDENTITY, 1028)).toBe(
      "EKbgiJ8yD4AYRDY3iT75bEAD628vs3kyHSNJ7y1dtD2a",
    );
  });

  test("accepts a matching finalized Claim Status account", () => {
    expect(() =>
      verifyBamBoostClaimStatusAccount(
        claimStatusAccount(R2D2_IDENTITY, 190_184_588n),
        R2D2_IDENTITY,
        190_184_588n,
      ),
    ).not.toThrow();
  });

  test("rejects a Claim Status amount that differs from the allocation", () => {
    expect(() =>
      verifyBamBoostClaimStatusAccount(
        claimStatusAccount(R2D2_IDENTITY, 190_184_587n),
        R2D2_IDENTITY,
        190_184_588n,
      ),
    ).toThrow("did not match allocation");
  });
});
