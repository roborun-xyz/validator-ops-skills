import {test,expect} from 'bun:test';
import {fetchJson,fetchOptionalJson} from './http';

test('JSON requests reject redirects and omit failing provider content',async()=>{
 const original=globalThis.fetch;
 try {
  globalThis.fetch=(async (_url:unknown,init?:RequestInit)=>{
   expect(init?.redirect).toBe('error');expect(init?.signal).toBeDefined();
   return new Response('secret-provider-body',{status:500});
  }) as unknown as typeof fetch;
  let message='';try{await fetchJson('https://example.com',undefined,0);}catch(error){message=(error as Error).message;}
  expect(message).toContain('request failed');expect(message).not.toContain('secret-provider-body');
  globalThis.fetch=(async ()=>new Response('',{status:404})) as unknown as typeof fetch;
  expect(await fetchOptionalJson('https://example.com',undefined,0)).toBeNull();
 } finally {globalThis.fetch=original;}
});
