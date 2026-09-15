#!/usr/bin/env bun
import { readConfig, saveConfig, configPath, selectInput, verifyValidator, type Config } from '../../shared/operator-config';

export async function main(args: string[]) {
  const command = args.shift() ?? 'status';
  if (command === '--help' || command === 'help') {
    console.log('onboard.ts status|add|refresh [--config PATH] [--profile NAME] [--validator PUBKEY] [--rpc-env ENV_NAME] [--default]\nadd creates a new verified profile; refresh explicitly updates an existing profile. RPC URLs stay in environment variables.'); return;
  }
  if (!['status','add','refresh'].includes(command)) throw new Error('Unknown onboarding command.');
  let path: string | undefined, name: string | undefined, target: string | undefined, rpcEnv: string | undefined, makeDefault = false;
  for (let i=0;i<args.length;i++) {
    const flag=args[i]; if (flag === '--default') {makeDefault=true;continue;}
    if (!['--config','--profile','--validator','--rpc-env'].includes(flag)) throw new Error('Unknown onboarding option.');
    const value=args[++i]; if (!value || value.startsWith('--')) throw new Error(`Missing value for ${flag}`);
    if (flag==='--config') path=value; else if(flag==='--profile') name=value; else if(flag==='--validator') target=value; else rpcEnv=value;
  }
  let config: Config;
  try { config=await readConfig(path); }
  catch(e) {
    if (command==='add' && (e as Error).message==='Specified operator config does not exist.') config={version:1,profiles:{}};
    else throw e;
  }
  if(command==='status') {
    console.log(JSON.stringify({configPath:configPath(path), ...config,
      rpcConfigured:Object.fromEntries(Object.entries(config.profiles).map(([n,p])=>[n,Boolean(process.env[p.rpcEnv])]))},null,2));return;
  }
  if (!name || !/^[a-zA-Z0-9_-]+$/.test(name)) throw new Error('Provide --profile with letters, digits, hyphens or underscores.');
  const old=Object.hasOwn(config.profiles,name)?config.profiles[name]:undefined;
  if(command==='add' && old) throw new Error('Profile already exists; use refresh to update it.');
  if(command==='refresh' && !old) throw new Error('Profile does not exist; use add first.');
  rpcEnv ??= old?.rpcEnv ?? 'SOLANA_RPC_URL';
  if(!/^[A-Z_][A-Z0-9_]*$/.test(rpcEnv)) throw new Error('Invalid RPC environment variable name.');
  if(!process.env[rpcEnv]) throw new Error(`ONBOARDING_REQUIRED: configure ${rpcEnv} in the local runtime.`);
  const selected=selectInput({validator:target ?? old?.voteAccount, rpcUrl:process.env[rpcEnv]}, {version:1,profiles:{}});
  const live=await verifyValidator(selected.target,selected.rpcUrl);
  const checkedAt=new Date().toISOString();
  const localTimeZone=process.env.LOCAL_TIME_ZONE || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const checkedAtLocal=new Date(checkedAt).toLocaleString('sv-SE',{timeZone:localTimeZone});
  Object.defineProperty(config.profiles,name,{value:{cluster:'mainnet-beta',...live,rpcEnv,verification:{source:'helius-rpc',checkedAt}},enumerable:true,writable:true,configurable:true});
  if(makeDefault) config.defaultProfile=name;
  await saveConfig(config,path);
  console.log(JSON.stringify({status:'verified',profile:name,...live,checkedAt,checkedAtLocal,localTimeZone,configPath:configPath(path)},null,2));
}
if(import.meta.main) main(Bun.argv.slice(2)).catch(e=>{console.error(e.message);process.exit(1);});
