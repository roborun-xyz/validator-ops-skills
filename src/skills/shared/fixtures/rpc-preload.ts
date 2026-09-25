// Offline subprocess fixture: no request is sent to a network endpoint.
import { MAINNET_GENESIS } from '../operator-config';
globalThis.fetch=Object.assign(async (_input:Parameters<typeof fetch>[0], init?:Parameters<typeof fetch>[1])=>{
 const request=JSON.parse(String(init?.body));
 let result:unknown;
 if(request.method==='getGenesisHash') result=process.env.FIXTURE_WRONG_NETWORK?'testnet':MAINNET_GENESIS;
 else if(request.method==='getVoteAccounts') result={current:[{votePubkey:'So11111111111111111111111111111111111111112',nodePubkey:'11111111111111111111111111111111'}],delinquent:[]};
 else throw new Error('Unexpected fixture RPC method');
 return new Response(JSON.stringify({jsonrpc:'2.0',id:request.id,result}));
},{preconnect:fetch.preconnect});
