import { describe, expect, test } from "bun:test";

import { calculateActions } from "./plan";

const SOL = 1_000_000_000n;
const RENT = 27_074_400n;

describe("calculateActions", () => {
  test("skips both accounts below their independent thresholds", () => {
    const plan = calculateActions(500_000_000n, RENT, 4n * SOL);

    expect(plan.voteAction).toBe("skip-below-threshold");
    expect(plan.identityAction).toBe("skip-below-threshold");
    expect(plan.bondFund).toBe(0n);
    expect(plan.expectedFinalIdentity).toBe(4n * SOL);
  });

  test("rejects vote sweeps that would leave the original identity below 5 SOL", () => {
    expect(() => calculateActions(2n * SOL, RENT, 4n * SOL)).toThrow("5 SOL hard floor");
    expect(() => calculateActions(2n * SOL, RENT, 5n * SOL - 1n)).toThrow("5 SOL hard floor");
  });

  test("can sweep vote surplus at the hard floor without spending the original identity balance", () => {
    const plan = calculateActions(2n * SOL, RENT, 5n * SOL);
    expect(plan.identityTransfer).toBe(0n);
    expect(plan.bondFund).toBe(2n * SOL - RENT);
    expect(plan.expectedFinalIdentity).toBe(5n * SOL);
  });

  test("combines vote and identity surplus and leaves the execution reserve", () => {
    const plan = calculateActions(2n * SOL, RENT, 7n * SOL);

    expect(plan.voteTransfer).toBe(2n * SOL - RENT);
    expect(plan.identityTransfer).toBe(1_999_000_000n);
    expect(plan.bondFund).toBe(3_971_925_600n);
    expect(plan.expectedFinalIdentity).toBe(5_001_000_000n);
  });

  test("treats exactly 5 SOL as an identity no-op", () => {
    const plan = calculateActions(RENT, RENT, 5n * SOL);

    expect(plan.identityAction).toBe("no-op-at-target");
    expect(plan.identityTransfer).toBe(0n);
    expect(plan.expectedFinalIdentity).toBe(5n * SOL);
  });

  test("retains the execution buffer above the 5 SOL hard floor", () => {
    const plan = calculateActions(RENT, RENT, 5_000_500_000n);

    expect(plan.identityAction).toBe("no-op-at-target");
    expect(plan.identityTransfer).toBe(0n);
    expect(plan.expectedFinalIdentity).toBe(5_000_500_000n);
  });
});
