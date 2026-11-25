const BTC_HISTORY_URL='./btc_bitstamp_preokx.json';
let dataState=null;
async function bitstampBTC(){const r=await fetch(BTC_HISTORY_URL,{cache:'no-cache'});if(!r.ok)throw Error('Không tải được lịch sử BTC 2015: HTTP '+r.status);const j=await r.json();if(!Array.isArray(j.bars))throw Error('Lịch sử BTC bổ sung không hợp lệ');return j.bars.map(x=>({t:x[0],o:x[1],h:x[2],l:x[3],c:x[4],source:'Bitstamp BTC/USD'}));}
async function okxDaily(coin,force=false){const key='mis-ces-daily-'+coin;let old=[];try{old=JSON.parse(localStorage.getItem(key)||'[]')}catch{}const map=new Map(old.map(b=>[b.t,b]));let after=null;const latest=old.length?Math.max(...old.map(x=>x.t)):0;let reached=false;
for(let page=0;page<110;page++){status(`Cập nhật ${coin} từ OKX: trang ${page+1}...`);const q=new URLSearchParams({instId:coin+'-USDT',bar:'1Dutc',limit:'100'});if(after!==null)q.set('after',after);const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),15000);let data;try{const r=await fetch('https://www.okx.com/api/v5/market/history-candles?'+q,{signal:ctrl.signal,cache:'no-store'});if(!r.ok)throw Error('OKX HTTP '+r.status);const j=await r.json();if(j.code!=='0'||!Array.isArray(j.data))throw Error('OKX: '+(j.msg||'phản hồi sai'));data=j.data}finally{clearTimeout(timer)}if(!data.length)break;for(const x of data){const b={t:+x[0],o:+x[1],h:+x[2],l:+x[3],c:+x[4],source:'OKX '+coin+'/USDT'};if(String(x[8])==='1'&&[b.t,b.o,b.h,b.l,b.c].every(Number.isFinite)&&b.o>0&&b.l>0&&b.h>=Math.max(b.o,b.c,b.l)&&b.l<=Math.min(b.o,b.c))map.set(b.t,b)}const oldest=Math.min(...data.map(x=>+x[0]));if(!Number.isFinite(oldest)||oldest===after||data.length<100)break;after=oldest;if(old.length&&oldest<=latest-86400000*2){reached=true;break;}}
const bars=[...map.values()].sort((a,b)=>a.t-b.t);try{localStorage.setItem(key,JSON.stringify(bars))}catch{}return bars;}
async function fullDaily(coin){const okx=await okxDaily(coin);if(coin!=='BTC')return okx;const legacy=await bitstampBTC();const earliest=okx[0]?.t??Infinity;return [...legacy.filter(x=>x.t<earliest),...okx];}
async function fearDaily(){status('Đang tải Fear & Greed lịch sử...');const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),20000);try{const r=await fetch('https://api.alternative.me/fng/?limit=0&format=json',{signal:ctrl.signal});if(!r.ok)throw Error('Fear Index HTTP '+r.status);const j=await r.json();if(!Array.isArray(j.data))throw Error('Fear Index: phản hồi không hợp lệ');return new Map(j.data.map(x=>[MISCES.iso(Number(x.timestamp)*1000),Number(x.value)]).filter(x=>Number.isFinite(x[1])))}catch(e){throw Error('Không tải được Fear & Greed: '+(e.name==='AbortError'?'quá 20 giây':e.message))}finally{clearTimeout(timer)}}
function validate(bars, name) {
  const dailyMs = 86400000;
  for (let i = 1; i < bars.length; i++) {
    if (bars[i].t - bars[i - 1].t !== dailyMs) {
      throw Error(name + ' thiếu ngày giữa ' + MISCES.iso(bars[i - 1].t) + ' và ' + MISCES.iso(bars[i].t));
    }
  }
  const fullWeeks = MISCES.aggregate(bars, 'week').filter(bar => bar.n === 7).length;
  if (fullWeeks < 200) {
    throw Error(name + ' chỉ có ' + fullWeeks + ' tuần đầy đủ; cần 200 tuần để khởi tạo EMA200 tuần.');
  }
}
