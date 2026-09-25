export type Model = {
 totalVev:number; otherBids:number; totalGaugeDirectedSol:number; totalGaugeVev:number;
 matchMultiplier:number; lamportsPerStakedSol:number; solUsd:number;
};
export function simulateBids(bids:number[], model:Model) {
 for(const [key,value] of Object.entries(model)) {
  if(!Number.isFinite(value) || value<0) throw new Error(`Invalid nonnegative model input: ${key}`);
 }
 if(model.totalGaugeVev<=0 || model.solUsd<=0 || model.matchMultiplier<1) throw new Error('Gauge veV and SOL price must be positive; match multiplier must be at least 1');
 if(!bids.length || bids.some(bid=>!Number.isFinite(bid)||bid<=0)) throw new Error('Every bid must be finite and positive');
 const rows=bids.map(bidUsdc=>{
  const acquiredVev=model.totalVev*bidUsdc/(model.otherBids+bidUsdc);
  const directedSol=acquiredVev*model.totalGaugeDirectedSol/model.totalGaugeVev;
  const effectiveSol=directedSol*model.matchMultiplier;
  const revenueSol=model.lamportsPerStakedSol*effectiveSol/1e9;
  const revenueUsd=revenueSol*model.solUsd;
  const netUsd=revenueUsd-bidUsdc;
  return {bidUsdc,acquiredVev,directedSol,effectiveSol,revenueSol,revenueUsd,netUsd,roiPct:netUsd/bidUsdc*100};
 });
 if(rows.some(row=>Object.values(row).some(value=>!Number.isFinite(value)))) throw new Error('Model overflow; use smaller input values');
 return rows;
}
