'use strict';
const frames={single:document.querySelector('#single'),double:document.querySelector('#double')},state={single:null,double:null},busy={single:false,double:false};
const linked=document.querySelector('#linked'),seek=document.querySelector('#seek'),fixture=document.querySelector('#fixture');let reduce=false,actualSize=false;
const other=side=>side==='single'?'double':'single';
function send(side,m){frames[side].contentWindow.postMessage(m,location.origin)}
function sendBoth(m){Object.keys(frames).forEach(side=>send(side,m))}
function sizePhones(){const stage=document.querySelector('.stage'),gap=innerWidth<=700?16:44,available=(stage.clientWidth-gap)/2,maxHeight=Math.max(440,innerHeight-165);const w=Math.min(390,available,actualSize?390:maxHeight*390/844);stage.style.setProperty('--phone-width',w+'px')}
addEventListener('resize',sizePhones);sizePhones();
const ro=new ResizeObserver(entries=>entries.forEach(e=>e.target.style.setProperty('--scale',e.contentRect.width/390)));document.querySelectorAll('.phone').forEach(e=>ro.observe(e));
function updateSeek(){const items=state.single?.items||state.double?.items||[],current=seek.value;const same=seek.dataset.ids===items.map(n=>n.id+':'+n.title).join('|');if(!same){seek.innerHTML='<option value="">定位同一条笔记…</option>'+items.map((n,i)=>`<option value="${n.id}">${i+1}. ${n.title}</option>`).join('');seek.dataset.ids=items.map(n=>n.id+':'+n.title).join('|');if(items.some(n=>n.id===current))seek.value=current;}seek.disabled=items.length===0||Object.values(busy).some(Boolean)}
function refresh(){Object.keys(state).forEach(side=>{const s=state[side];if(!s)return;const index=s.items.findIndex(n=>n.id===s.anchor)+1;document.querySelector('#'+side+'-status').textContent=s.items.length?`第${index}/${s.items.length}条附近 · 已滑动${Math.round(s.scrollTop)}px${s.atEnd?' · 已到底':''}`:'当前筛选没有笔记';});document.querySelector('#step').disabled=Object.values(busy).some(Boolean);updateSeek()}
addEventListener('message',e=>{
 if(e.origin!==location.origin||!e.data||typeof e.data!=='object')return;const side=Object.keys(frames).find(k=>frames[k].contentWindow===e.source);if(!side)return;const m=e.data;
 if(m.type==='feed-status'){const prev=state[side];state[side]=m;refresh();if(linked.checked&&m.cause==='user'&&prev&&!Object.values(busy).some(Boolean)){const delta=m.scrollTop-prev.scrollTop;if(Math.abs(delta)>.5)send(other(side),{type:'compare-scroll',delta});}return;}
 if(m.type==='feed-filters'){seek.value='';send(other(side),{type:'compare-filters',category:m.category,region:m.region});return;}
 if(m.type==='feed-like'){send(other(side),{type:'compare-like',id:m.id,liked:m.liked});return;}
 if(m.type==='feed-detail'||m.type==='feed-panel'){busy[side]=!!m.open;refresh();}
});
Object.keys(frames).forEach(side=>frames[side].addEventListener('load',()=>{busy[side]=false;state[side]=null;send(side,{type:'motion-reduce',reduce});send(side,{type:'compare-report'});}));
document.querySelector('#step').onclick=()=>{const h=Math.min(state.single?.height||680,state.double?.height||680);sendBoth({type:'compare-scroll',delta:Math.round(h*.78),behavior:'smooth'});};
document.querySelector('#top').onclick=()=>{seek.value='';sendBoth({type:'compare-top'});};
seek.onchange=()=>{if(seek.value)sendBoth({type:'compare-seek',id:seek.value});};
fixture.onchange=()=>{seek.value='';Object.keys(frames).forEach(side=>{state[side]=null;busy[side]=false;const url=`screen.html?layout=${side}&case=${fixture.value}`;frames[side].src=url;document.querySelector('#'+side+'-link').href=url;});};
document.querySelector('#reduce').onclick=e=>{reduce=!reduce;e.currentTarget.setAttribute('aria-pressed',String(reduce));sendBoth({type:'motion-reduce',reduce});};

document.querySelector('#actual-size').onclick=e=>{actualSize=!actualSize;e.currentTarget.setAttribute('aria-pressed',String(actualSize));e.currentTarget.textContent=actualSize?'适合窗口':'原尺寸查看';sizePhones();};
