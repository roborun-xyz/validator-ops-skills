import {test,expect} from 'bun:test';
import {base58Encode,base58Decode} from './base58';
test('base58 preserves empty inputs and exact leading zero counts',()=>{
 for(const bytes of [new Uint8Array(),new Uint8Array(32),Uint8Array.of(0,0,1),Uint8Array.of(255,128,0,1)]) expect(base58Decode(base58Encode(bytes))).toEqual(bytes);
 expect(base58Encode(new Uint8Array(32))).toBe('1'.repeat(32));
 expect(base58Decode('1'.repeat(32)).length).toBe(32);
 expect(base58Encode(Uint8Array.of(0,1))).toBe('12');
 expect(()=>base58Decode('0')).toThrow();
});
