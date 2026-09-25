import { test, expect } from "bun:test";
import { normalizePerformanceRow, renderCsv, renderMarkdown } from "./performance";

const source = { epoch: 99, validatorId: "fixture-identity", voteId: "fixture-vote" };

test("missing upstream metrics stay unavailable rather than zero stake or 100 percent skipped", () => {
  const row = normalizePerformanceRow({ ...source, leaderSlotsTotal: 10 });
  expect(row).toMatchObject({
    stakeSol: null, voteCredits: null, tvcPctOfMax: null, tvcRank: null,
    leaderSlots: 10, blocksProduced: null, blockProductionPct: null, skipRatePct: null,
    commissionPct: null, mevCommissionPct: null,
  });
  const csvValues = renderCsv([row]).split("\n")[1].split(",");
  expect(csvValues).toEqual(["99", "", "", "", "", "", "10", "", "", "", ""]);
  expect(JSON.parse(JSON.stringify(row)).blocksProduced).toBeNull();
});

test("known zero values remain zero and a verified zero block count can mean 100 percent skipped", () => {
  const row = normalizePerformanceRow({ ...source, tvCredits: 0, totalStake: "0", leaderSlotsTotal: 10, leaderSlotsDone: 0, fee: 0, mevCommission: 0 });
  expect(row).toMatchObject({ stakeSol: 0, voteCredits: 0, tvcPctOfMax: 0, blocksProduced: 0, blockProductionPct: 0, skipRatePct: 100, commissionPct: 0, mevCommissionPct: 0 });
});

test("invalid and null provider values do not become fabricated metrics", () => {
  const row = normalizePerformanceRow({ ...source, totalStake: "bad", tvCredits: Number.NaN, leaderSlotsTotal: 10, leaderSlotsDone: -1, fee: null as never, mevCommission: null as never, skippedSlots: "bad" });
  expect(row).toMatchObject({ stakeSol: null, voteCredits: null, blocksProduced: null, blockProductionPct: null, skipRatePct: null, commissionPct: null, mevCommissionPct: null });
  expect(normalizePerformanceRow({ ...source, totalStake: Number.MAX_SAFE_INTEGER + 1 }).stakeSol).toBeNull();
});

test("available upstream skip rates survive missing block counts", () => {
  expect(normalizePerformanceRow({ ...source, leaderSlotsTotal: 10, skippedSlots: "0.25" }).skipRatePct).toBe(25);
  expect(normalizePerformanceRow({ ...source, leaderSlotsTotal: 0, leaderSlotsDone: 0 }).blockProductionPct).toBeNull();
});

test("markdown shows missing fields and does not present partial window sums as totals", () => {
  const missing = normalizePerformanceRow({ ...source, leaderSlotsTotal: 10 });
  const known = normalizePerformanceRow({ ...source, epoch: 98, tvCredits: 100, leaderSlotsTotal: 10, leaderSlotsDone: 9 });
  const output = renderMarkdown({
    voteAccount: "fixture-vote", currentEpoch: 100, currentSlotIndex: 1, slotsInEpoch: 432_000,
    firstEpoch: 98, lastEpoch: 99, rows: [known, missing],
    current: { isDelinquent: null, activatedStakeSol: null, liveCommissionPct: null, nodePubkey: null },
  });
  expect(output).toContain("| 99 | — | — | — | — | —/10 | — | — | — | — |");
  expect(output).toContain("Total vote credits: `—`");
  expect(output).toContain("Block production: `— / 20`");
  expect(output).toContain("Averages use available epochs");
  expect(output).not.toContain("100.00%");
});
