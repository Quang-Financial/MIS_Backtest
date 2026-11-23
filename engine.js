/* MIS Alpha 3 — frozen B + causal cycle. Historical PMS BTC weekly snapshot only. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.MISEngine=api})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const FEE=.001, BUDGET=[3000,3000,4000],MS_DAY=86400000;
const days=(a,b)=>(Date.parse(a+'T00:00:00Z')-Date.parse(b+'T00:00:00Z'))/MS_DAY;
function decode(snapshot){const cs=snapshot.columns;return snapshot.rows.map(a=>Object.fromEntries(cs.map((c,i)=>[c,a[i]])))}
function anchors(rows){let candidate=Array(rows.length).fill(false),confirmed=new Map();
 for(let i=0;i<rows.length;i++){
  if(i>=26){const prev=rows.slice(Math.max(0,i-52),i).map(r=>r.high);const prior=Math.max(...prev);const lows=rows.slice(Math.max(0,i-26),i).map(r=>r.low);if(lows.length>=13&&rows[i].low/prior<=.55&&rows[i].low<=Math.min(...lows))candidate[i]=true}
 }
 for(let j=13;j<rows.length;j++){const k=j-13;if(candidate[k]&&rows[k].low<=Math.min(...rows.slice(k+1,j+1).map(r=>r.low)))confirmed.set(j,k)}
 const output=[],asof=[];let active=null;
 for(let j=0;j<rows.length;j++){
  if(confirmed.has(j)){const k=confirmed.get(j),bottom=rows[k].date;if(active===null||days(bottom,active)>=730){active=bottom;output.push({confirmation:rows[j].date,bottom,low:rows[k].low})}}
  asof.push(active)
 }
 return {output,asof}
}
function simulate(rows,anchorAsOf,start,end,variant='cycle'){
 const z=rows.map((r,i)=>({...r,_anchor:anchorAsOf[i]})).filter(r=>r.date>=start&&r.date<=end);
 let cash=10000,btc=0,cost=0,qty=0,bought=[false,false,false],peak=0,partial=false,closed=false,blocked=0;
 const trades=[],equity=[];
 for(let i=0;i<z.length;i++){
  const r=z[i];if(i){const p=z[i-1],price=r.open;
   if(btc>1e-12&&!closed){
    peak=Math.max(peak,p.close);const avg=cost/qty,eligible=peak>=2.5*avg;
    const shock=p.d_SDI<=-30&&p.d_rsi14<=-6&&p.d_TRI<=-8&&p.SDI<0&&p.top_context;
    const fallback=eligible&&((p.structure_break&&p.trend_weak&&p.under52_2)||(p.close<peak*.8&&p.under52_2&&p.TRI<0));
    const age=p._anchor?days(p.date,p._anchor):null,allowed=variant==='baseline'||(age!==null&&age>=969);
    let action=null,amount=0;
    if(eligible&&partial&&shock&&allowed){action='SELL_ALL_PMS';amount=btc}
    else if(fallback&&allowed){action='SELL_ALL_FALLBACK';amount=btc}
    else if(eligible&&!partial&&p.close>=2.5*avg){action='SELL_PART_PROFIT';amount=btc*.25;partial=true}
    if(!allowed&&(shock||fallback))blocked++;
    if(action){cash+=amount*price*(1-FEE);btc-=amount;trades.push({date:r.date,signal:p.date,action,price,btc_qty:amount,cash_after:cash,age_days:age})}
    if(btc<1e-12){btc=0;closed=true}
   }
   if(!partial&&!closed){const cond=[(p.MCI_A>=65&&p.spring)||p.MCI_A>=75,bought[0]&&p.SDI>0&&p.CLV>0&&p.close>p.ema26,bought[1]&&p.TRI>=35&&p.HHHL&&p.close>p.ema26];
    for(let j=0;j<3;j++)if(cond[j]&&!bought[j]){const budget=Math.min(cash,BUDGET[j]),amount=budget/(price*(1+FEE));cash-=budget;btc+=amount;cost+=budget;qty+=amount;bought[j]=true;trades.push({date:r.date,signal:p.date,action:'BUY'+(j+1),price,btc_qty:amount,cash_after:cash})}
   }
  }
  equity.push({date:r.date,equity:cash+btc*r.close,cash,btc})
 }
 if(!equity.length)throw Error('Không có nến trong khoảng đã chọn');
 let max=0,mdd=0;for(const e of equity){max=Math.max(max,e.equity);mdd=Math.min(mdd,(e.equity/max-1)*100)}
 const last=equity.at(-1);return {roi_pct:+((last.equity/10000-1)*100).toFixed(2),mdd_pct:+mdd.toFixed(2),end_equity:+last.equity.toFixed(2),remaining_btc:btc,blocked_exit_weeks:blocked,trades,equity}
}
return {decode,anchors,simulate}
});
