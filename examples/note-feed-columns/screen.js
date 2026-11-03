'use strict';
const $=s=>document.querySelector(s), app=$('#app'), page=$('#list-page'), feed=$('#feed'), content=$('#feed-content'), detail=$('#detail'), flight=$('#flight'), panel=$('#panel');
const paths={search:'<circle cx="10" cy="10" r="6.5"/><path d="m15 15 5 5"/>',heart:'<path d="M20 5c-2-2-5-1-8 2-3-3-6-4-8-2-4 4 1 9 8 14 7-5 12-10 8-14Z"/>',back:'<path d="m14 5-7 7 7 7"/>',home:'<path d="m3 10 9-7 9 7v10h-6v-6H9v6H3Z"/>',trip:'<circle cx="12" cy="12" r="9"/><path d="m15 8-2 6-5 2 2-6Z"/>',grid:'<path d="M3 3h6v6H3zM15 3h6v6h-6zM3 15h6v6H3zM15 15h6v6h-6z"/>',message:'<path d="M3 4h18v13H9l-5 4v-4H3Z"/><path d="M7 9h10M7 13h7"/>',person:'<circle cx="12" cy="7" r="4"/><path d="M4 21v-3a8 8 0 0 1 16 0v3"/>',car:'<path d="m4 8 2-4h12l2 4v10H4ZM4 10h16M7 14h2m6 0h2M6 18v3m12-3v3"/>',play:'<path d="m8 4 12 8-12 8Z"/>',more:'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',comment:'<path d="M3 4h18v13H9l-5 4v-4H3Z"/>',bookmark:'<path d="M6 3h12v18l-6-4-6 4Z"/>'};
const icon=name=>`<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name]||paths.grid}</svg>`;
const notes=structuredClone(STUDY_NOTES);
const layoutMode=new URLSearchParams(location.search).get('layout')==='single'?'single':'double';
document.body.dataset.layout=layoutMode;
// Sample variants are presentation fixtures, not product controls or new API fields.
const sampleCase=new URLSearchParams(location.search).get('case')||'default';
if(sampleCase==='long')Object.assign(notes[0],{title:'从凌晨的海岸一路骑到山里，把没有走过的那段路留给这个周末',author:'今天也想慢慢骑车看风景的人',topic:'从城市出发的周末骑行记录'});
if(sampleCase==='brief')Object.assign(notes[0],{body:'',topic:''});
if(sampleCase==='portrait'){const n=notes.splice(1,1)[0];notes.unshift(n);}
const mediaSize={coast:[1200,800],moganshan:[800,1131],forest:[1200,800],gravel:[1200,1800],group:[1200,1500],valley:[1200,2133]};
const mediaShape=n=>mediaSize[n.id][1]>mediaSize[n.id][0]?'portrait':'landscape';
const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const excerpt=n=>(n.body||'').replace(/\s+/g,' ').trim();
const categories=['推荐','骑行','徒步','滑雪','登山'];let category='推荐',region='全国',query='',authorOnly=null,likes=new Set(),saved=new Set(),followed=new Set(),rate=new URLSearchParams(location.search).get('speed')==='0.35'?.35:1,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches||new URLSearchParams(location.search).get('reduce')==='1';
const avatar='assets/avatar.png';const cover=n=>`assets/note-cover-${n.id}.jpg`;let toastTimer;
function toast(text){clearTimeout(toastTimer);$('#toast').textContent=text;$('#toast').classList.add('visible');toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),1800)}
function authorHTML(n){return `<button class="author" data-action="author" data-id="${n.id}" aria-label="查看${n.author}的主页"><span>${n.author}</span></button>`}
function likeHTML(n){return `<button class="like" data-action="like" data-id="${n.id}" aria-label="${likes.has(n.id)?'取消点赞':'点赞'}：${n.title}" aria-pressed="${likes.has(n.id)}">${icon('heart')}<span>${n.likes+(likes.has(n.id)?1:0)}</span></button>`}
function coverHTML(n){const size=mediaSize[n.id];return `<button class="cover-button" data-shape="${mediaShape(n)}" data-action="open" data-id="${n.id}" aria-label="打开笔记：${escapeHTML(n.title)}"><img src="${cover(n)}" width="${size[0]}" height="${size[1]}" alt="${escapeHTML(n.title)}的封面" draggable="false">${n.video?`<span class="video-badge" aria-label="视频笔记">${icon('play')}</span>`:''}</button>`}
function cardHTML(n){return `<article class="note" data-note="${n.id}">${coverHTML(n)}<div class="note-body"><button class="note-title" data-action="open" data-id="${n.id}">${escapeHTML(n.title)}</button><div class="meta">${authorHTML(n)}${likeHTML(n)}</div></div></article>`}
function matching(){return notes.filter(n=>(category==='推荐'||n.type===category)&&(region==='全国'||n.region===region)&&(!authorOnly||n.author===authorOnly)&&(n.title+n.topic+n.author).includes(query))}
function renderFeed(animate=false){
 $('.categories').innerHTML=categories.map(c=>`<button data-action="category" data-category="${c}" aria-pressed="${c===category}">${c}</button>`).join('');
 $('.region').innerHTML=`${region} <span>⌄</span>`;const list=matching();feed.scrollTop=0;
 if(!list.length){content.style.height='';content.innerHTML=`<div class="empty">${icon('search')}<span>这里还没有${category==='推荐'?'相关':category}笔记</span><button data-action="reset">看看全部笔记</button></div>`;$('.end').hidden=true;queueLayout();return}
 $('.end').hidden=false;content.innerHTML=list.map(n=>cardHTML(n)).join('');queueLayout();
 if(animate&&!reduced)content.animate([{opacity:.15},{opacity:1}],{duration:200/rate});
}

