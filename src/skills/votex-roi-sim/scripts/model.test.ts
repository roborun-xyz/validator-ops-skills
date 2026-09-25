import {test,expect} from 'bun:test';
import {simulateBids,type Model} from './model';
const model:Model={totalVev:1000,otherBids:100,totalGaugeDirectedSol:10000,totalGaugeVev:2000,matchMultiplier:1,lamportsPerStakedSol:100000,solUsd:100};
test('bid dilution and net cost are reflected independently',()=>{
 const [a,b]=simulateBids([100,300],model);
 expect(a.acquiredVev).toBe(500);expect(a.directedSol).toBe(2500);expect(a.revenueUsd).toBe(25);expect(a.netUsd).toBe(-75);expect(a.roiPct).toBe(-75);
 expect(b.acquiredVev).toBe(750);expect(b.directedSol).toBe(3750);
});
test('zero denominators, bad bids, negative inputs and overflow fail instead of JSON null',()=>{
 for(const patch of [{totalGaugeVev:0},{otherBids:-1},{solUsd:0},{matchMultiplier:0.5},{totalVev:Infinity},{totalVev:1e308,totalGaugeDirectedSol:1e308}]) expect(()=>simulateBids([100],{...model,...patch})).toThrow();
 for(const bids of [[],[0],[100,NaN],[-1]]) expect(()=>simulateBids(bids,model)).toThrow();
 expect(simulateBids([100],{...model,totalVev:0})[0].roiPct).toBe(-100);
});
