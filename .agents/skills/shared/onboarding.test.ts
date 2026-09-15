import {test,expect} from 'bun:test';
import {mkdtemp,rm,readFile,stat} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
const script=resolve(import.meta.dir,'../inventory/scripts/onboard.ts');
const fixture=resolve(import.meta.dir,'fixtures/rpc-preload.ts');
test('first-use CLI verifies and persists public fields; errors leave config intact',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'onboard-cli-'));const path=join(dir,'config.json');
 const run=async(args:string[],extra:Record<string,string>={})=>{
  const proc=Bun.spawn([process.execPath,'--preload',fixture,script,...args,'--config',path],{env:{...process.env,MY_FIXTURE_RPC:'https://mainnet.helius-rpc.com/?api-key=TEST_ONLY',...extra},stdout:'pipe',stderr:'pipe'});
  const [out,err,code]=await Promise.all([new Response(proc.stdout).text(),new Response(proc.stderr).text(),proc.exited]);return{out,err,code};
 };
 try {
  const add=['add','--profile','mine','--validator','11111111111111111111111111111111','--rpc-env','MY_FIXTURE_RPC'];
  expect((await run(add,{FIXTURE_WRONG_NETWORK:'1'})).code).toBe(1);
  expect(await Bun.file(path).exists()).toBe(false);
  const ok=await run(add);expect(ok.code).toBe(0);expect(ok.out).not.toContain('TEST_ONLY');
  const saved=await readFile(path,'utf8');expect(saved).not.toContain('TEST_ONLY');expect((await stat(path)).mode&0o777).toBe(0o600);
  expect((await run(add)).code).toBe(1);expect(await readFile(path,'utf8')).toBe(saved);
  const status=await run(['status']);expect(status.code).toBe(0);expect(JSON.parse(status.out).rpcConfigured.mine).toBe(true);
  const missing=await run(['refresh','--profile','mine'],{MY_FIXTURE_RPC:'',SOLANA_RPC_URL:'https://mainnet.helius-rpc.com/?api-key=TEST_ONLY'});
  expect(missing.code).toBe(1);expect(missing.err).toContain('MY_FIXTURE_RPC');expect(await readFile(path,'utf8')).toBe(saved);
 } finally {await rm(dir,{recursive:true,force:true});}
});