$('.icon-button[data-action=search]').innerHTML=icon('search');$('.rent-entry').innerHTML=icon('car');
let layoutFrame=0,statusFrame=0,programmaticUntil=0;
const parentSend=m=>{if(parent!==window)parent.postMessage({...m,layout:layoutMode},location.origin)};
function queueLayout(){cancelAnimationFrame(layoutFrame);layoutFrame=requestAnimationFrame(layoutFeed)}
function layoutFeed(){
 const items=[...content.querySelectorAll('.note')];
 if(layoutMode==='single'){content.style.height='';items.forEach(e=>{e.style.position='';e.style.width='';e.style.left='';e.style.top='';});}
 else if(items.length){const gap=14,w=(content.clientWidth-gap)/2,ys=[0,0];items.forEach(e=>{e.style.position='absolute';e.style.width=w+'px';});items.forEach(e=>{const col=ys[0]<=ys[1]?0:1;e.style.left=(col*(w+gap))+'px';e.style.top=ys[col]+'px';ys[col]+=e.offsetHeight+24;});content.style.height=(Math.max(...ys)-24)+'px';}
 reportStatus();
}
function reportStatus(){
 const fr=feed.getBoundingClientRect(),items=[...content.querySelectorAll('.note')],inView=items.filter(e=>{const r=e.getBoundingClientRect();return r.bottom>fr.top+8&&r.top<fr.bottom-8});
 const anchor=inView[0]||items.at(-1),list=matching();
 parentSend({type:'feed-status',scrollTop:feed.scrollTop,maxScroll:Math.max(0,feed.scrollHeight-feed.clientHeight),height:feed.clientHeight,anchor:anchor?.dataset.note||null,items:list.map(n=>({id:n.id,title:n.title})),atEnd:feed.scrollHeight-feed.clientHeight-feed.scrollTop<2,cause:performance.now()<programmaticUntil?'programmatic':'user'});
}
feed.addEventListener('scroll',()=>{cancelAnimationFrame(statusFrame);statusFrame=requestAnimationFrame(reportStatus)},{passive:true});
function markProgrammatic(ms=180){programmaticUntil=performance.now()+ms}
['wheel','touchstart','keydown'].forEach(type=>feed.addEventListener(type,()=>{programmaticUntil=0},{passive:true}));
function announceFilters(){parentSend({type:'feed-filters',category,region})}
function seekNote(id){if(motion)finish(0);const e=content.querySelector(`[data-note="${id}"]`);if(!e)return;markProgrammatic();feed.scrollTop+=e.getBoundingClientRect().top-feed.getBoundingClientRect().top;feed.dataset.compareTarget=id;reportStatus();}
let lastWidth=0;new ResizeObserver(entries=>{const w=entries[0].contentRect.width;if(Math.abs(w-lastWidth)>.5){lastWidth=w;queueLayout();}}).observe(content);
addEventListener('load',queueLayout);document.fonts.ready.then(queueLayout);
$('.bottom-nav').innerHTML=[['home','首页'],['trip','行程'],['grid','工作台'],['message','消息'],['person','我的']].map(([i,t])=>`<button data-action="nav" data-nav="${i}" aria-label="${t}" ${i==='home'?'aria-current="page"':''} class="${i==='grid'?'nav-center':''}">${icon(i)}<span>${t}</span></button>`).join('');
renderFeed();

