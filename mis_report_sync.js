(function(g){'use strict';
function quick(r){
 if(!r)throw Error('Chưa có báo cáo');
 if(Array.isArray(r.all)){
 const {all,results,selected,audit,...meta}=r;
 const groups={};for(const x of all){const k=x.phase||'unknown';const a=groups[k]??={};a[x.status]=(a[x.status]||0)+1}
 const {robustness,...checks}=audit||{};
 return {...meta,format:'ai-quick-v1',omitted:['all','results','robustness'],groups,accepted:results.length,audit:checks,selected:MISReport.compact(r,true).selected};
 }
 if(Array.isArray(r.rows))return {...r,format:'ai-quick-v1',omitted:['rejected weekly details'],rows:r.rows.map(({rows,...x})=>({...x,signalWeeks:rows?.length,validSignals:rows?.filter(v=>v.valid)}))};
 return {...r,format:'ai-quick-v1'};
}
async function publish(r,repo,token){
 if(!/^Quang-Financial\/MIS_Reports$/.test(repo))throw Error('Chỉ hỗ trợ MIS_Reports');
 const headers={Authorization:'Bearer '+token,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'};
 const base='https://api.github.com/repos/'+repo;
 const info=await fetch(base,{headers,cache:'no-store'});if(!info.ok)throw Error('Không đọc được repository: '+info.status);
 const meta=await info.json();if(!meta.private)throw Error('Repository báo cáo phải Private');
 const json=JSON.stringify(r),bytes=new TextEncoder().encode(json);if(bytes.length>900000)throw Error('Báo cáo quá lớn cho đồng bộ nhanh; chọn AI Quick hoặc tải Full JSON.');let s='';for(let i=0;i<bytes.length;i+=8192)s+=String.fromCharCode(...bytes.subarray(i,i+8192));
 const path='reports/'+new Date().toISOString().replace(/[:.]/g,'-')+'-'+crypto.randomUUID()+'.json';
 const res=await fetch(base+'/contents/'+path,{method:'PUT',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify({message:'MIS AI report',content:btoa(s),branch:meta.default_branch})});
 if(!res.ok)throw Error('Đồng bộ thất bại: HTTP '+res.status);
 const saved=await res.json();return saved.content.html_url;
}
function mount(getReport){
 const section=document.createElement('section');section.innerHTML='<h3>AI Report & GitHub Sync</h3><label>Loại báo cáo<select><option value="quick">AI Quick</option><option value="research">AI Research</option><option value="full">Full JSON</option></select></label><button type="button">Copy AI Report</button> <button type="button">Xem dung lượng</button> <button type="button">Đồng bộ GitHub</button><p role="status"></p>';
 const [copy,preview,sync]=section.querySelectorAll('button'),select=section.querySelector('select'),status=section.querySelector('p');
 const data=()=>{const r=getReport();if(!r)throw Error('Chạy Backtest trước');return select.value==='full'?r:select.value==='research'?(Array.isArray(r.all)?MISReport.compact(r):r):quick(r)};
 preview.onclick=()=>{try{status.textContent='Dung lượng: '+(MISReport.bytes(data()).length/1024).toFixed(1)+' KB'}catch(e){status.textContent=e.message}};copy.onclick=async()=>{try{const s=JSON.stringify(data());await navigator.clipboard.writeText(s);status.textContent='Đã copy '+new TextEncoder().encode(s).length+' bytes'}catch(e){status.textContent=e.message}};
 sync.onclick=async()=>{let token;try{const r=data();if(!confirm('Gửi báo cáo vào repository Private MIS_Reports?'))return;token=prompt('Nhập fine-grained token chỉ có Contents read/write cho MIS_Reports. Không gửi token vào ChatGPT. Token không được lưu.');if(!token)return;sync.disabled=true;const url=await publish(r,'Quang-Financial/MIS_Reports',token);status.replaceChildren(document.createTextNode('Đã lưu: '));const a=document.createElement('a');a.href=url;a.textContent=url;a.target='_blank';a.rel='noopener noreferrer';status.append(a)}catch(e){status.textContent=e.message}finally{token=null;sync.disabled=false}};
 const history=document.createElement('a');history.href='https://github.com/Quang-Financial/MIS_Reports/tree/main/reports';history.target='_blank';history.rel='noopener noreferrer';history.textContent='Lịch sử báo cáo GitHub';section.append(history);document.body.append(section);
}
g.MISReportSync={quick,publish,mount};
})(globalThis);
