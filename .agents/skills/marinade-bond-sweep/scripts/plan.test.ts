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

  test("sweeps all vote surplus while preserving an identity below 5 SOL", () => {
    const plan = calculateActions(1n * SOL, RENT, 4n * SOL);

    expect(plan.voteAction).toBe("withdraw-all");
    expect(plan.voteTransfer).toBe(1n * SOL - RENT);
    expect(plan.identityAction).toBe("skip-below-threshold");
    expect(plan.identityTransfer).toBe(0n);
    expect(plan.bondFund).toBe(1n * SOL - RENT);
    expect(plan.expectedFinalIdentity).toBe(4n * SOL);
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