let panelOwner=page,panelClosing=null;
function openPanel(title,html){
 if(motion&&motion.p>0&&motion.p<1)return;
 panelOwner=detail.hidden?page:detail;$('.panel-top h2').textContent=title;$('.panel-body').innerHTML=html;panel.showModal();parentSend({type:'feed-panel',open:true});
 if(!reduced){panel.animate([{transform:'translateX(100%) rotateY(-6deg)',opacity:.3},{transform:'translateX(0) rotateY(0)',opacity:1}],{duration:360/rate,easing:'cubic-bezier(.2,.8,.2,1)'});panelOwner.animate([{transform:'translateZ(0)'},{transform:'translateX(-15px) translateZ(-65px)',opacity:.68}],{duration:360/rate,fill:'forwards'});}
}
async function closePanel(){if(!panel.open)return;if(panelClosing)return panelClosing;panelClosing=(async()=>{if(!reduced){await Promise.allSettled([panel.animate([{transform:'translateX(0)',opacity:1},{transform:'translateX(100%)',opacity:.4}],{duration:250/rate,easing:'ease-in'}).finished,panelOwner.animate([{transform:'translateX(-15px) translateZ(-65px)',opacity:.68},{transform:'none',opacity:1}],{duration:250/rate,fill:'forwards'}).finished]);}panelOwner.getAnimations().forEach(a=>a.cancel());panel.close();parentSend({type:'feed-panel',open:false});panelClosing=null;})();return panelClosing;}
panel.addEventListener('cancel',e=>{e.preventDefault();closePanel()});
function openSearch(){openPanel('搜索笔记',`<input id="note-search" aria-label="搜索关键词" placeholder="搜索标题、话题或作者" autocomplete="off"><div class="search-results"></div>`);const input=$('#note-search');input.addEventListener('input',()=>searchResults(input.value));searchResults('');setTimeout(()=>input.focus(),60)}
function searchResults(value){const items=notes.filter(n=>(n.title+n.topic+n.author).includes(value.trim()));$('.search-results').innerHTML=items.length?items.map(n=>`<button class="search-result" data-action="search-open" data-id="${n.id}"><img src="${cover(n)}" alt=""><span>${n.title}<br><small>${n.author} · ${n.type}</small></span></button>`).join(''):'<div class="empty">没有找到相关笔记</div>';}
function updateLikes(n){document.querySelectorAll(`.like[data-id="${n.id}"]`).forEach(b=>{b.setAttribute('aria-pressed',String(likes.has(n.id)));b.setAttribute('aria-label',`${likes.has(n.id)?'取消点赞':'点赞'}：${n.title}`);b.querySelector('span').textContent=n.likes+(likes.has(n.id)?1:0);if(!reduced)b.animate([{transform:'scale(.88)'},{transform:'scale(1.12)'},{transform:'scale(1)'}],{duration:280/rate})})}
function detailHTML(n){return `<header class="detail-head"><button class="icon-button" data-action="back" aria-label="返回笔记列表">${icon('back')}</button><strong>笔记</strong><button class="icon-button" data-action="more" aria-label="笔记更多操作">${icon('more')}</button></header><div class="detail-scroll"><div class="detail-cover" data-shape="${mediaShape(n)}"><img src="${cover(n)}" alt="${n.title}的封面">${n.video?`<button class="video-badge" data-action="video" aria-label="播放视频笔记">${icon('play')}</button>`:''}</div><div class="detail-copy">${authorHTML(n)}<h2>${n.title}</h2>${n.topic?`<span class="topic"># ${n.topic}</span>`:''}${n.body?n.body.split('\n\n').map(p=>`<p>${p}</p>`).join(''):''}<p class="caption">${n.region}</p></div></div><div class="detail-bottom"><button class="comment" data-action="comment">说点什么…</button>${likeHTML(n)}<button class="icon-button" data-action="save" data-id="${n.id}" aria-label="${saved.has(n.id)?'取消收藏':'收藏笔记'}" aria-pressed="${saved.has(n.id)}">${icon('bookmark')}</button></div>`}
let motion=null,raf=0,transitionToken=0;
const rectOf=el=>{const a=app.getBoundingClientRect(),r=el.getBoundingClientRect();return {x:r.left-a.left,y:r.top-a.top,w:r.width,h:r.height}};
const mix=(a,b,p)=>a+(b-a)*p;
function createFlight(){flight.innerHTML=`<div class="flying-image"><div class="sheet-front"><img src="${cover(motion.note)}" alt=""></div><div class="sheet-back"></div></div>`;flight.hidden=false;motion.flying=flight.firstElementChild;const originalStyle=getComputedStyle(motion.sourceImg), flyingImg=motion.flying.querySelector('img');flyingImg.style.objectFit=originalStyle.objectFit;flyingImg.style.objectPosition=originalStyle.objectPosition;motion.sourceImg.style.visibility='hidden';motion.targetImg.style.visibility=motion.p>.94?'':'hidden'}
function draw(p){
 if(!motion)return;motion.p=p;const m=motion,bend=Math.sin(p*Math.PI);
 feed.scrollTop=m.scrollTop;page.style.visibility='visible';page.style.transform='none';page.style.opacity=String(reduced?1-p:1);
 content.style.transform=reduced?'none':`perspective(1000px) translateZ(${-1000*p}px)`;
 detail.style.transform='none';detail.style.opacity=String(reduced?p:p<.88?0:Math.min(1,(p-.88)/.07));
 if(m.flying){const a=m.from,b=m.to;Object.assign(m.flying.style,{left:mix(a.x,b.x,p)+'px',top:mix(a.y,b.y,p)+'px',width:mix(a.w,b.w,p)+'px',height:mix(a.h,b.h,p)+'px',transform:`translateZ(${bend*110}px) rotateX(${-180*p}deg)`});flight.style.opacity=String(p<.95?1:Math.max(0,(1-p)/.05));m.targetImg.style.visibility=p>.94?'':'hidden';}
 const copy=$('.detail-copy');if(copy){const c=reduced?p:Math.max(0,Math.min(1,(p-.9)/.1));copy.style.opacity=String(c);copy.style.transform=reduced?'none':`translateY(${(1-c)*18}px)`}
}
function finish(target){
 cancelAnimationFrame(raf);if(!motion)return;draw(target);const m=motion;flight.hidden=true;flight.innerHTML='';m.flying=null;m.targetImg.style.visibility='';
 if(target===1){page.style.visibility='hidden';detail.inert=false;$('#edge').hidden=reduced;document.title='笔记详情 · 草稿';$('.detail-head [data-action=back]').focus({preventScroll:true});}
 else{m.sourceImg.style.visibility='';page.style.visibility='';page.style.transform='';page.style.opacity='';content.style.transform='';content.style.transformOrigin='';feed.scrollTop=m.scrollTop;page.inert=false;detail.hidden=true;detail.innerHTML='';detail.style.transform='';detail.style.opacity='';$('#edge').hidden=true;motion=null;parentSend({type:'feed-detail',open:false});reportStatus();document.title='笔记 · '+(layoutMode==='single'?'单列':'双列')+'浏览稿';m.sourceButton.focus({preventScroll:true});}
}
function runTo(target){
 if(!motion)return;cancelAnimationFrame(raf);const token=++transitionToken,m=motion,start=m.p,duration=(reduced?120:440)*Math.max(.16,Math.abs(target-start))/rate,t0=performance.now();
 function frame(now){if(token!==transitionToken||!motion)return;const t=Math.min(1,(now-t0)/duration),e=t*t*(3-2*t);draw(mix(start,target,e));if(t<1)raf=requestAnimationFrame(frame);else finish(target)}raf=requestAnimationFrame(frame);
}
function openNote(n,sourceButton){
 if(motion)return;parentSend({type:'feed-detail',open:true});const sourceImg=sourceButton.querySelector('img');const from=rectOf(sourceButton);detail.innerHTML=detailHTML(n);detail.hidden=false;detail.inert=false;const targetImg=$('.detail-cover img'),to={x:0,y:40,w:app.clientWidth,h:app.clientHeight-40};const cr=content.getBoundingClientRect(),fr=feed.getBoundingClientRect();content.style.transformOrigin=`50% ${fr.top+fr.height/2-cr.top}px`;
 motion={p:0,note:n,sourceButton,sourceImg,targetImg,from,to,flying:null,scrollTop:feed.scrollTop};page.inert=true;$('#edge').hidden=true;document.title='笔记详情 · 过渡中';if(!reduced)createFlight();draw(0);runTo(1);
}
function prepareBack(){if(!motion)return;page.style.visibility='visible';detail.inert=true;if(!motion.flying&&!reduced)createFlight();else if(!motion.flying)motion.sourceImg.style.visibility='';}
function back(){if(!motion)return;prepareBack();runTo(0)}
function selectCategory(c){if(motion)return;category=c;query='';authorOnly=null;markProgrammatic();renderFeed(true);announceFilters()}
document.addEventListener('click',async e=>{
 const b=e.target.closest('[data-action]');if(!b)return;const action=b.dataset.action,n=notes.find(n=>n.id===b.dataset.id);
 if(action==='like'){likes.has(n.id)?likes.delete(n.id):likes.add(n.id);updateLikes(n);parentSend({type:'feed-like',id:n.id,liked:likes.has(n.id)});return}
 if(action==='back'){back();return}
 if(action==='close-panel'){closePanel();return}
 if(action==='category'){selectCategory(b.dataset.category);return}
 if(action==='open'){const source=content.querySelector(`[data-note="${n.id}"] .cover-button`);openNote(n,source);return}
 if(action==='region'){openPanel('选择地区',`<div class="region-options">${['全国','上海','浙江'].map(r=>`<button data-action="set-region" data-region="${r}" aria-pressed="${region===r}">${r}</button>`).join('')}</div>`);return}
 if(action==='set-region'){region=b.dataset.region;await closePanel();markProgrammatic();renderFeed(true);announceFilters();return}
 if(action==='search'){openSearch();return}
 if(action==='search-open'){await closePanel();category='推荐';region='全国';authorOnly=null;query='';renderFeed();layoutFeed();announceFilters();const source=content.querySelector(`[data-note="${n.id}"] .cover-button`);const sr=source.getBoundingClientRect(),fr=feed.getBoundingClientRect();feed.scrollTop+=sr.top-fr.top-Math.max(0,(feed.clientHeight-sr.height)/2);openNote(n,source);return}
 if(action==='reset'){category='推荐';region='全国';query='';authorOnly=null;markProgrammatic();renderFeed(true);announceFilters();return}
 if(action==='author'){openPanel(n.author,`<div class="profile-preview"><img src="${avatar}" alt="${n.author}的头像"><h3>${n.author}</h3><p>记录骑行，也记录沿途的日常。</p><button class="primary" data-action="follow" data-author="${n.author}" aria-pressed="${followed.has(n.author)}">${followed.has(n.author)?'已关注':'关注'}</button></div>`);return}
 if(action==='follow'){const a=b.dataset.author;followed.has(a)?followed.delete(a):followed.add(a);b.textContent=followed.has(a)?'已关注':'关注';b.setAttribute('aria-pressed',String(followed.has(a)));return}
 if(action==='save'){saved.has(n.id)?saved.delete(n.id):saved.add(n.id);b.setAttribute('aria-pressed',String(saved.has(n.id)));b.style.color=saved.has(n.id)?'#333':'';toast(saved.has(n.id)?'已收藏':'已取消收藏');return}
 if(action==='comment'){openPanel('评论',`<input aria-label="评论内容" placeholder="写下你的想法"><button class="primary" style="margin-top:18px" data-action="comment-send">发送</button>`);return}
 if(action==='comment-send'){const v=$('.panel-body input').value.trim();if(!v){toast('先写点内容吧');return}await closePanel();toast('草稿反馈已记录');return}
 if(action==='video'){toast('本稿仅演示视频入口与封面');return}
 if(action==='more'){openPanel('更多操作','<button class="primary" data-action="close-panel">返回笔记</button>');return}
 if(action==='rent'){toast('租车页面沿用现有入口');return}
 if(action==='nav'){if(b.dataset.nav==='home')feed.scrollTo({top:0,behavior:reduced?'auto':'smooth'});else toast(b.dataset.nav==='trip'?'行程即将开放':b.dataset.nav==='grid'?'功能建设中':'该入口未纳入本轮草稿');}
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.open&&motion){e.preventDefault();back()}});
let edgeGesture=null;
$('#edge').addEventListener('pointerdown',e=>{if(!motion||motion.p<.999)return;prepareBack();cancelAnimationFrame(raf);transitionToken++;edgeGesture={x:e.clientX,id:e.pointerId};e.currentTarget.setPointerCapture(e.pointerId)});
$('#edge').addEventListener('pointermove',e=>{if(!edgeGesture)return;draw(1-Math.min(1,Math.max(0,e.clientX-edgeGesture.x)/app.clientWidth))});
function finishEdge(e,cancel=false){if(!edgeGesture)return;const distance=e.clientX-edgeGesture.x;edgeGesture=null;runTo(!cancel&&distance>app.clientWidth*.27?0:1)}
$('#edge').addEventListener('pointerup',e=>finishEdge(e));$('#edge').addEventListener('pointercancel',e=>finishEdge(e,true));
addEventListener('message',e=>{if(e.origin!==location.origin)return;const m=e.data;
 if(m.type==='compare-scroll'){if(motion||panel.open)return;const smooth=m.behavior==='smooth'&&!reduced;markProgrammatic(smooth?900:180);feed.scrollTo({top:feed.scrollTop+(Number(m.delta)||0),behavior:smooth?'smooth':'auto'});reportStatus();return;}
 if(m.type==='compare-top'){if(motion)finish(0);markProgrammatic();feed.scrollTop=0;reportStatus();return;}
 if(m.type==='compare-seek'){seekNote(m.id);return;}
 if(m.type==='compare-filters'){if(motion)finish(0);category=categories.includes(m.category)?m.category:'推荐';region=['全国','上海','浙江'].includes(m.region)?m.region:'全国';query='';authorOnly=null;markProgrammatic();renderFeed();return;}
 if(m.type==='compare-like'){const n=notes.find(n=>n.id===m.id);if(n){m.liked?likes.add(n.id):likes.delete(n.id);updateLikes(n);}return;}
 if(m.type==='compare-report'){reportStatus();return;}
 if(m.type==='motion-speed'){rate=m.speed===.35?.35:1;}if(m.type==='motion-reduce'){reduced=!!m.reduce||matchMedia('(prefers-reduced-motion: reduce)').matches;if(motion&&motion.p>0&&motion.p<1)finish(motion.p>.5?1:0);}if(m.type==='reset-draft'){if(motion)finish(0);category='推荐';region='全国';query='';authorOnly=null;likes.clear();saved.clear();renderFeed();}});
matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',e=>{reduced=e.matches});
