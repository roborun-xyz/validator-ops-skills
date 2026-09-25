import { test, expect } from "bun:test";
import { resolve } from "node:path";

async function run(mode: string) {
  const proc = Bun.spawn([
    process.execPath, "--preload", resolve(import.meta.dir, "fixtures/offline-preload.ts"),
    resolve(import.meta.dir, "votex_status.ts"), "100", "--json", "--no-names", "--max-pages=2",
  ], {
    env: { ...process.env, VOTEX_FIXTURE_MODE: mode, SOLANA_RPC_URL: "https://mainnet.helius-rpc.com/?api-key=TEST_ONLY" },
    stdout: "pipe", stderr: "pipe",
  });
  const [stdout, stderr, code] = await Promise.all([
    new Response(proc.stdout).text(), new Response(proc.stderr).text(), proc.exited,
  ]);
  return { stdout, stderr, code };
}

for (const mode of ["rpc-error", "null-tx", "missing-result", "missing-response", "duplicate-response", "invalid-meta", "truncated"]) {
  test(`on-chain fallback reports ${mode} as incomplete instead of zero bids`, async () => {
    const result = await run(mode);
    expect(result.code).toBe(1);
    expect(result.stdout).toBe("");
    expect(result.stderr).toContain("Incomplete on-chain scan");
    expect(result.stderr).not.toContain("TEST_ONLY");
    if (mode === "truncated") expect(result.stderr).toContain("--max-pages=2 reached");
  });
}

test("a fully covered on-chain window can report a verified empty result", async () => {
  const result = await run("empty");
  expect(result.code).toBe(0);
  const output = JSON.parse(result.stdout);
  expect(output.totalUsdcRaw).toBe("0");
  expect(output.scanWindow.complete).toBe(true);
  expect(output.scanWindow.signatureCandidates).toBe(0);
});

test("on-chain bids are counted once when batch responses arrive out of order", async () => {
  const result = await run("valid");
  expect(result.code).toBe(0);
  const output = JSON.parse(result.stdout);
  expect(output.totalUsdcRaw).toBe("150000000");
  expect(output.rows[0].bidSharePct).toBe(100);
  expect(output.rows[0].transactions.map((tx: { amountRaw: string }) => tx.amountRaw)).toEqual(["100000000", "50000000"]);
  expect(output.scanWindow.complete).toBe(true);
});

test("failed transactions do not contribute bids", async () => {
  const result = await run("failed-tx");
  expect(result.code).toBe(0);
  expect(JSON.parse(result.stdout).totalUsdcRaw).toBe("0");
});
