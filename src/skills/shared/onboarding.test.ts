import {test,expect} from 'bun:test';
import {mkdtemp,rm,readFile,stat} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
const script=resolve(import.meta.dir,'../onboarding/scripts/onboard.ts');
const fixture=resolve(import.meta.dir,'fixtures/rpc-preload.ts');
test('first-use CLI verifies and persists public fields; errors leave config intact',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'onboard-cli-'));const path=join(dir,'config.json');
 const run=async(args:string[],extra:Record<string,string>={})=>{
  const proc=Bun.spawn([process.execPath,'--preload',fixture,script,...args,'--config',path],{env:{...process.env,VALIDATOR_OPS_FLEET:join(dir,'absent-fleet.json'),VALIDATOR_OPS_HOST_INVENTORY:join(dir,'absent-hosts.md'),MY_FIXTURE_RPC:'https://mainnet.helius-rpc.com/?api-key=TEST_ONLY',...extra},stdout:'pipe',stderr:'pipe'});
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

test('status works outside the bundle and diagnoses files independently without leaking invalid content',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'onboard-status-'));
 const paths={config:join(dir,'config.json'),fleet:join(dir,'fleet.json'),hosts:join(dir,'hosts.md')};
 const run=async(extra:Record<string,string>={})=>{
  const proc=Bun.spawn([process.execPath,script,'status'],{cwd:dir,env:{...process.env,
   VALIDATOR_OPS_CONFIG:paths.config,VALIDATOR_OPS_FLEET:paths.fleet,VALIDATOR_OPS_HOST_INVENTORY:paths.hosts,...extra},stdout:'pipe',stderr:'pipe'});
  const [out,err,code]=await Promise.all([new Response(proc.stdout).text(),new Response(proc.stderr).text(),proc.exited]);return {out,err,code};
 };
 try {
  let result=await run();expect(result.code).toBe(0);
  for(const file of Object.values(JSON.parse(result.out).files) as any[]) expect(file.status).toBe('missing');
  await Bun.write(paths.config,'{"secret":"DO_NOT_PRINT"}');
  await Bun.write(paths.fleet,JSON.stringify({version:1,groups:{test:{mainnetBetaPubkey:'1'.repeat(32),testnetPubkey:'1'.repeat(32)}},hosts:[]}));
  await Bun.write(paths.hosts,'---\ncreated: 2026-09-16\nlast_updated: 2026-09-16\n---\n# DO_NOT_PRINT\n');
  result=await run();expect(result.code).toBe(0);expect(result.out).not.toContain('DO_NOT_PRINT');
  let files=JSON.parse(result.out).files;
  expect(files.profiles.status).toBe('invalid');expect(files.fleet.status).toBe('valid');expect(files.hosts.status).toBe('readable');
  await Bun.write(paths.fleet,'{"secret":"DO_NOT_PRINT"}');
  result=await run();expect(result.out).not.toContain('DO_NOT_PRINT');expect(JSON.parse(result.out).files.fleet.status).toBe('invalid');
  result=await run({VALIDATOR_OPS_HOST_INVENTORY:''});expect(result.code).toBe(1);expect(result.err).toContain('Empty configuration path');
 } finally {await rm(dir,{recursive:true,force:true});}
});

test('fresh HOME defaults resolve outside cwd and profile status survives absent Python setup',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'onboard-home-'));
 const bundle=join(dir,'installed');
 try {
  for(const relative of ['onboarding/scripts/onboard.ts','onboarding/scripts/status.ts','shared/operator-config.ts'])
   await Bun.write(join(bundle,'src/skills',relative),await Bun.file(resolve(import.meta.dir,'..',relative)).text());
  const home=join(dir,'operator');
  await Bun.write(join(home,'.config/validator-ops/config.json'),JSON.stringify({version:1,profiles:{}}));
  await Bun.write(join(home,'.config/validator-ops/fleet.json'),JSON.stringify({version:1,groups:{test:{mainnetBetaPubkey:'1'.repeat(32),testnetPubkey:'1'.repeat(32)}},hosts:[]}));
  const env: Record<string,string|undefined>={...process.env,HOME:home};
  delete env.VALIDATOR_OPS_CONFIG;delete env.VALIDATOR_OPS_FLEET;delete env.VALIDATOR_OPS_HOST_INVENTORY;
  const proc=Bun.spawn([process.execPath,join(bundle,'src/skills/onboarding/scripts/onboard.ts'),'status'],{cwd:dir,env,stdout:'pipe',stderr:'pipe'});
  const [out,err,code]=await Promise.all([new Response(proc.stdout).text(),new Response(proc.stderr).text(),proc.exited]);
  expect(err).toBe('');expect(code).toBe(0);
  const files=JSON.parse(out).files;
  expect(files.profiles.path).toBe(join(home,'.config/validator-ops/config.json'));
  expect(files.profiles.status).toBe('valid');expect(files.fleet.status).toBe('unchecked');expect(files.hosts.status).toBe('missing');
 } finally {await rm(dir,{recursive:true,force:true});}
});
