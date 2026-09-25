import { PublicKey } from "@solana/web3.js";

type RpcAccount = { data: [string, string]; owner: string };
const BAM_BOOST_PROGRAM = new PublicKey("BoostxbPp2ENYHGcTLYt1obpcY13HE4NojdqNWdzqSSb");
const BAM_BOOST_CLAIM_STATUS_ACCOUNT_SIZE = 48;
const BAM_BOOST_CLAIM_STATUS_DISCRIMINATOR = Buffer.from([22, 183, 249, 157, 247, 95, 150, 96]);

export function verifyBamBoostClaimStatusAccount(
  account: RpcAccount,
  identityAccount: string,
  expectedAmount: bigint,
): void {
  if (account.owner !== BAM_BOOST_PROGRAM.toBase58()) {
    throw new Error(
      `BAM Boost Claim Status account has unexpected owner ${account.owner}.`,
    );
  }
  if (account.data[1] !== "base64") {
    throw new Error(
      `BAM Boost Claim Status account used unexpected encoding '${account.data[1]}'.`,
    );
  }

  const data = Buffer.from(account.data[0], "base64");
  if (data.length !== BAM_BOOST_CLAIM_STATUS_ACCOUNT_SIZE) {
    throw new Error(
      `BAM Boost Claim Status account has unexpected size ${data.length}.`,
    );
  }
  if (
    !data
      .subarray(0, BAM_BOOST_CLAIM_STATUS_DISCRIMINATOR.length)
      .equals(BAM_BOOST_CLAIM_STATUS_DISCRIMINATOR)
  ) {
    throw new Error("BAM Boost Claim Status discriminator did not match.");
  }

  const identity = new PublicKey(identityAccount);
  if (!data.subarray(8, 40).equals(identity.toBuffer())) {
    throw new Error("BAM Boost Claim Status claimant did not match.");
  }
  const claimedAmount = data.readBigUInt64LE(40);
  if (claimedAmount !== expectedAmount) {
    throw new Error(
      `BAM Boost Claim Status amount ${claimedAmount} did not match allocation ${expectedAmount}.`,
    );
  }
}
