const BTC_HISTORY_URL='./btc_bitstamp_preokx.json';
let dataState=null;
async function bitstampBTC(){const r=await fetch(BTC_HISTORY_URL,{cache:'no-cache'});if(!r.ok)throw Error('Không tải được lịch sử BTC 2015: HTTP '+r.status);const j=await r.json();if(!Array.isArray(j.bars))throw Error('Lịch sử BTC bổ sung không hợp lệ');return j.bars.map(x=>({t:x[0],o:x[1],h:x[2],l:x[3],c:x[4],source:'Bitstamp BTC/USD'}));}
async function okxDaily(coin,force=false){const key='mis-ces-daily-'+coin;let old=[];try{old=JSON.parse(localStorage.getItem(key)||'[]')}catch{}const map=new Map(old.map(b=>[b.t,b]));let after=null;const latest=old.length?Math.max(...old.map(x=>x.t)):0;let reached=false;
for(let page=0;page<110;page++){status(`Cập nhật ${coin} từ OKX: trang ${page+1}...`);const q=new URLSearchParams({instId:coin+'-USDT',bar:'1Dutc',limit:'100'});if(after!==null)q.set('after',after);const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),15000);let data;try{const r=await fetch('https://www.okx.com/api/v5/market/history-candles?'+q,{signal:ctrl.signal,cache:'no-store'});if(!r.ok)throw Error('OKX HTTP '+r.status);const j=await r.json();if(j.code!=='0'||!Array.isArray(j.data))throw Error('OKX: '+(j.msg||'phản hồi sai'));data=j.data}finally{clearTimeout(timer)}if(!data.length)break;for(const x of data){const b={t:+x[0],o:+x[1],h:+x[2],l:+x[3],c:+x[4],source:'OKX '+coin+'/USDT'};if(String(x[8])==='1'&&[b.t,b.o,b.h,b.l,b.c].every(Number.isFinite)&&b.o>0&&b.l>0&&b.h>=Math.max(b.o,b.c,b.l)&&b.l<=Math.min(b.o,b.c))map.set(b.t,b)}const oldest=Math.min(...data.map(x=>+x[0]));if(!Number.isFinite(oldest)||oldest===after||data.length<100)break;after=oldest;if(old.length&&oldest<=latest-86400000*2){reached=true;break;}}
const bars=[...map.values()].sort((a,b)=>a.t-b.t);try{localStorage.setItem(key,JSON.stringify(bars))}catch{}return bars;}
async function fullDaily(coin){const okx=await okxDaily(coin);if(coin!=='BTC')return okx;const legacy=await bitstampBTC();const earliest=okx[0]?.t??Infinity;return [...legacy.filter(x=>x.t<earliest),...okx];}
async function fearDaily(){status('Đang tải Fear & Greed lịch sử...');const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),20000);try{const r=await fetch('https://api.alternative.me/fng/?limit=0&format=json',{signal:ctrl.signal});if(!r.ok)throw Error('Fear Index HTTP '+r.status);const j=await r.json();if(!Array.isArray(j.data))throw Error('Fear Index: phản hồi không hợp lệ');return new Map(j.data.map(x=>[MISCES.iso(Number(x.timestamp)*1000),Number(x.value)]).filter(x=>Number.isFinite(x[1])))}catch(e){throw Error('Không tải được Fear & Greed: '+(e.name==='AbortError'?'quá 20 giây':e.message))}finally{clearTimeout(timer)}}
function validate(bars, name) {
  if (bars.length) MISCES.validateDailyDates(bars, name);
  const fullWeeks = MISCES.aggregate(bars, 'week').filter(bar => bar.n === 7).length;
  if (fullWeeks < 200) {
    throw Error(name + ' chỉ có ' + fullWeeks + ' tuần đầy đủ; cần 200 tuần để khởi tạo EMA200 tuần.');
  }
}

// Bound evaluation by common closed dates while preserving the earlier BTC peak history.
function alignSignalData(coin, assetBars, btcBars) {
  const start = Math.max(assetBars[0]?.t ?? Infinity, btcBars[0]?.t ?? Infinity);
  const end = Math.min(assetBars.at(-1)?.t ?? -Infinity, btcBars.at(-1)?.t ?? -Infinity);
  const inRange = bar => bar.t >= start && bar.t <= end;
  const a = assetBars.filter(inRange);
  const b = btcBars.filter(bar => bar.t <= end);
  validate(a, coin);
  validate(b, 'BTC');
  return { start, end, a, b };
}

function canonicalResearchValue(value) {
  if (Array.isArray(value)) return value.map(canonicalResearchValue);
  if (value === null || typeof value !== 'object') return value;
  return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonicalResearchValue(value[key])]));
}

async function researchHash(value) {
  const bytes = new TextEncoder().encode(JSON.stringify(canonicalResearchValue(value)));
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, '0')).join('');
}

async function researchSnapshot(coin, assetBars, btcBars, fear, requestedEnd = Infinity, now = Date.now()) {
  const day = 86400000;
  const cutoff = Math.min(requestedEnd, Math.floor(now / day) * day - day);
  const closed = bars => bars.filter(row => row.t <= cutoff);
  const aligned = alignSignalData(coin, closed(assetBars), closed(btcBars));
  const sentiment = new Map([...fear].filter(([date]) => date <= MISCES.iso(aligned.end)).sort(([a], [b]) => a.localeCompare(b)));
  const snapshotId = await researchHash({ schema: 1, coin, cutoff: aligned.end,
    asset: aligned.a, btc: aligned.b, fear: [...sentiment] });
  return { ...aligned, fear: sentiment, snapshotId };
}

// A separate database keeps pinned research inputs away from existing reports.
async function pinnedResearchSnapshot(coin, value) {
  const db = await new Promise((resolve, reject) => {
    const request = indexedDB.open('mis-research-snapshots-v1', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('snapshots');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction('snapshots', value ? 'readwrite' : 'readonly');
      const store = tx.objectStore('snapshots');
      const request = value ? store.put(value, coin) : store.get(coin);
      tx.oncomplete = () => resolve(request.result);
      tx.onerror = tx.onabort = () => reject(tx.error || Error('Không thể lưu snapshot'));
    });
  } finally { db.close(); }
}

async function restorePinnedResearch(coin, requestedEnd) {
  const saved = await pinnedResearchSnapshot(coin);
  if (!saved || saved.end !== requestedEnd) throw Error('Snapshot đã ghim không khớp tài sản và ngày kết thúc');
  const restored = await researchSnapshot(coin, saved.a, saved.b, saved.fear, saved.end);
  if (restored.snapshotId !== saved.snapshotId) throw Error('Hash snapshot đã ghim không hợp lệ');
  return restored;
}
