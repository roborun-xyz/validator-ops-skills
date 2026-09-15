import {test,expect} from 'bun:test';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {resolveBamTarget} from './check';
import {saveConfig,MAINNET_GENESIS} from '../../shared/operator-config';

test('BAM profiles verify current identity; historical explicit claimants bypass active-set lookup', async () => {
 const directory = await mkdtemp(join(tmpdir(),'bam-profile-'));
 const path = join(directory,'config.json');
 const identity = '11111111111111111111111111111111';
 const vote = 'So11111111111111111111111111111111111111112';
 const rpcUrl = 'https://mainnet.helius-rpc.com/?api-key=TEST_ONLY';
 try {
  await saveConfig({version:1,profiles:{example:{cluster:'mainnet-beta',identity,voteAccount:vote,rpcEnv:'CUSTOM_RPC',verification:{source:'helius-rpc',checkedAt:'2026-09-15T00:00:00Z'}}}},path);
  const call = async (_:string, method:string) => method === 'getGenesisHash' ? MAINNET_GENESIS : {current:[{votePubkey:vote,nodePubkey:identity}],delinquent:[]};
  expect((await resolveBamTarget({config:path,profile:'example',rpcUrl},call)).identity).toBe(identity);
  expect((await resolveBamTarget({config:path,profile:'example',identity:vote,rpcUrl},async()=>{throw new Error('must not query active set');})).identity).toBe(vote);
  await expect(resolveBamTarget({config:path,identity:'other-operators-host',rpcUrl},call)).rejects.toThrow();
  await expect(resolveBamTarget({config:path,profile:'missing',rpcUrl},call)).rejects.toThrow('Unknown');
 } finally {await rm(directory,{recursive:true,force:true});}
});
