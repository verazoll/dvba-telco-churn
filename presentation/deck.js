/* Telco Churn – Retention Priorities (v3) – slide logic. Needs d3 and window.dash (see index.html). */
if(window.tcPage==null)window.tcPage=0;
const ORDER=[0,2,18,3,6,5,14,19,15,8,26,13,9,16,21,17,22,20,23,12,24,25,10,7];
// backup slides: page 13 is the appendix overview, every other one gets a button back to it
const APX=ORDER.slice(ORDER.indexOf(13));// (the 'Appendix' title slide 26 before it gets no back button)
const NUM=p=>{const i=ORDER.indexOf(p);return i>=0?i+1:(p===11?ORDER.length+1:'')};
const NF='Month-to-month · Fiber · ≤15 months';
dash.draw('pgno',el=>{el.textContent=String(NUM(window.tcPage))});
const go=p=>{if(!document.getElementById('p'+p))return;const prev=window.tcPage;window.tcPage=p;
  // a slide that is not on screen is set to its start state without animating, so it never shows the old state for a moment
  if(prev!==p&&typeof tcNoTr==='function')tcNoTr(document.getElementById('p'+p));
  // the slider on the ranking slide is only a demo: whenever we leave it, every later slide uses the plan of 1,600 again
  if(prev===6&&p!==6){const inp=document.querySelector('.tc #p6 .in-n');if(inp&&+inp.value!==1600){inp.value=1600;inp.dispatchEvent(new Event('input'))}}
  document.querySelectorAll('.tc').forEach(t=>t.classList.toggle('cover',p===0||p===8||p===26));
  if(p===5&&prev!==5){window.tcSel=null;window.tc5=5;{const q5=document.getElementById('p5');if(q5)q5.classList.remove('nolab')}if(typeof hd5==='function')hd5(5);const q5=document.getElementById('p5');if(q5)for(let k=1;k<=5;k++)q5.classList.add('st'+k);document.querySelectorAll('.tc #p5 [data-draw=segbars]').forEach(e=>{e.dataset.st='5'});try{dash.draw('segbars')}catch(e){}}
  if(p===14&&prev!==14){window.tcSel=null;if(typeof s14==='function')s14(prev===5?0:2)}
  if(p===6&&prev!==6&&typeof s6==='function')s6(3);
  if(p===4&&prev!==4&&window.tcG!==2){window.tcG=2;window.tcGprev=2;document.querySelectorAll('.tc #groups').forEach(e=>e.classList.remove('g3s'));try{dash.draw('groups')}catch(e){}}
  if(p===2&&prev!==2&&typeof s2==='function')s2(prev===18?1:0);// problem slide: the cost tile appears on the next click
  if(p===18&&prev!==18&&typeof run18==='function')setTimeout(()=>{run18();if(prev===3&&typeof s18==='function')s18(2)},0);
  document.querySelectorAll('.tc .page').forEach(s=>{const off=s.id!=='p'+p;s.hidden=false;s.classList.toggle('off',off);s.setAttribute('aria-hidden',String(off))});
  // fit the slide to the screen and draw its bubble chart at that final size before the first paint (no later redraw jump)
  if(prev!==p&&window.tcFit){try{const ch={5:'segbars',14:'segbars2',6:'curve',19:'wf',9:'tree',12:'be2'}[p];for(let i=0;i<2;i++){window.tcFit(true);if(ch)dash.draw(ch)}window.tcFit(true)}catch(e){}}
  {const sp=(p===1||p===18)?2:p;document.querySelectorAll('.tc .dots button').forEach(b=>b.setAttribute('aria-current',String(+b.dataset.p===sp)))}
  document.querySelectorAll('.tc .htitle [data-p]').forEach(e=>e.classList.toggle('on',+e.dataset.p===p));
  try{dash.draw('pgno')}catch(e){}
  document.querySelectorAll('.tc .axback').forEach(b=>{b.hidden=!APX.includes(p)||p===13});
  if(p===12&&typeof s12==='function')s12(5);
  document.querySelectorAll('.tc .prev').forEach(b=>b.disabled=p===0);
  document.querySelectorAll('.tc .next').forEach(b=>b.disabled=p===7||p===11);
  const s=document.getElementById('p'+p);if(s)dash.setLink(s.id);if(window.tcFit)requestAnimationFrame(()=>window.tcFit(true))};
// force=false (layout observers): never rescale the slide that is on screen, so a chart redraw mid-slide cannot make it jump
window.tcFit=(force)=>{const cur='p'+window.tcPage;document.querySelectorAll('.tc > .pages').forEach(box=>{const bs=getComputedStyle(box),H=box.clientHeight-(parseFloat(bs.paddingTop)||0)-(parseFloat(bs.paddingBottom)||0);if(H<=0)return;
  box.querySelectorAll(':scope > .page').forEach(pg=>{if(force!==true&&pg.id===cur&&pg.dataset.s)return;const old=+pg.dataset.s||1,h=pg.scrollHeight;
    let ns=h>0?Math.max(.5,Math.min(1,H/h*old>=1&&old===1?1:H/h)):1;if(old===1&&h<=H)ns=1;
    if(ns>=old?ns-old<.02:old-ns<.004)return;const fk=H+'x'+box.clientWidth;if(ns>old&&pg.dataset.fk===fk)return;pg.dataset.fk=fk;pg.dataset.s=String(ns);pg.style.width=ns<1?(100/ns)+'%':'';pg.style.transform=ns<1?`scale(${ns})`:'none'});
  const grp=['#p6'].map(q=>box.querySelector(':scope > '+q)).filter(Boolean);if(grp.length>1&&(force===true||!grp.some(g=>g.id===cur))){const s=Math.min(...grp.map(g=>+g.dataset.s||1));grp.forEach(pg=>{pg.dataset.s=String(s);pg.style.width=s<1?(100/s)+'%':'';pg.style.transform=s<1?`scale(${s})`:'none'})}})};
// settle: fit every slide to the screen and draw its charts at that final size BEFORE they are shown,
// so no chart is drawn at a temporary size and later redrawn (that redraw is what made charts jump)
window.tcSettle=()=>{for(let i=0;i<3;i++){window.tcFit(true);['segbars','segbars2','curve','wf'].forEach(n=>{try{dash.draw(n)}catch(e){}})}window.tcFit(true)};
{let rt=0;window.addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>{try{window.tcSettle()}catch(e){}},300)});setTimeout(()=>{try{window.tcSettle()}catch(e){}},700)}
{let q=0;const sch=()=>{if(q)return;q=requestAnimationFrame(()=>{q=0;window.tcFit()})};
 window.addEventListener('resize',sch);document.querySelectorAll('.tc > .pages').forEach(b=>{new MutationObserver(sch).observe(b,{childList:true,subtree:true});new ResizeObserver(sch).observe(b)});setTimeout(sch,300);setTimeout(sch,1200)}
const setG=g=>{const pg=window.tcG||1;window.tcG=g;document.querySelectorAll('.tc #groups').forEach(e=>e.classList.toggle('g3s',g>=3));if((g>=3)!==(pg>=3)&&Math.min(g,pg)>=2)return;dash.draw('groups')};
var vz=e=>{const h=e&&e.offsetHeight;return h?(e.getBoundingClientRect().height/h)||1:1};
var tcZoom=()=>{const t=document.querySelector('.tc');if(!t||t.clientWidth<200)return;const z=Math.round(Math.max(1,Math.min(2.4,t.clientWidth/1200))*100)/100;if(Math.abs((+t.dataset.z||1)-z)<.02&&t.dataset.z)return;t.dataset.z=z;t.style.setProperty('--tcz',z);
  t.querySelectorAll(':scope > .brand,:scope > .pages,:scope > .nav').forEach(e=>e.style.zoom=z);
  setTimeout(()=>{for(let i=0;i<2;i++){window.tcFit&&window.tcFit(true);['segbars','segbars2','curve','be2','mix','tree','wf'].forEach(n=>{try{dash.draw(n)}catch(e){}})}window.tcFit&&window.tcFit(true)},60)};
var tcR=r=>{const b=r.getBoundingClientRect();return{left:b.left+r.clientLeft,top:b.top+r.clientTop,width:b.width,height:b.height}};
const MORPH_EASE='cubic-bezier(.65,0,.35,1)';
var morphTo4=()=>{const root=document.querySelector('.tc'),card=document.querySelector('.tc #p3 .qc[data-go="6"]'),src=card&&card.querySelector('.h');
  if(!root||!src||matchMedia('(prefers-reduced-motion: reduce)').matches){go(6);return}
  const R=tcR(root),rel=b=>({x:b.left-R.left,y:b.top-R.top,w:b.width,h:b.height});
  document.querySelectorAll('.tc .morph').forEach(e=>e.remove());
  const tb0=rel(src.getBoundingClientRect()),cs=getComputedStyle(src);
  const g=document.createElement('div');g.className='morph';g.textContent=src.textContent;
  const z4=vz(src);Object.assign(g.style,{left:tb0.x+'px',top:tb0.y+'px',width:tb0.w+'px',fontFamily:cs.fontFamily,fontSize:(parseFloat(cs.fontSize)*z4)+'px',fontWeight:cs.fontWeight,lineHeight:((parseFloat(cs.lineHeight)||parseFloat(cs.fontSize)*1.25)*z4)+'px',color:cs.color,transformOrigin:'left top',zIndex:7});root.appendChild(g);
  const circ=[...document.querySelectorAll('.tc #p3 .qn')].map(q=>{const b=rel(q.getBoundingClientRect()),c=document.createElement('div');c.className='morph';
    Object.assign(c.style,{left:b.x+'px',top:b.y+'px',width:b.w+'px',height:b.h+'px',borderRadius:'50%',background:'#2C4670',zIndex:7});root.appendChild(c);return{c,b}});
  const cards=[...document.querySelectorAll('.tc #p3 .qc')].map(q=>{const b=rel(q.getBoundingClientRect()),c=document.createElement('div');c.className='morph';
    Object.assign(c.style,{left:b.x+'px',top:b.y+'px',width:b.w+'px',height:b.h+'px',borderRadius:'8px',background:'var(--color-panel)',border:'1px solid var(--color-border-line)',zIndex:6});root.appendChild(c);return c});
  const p4=document.getElementById('p6');if(p4)p4.classList.add('morph4');
  go(6);s6(0);
  const hk=()=>document.querySelector('.tc .htitle .hk.q.on'),r0=e=>e.getBoundingClientRect().width>0;
  {const t=hk();if(t){t.style.transition='none';t.style.opacity='0'}}
  let n=0,last='',st=0;const run=()=>{const t=hk(),key=t?(()=>{const r=t.getBoundingClientRect();return Math.round(r.left)+','+Math.round(r.top)+','+Math.round(r.width)})():'';
    if(t&&r0(t)&&key===last)st++;else st=0;last=key;
    if(st<2&&n++<40){requestAnimationFrame(run);return}
    if(!t){document.querySelectorAll('.tc .morph').forEach(e=>e.remove());if(p4)p4.classList.remove('morph4');return}
    t.style.transition='none';t.style.opacity='0';
    const R2=tcR(root),rel2=b=>({x:b.left-R2.left,y:b.top-R2.top,w:b.width,h:b.height});
    const tx=t.querySelector('.qtx')||t,tt=rel2(tx.getBoundingClientRect()),k=parseFloat(getComputedStyle(tx).fontSize)*vz(tx)/(parseFloat(cs.fontSize)*z4);
    const E='cubic-bezier(.45,0,.2,1)',T=1500;
    cards.forEach(c=>c.animate([{opacity:1},{opacity:0}],{duration:350,easing:'ease-out',fill:'forwards'}));
    g.animate([{transform:'translate(0,0) scale(1)',color:cs.color,opacity:1},{offset:.65,opacity:1},{transform:`translate(${tt.x-tb0.x}px,${tt.y-tb0.y}px) scale(${k})`,color:'#93A3BA',opacity:0}],{duration:T,easing:E,fill:'forwards'});
    const dots=[...t.querySelectorAll('.qd i')].map(d=>rel2(d.getBoundingClientRect()));
    circ.forEach(({c,b},i)=>{const d=dots[i];if(!d){c.remove();return}
      c.animate([{left:b.x+'px',top:b.y+'px',width:b.w+'px',height:b.h+'px',backgroundColor:'#2C4670',opacity:1},{offset:.9,opacity:1},
        {left:d.x+'px',top:d.y+'px',width:d.w+'px',height:d.h+'px',backgroundColor:i===0?'#EAF0F8':'#5D6F8C',opacity:0}],{duration:T,easing:E,fill:'forwards'})});
    setTimeout(()=>{t.style.transition='opacity .4s ease-out';t.style.opacity=''},T*.6);
    setTimeout(()=>{document.querySelectorAll('.tc .morph').forEach(e=>e.remove());if(p4)requestAnimationFrame(()=>p4.classList.remove('morph4'))},T+120)};
  requestAnimationFrame(run)};
var morphTo14=()=>{const root=document.querySelector('.tc'),p14=document.getElementById('p14');
  const go14=()=>{go(14);window.tcSel=null;['segbars2','action','evid','selgrp'].forEach(n=>{try{dash.draw(n)}catch(e){}})};
  if(!root||!p14||matchMedia('(prefers-reduced-motion: reduce)').matches){go14();return}
  const id=(window.tcMid=(window.tcMid||0)+1),R=tcR(root),mb=document.querySelector('.tc #p5 [data-draw=segbars]');
  const src=mb?[...mb.querySelectorAll('circle[data-seg]')].map(c=>{const b=c.getBoundingClientRect(),nx=c.nextElementSibling;return{seg:c.dataset.seg,x:b.left-R.left,y:b.top-R.top,d:b.width,fill:getComputedStyle(c).fill,num:nx?nx.textContent:'',nfs:nx?(nx.getBoundingClientRect().height/1.15||11):11,i0:(()=>{const cx=b.left+b.width/2,cy=b.top+b.height/2,m=[...c.ownerSVGElement.querySelectorAll('circle:not([data-seg])')].find(q=>{const qb=q.getBoundingClientRect();return qb.width>0&&Math.abs(qb.left+qb.width/2-cx)<2&&Math.abs(qb.top+qb.height/2-cy)<2});return m&&+getComputedStyle(m.parentNode).opacity>.5?m.getBoundingClientRect().width:0})()}}).filter(s=>s.d>0):[];
  document.querySelectorAll('.tc .morph').forEach(e=>e.remove());
  p14.classList.add('p14pre');go14();
  if(!src.length){requestAnimationFrame(()=>requestAnimationFrame(()=>p14.classList.remove('p14pre')));return}
  const gs=src.map(s=>{const g=document.createElement('div');g.className='morph';
    Object.assign(g.style,{left:s.x+'px',top:s.y+'px',width:s.d+'px',height:s.d+'px',borderRadius:'50%',background:s.fill,display:'flex',alignItems:'center',justifyContent:'center',zIndex:7});
    const inn=document.createElement('div');Object.assign(inn.style,{position:'absolute',left:'50%',top:'50%',width:(s.i0||0)+'px',height:(s.i0||0)+'px',borderRadius:'50%',background:'#3FC1E8',opacity:'.92',transform:'translate(-50%,-50%)'});
    const t=document.createElement('span');t.textContent=s.num;Object.assign(t.style,{position:'relative',color:'#050B16',fontWeight:'700',fontSize:s.nfs+'px',lineHeight:'1',zIndex:2});
    g.append(inn,t);root.appendChild(g);return{g,inn,t,s}});
  const t0=performance.now();let last='',stable=0;
  const ready=()=>{if(window.tcMid!==id){gs.forEach(o=>o.g.remove());p14.classList.remove('p14pre');return}
    const cs=[...p14.querySelectorAll('[data-draw=segbars2] circle[data-seg]')],key=cs.map(c=>{const b=c.getBoundingClientRect();return Math.round(b.left)+','+Math.round(b.top)+','+Math.round(b.width)}).join('|');
    if(cs.length>=src.length&&key===last&&cs[0].getBoundingClientRect().width>0)stable++;else stable=0;last=key;
    if(stable<4&&performance.now()-t0<1500){requestAnimationFrame(ready);return}
    const R2=tcR(root),D=1500;
    gs.forEach(({g,inn,t,s})=>{const q=cs.find(c=>c.dataset.seg===s.seg);if(!q){g.animate([{opacity:1},{opacity:0}],{duration:400,fill:'forwards'});return}
      const b=q.getBoundingClientRect(),ic=q.nextElementSibling,idm=ic&&ic.tagName.toLowerCase()==='circle'&&!ic.dataset.seg?ic.getBoundingClientRect().width:0;
      g.animate([{left:s.x+'px',top:s.y+'px',width:s.d+'px',height:s.d+'px',backgroundColor:s.fill},
        {left:(b.left-R2.left)+'px',top:(b.top-R2.top)+'px',width:b.width+'px',height:b.width+'px',backgroundColor:'rgba(74,91,118,.55)'}],{duration:D,easing:MORPH_EASE,fill:'forwards'});
      inn.animate(s.i0?[{width:s.i0+'px',height:s.i0+'px'},{width:idm+'px',height:idm+'px'}]:[{width:'0px',height:'0px'},{offset:.45,width:'0px',height:'0px'},{width:idm+'px',height:idm+'px'}],{duration:D,easing:MORPH_EASE,fill:'forwards'});
      const cx=b.left+b.width/2,cy=b.top+b.height/2,lab=[...(q.ownerSVGElement||q.parentNode).querySelectorAll('text')].find(x=>{if(x.textContent!==s.num)return false;const xb=x.getBoundingClientRect();return Math.abs(xb.left+xb.width/2-cx)<b.width/2&&Math.abs(xb.top+xb.height/2-cy)<b.height/2});
      if(lab){const fsT=lab.getBoundingClientRect().height/1.15||s.nfs;t.animate([{fontSize:s.nfs+'px'},{fontSize:fsT+'px'}],{duration:D,easing:MORPH_EASE,fill:'forwards'})}
      else t.animate([{opacity:1},{opacity:0,offset:.4},{opacity:0}],{duration:D,fill:'forwards'})});
    setTimeout(()=>{if(window.tcMid!==id)return;p14.classList.remove('p14pre');setTimeout(()=>gs.forEach(o=>o.g.remove()),700)},D+40)};
  requestAnimationFrame(ready)};
var morphTo3=()=>{const root=document.querySelector('.tc'),src=document.querySelector('.tc #p18 .brn');
  if(!root||!src||!src.getBoundingClientRect().width||matchMedia('(prefers-reduced-motion: reduce)').matches){go(3);return}
  const R=tcR(root),b=src.getBoundingClientRect(),cs=getComputedStyle(src),z=vz(src),fs0=parseFloat(cs.fontSize)*z;
  document.querySelectorAll('.tc .morph').forEach(e=>e.remove());
  const g=document.createElement('div');g.className='morph';g.textContent=src.textContent;
  Object.assign(g.style,{left:(b.left-R.left)+'px',top:(b.top-R.top+(b.height-fs0)/2)+'px',fontFamily:cs.fontFamily,fontSize:fs0+'px',lineHeight:'1',color:cs.color,whiteSpace:'nowrap',transformOrigin:'left top',zIndex:7});root.appendChild(g);
  src.style.visibility='hidden';go(3);
  const tg=()=>document.querySelector('.tc .htitle .ht[data-p="3"] [data-draw="k_rar2"]');
  {const e=tg();if(e){e.style.transition='none';e.style.opacity='0'}}
  let n=0,last='',st=0;const run=()=>{const e=tg(),key=e?(()=>{const r=e.getBoundingClientRect();return Math.round(r.left)+','+Math.round(r.top)+','+Math.round(r.width)})():'';
    if(e&&e.getBoundingClientRect().width>0&&key===last)st++;else st=0;last=key;
    if(st<2&&n++<40){requestAnimationFrame(run);return}
    if(!e){g.remove();src.style.visibility='';return}
    const eb=e.getBoundingClientRect(),gb=g.getBoundingClientRect(),fsT=parseFloat(getComputedStyle(e).fontSize)*vz(e),k=fsT/fs0,ty=eb.top+(eb.height-fsT)/2-gb.top;
    const T=1300,E='cubic-bezier(.45,0,.2,1)';
    g.animate([{transform:'translate(0,0) scale(1)'},{transform:`translate(${eb.left-gb.left}px,${ty}px) scale(${k})`}],{duration:T,easing:E,fill:'forwards'});
    setTimeout(()=>{e.style.transition='opacity .25s';e.style.opacity='';g.animate([{opacity:1},{opacity:0}],{duration:250,fill:'forwards'});setTimeout(()=>{g.remove();src.style.visibility=''},280)},T)};
  requestAnimationFrame(run);
  setTimeout(()=>{const e=tg();if(e)e.style.opacity='';src.style.visibility=''},2600)};
var morphTo5c=()=>{const root=document.querySelector('.tc'),p6=document.getElementById('p6'),p5=document.getElementById('p5');
  if(!root||!p6||!p5||matchMedia('(prefers-reduced-motion: reduce)').matches){go(5);s5(0,1);return}
  const lo=p6.querySelector('[data-draw=curve] path.cv-lo'),hi=p6.querySelector('[data-draw=curve] path.cv-hi'),cd=dash.data('customers');
  const segs=[lo,hi].filter(p=>p&&p.getTotalLength&&p.getTotalLength()>0).map(p=>({p,len:p.getTotalLength(),M:p.getScreenCTM(),hi:p===hi}));
  if(!segs.length||cd.status!=='ok'){go(5);s5(0,1);return}
  const id=(window.tcMid=(window.tcMid||0)+1),R=tcR(root),LT=segs.reduce((a,s)=>a+s.len,0);
  const ptAt=f=>{let d=f*LT;for(const s of segs){if(d<=s.len||s===segs[segs.length-1]){const q=s.p.getPointAtLength(Math.min(d,s.len)),r=new DOMPoint(q.x,q.y).matrixTransform(s.M);return{x:r.x-R.left,y:r.y-R.top,hi:s.hi}}d-=s.len}};
  const cur=cd.data.filter(r=>r.churned==='No').sort((a,b)=>+b.revenue_at_risk_12m-+a.revenue_at_risk_12m),N=160,dot=6;
  const pts=[];for(let k=0;k<N;k++){const f=(k+.5)/N,p=ptAt(f),c=cur[Math.min(cur.length-1,Math.floor(f*cur.length))];pts.push({...p,seg:c.segment})}
  document.querySelectorAll('.tc .morph').forEach(e=>e.remove());
  const ds=pts.map(p=>{const d=document.createElement('div');d.className='morph';Object.assign(d.style,{left:(p.x-dot/2)+'px',top:(p.y-dot/2)+'px',width:dot+'px',height:dot+'px',borderRadius:'50%',background:p.hi?'#9AA0A8':'#EAF0F8',zIndex:7});root.appendChild(d);return d});
  go(5);p5.classList.add('morph5x','nolab');s5(0,1);
  const t0=performance.now();let last='',stable=0;
  const ready=()=>{if(window.tcMid!==id){ds.forEach(d=>d.remove());p5.classList.remove('morph5x','nolab');return}
    const cs=[...p5.querySelectorAll('[data-draw=segbars] circle[data-seg]')],key=cs.map(c=>{const b=c.getBoundingClientRect();return Math.round(b.left)+','+Math.round(b.top)+','+Math.round(b.width)}).join('|');
    if(cs.length>=5&&key===last)stable++;else stable=0;last=key;
    if(stable<3&&performance.now()-t0<1500){requestAnimationFrame(ready);return}
    const R2=tcR(root),tg={};cs.forEach(c=>{const b=c.getBoundingClientRect();tg[c.dataset.seg]={x:b.left-R2.left+b.width/2,y:b.top-R2.top+b.height/2,r:Math.max(4,b.width/2)}});
    const D=1600;
    ds.forEach((d,i)=>{const p=pts[i],t=tg[p.seg];if(!t){d.animate([{opacity:1},{opacity:0}],{duration:400,fill:'forwards'});return}
      const a=Math.random()*Math.PI*2,rr=Math.sqrt(Math.random())*t.r*.6,tx=t.x+Math.cos(a)*rr-dot/2,ty=t.y+Math.sin(a)*rr-dot/2;
      d.animate([{left:(p.x-dot/2)+'px',top:(p.y-dot/2)+'px',opacity:1,backgroundColor:p.hi?'#9AA0A8':'#EAF0F8'},{offset:.82,left:tx+'px',top:ty+'px',opacity:1,backgroundColor:'#93A3BA'},{left:tx+'px',top:ty+'px',opacity:0,backgroundColor:'#93A3BA'}],{duration:D,delay:(i/N)*450,easing:MORPH_EASE,fill:'forwards'})});
    setTimeout(()=>{if(window.tcMid!==id)return;p5.classList.remove('morph5x')},D*.8);
    setTimeout(()=>ds.forEach(d=>d.remove()),D+700)};
  requestAnimationFrame(ready)};
var r11=s=>{window.tc11=s;document.querySelectorAll('.tc #p11 .rd').forEach((d,i)=>d.classList.toggle('hid',i>=s-1));document.querySelectorAll('.tc #p11 .bl').forEach(b=>b.classList.toggle('hid',s<1))};
var s12=n=>{window.tc12=n;const p=document.getElementById('p12');if(p)for(let k=1;k<=5;k++)p.classList.toggle('st'+k,n>=k)};s12(5);
var H6=['We rank every customer still with us by revenue at risk','The customers with the most revenue at risk come first – so the curve rises steeply','The top <span style="color:#3FC1E8">1,600</span> customers reach <span style="color:#D9732E">80%</span> of the revenue at risk',null];
var hd6=n=>{}; // one core headline per slide: the steps no longer rewrite the title
var s6=n=>{const pv=window.tc6??3;window.tc6=n;hd6(n);const p=document.getElementById('p6');if(p)for(let k=1;k<=3;k++)p.classList.toggle('st'+k,n>=k);
  // step 1: curve fully dashed; step 2 (from step 1): slider starts at 0 and dragging turns the curve white
  const inp=document.querySelector('.tc #p6 .in-n');if(!inp)return;const v0=inp.value;
  if(n===2&&pv===1)inp.value=0;else if(n<2||(n>=3&&pv>=3&&+inp.value===0))inp.value=1600;/* step 3 keeps the value the presenter dragged to */
  if(inp.value!==v0||(pv<2)!==(n<2))inp.dispatchEvent(new Event('input'))};s6(3);
// offer slide steps: 0 bubbles only, 1 silver (base) diamonds, 2 gold (premium) diamonds
var s14=n=>{window.tc14=n;const p=document.getElementById('p14');if(p)for(let k=1;k<=2;k++)p.classList.toggle('st'+k,n>=k)};
var tcNoTr=pg=>{if(!pg)return;pg.classList.add('notr');clearTimeout(pg._ntr);pg._ntr=setTimeout(()=>{void pg.offsetWidth;pg.classList.remove('notr')},60)};
var s19=n=>{window.tc19=n;const p=document.getElementById('p19');if(p&&window.tcPage!==19)tcNoTr(p);if(p)for(let k=1;k<=4;k++)p.classList.toggle('st'+k,n>=k)};s19(3);
var r6=s=>{document.querySelectorAll('.tc #p6 .mixbox').forEach(m=>m.classList.toggle('hid6',!s))};
var safeM=(fn,p)=>{const before=window.tcPage;try{fn()}catch(err){console.error('[tc] morph',err)}
  if(window.tcPage===before)go(p);
  setTimeout(()=>{document.querySelectorAll('.tc .p14pre').forEach(e=>e.classList.remove('p14pre'));document.querySelectorAll('.tc .morph5x,.tc .morph6x').forEach(e=>e.classList.remove('morph5x','morph6x'));document.querySelectorAll('.tc .morph4').forEach(e=>{e.classList.remove('morph4');e.style.opacity=''});document.querySelectorAll('.tc .morph').forEach(e=>e.remove())},7500)};
const openSummary=()=>{go(11);r11(4)};
const nextP=p=>{const i=ORDER.indexOf(p);return i>=0&&i<ORDER.length-1?ORDER[i+1]:null};
const prevP=p=>{const i=ORDER.indexOf(p);return i>0?ORDER[i-1]:null};
document.querySelectorAll('.tc .prev').forEach(b=>b.addEventListener('click',()=>{const p=window.tcPage;
  if(p===2&&(window.tc2??1)>0){s2(0);return}
  if(p===18&&(window.tc18??0)>0){s18(window.tc18-1);return}
  if(p===6&&(window.tc6??3)>0){s6(window.tc6-1);return}
  if(p===5&&(window.tc5??4)>0){s5((window.tc5??4)-1);return}
  if(p===5){const q5=document.getElementById('p5');if(q5&&!q5.classList.contains('nolab')&&(window.tc5??0)===0){q5.classList.add('nolab');return}go(6);return}
  if(p===11){go(7);return}
  if(p===15){go(19);s19(3);return}
  if(p===19&&(window.tc19??3)>0){s19(window.tc19-1);return}
  if(p===19){go(14);return}
  if(p===14&&(window.tc14??2)>0){s14(window.tc14-1);return}
  if(p===14){go(5);return}
  const q=prevP(p);if(q!=null)go(q)}));
document.querySelectorAll('.tc .next').forEach(b=>b.addEventListener('click',()=>{const p=window.tcPage;
  if(p===2&&(window.tc2??1)<1){s2(1);return}
  if(p===18&&(window.tc18??2)<2){s18((window.tc18??2)+1);return}
  if(p===18){safeM(morphTo3,3);return}
  if(p===3){safeM(morphTo4,6);return}
  if(p===5){const q5=document.getElementById('p5');if(q5&&q5.classList.contains('nolab')){q5.classList.remove('nolab');return}}
  if(p===5&&(window.tc5??5)<5){s5((window.tc5??5)+1);return}
  if(p===5){safeM(morphTo14,14);return}
  if(p===6&&(window.tc6??3)<3){s6((window.tc6??3)+1);return}
  if(p===6){safeM(morphTo5c,5);return}
  if(p===14&&(window.tc14??2)<2){s14((window.tc14??2)+1);return}
  if(p===14){s19(0);go(19);return}
  if(p===19&&(window.tc19??3)<3){s19((window.tc19??3)+1);return}
  if(p===11||p===7)return;
  const q=nextP(p);if(q!=null)go(q)}));
document.querySelectorAll('.tc .dots button').forEach(b=>b.addEventListener('click',()=>{const p=+b.dataset.p;go(p);if(p===12)s12(5);if(p===19)s19(3);if(p===4)setG(2);if(p===14){window.tcSel=null;['segbars2','action','evid','selgrp'].forEach(n=>{try{dash.draw(n)}catch(e){}})}b.blur()}));
const tcFS=()=>{const t=document.querySelector('.tc');if(!t)return;
  const cur=()=>document.fullscreenElement||document.webkitFullscreenElement;
  if(cur()){const ex=document.exitFullscreen||document.webkitExitFullscreen;try{const p=ex&&ex.call(document);if(p&&p.catch)p.catch(()=>{})}catch(e){}return}
  if(t.classList.contains('fsfake')){t.classList.remove('fsfake');setTimeout(()=>window.tcFit&&window.tcFit(true),100);return}
  const fail=()=>{if(!cur())t.classList.add('fsfake');setTimeout(()=>window.tcFit&&window.tcFit(true),100)};
  const req=t.requestFullscreen||t.webkitRequestFullscreen;
  if(!req){fail();return}
  try{const p=req.call(t);if(p&&p.then)p.then(()=>setTimeout(()=>window.tcFit&&window.tcFit(true),200)).catch(fail);else setTimeout(()=>{if(!cur())fail()},400)}catch(e){fail()}};
document.querySelectorAll('.tc .fs').forEach(b=>b.addEventListener('click',tcFS));
if(!window.tcKeys){window.tcKeys=1;document.addEventListener('keydown',e=>{if(e.target.closest&&e.target.closest('input,textarea'))return;
  if(e.key==='f'||e.key==='F'){tcFS();e.preventDefault()}
  else if(e.key==='s'||e.key==='S'){openSummary();e.preventDefault()}
  else if(e.key==='a'||e.key==='A'){go(13);e.preventDefault()}
  else if(e.key==='ArrowRight'||e.key===' '||e.key==='PageDown'){const b=document.querySelector('.tc .next');if(b&&!b.disabled)b.click();e.preventDefault()}
  else if(e.key==='ArrowLeft'||e.key==='PageUp'){const b=document.querySelector('.tc .prev');if(b&&!b.disabled)b.click();e.preventDefault()}
  else if(e.key==='Escape'){const t=document.querySelector('.tc');if(t)t.classList.remove('fsfake')}})}
const tcBox=()=>{document.querySelectorAll('.tc').forEach(t=>{if((document.fullscreenElement||document.webkitFullscreenElement)===t){const W=innerWidth,H=innerHeight,w=Math.min(W,H*16/9),h=w*9/16;t.style.borderStyle='solid';t.style.borderColor='#000';t.style.borderWidth=`${(H-h)/2}px ${(W-w)/2}px`;t.style.borderRadius='0'}else{t.style.borderStyle='';t.style.borderColor='';t.style.borderWidth='';t.style.borderRadius='';t.classList.remove('fsfake')}});if(window.tcFit)setTimeout(window.tcFit,100)};
document.addEventListener('fullscreenchange',tcBox);document.addEventListener('webkitfullscreenchange',tcBox);window.addEventListener('resize',()=>{if(document.fullscreenElement)tcBox()});
document.querySelectorAll('.tc .qc').forEach(b=>b.addEventListener('click',()=>go(+b.dataset.go)));
// appendix: overview topics, references on the main slides and the back button all jump straight to a backup slide
document.querySelectorAll('.tc .axi[data-go],.tc [data-ax]').forEach(b=>b.addEventListener('click',()=>{go(+(b.dataset.go||b.dataset.ax));b.blur&&b.blur()}));
document.querySelectorAll('.tc .axback').forEach(b=>b.addEventListener('click',()=>{go(13);b.blur()}));
const h=location.hash.match(/^#p(\d{1,2})$/);go(h&&document.getElementById('p'+h[1])?+h[1]:window.tcPage);if(window.tcPage===11)r11(4);
tcZoom();window.addEventListener('resize',()=>tcZoom());{const t=document.querySelector('.tc');if(t)new ResizeObserver(()=>tcZoom()).observe(t)}setTimeout(tcZoom,400);

const usd=v=>'$'+(v>=1e4?Intl.NumberFormat('en',{notation:'compact',maximumFractionDigits:1}).format(v):d3.format(',.0f')(v));
const usd0=v=>'$'+Intl.NumberFormat('en',{notation:'compact',maximumFractionDigits:0}).format(v);
const kv=(f,fmt)=>el=>{const k=dash.data('kpis');el.textContent=k.status==='ok'?fmt(+k.data[0][f]):'—'};
dash.draw('k_churn',kv('churn_rate',d3.format('.1%')));
dash.draw('k_cust',kv('customers',d3.format(',')));
dash.draw('k_lost0',kv('lost_monthly_revenue',usd0));
dash.draw('k_lost1',kv('lost_monthly_revenue',usd0));
dash.draw('k_rar2',kv('revenue_at_risk_12m',usd));
dash.draw('k_rar3',kv('revenue_at_risk_12m',usd));
dash.draw('k_rar4',kv('revenue_at_risk_12m',usd));
dash.draw('crowd',el=>{el.replaceChildren();const c=dash.data('customers');if(c.status!=='ok'){el.textContent='—';return}
  const cur=c.data.filter(r=>r.churned==='No'),N=100,C=10,cs=40,NS='http://www.w3.org/2000/svg',col=d3.interpolateRgb('#4A5B76','#D9732E');
  const svg=document.createElementNS(NS,'svg');svg.setAttribute('viewBox',`0 0 ${C*cs} ${Math.ceil(N/C)*cs}`);svg.setAttribute('aria-label','Customer base: 100 figures, colored by churn risk');
  for(let i=0;i<N;i++){const r=cur[Math.floor(i*cur.length/N)],s=Math.min(1,+r.churn_score/.7),x=(i%C)*cs+4,y=Math.floor(i/C)*cs+3;
    const g=document.createElementNS(NS,'g');g.setAttribute('class','ppl');g.style.setProperty('--d',((i%C)+Math.floor(i/C))*28+'ms');g.style.setProperty('--c',col(s));
    g.innerHTML=`<g transform="translate(${x},${y}) scale(1.35)"><circle cx="12" cy="7.5" r="4.5"/><path d="M3 22c0-5 4-8 9-8s9 3 9 8z"/></g>`;svg.appendChild(g)}
  el.appendChild(svg)});
var cnt18=()=>{const el=document.querySelector('.tc #p18 .brn'),k=dash.data('kpis');if(!el||k.status!=='ok')return;const v=+k.data[0].revenue_at_risk_12m,t0=performance.now(),D=1200;
  const f=now=>{const q=Math.min(1,(now-t0)/D),e=1-Math.pow(1-q,3);el.textContent=usd(v*e);if(q<1&&window.tcPage===18)requestAnimationFrame(f);else el.textContent=usd(v)};requestAnimationFrame(f)};
var s2=n=>{window.tc2=n;const p=document.getElementById('p2');if(p)p.classList.toggle('r1',n>=1)};
var run18=()=>{const p=document.getElementById('p18');if(!p)return;(window.tc18t||[]).forEach(clearTimeout);window.tc18t=[];p.classList.remove('go1','go2','go3','go4');try{dash.draw('crowd')}catch(e){}
  const red=matchMedia('(prefers-reduced-motion: reduce)').matches,T=(f,ms)=>window.tc18t.push(setTimeout(f,red?0:ms));
  window.tc18=0;T(()=>p.classList.add('go1'),80)};
// stake slide steps: 0 people, 1 formula in the middle (click), 2 revenue at risk on the right, then the donut (click)
var s18=n=>{const p=document.getElementById('p18');if(!p)return;const pv=window.tc18??0;window.tc18=n;(window.tc18t||[]).forEach(clearTimeout);window.tc18t=[];
  const red=matchMedia('(prefers-reduced-motion: reduce)').matches;p.classList.add('go1');p.classList.toggle('go2',n>=1);p.classList.toggle('go3',n>=2);
  if(n>=2&&pv<2){p.classList.remove('go4');if(!red)cnt18();window.tc18t.push(setTimeout(()=>p.classList.add('go4'),red?0:1300))}else p.classList.toggle('go4',n>=2)};
if(window.tcPage===18)run18();
const ax=s=>s.attr('font-size',null).attr('font-family',null);

window.tcG=window.tcG||1;
const GA={fib_new:['Month-to-month','Fiber','≤ 15 months'],fib_old:['Month-to-month','Fiber','> 15 months'],nofib_new:['Month-to-month','DSL / none','≤ 5 months'],nofib_old:['Month-to-month','DSL / none','> 5 months'],long:['1–2 yr contract','any','any']};
const META={fib_new:['New fiber customers','Month-to-month · Fiber · ≤15 months'],fib_old:['Established fiber customers','Month-to-month · Fiber · >15 months'],nofib_new:['New DSL / basic customers','Month-to-month · DSL/no internet · ≤5 months'],nofib_old:['Established DSL / basic customers','Month-to-month · DSL/no internet · >5 months'],long:['Long-Term Contract Customers','1- or 2-year contract']};
const gRows=(t,s)=>t.data.filter(r=>META[r.node]).map(r=>{const sr=s.data.find(q=>q.segment===META[r.node][1]);return{...r,v:+r.churn_rate,c:sr?+sr.customers:0,m:sr?+sr.avg_monthly_charges:0}});
const gCell=(w,c,big,small)=>{const d=document.createElement('div');d.className='gc';const bar=document.createElement('div');bar.className='gb';const f=document.createElement('i');f.style.width=w+'%';f.style.background=c;bar.appendChild(f);
  const p=document.createElement('div');p.className='gp';p.textContent=big;const x=document.createElement('span');x.className='gx';x.textContent=small;p.appendChild(x);d.append(bar,p);return d};
const gDesc=r=>{const tx=document.createElement('div'),a=document.createElement('div'),b=document.createElement('div');a.className='gt';a.textContent=META[r.node][0];b.className='gs ga';(GA[r.node]||[]).forEach(v=>{const sp=document.createElement('span');sp.textContent=v;if(v==='any')sp.className='nx';b.appendChild(sp)});tx.append(a,b);return tx};
const gHead=(labels,flags)=>{const head=document.createElement('div');head.className='gr gh g2';
  {const d=document.createElement('div');d.className='gs ga gah';['Contract','Internet','Tenure'].forEach(v=>{const sp=document.createElement('span');sp.textContent=v;d.appendChild(sp)});head.appendChild(d)}
  labels.forEach((tx,k)=>{const d=document.createElement('div');d.innerHTML=/bill/i.test(tx)?IRV:ICU;const pts=tx.split('|'),t=document.createElement('span');t.textContent=pts[0];d.appendChild(t);if(pts[1]){const sb=document.createElement('span');sb.className='ghsub';sb.textContent=pts[1];d.appendChild(sb)}if(flags[k])d.className=flags[k];head.appendChild(d)});return head};
var ICU='<svg class="ico cu" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="7.5" r="4.5"/><path d="M3 22c0-5 4-8 9-8s9 3 9 8z"/></svg>',IRV='<svg class="ico rv" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M15.5 8.6c-.6-1-1.9-1.6-3.4-1.6-2 0-3.4 1-3.4 2.5 0 3.4 7 1.6 7 5 0 1.5-1.5 2.5-3.6 2.5-1.6 0-3-.7-3.6-1.8M12 5v14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>';
const gCol=v=>v>=0.5?'#D9732E':v>=0.3?'#E8A57A':'#9AA0A8';
dash.draw('groups',el=>{
  el.replaceChildren();el.classList.toggle('g3s',window.tcG>=3);const t=dash.data('tree'),s=dash.data('segments');if(t.status!=='ok'||s.status!=='ok'){el.textContent='—';return}
  const all=t.data.find(r=>r.node==='all'),avg=all?+all.churn_rate:null,two=window.tcG>=2;
  const gp=window.tcGprev||1,a2=two&&gp<2;window.tcGprev=window.tcG;
  const byId=Object.fromEntries(gRows(t,s).map(r=>[r.node,r])),order=['fib_new','fib_old','nofib_new','nofib_old','long'].filter(k=>byId[k]),rows=order.map(k=>byId[k]),tot=d3.sum(rows,q=>q.c);
  el.appendChild(gHead([`Share who left|Base: all ${all?d3.format(',')(+all.customers):'7,043'} customers`,`Customers still with us|Base: only the ${d3.format(',')(tot)} still with us`],['',two?(a2?'s2 on anim':'s2 on'):'s2']));
  const mk=r=>{const col=gCol(r.v),row=document.createElement('div');row.className='gr g2';row.appendChild(gDesc(r));
    row.appendChild(gCell(r.v*100,col,d3.format('.0%')(r.v),avg?`${d3.format('.1f')(r.v/avg)}× average`:''));
    const c2=gCell(r.c/tot*100,'#3FC1E8',d3.format(',')(r.c),`${d3.format('.0%')(r.c/tot)} of ${d3.format(',')(tot)}`);const cum=d3.sum(rows.slice(0,rows.indexOf(r)),q=>q.c);c2.querySelector('i').style.left=(cum/tot*100)+'%';c2.querySelector('i').style.borderRadius='0';
    c2.classList.add('s2');if(two)c2.classList.add('on');if(a2)c2.classList.add('anim');row.appendChild(c2);
    row.dataset.seg=META[r.node][1];row.dataset.col=col;return row};
  const blk=document.createElement('div');blk.className='m2m';const bl=document.createElement('p');bl.className='bl2';bl.textContent='Month-to-month contract';blk.appendChild(bl);
  [['fib_new','fib_old'],['nofib_new','nofib_old']].forEach(pr=>{const pd=document.createElement('div');pd.className='pair';pr.forEach(k=>{if(byId[k])pd.appendChild(mk(byId[k]))});blk.appendChild(pd)});
  el.appendChild(blk);
  if(byId.long){const lt=document.createElement('div');lt.className='ltc';lt.appendChild(mk(byId.long));el.appendChild(lt)}
});
dash.draw('groups_orig',el=>{
  el.replaceChildren();const t=dash.data('tree'),s=dash.data('segments');if(t.status!=='ok'||s.status!=='ok'){el.textContent='—';return}
  const all=t.data.find(r=>r.node==='all'),avg=all?+all.churn_rate:null;
  const OK=['fib_new','fib_old','nofib_new','nofib_old','long'],rows=gRows(t,s).sort((a,b)=>OK.indexOf(a.node)-OK.indexOf(b.node)),tot=d3.sum(rows,q=>q.c),mm=d3.max(rows,r=>r.m)||1;
  el.appendChild(gHead([`Share who left|Base: all ${all?d3.format(',')(+all.customers):'7,043'} customers`,`Customers still with us|Base: only the ${d3.format(',')(tot)} still with us`,'Average monthly bill|Base: customers still with us'],['','','']));
  rows.forEach(r=>{const col=gCol(r.v),row=document.createElement('div');row.className='gr g2';row.appendChild(gDesc(r));
    row.appendChild(gCell(r.v*100,col,d3.format('.0%')(r.v),avg?`${d3.format('.1f')(r.v/avg)}× average`:''));
    const c2=gCell(r.c/tot*100,'#3FC1E8',d3.format(',')(r.c),`${d3.format('.0%')(r.c/tot)} of ${d3.format(',')(tot)}`);const cum=d3.sum(rows.slice(0,rows.indexOf(r)),q=>q.c);c2.querySelector('i').style.left=(cum/tot*100)+'%';c2.querySelector('i').style.borderRadius='0';row.appendChild(c2);
    const c3=gCell(r.m/mm*100,'#5E6673','$'+d3.format('.0f')(r.m),'per month');c3.classList.add('bill');row.appendChild(c3);
    el.appendChild(row)});
});
dash.draw('rartab',tb=>{
  tb.replaceChildren();const s=dash.data('segments');if(s.status!=='ok')return;
  const nm={'1- or 2-year contract':['Long-Term Contract Customers','1- or 2-year contract'],'Month-to-month · DSL/no internet · >5 months':['Established DSL / basic customers','month-to-month, > 5 months'],'Month-to-month · DSL/no internet · ≤5 months':['New DSL / basic customers','month-to-month, ≤ 5 months'],'Month-to-month · Fiber · >15 months':['Established fiber customers','month-to-month, > 15 months'],'Month-to-month · Fiber · ≤15 months':['New fiber customers','month-to-month, ≤ 15 months']};
  const td=(v,cls)=>{const e=document.createElement('td');if(cls)e.className=cls;if(v instanceof Node)e.appendChild(v);else e.textContent=v;return e};
  const SO=[NF,'Month-to-month · Fiber · >15 months','Month-to-month · DSL/no internet · ≤5 months','Month-to-month · DSL/no internet · >5 months','1- or 2-year contract'];
  [...s.data].sort((a,b)=>SO.indexOf(a.segment)-SO.indexOf(b.segment)).forEach(r=>{const tr=document.createElement('tr'),n=nm[r.segment]||[r.segment,''],g=document.createElement('span');g.textContent=n[0];const sub=document.createElement('span');sub.className='gsub';sub.textContent=n[1];g.appendChild(sub);
    tr.append(td(g),td(d3.format(',')(+r.customers),'n'),td(d3.format('.1%')(+r.avg_churn_score),'n'),td('$'+d3.format(',.2f')(+r.avg_monthly_charges),'n'),td('$'+d3.format(',.0f')(+r.revenue_at_risk_12m),'n'));tb.appendChild(tr)});
  const tr=document.createElement('tr');tr.className='tot';tr.append(td('Total'),td(d3.format(',')(d3.sum(s.data,r=>+r.customers)),'n'),td('','n'),td('','n'),td('$'+d3.format(',.0f')(d3.sum(s.data,r=>+r.revenue_at_risk_12m)),'n'));tb.appendChild(tr);
});
dash.draw('tree',el=>{
  const t=dash.data('tree'),s=dash.data('segments');el.replaceChildren();if(t.status!=='ok'||s.status!=='ok'){el.textContent='—';return}
  const segOf={long:'1- or 2-year contract',fib_new:'Month-to-month · Fiber · ≤15 months',fib_old:'Month-to-month · Fiber · >15 months',nofib_new:'Month-to-month · DSL/no internet · ≤5 months',nofib_old:'Month-to-month · DSL/no internet · >5 months'};
  const rank=s.data.map(r=>({seg:r.segment,z:+r.revenue_at_risk_12m})).sort((a,b)=>b.z-a.z).map(r=>r.seg);
  const data=t.data.map(r=>({...r,parent:r.parent||null,customers:+r.customers,churn_rate:+r.churn_rate}));
  const root=d3.stratify().id(d=>d.node).parentId(d=>d.parent)(data);
  const W=el.clientWidth||600,cols=['fib_new','fib_old','nofib_new','nofib_old','long'],cw=(W-12)/5,bw=Math.min(170,cw-14),bh=48,gap=32,H=4*(bh+gap)+28;
  const depth={all:0,m2m:1,long:3,fib:2,nofib:2,fib_new:3,fib_old:3,nofib_new:3,nofib_old:3};
  root.eachAfter(d=>{d.y=depth[d.data.node]*(bh+gap);const c=cols.indexOf(d.data.node);d.x=c>=0?c*cw+cw/2-bw/2-6:d3.mean(d.children,k=>k.x)});
  const svg=d3.select(el).append('svg').attr('width','100%').attr('viewBox',`0 0 ${W} ${H}`);
  const g=svg.append('g').attr('transform',`translate(${bw/2+6},6)`);
  const ramp=v=>v>=0.5?'#D9732E':v>=0.3?'#E8A57A':'#C8CCD2';
  const q={all:'Month-to-month contract?',m2m:'Fiber optic internet?',fib:'Customer ≤ 15 months?',nofib:'Customer ≤ 5 months?'};
  g.selectAll('path').data(root.links()).join('path').attr('fill','none').attr('stroke','var(--cds-chart-axis)')
    .attr('d',d=>`M${d.source.x},${d.source.y+bh}V${d.source.y+bh+gap/2+7}H${d.target.x}V${d.target.y}`);
  g.selectAll('text.ans').data(root.links()).join('text').attr('class','ans').attr('x',d=>d.target.x+(d.target.x<d.source.x?-6:6)).attr('y',d=>d.target.y-8)
    .attr('text-anchor',d=>d.target.x<d.source.x?'end':'start').attr('font-size','var(--cds-font-size-caption)').attr('fill','var(--color-fg-muted)')
    .text(d=>d.target.data.node==='long'?'no':['m2m','fib','fib_new','nofib_new'].includes(d.target.data.node)?'yes':'no');
  const n=g.selectAll('g.n').data(root.descendants()).join('g').attr('transform',d=>`translate(${d.x-bw/2},${d.y})`);
  n.append('rect').attr('width',bw).attr('height',bh).attr('rx',8).attr('fill',d=>ramp(d.data.churn_rate)).attr('fill-opacity',d=>d.children?.18:.35).attr('stroke',d=>ramp(d.data.churn_rate)).attr('stroke-width',d=>d.children?1:2);
  n.append('text').attr('x',bw/2).attr('y',20).attr('text-anchor','middle').attr('font-size','var(--cds-font-size-caption)').attr('fill','var(--color-fg)').attr('font-weight',700).text(d=>d3.format('.0%')(d.data.churn_rate)+' left');
  n.append('text').attr('x',bw/2).attr('y',38).attr('text-anchor','middle').attr('font-size','var(--cds-font-size-caption)').attr('fill','var(--color-fg-muted)').text(d=>`${d3.format(',')(d.data.customers)} customers`);
  n.filter(d=>q[d.data.node]).append('text').attr('x',bw/2).attr('y',bh+15).attr('text-anchor','middle').attr('font-size','var(--cds-font-size-caption)').attr('font-weight',600).attr('fill','var(--color-fg)').text(d=>q[d.data.node]);
  const nm={fib_new:'New fiber customers',fib_old:'Established fiber customers',nofib_new:'New DSL / basic customers',nofib_old:'Established DSL / basic customers',long:'Long-Term Contract Customers'};
  n.filter(d=>!d.children).append('text').attr('x',bw/2).attr('y',bh+20).attr('text-anchor','middle').attr('font-size','var(--cds-font-size-caption)').attr('font-weight',700).attr('fill','var(--color-fg)').text(d=>nm[d.data.node]);
  n.filter(d=>!d.children).each(function(d){const i=rank.indexOf(segOf[d.data.node]);if(i<0)return;const gg=d3.select(this);
    gg.append('circle').attr('cx',bw-2).attr('cy',2).attr('r',12).attr('fill',i<2?'#D9732E':'#8A919C');
    gg.append('text').attr('x',bw-2).attr('y',2).attr('dy','0.35em').attr('text-anchor','middle').attr('font-size','var(--cds-font-size-caption)').attr('font-weight',700).attr('fill','#FFFFFF').text(i+1)});
});
// inner height of the card around a chart (the card itself is sized by the slide layout, not by the chart)
var cardH=(el,reserve,min)=>{const c=el.closest('.card');if(!c)return min;const cs=getComputedStyle(c);const h=c.clientHeight-(parseFloat(cs.paddingTop)||0)-(parseFloat(cs.paddingBottom)||0);return h>0?Math.max(min,Math.round(h-reserve)):min};
var fillH=(el,reserve,min)=>{const pg=el.closest('.page'),box=el.closest('.pages');if(!pg||!box||!el.clientWidth)return min;
  const s=+pg.dataset.s||1,r=el.getBoundingClientRect(),pr=pg.getBoundingClientRect(),br=box.getBoundingClientRect(),q=(r.width/el.clientWidth)/s;if(!q||!br.height)return min;
  const avail=(br.bottom-pr.top)-(r.top-pr.top)/s;return Math.round(Math.max(min,Math.min(1200,avail/q-reserve)))};
const tipIn=el=>{let t=el.querySelector('.tip');if(!t){t=document.createElement('div');t.className='tip';t.hidden=true;el.appendChild(t)}return t};
// the where-to-act chart can be drawn while the slide is still settling (e.g. during the morph);
// re-check its size once layout is stable and on resize, and redraw if it was drawn at the wrong size
var segChk=el=>{const run=()=>{if(!el.isConnected||!el.clientWidth||window.tcPage!==5)return;const ago=performance.now()-(el._anim||0);if(ago<1900){setTimeout(run,1950-ago);return}/* never redraw while a step animates */const W2=el.clientWidth,H2=cardH(el,10,260);
    if((Math.abs(W2-(el._dw||0))>4||Math.abs(H2-(el._dh||0))>40)&&(el._rc=(el._rc||0)+1)<=4){try{dash.draw('segbars')}catch(e){}}};
  clearTimeout(el._ct);el._ct=setTimeout(()=>{el._rc=0;},3000);[120,500,1200].forEach(ms=>setTimeout(run,ms));
  if(!el._ro&&window.ResizeObserver){el._ro=new ResizeObserver(()=>{clearTimeout(el._rt);el._rt=setTimeout(()=>{el._rc=0;run()},150)});el._ro.observe(el)}};
var drawSeg=(el,Hfix)=>{
  const s=dash.data('segments'),on5=!!el.closest('#p5'),st=on5?(window.tc5??4):4,ost=el.dataset.st==null?st:+el.dataset.st;el.dataset.st=String(st);
  const old={};el.querySelectorAll('[data-k]').forEach(e=>{old[e.dataset.k]={cx:e.getAttribute('cx'),cy:e.getAttribute('cy'),r:e.getAttribute('r'),x:e.getAttribute('x'),y:e.getAttribute('y'),fill:e.getAttribute('fill')}});
  el.replaceChildren();if(s.status!=='ok'){el.textContent='—';return}
  const rows=s.data.map(r=>({...r,x:+r.avg_churn_score,y:+r.avg_monthly_charges,z:+r.revenue_at_risk_12m,a:+r.actual_churn_rate,n:+r.customers})).sort((a,b)=>b.z-a.z);
  const W=el.clientWidth||600,H=Hfix||cardH(el,10,260),m={t:34,r:24,b:62,l:64};
  if(on5&&!Hfix){if(ost!==st)el._anim=performance.now();el._dw=W;el._dh=H;segChk(el)}
  const svg=d3.select(el).append('svg').attr('width','100%').attr('viewBox',`0 0 ${W} ${H}`);
  const x=d3.scaleLinear([0,d3.max(rows,d=>d.x)*1.1],[m.l,W-m.r]),y=d3.scaleLinear([0,d3.max(rows,d=>d.y)*1.25],[H-m.b,m.t]);
  const r=d3.scaleSqrt([0,d3.max(rows,d=>d.n)],[3,Math.min(46,W/15)]);
  const xm=d3.mean(rows,d=>d.x),ym=d3.mean(rows,d=>d.y),top=rows.filter(d=>d.x>xm&&d.y>ym);
  const vis=(a,b)=>k=>(k>=a&&k<=b)?1:0;
  const G=(a,b=9)=>svg.append('g').attr('data-s0',a).attr('data-s1',b).attr('opacity',vis(a,b)(st));
  const g4=G(4);
  g4.append('rect').attr('x',x(xm)).attr('y',m.t).attr('width',W-m.r-x(xm)).attr('height',y(ym)-m.t).attr('fill','#D9732E').attr('opacity',.07);
  const gX=G(1),gY=G(2);
  gX.append('g').attr('transform',`translate(0,${H-m.b})`).call(d3.axisBottom(x).ticks(Math.max(3,W/120)).tickFormat(d3.format('.0%'))).call(ax);
  gY.append('g').attr('transform',`translate(${m.l},0)`).call(d3.axisLeft(y).ticks(5).tickFormat(v=>'$'+v)).call(ax);
  svg.selectAll('.tick text').attr('fill','var(--color-fg-muted)');
  {const aid='arr-'+(el.id||'s')+'-'+Math.random().toString(36).slice(2,7);svg.append('defs').append('marker').attr('id',aid).attr('viewBox','0 0 10 10').attr('refX',8).attr('refY',5).attr('markerWidth',7).attr('markerHeight',7).attr('orient','auto-start-reverse').append('path').attr('d','M0,0 L10,5 L0,10 z').attr('fill','var(--color-fg-muted)');
   gX.append('line').attr('x1',m.l).attr('x2',W-m.r+12).attr('y1',H-m.b).attr('y2',H-m.b).attr('stroke','var(--color-fg-muted)').attr('stroke-width',1.2).attr('marker-end',`url(#${aid})`);
   gY.append('line').attr('x1',m.l).attr('x2',m.l).attr('y1',H-m.b).attr('y2',m.t-14).attr('stroke','var(--color-fg-muted)').attr('stroke-width',1.2).attr('marker-end',`url(#${aid})`)}
  gX.append('text').attr('class','fnote').attr('x',W-m.r).attr('y',H+6).attr('text-anchor','end').style('font-size','10px').attr('fill','var(--color-fg-muted)').attr('opacity',.75).call(t=>{t.append('tspan').attr('x',W-m.r).text('Churn risk: logistic regression (AUC 0.84), averaged per group');t.append('tspan').attr('x',W-m.r).attr('dy','1.3em').text('Dashed lines = average of the 5 groups')});
  gX.append('text').attr('x',W-m.r).attr('y',H-24).attr('text-anchor','end').attr('font-size','var(--cds-font-size-caption)').attr('fill','var(--color-fg-muted)').attr('data-axl','x').text('Average churn risk today');
  gY.append('text').attr('x',m.l+6).attr('y',m.t+4).attr('font-size','var(--cds-font-size-caption)').attr('fill','var(--color-fg-muted)').attr('data-axl','y').text('Average monthly bill');
  g4.append('text').attr('x',W-m.r-8).attr('y',m.t+20).attr('text-anchor','end').attr('font-weight',700).attr('font-size','var(--cds-font-size-caption)').attr('fill','#D9732E').text('Priority groups');
  [[xm,'v'],[ym,'h']].forEach(([v,o])=>g4.append('line').attr('stroke','var(--cds-chart-reference)').attr('stroke-dasharray','4 3')
    .attr('x1',o==='v'?x(v):m.l).attr('x2',o==='v'?x(v):W-m.r).attr('y1',o==='v'?m.t:y(v)).attr('y2',o==='v'?H-m.b:y(v)));
  const ord=[NF,'Month-to-month · Fiber · >15 months','Month-to-month · DSL/no internet · ≤5 months','Month-to-month · DSL/no internet · >5 months','1- or 2-year contract'];
  const sn={[ord[0]]:'New fiber',[ord[1]]:'Est. fiber',[ord[2]]:'New DSL/basic',[ord[3]]:'Est. DSL/basic',[ord[4]]:'Long-Term Contract'};
  const slot=(W-m.l-m.r)/5,rowY=(m.t+H-m.b)/2,oi=d=>Math.max(0,ord.indexOf(d.segment));
  const px=d=>st>=1?x(d.x):m.l+(oi(d)+.5)*slot,py=d=>st>=2?y(d.y):rowY,pr=d=>st>=3?r(d.n):12;
  const pf=d=>'#4A5B76';
  const tip=tipIn(el);
  const showTip=(ev,d)=>{const rch=ev.currentTarget&&ev.currentTarget.dataset?ev.currentTarget.dataset.reach:null;tip.replaceChildren(...[d.segment,`${d3.format(',')(d.n)} current customers · ${d3.format('.0%')(d.a)} already left`,`Avg. $${d.y.toFixed(0)}/month`,`Revenue at risk ${usd(d.z)}`,...(rch?[rch]:[])].map((s,i)=>{const e=document.createElement('div');e.textContent=s;if(!i)e.style.color='var(--cds-text-secondary)';return e}));
    tip.hidden=false;
    // place the box right next to the bubble (right side; left side only if it would leave the slide)
    const zz=vz(el)||1,op=(tip.offsetParent||el).getBoundingClientRect(),cb=ev.currentTarget.getBoundingClientRect(),tb=tip.getBoundingClientRect(),rb=(el.closest('.tc')||el).getBoundingClientRect();
    let sx=cb.right+10;if(sx+tb.width>rb.right-8)sx=cb.left-10-tb.width;let sy=cb.top+cb.height/2-tb.height/2;sy=Math.max(rb.top+8,Math.min(sy,rb.bottom-8-tb.height));
    tip.style.left=((sx-op.left)/zz)+'px';tip.style.top=((sy-op.top)/zz)+'px'};
  svg.append('g').selectAll('circle').data(rows.slice().sort((a,b)=>b.n-a.n)).join('circle').attr('class','bar').attr('data-seg',d=>d.segment).attr('data-k',d=>'c|'+d.segment)
    .attr('cx',px).attr('cy',py).attr('r',pr).attr('fill',pf).attr('fill-opacity',d=>!window.tcSel||d.segment===window.tcSel?.8:.35)
    .attr('stroke',d=>d.segment===window.tcSel?'var(--color-fg)':'var(--color-bg)').attr('stroke-width',d=>d.segment===window.tcSel?3:1)
    .on('mousemove',showTip).on('mouseleave',()=>{tip.hidden=true})
    .on('click',(ev,d)=>{window.tcSel=d.segment;['segbars','action','evid','selgrp'].forEach(n=>dash.draw(n))});
  if(on5){const gI=G(5);let zr=null;try{const cd=dash.data('customers');if(cd.status==='ok'){const cu=cd.data.filter(q=>q.churned==='No').sort((a,b)=>+b.revenue_at_risk_12m-+a.revenue_at_risk_12m).slice(0,ctl().n);zr=d3.rollup(cu,v=>v.length,q=>q.segment)}}catch(e){}
    if(zr)rows.forEach(d=>{const z=zr.get(d.segment)||0;if(z>0)gI.append('circle').attr('class','core5').attr('cx',x(d.x)).attr('cy',y(d.y)).attr('r',Math.min(r(d.n),r(z))).attr('fill','#3FC1E8').attr('fill-opacity',.92).attr('pointer-events','none')})}
  const ly=d=>st>=2&&d.segment===ord[2]?py(d)+5:st>=2&&d.segment===ord[3]?py(d)-12-10:oi(d)%2?py(d)+12+20:py(d)-12-10;
  svg.append('g').selectAll('text').data(on5?rows:[]).join('text').attr('class','lab5').attr('data-k',d=>'n|'+d.segment).attr('data-s0',0).attr('data-s1',2).attr('opacity',vis(0,2)(st))
    .attr('x',px).attr('y',ly).attr('text-anchor','middle').attr('font-size','var(--cds-font-size-caption)').attr('font-weight',600).attr('fill','var(--color-fg)').attr('pointer-events','none').text(d=>sn[d.segment]||d.segment).each(function(d){const w=this.getComputedTextLength?this.getComputedTextLength():0;this.setAttribute('x',Math.min(W-m.r-w/2,Math.max(m.l+w/2+6,px(d)+(st>=2&&d.segment===ord[2]?12+8+w/2:0))))});
  const gL=G(3);
  const fname={'Month-to-month · Fiber · >15 months':'Established fiber customers','Month-to-month · Fiber · ≤15 months':'New fiber customers'};
  rows.slice(0,2).forEach(d=>{if(!fname[d.segment])return;const w=fname[d.segment].split(' '),L=[w.slice(0,-1).join(' '),w[w.length-1]],lx=x(d.x)-r(d.n)-5;// two lines, left of the bubble, centred on it
    const t=gL.append('text').attr('data-mlabel',d.segment).attr('x',lx).attr('y',y(d.y)).attr('text-anchor','end').attr('font-size','12px').attr('font-weight',600).attr('fill','var(--color-fg)').attr('pointer-events','none');
    L.forEach((l,i)=>t.append('tspan').attr('x',lx).attr('dy',i?'1.15em':'-0.22em').text(l))});
  const g4b=G(4);
  g4b.selectAll('text').data(top).join('text').attr('class','num5').attr('x',d=>x(d.x)).attr('y',d=>y(d.y)).attr('dy','0.35em').attr('text-anchor','middle')
    .attr('fill',on5&&st<5?'#FFFFFF':'#050B16').attr('font-weight',700).attr('pointer-events','none').text((d,i)=>i+1);
  if(on5&&ost<5&&st===5&&svg.transition&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
    svg.selectAll('circle.core5').each(function(){const rf=+this.getAttribute('r');d3.select(this).attr('r',0).transition().delay(600).duration(1700).ease(d3.easeCubicInOut).attr('r',rf)});
    svg.selectAll('text.num5').attr('fill','#FFFFFF').transition().delay(1500).duration(500).attr('fill','#050B16')}
  if(on5&&ost!==st&&svg.transition&&!matchMedia('(prefers-reduced-motion: reduce)').matches){const T=950,E=d3.easeCubicInOut;
    svg.selectAll('[data-k]').each(function(){const o=old[this.dataset.k];if(!o)return;const e=d3.select(this),isC=this.tagName.toLowerCase()==='circle';
      const nv=isC?{cx:e.attr('cx'),cy:e.attr('cy'),r:e.attr('r'),fill:e.attr('fill')}:{x:e.attr('x'),y:e.attr('y')};
      Object.keys(nv).forEach(a=>{if(o[a]!=null)e.attr(a,o[a])});const t=e.transition().duration(T).ease(E);Object.keys(nv).forEach(a=>t.attr(a,nv[a]))});
    svg.selectAll('[data-s0]').each(function(){const a=+this.dataset.s0,b=+this.dataset.s1,f=vis(a,b),o0=f(ost),o1=f(st);if(o0===o1)return;
      const e=d3.select(this).attr('opacity',o0);e.transition().delay(o1&&st>=3?T*.6:0).duration(o1?600:350).ease(E).attr('opacity',o1)})}
  const leg=document.createElement('ol');leg.style.cssText='margin:8px 0 16px;padding-left:0;list-style:none;font-size:var(--cds-font-size-caption);display:flex;flex-direction:column;gap:4px';
  (window.tcSel&&window.tcPage===5&&st>=4?rows.filter(d=>d.segment===window.tcSel):[]).forEach(d=>{const i=top.indexOf(d);const li=document.createElement('li'),n=document.createElement('span'),b=document.createElement('b'),sp=document.createElement('span');
    n.textContent=i>=0?i+1:'•';n.style.cssText='display:inline-flex;align-items:center;justify-content:center;width:1.5em;height:1.5em;border-radius:50%;background:#D9732E;color:#FFFFFF;font-weight:700;margin-right:8px';li.appendChild(n);b.textContent=d.segment;sp.style.color='var(--color-fg-muted)';
    sp.textContent=` — ${usd(d.z)} at risk · ${d3.format(',')(d.n)} current customers · ${d3.format('.0%')(d.a)} already left`;li.append(b,sp);leg.appendChild(li)});
  if(on5)el.appendChild(leg);
};
var H5=['We group today\'s customers into five groups by contract, internet and tenure','New fiber customers have the highest churn risk today','Fiber customers also pay the highest monthly bills','Long-Term Contract customers are the biggest group – but with the lowest churn risk',null,'Our top <span style="color:#3FC1E8">1,600</span> (<span style="color:#D9732E">80%</span> of the revenue at risk) include almost every fiber customer'];
var hd5=n=>{}; // one core headline per slide
var s5=(n,na)=>{window.tc5=n;hd5(n);const p=document.getElementById('p5');if(p)for(let k=1;k<=5;k++)p.classList.toggle('st'+k,n>=k);
  if(na)document.querySelectorAll('.tc #p5 [data-draw=segbars]').forEach(e=>{e.dataset.st=String(n)});try{dash.draw('segbars')}catch(e){}};
dash.draw('segbars',el=>drawSeg(el));
const OFF={
  A:{'Month-to-month · Fiber · ≤15 months':[['Welcome email series','set-up tips, Wi-Fi guide, free online speed check']],
    'Month-to-month · Fiber · >15 months':[['Loyalty email','thank-you note and a one-click 1-year contract offer'],['Autopay bonus','one-off credit for switching to automatic payment']],
    'Month-to-month · DSL/no internet · ≤5 months':[['Welcome email series','how to get the most from the service; where to find help']],
    'Month-to-month · DSL/no internet · >5 months':[['Loyalty email','small thank-you benefit and a contract offer']],
    '1- or 2-year contract':[['Renewal reminder','60 days before the contract ends']]},
  T:{'Month-to-month · Fiber · ≤15 months':[['Peace-of-mind bundle','tech support + online security free for 6 months'],['Home set-up visit','a technician fixes Wi-Fi and speed problems on site']],
    'Month-to-month · Fiber · >15 months':[['Peace-of-mind bundle','tech support + online security included when switching to a 1-year contract'],['Price lock','same monthly price guaranteed for 12 months']]}};
const GNAME={'Month-to-month · Fiber · ≤15 months':'New fiber customers','Month-to-month · Fiber · >15 months':'Established fiber customers','Month-to-month · DSL/no internet · ≤5 months':'New DSL / basic customers','Month-to-month · DSL/no internet · >5 months':'Established DSL / basic customers','1- or 2-year contract':'Long-Term Contract Customers'};
dash.draw('selgrp',el=>{{const pg=el.closest('#p14');if(pg)pg.classList.toggle('nosel',!window.tcSel)}el.textContent=window.tcSel?`Selected group: ${GNAME[window.tcSel]||window.tcSel}`:'Click a bubble to see the measures for a group'});
dash.draw('action',ul=>{
  ul.replaceChildren();const s=dash.data('segments');
  const add=(b,t)=>{const li=document.createElement('li'),e=document.createElement('b');e.textContent=b;li.append(e);ul.appendChild(li)};/* short on the slide; descriptions in appendix 1.6 */
  if(s.status!=='ok'||!window.tcSel){const li=document.createElement('li');li.textContent='Click a bubble to see what to do for that segment.';ul.appendChild(li);return}
  const r=s.data.find(x=>x.segment===window.tcSel);if(!r)return;
  const sec=(title,sub,items)=>{const h=document.createElement('li');h.className='ah';
    const top=title.includes('top'),ns='http://www.w3.org/2000/svg',sv=document.createElementNS(ns,'svg');sv.setAttribute('viewBox','0 0 16 16');sv.setAttribute('class','dia');
    const p=document.createElementNS(ns,'path');p.setAttribute('d','M4 2h8l3 4-7 9-7-9z');p.setAttribute('fill',top?'#E3B341':'#B8C2D0');
    const l=document.createElementNS(ns,'path');l.setAttribute('d','M1 6h14M4 2l2 4 2 9 2-9 2-4');l.setAttribute('fill','none');l.setAttribute('stroke','rgba(11,22,40,.45)');l.setAttribute('stroke-width','.8');
    sv.append(p,l);h.appendChild(sv);const b=document.createElement('b');b.textContent=title.replace(' · top','');const sp=document.createElement('span');sp.textContent=' · '+sub;h.append(b,sp);ul.appendChild(h);items.forEach(([x,y])=>add(x,y))};
  let inTop=0,all=0;{const cd=dash.data('customers');if(cd.status==='ok'){const cur=cd.data.filter(x=>x.churned==='No');all=cur.filter(x=>x.segment===r.segment).length;inTop=cur.slice().sort((a,b)=>+b.revenue_at_risk_12m-+a.revenue_at_risk_12m).slice(0,ctl().n).filter(x=>x.segment===r.segment).length}}
  const f=d3.format(','),N=f(ctl().n);
  sec('Base',`${f(inTop)} customers · email`,OFF.A[r.segment]||[]);
  if(r.segment.includes('Fiber')&&(OFF.T[r.segment]||[]).length)sec('Premium · top',`same ${f(inTop)} · personal, $30 each`,OFF.T[r.segment]);
});
dash.draw('evid',el=>{el.replaceChildren();
  const F=[['Month-to-month fiber customers',[['tech support',39,58],['online security',37,58]],[60,'42–46']]],D=[['Month-to-month DSL / basic customers',[['tech support',23,36],['online security',22,36]],null]],C=[['Long-Term Contract Customers with internet',[['tech support',8,12],['online security',6,14]],null]];
  const E={'Month-to-month · Fiber · ≤15 months':F,'Month-to-month · Fiber · >15 months':F,'Month-to-month · DSL/no internet · ≤5 months':D,'Month-to-month · DSL/no internet · >5 months':D,'1- or 2-year contract':C}[window.tcSel];
  el.style.display=E?'':'none';if(!E)return;const [who,adds,pay]=E[0];
  const b=(t,c)=>{const e=document.createElement('b');if(c)e.className=c;e.textContent=t;return e},T=t=>document.createTextNode(t);
  el.append(b('Why these offers? '),T(who+' left less often with '));
  adds.forEach(([n,w,wo],i)=>{el.append(T((i?' or ':'')+n+' ('),b(w+'%','g'),T(' vs '),b(wo+'%','r'),T(i?')':' without)'))});
  if(pay)el.append(T(', and more often when paying by electronic check ('),b(pay[0]+'%','r'),T(' vs '),b(pay[1]+'%','g'),T(' automatic payment)'));
  el.append(T('. Correlations, not proof – the pilot tests them.'))});

const ctl=()=>{const g=(c,d)=>{const e=document.querySelector('.tc '+c);return e?+e.value:d};return{n:Math.min(5174,Math.max(0,g('.in-n',1600))),s:g('.in-s',20)/100,c:g('.in-c',30)}};
const at=(rows,col,n)=>{const i=d3.bisector(d=>d.customers_contacted).left(rows,n);const a=rows[Math.max(0,i-1)],b=rows[Math.min(rows.length-1,i)];if(!a||!b)return 0;if(b.customers_contacted===a.customers_contacted)return b[col];return a[col]+(b[col]-a[col])*(n-a.customers_contacted)/(b.customers_contacted-a.customers_contacted)};
const curveRows=()=>{const c=dash.data('capacity');return c.status==='ok'?c.data.map(r=>({customers_contacted:+r.customers_contacted,share_by_value:+r.share_by_value,share_random:+r.share_random})):null};
const totalRar=()=>{const k=dash.data('kpis');return k.status==='ok'?+k.data[0].revenue_at_risk_12m:null};
dash.draw('curve',el=>{
  const rows=curveRows();el.replaceChildren();if(!rows){el.textContent='—';return}
  // while the slider is dragged, keep the chart's size from the last regular draw so nothing below the pointer moves
  const {n}=ctl(),dr=window.tcDrag&&el._sz,W=dr?el._sz[0]:(el.clientWidth||600),H=dr?el._sz[1]:fillH(el,84,300),m={t:22,r:120,b:56,l:62};if(!dr)el._sz=[W,H];
  requestAnimationFrame(()=>{const sb=el.getBoundingClientRect(),k=sb.width/W;document.querySelectorAll('.tc #p6 .in-n').forEach(inp=>{const lab=inp.parentElement;
    const pg=el.closest('.page'),z=pg&&pg.offsetWidth?pg.getBoundingClientRect().width/pg.offsetWidth:1,thumb=16*z;
    lab.style.paddingLeft='0';const lb2=lab.getBoundingClientRect();lab.style.paddingLeft=Math.max(0,(sb.left+m.l*k-lb2.left-thumb/2)/z)+'px';
    inp.style.marginLeft='0';inp.style.width=(((W-m.l-m.r)*k+thumb)/z)+'px';inp.style.display='block';
    const P=(+inp.value-+inp.min)/(+inp.max-+inp.min)*100;
    inp.style.background=`linear-gradient(90deg,#3FC1E8 0 ${P}%,transparent ${P}% 100%),repeating-linear-gradient(90deg,#5D6F8C 0 3px,transparent 3px 7px)`})});
  const svg=d3.select(el).append('svg').attr('width','100%').attr('viewBox',`0 0 ${W} ${H}`);
  const x=d3.scaleLinear([0,5200],[m.l,W-m.r]),y=d3.scaleLinear([0,1],[H-m.b,m.t]);
  svg.append('g').attr('transform',`translate(0,${H-m.b})`).call(d3.axisBottom(x).ticks(Math.max(3,W/140)).tickFormat(d3.format(','))).call(ax).call(g=>g.selectAll('.tick').filter(d=>d>0&&Math.abs(x(d)-x(n))<60).select('text').classed('c2x',true));
  svg.append('g').attr('transform',`translate(${m.l},0)`).call(d3.axisLeft(y).ticks(4).tickFormat(d3.format('.0%'))).call(ax);
  svg.selectAll('.tick text').attr('fill','var(--color-fg-muted)');
  {const aid='arr-curve-'+Math.random().toString(36).slice(2,7);svg.append('defs').append('marker').attr('id',aid).attr('viewBox','0 0 10 10').attr('refX',8).attr('refY',5).attr('markerWidth',7).attr('markerHeight',7).attr('orient','auto-start-reverse').append('path').attr('d','M0,0 L10,5 L0,10 z').attr('fill','var(--color-fg-muted)');
   svg.append('line').attr('x1',m.l).attr('x2',W-m.r+14).attr('y1',H-m.b).attr('y2',H-m.b).attr('stroke','var(--color-fg-muted)').attr('stroke-width',1.2).attr('marker-end',`url(#${aid})`);
   svg.append('line').attr('x1',m.l).attr('x2',m.l).attr('y1',H-m.b).attr('y2',m.t-14).attr('stroke','var(--color-fg-muted)').attr('stroke-width',1.2).attr('marker-end',`url(#${aid})`)}
  const k='share_by_value',nw=(window.tc6??3)>=2?n:0,pt={customers_contacted:nw,share_by_value:at(rows,k,nw)},lo=[...rows.filter(d=>d.customers_contacted<nw),pt],hi=[pt,...rows.filter(d=>d.customers_contacted>nw)],ln=d3.line(d=>x(d.customers_contacted),d=>y(d[k]));
  // dashed continuation is revealed through a mask so it draws on as one stroke after the white line
  {const mid='cvhm-'+Math.random().toString(36).slice(2,7);svg.append('defs').append('mask').attr('id',mid).attr('maskUnits','userSpaceOnUse').attr('x',0).attr('y',0).attr('width',W).attr('height',H)
     .append('path').datum(hi).attr('class','cv-hm').attr('fill','none').attr('stroke','#fff').attr('stroke-width',10).attr('d',ln);
   svg.append('path').datum(hi).attr('class','cv-hi').attr('fill','none').attr('stroke','#9AA0A8').attr('stroke-width',1.2).attr('stroke-dasharray','3 4').attr('mask',`url(#${mid})`).attr('d',ln)}
  svg.append('path').datum(lo).attr('class','cv-lo').attr('fill','none').attr('stroke','#EAF0F8').attr('stroke-width',3).attr('stroke-linecap','round').attr('stroke-linejoin','round').attr('d',ln);
  svg.append('path').datum(rows).attr('fill','none').attr('stroke','var(--cds-chart-muted)').attr('stroke-width',2).attr('stroke-linecap','round').attr('stroke-linejoin','round').attr('d',d3.line(d=>x(d.customers_contacted),d=>y(d.share_random)));
  const yv=y(at(rows,'share_by_value',n)),yr=y(at(rows,'share_random',n));
  svg.append('line').attr('x1',x(n)).attr('x2',x(n)).attr('y1',m.t).attr('y2',H-m.b).attr('stroke','#3FC1E8').attr('stroke-width',1).attr('stroke-dasharray','2 3');
  svg.append('line').attr('x1',m.l).attr('x2',x(n)).attr('y1',yv).attr('y2',yv).attr('stroke','#D9732E').attr('stroke-width',1).attr('stroke-dasharray','2 3');
  const pill=(cx,cy,txt,fill,anchor)=>{const gp=svg.append('g');const t=gp.append('text').attr('x',cx).attr('y',cy).attr('dy','0.35em').attr('text-anchor',anchor).attr('font-size','var(--cds-font-size-caption)').attr('font-weight',700).attr('fill','#050B16').text(txt);
    const bb=t.node().getBBox();gp.insert('rect','text').attr('x',bb.x-6).attr('y',bb.y-3).attr('width',bb.width+12).attr('height',bb.height+6).attr('rx',4).attr('fill',fill)};
  pill(m.l-6,yv,d3.format('.0%')(at(rows,'share_by_value',n)),'#D9732E','end');
  pill(x(n),H-m.b+16,d3.format(',')(n),'#3FC1E8','middle');
  svg.append('circle').attr('cx',x(n)).attr('cy',yv).attr('r',6).attr('fill','#EAF0F8');
  const ly=[yv,yr];if(ly[1]-ly[0]<16)ly[1]=ly[0]+16;
  // line labels sit along each line, well right of the 1,600 point, so they name the lines and not the dot
  {const xa=n+(5200-n)*.3,xb=n+(5200-n)*.55;
   svg.append('text').attr('x',x(xa)).attr('y',y(at(rows,'share_by_value',xa))+22).attr('text-anchor','middle').attr('dy','0.35em').attr('font-size','var(--cds-font-size-caption)').attr('font-weight',700).attr('fill','var(--color-fg)').text('Ranked contacts');
   svg.append('text').attr('x',x(xb)).attr('y',y(at(rows,'share_random',xb))+24).attr('text-anchor','middle').attr('dy','0.35em').attr('font-size','var(--cds-font-size-caption)').attr('fill','var(--color-fg-muted)').text('Random contacts')}
  svg.append('text').attr('x',m.l+12).attr('y',12).attr('font-size','var(--cds-font-size-caption)').attr('fill','var(--color-fg-muted)').text('Share of revenue at risk reached');
  svg.append('text').attr('x',W-m.r).attr('y',H-6).attr('text-anchor','end').attr('font-size','var(--cds-font-size-caption)').attr('fill','var(--color-fg-muted)').text('Customers contacted, highest revenue at risk first');
  svg.selectAll('path.cv-lo,path.cv-hi').classed('c1',true);
  svg.selectAll('path').filter(function(){return this.getAttribute('stroke')==='var(--cds-chart-muted)'}).classed('c3',true);
  svg.selectAll('line').filter(function(){const s=this.getAttribute('stroke');return s==='#3FC1E8'||s==='#D9732E'}).classed('c2',true);
  svg.selectAll('g').filter(function(){const r=this.querySelector(':scope > rect');return !!r&&(r.getAttribute('fill')==='#D9732E'||r.getAttribute('fill')==='#3FC1E8')}).classed('c2',true);
  svg.selectAll('circle').classed('c2',true);
  svg.selectAll('text').filter(function(){return this.textContent==='Ranked contacts'}).classed('c3',true);
  svg.selectAll('text').filter(function(){return this.textContent==='Random contacts'}).classed('c3',true);
  {const t=totalRar();if(t!=null)svg.append('text').attr('x',m.l+10).attr('y',y(1)).attr('dy','0.35em').attr('font-weight',700).attr('fill','#D9732E').text('= '+usd(t)+' at risk')}
  {const lp=svg.select('path.cv-lo').node();if(lp&&lp.getTotalLength)lp.style.setProperty('--L',String(Math.ceil(lp.getTotalLength())))}
  {const hp=svg.select('path.cv-hm').node();if(hp&&hp.getTotalLength)hp.style.setProperty('--L2',String(Math.ceil(hp.getTotalLength())+2))}
});
dash.draw('h_n',el=>{el.textContent=d3.format(',')(ctl().n)});
dash.draw('h_share',el=>{const r=curveRows();el.textContent=r?d3.format('.0%')(at(r,'share_by_value',ctl().n)):'—'});
dash.draw('h_mult',el=>{const r=curveRows();if(!r){el.textContent='—';return}const n=ctl().n,a=at(r,'share_by_value',n),b=at(r,'share_random',n);el.textContent=b?d3.format('.1f')(a/b):'—'});
dash.draw('o_n',el=>{el.textContent=d3.format(',')(ctl().n)});
dash.draw('mx_n',el=>{el.textContent=d3.format(',')(ctl().n)});
dash.draw('mx_share',el=>{const r=curveRows();el.textContent=r?d3.format('.0%')(at(r,'share_by_value',ctl().n)):'—'});
dash.draw('o_share',el=>{const r=curveRows();el.textContent=r?d3.format('.0%')(at(r,'share_by_value',ctl().n)):'—'});
dash.draw('o_abs',el=>{const r=curveRows(),t=totalRar();el.textContent=r&&t!=null?usd(at(r,'share_by_value',ctl().n)*t):'—'});
// business case: only the fiber customers among our top n get the personal ($30) offer; the base email is not counted
const premV=n=>{const cd=dash.data('customers');if(cd.status!=='ok')return null;if(premV._n===n&&premV._v)return premV._v;
  const top=cd.data.filter(x=>x.churned==='No').sort((a,b)=>+b.revenue_at_risk_12m-+a.revenue_at_risk_12m).slice(0,n).filter(x=>/Fiber/.test(x.segment));
  premV._n=n;premV._v={np:top.length,reach:d3.sum(top,x=>+x.revenue_at_risk_12m)};return premV._v};
const recV=()=>{const t=totalRar(),c=ctl(),pv=premV(c.n);if(t==null||!pv)return null;const reach=pv.reach,cost=pv.np*c.c,saved=reach*c.s;return{n:pv.np,nAll:c.n,share:t?reach/t:0,cost,saved,net:saved-cost,be:reach?cost/reach:null}};
const recD=(name,f)=>dash.draw(name,el=>{const v=recV();el.textContent=v?f(v):'—'});
const sgn=v=>(v>=0?'+':'−')+usd(Math.abs(v));
recD('r_n',v=>d3.format(',')(v.n));recD('r_share',v=>d3.format('.0%')(v.share));
recD('b_one2',v=>v.be?Math.floor(1/v.be):'—');
recD('s_cost',v=>usd(v.cost));recD('s_saved',v=>usd(v.saved));recD('s_net',v=>sgn(v.net));
recD('q3n',v=>d3.format(',')(v.n));recD('q3s',v=>d3.format('.0%')(v.share));recD('q3o',v=>v.be?Math.floor(1/v.be):'—');
recD('c_reach',v=>usd(v.saved/ctl().s));recD('c_share',v=>d3.format('.0%')(v.share));recD('c_s',()=>d3.format('.0%')(ctl().s));recD('c_saved',v=>'+'+usd(v.saved));recD('c_cost',v=>usd(v.cost));recD('c_n',v=>d3.format(',')(v.n));recD('c_nall',v=>d3.format(',')(v.nAll));recD('c_net',v=>sgn(v.net));
const reachV=()=>{const c=ctl(),pv=premV(c.n);if(!pv)return null;return{reach:pv.reach,cost:pv.np*c.c,c}};
document.querySelectorAll('.tc .ctrl input').forEach(i=>i.addEventListener('input',(ev)=>{window.tcDrag=ev.isTrusted;if(i.classList.contains('in-n')&&Math.abs(+i.value-1600)<=100)i.value=1600;/* magnet: easy to stop exactly at 1,600 */['curve','o_n','o_share','o_abs','mix','mx_n','mx_share','h_n','h_share','h_mult','r_n','r_share','b_one2','q3n','q3s','q3o','s_cost','s_saved','s_net','c_reach','c_share','c_saved','c_cost','c_n','c_net','be2','wf','segbars2','action'].forEach(n=>dash.draw(n));window.tcDrag=false}));
dash.draw('segbars2',el=>{el.replaceChildren();const c=dash.data('customers');
  if(c.status!=='ok'){el.textContent='—';return}
  const NS='http://www.w3.org/2000/svg';drawSeg(el,cardH(el,(el.parentElement.querySelector('.l14')||{offsetHeight:0}).offsetHeight+16,260));const svg=el.querySelector('svg');if(!svg)return;
  const n=ctl().n,cur=c.data.filter(r=>r.churned==='No'),tot=d3.rollup(cur,v=>d3.sum(v,r=>+r.revenue_at_risk_12m),r=>r.segment);
  const picked=cur.slice().sort((a,b)=>+b.revenue_at_risk_12m-+a.revenue_at_risk_12m).slice(0,n);
  const zr=d3.rollup(picked,v=>d3.sum(v,r=>+r.revenue_at_risk_12m),r=>r.segment),cnt=d3.rollup(picked,v=>v.length,r=>r.segment);
  const cs=[...svg.querySelectorAll('circle[data-seg]')];if(!cs.length)return;
  const nt=d3.rollup(cur,v=>v.length,r=>r.segment),R=d3.max(cs,q=>+q.getAttribute('r')),Z=d3.max([...nt.values()])||1,rad=z=>3+(R-3)*Math.sqrt(Math.max(0,z)/Z);
  const hl=()=>cs.forEach(q=>{const s=window.tcSel===q.dataset.seg;q.setAttribute('stroke',s?'#EAF0F8':'#050B16');q.setAttribute('stroke-width',s?3:1)});
  cs.forEach(q=>{const seg=q.dataset.seg,cx=+q.getAttribute('cx'),cy=+q.getAttribute('cy'),r=+q.getAttribute('r');
    q.setAttribute('fill','#4A5B76');q.setAttribute('fill-opacity','.55');q.style.cursor='pointer';
    const z=zr.get(seg)||0;q.dataset.reach=`${d3.format(',')(cnt.get(seg)||0)} of ${d3.format(',')(nt.get(seg)||0)} contacted · ${usd(z)} of ${usd(tot.get(seg)||0)} at risk reached`;
    if(z>0){const ri=Math.min(r,rad(cnt.get(seg)||0)),ic=document.createElementNS(NS,'circle');ic.setAttribute('cx',cx);ic.setAttribute('cy',cy);ic.setAttribute('r',ri);ic.setAttribute('fill','#3FC1E8');ic.setAttribute('fill-opacity','.92');ic.setAttribute('pointer-events','none');q.after(ic)}
    q.addEventListener('click',()=>{window.tcSel=seg;hl();['action','evid','selgrp'].forEach(nm=>dash.draw(nm));const a=document.querySelector('.tc #offer');if(a&&a.animate)a.animate([{boxShadow:'0 0 0 3px #3FC1E8',backgroundColor:'rgba(63,193,232,.12)'},{boxShadow:'0 0 0 0 rgba(63,193,232,0)',backgroundColor:'rgba(63,193,232,0)'}],{duration:1100,easing:'ease-out'})})});
  cs.forEach(q=>{const seg=q.dataset.seg,cx=+q.getAttribute('cx'),cy=+q.getAttribute('cy'),rr=+q.getAttribute('r'),pr=!!(OFF.T[seg]&&OFF.T[seg].length),dm=(tx,col)=>{const p=document.createElementNS(NS,'path');
    p.setAttribute('d','M4 2h8l3 4-7 9-7-9z');p.setAttribute('class',col==='#E3B341'?'dmg':'dms');p.setAttribute('transform',`translate(${tx},${cy-rr*.72-9})`);p.setAttribute('fill',col);p.setAttribute('stroke','#050B16');p.setAttribute('stroke-width','1');p.setAttribute('pointer-events','none');svg.appendChild(p)};
    dm(cx+rr*.72-8,'#B8C2D0');if(pr)dm(cx+rr*.72+7,'#E3B341')});
  hl()});
// redraw the waterfall whenever its box changes size (it is drawn to the box's exact size)
{const wfo=()=>{const el=document.querySelector('.tc #p19 .wfc');if(!el||el._ro||!window.ResizeObserver)return;el._ro=new ResizeObserver(()=>{const sv=el.querySelector('svg');if(!sv)return;const vb=(sv.getAttribute('viewBox')||'').split(' ').map(Number);if(Math.abs(vb[2]-el.clientWidth)>4||Math.abs(vb[3]-el.clientHeight)>4){clearTimeout(el._rt);el._rt=setTimeout(()=>{try{dash.draw('wf')}catch(e){}},60)}});el._ro.observe(el)};setTimeout(wfo,0)}
dash.draw('wf',el=>{el.replaceChildren();const v=recV(),c=ctl();if(!v||!c.s){el.textContent='—';return}
  const reach=v.saved/c.s,saved=v.saved,cost=v.cost,net=v.net,W=el.clientWidth||900,H=el.clientHeight||240,m={t:30,b:4};
  const sv=d3.select(el).append('svg').attr('width','100%').attr('height','100%').attr('viewBox',`0 0 ${W} ${H}`);
  const tot=totalRar()||reach,cr=curveRows(),top=cr?at(cr,'share_by_value',c.n)*tot:reach;
  const y=d3.scaleLinear([0,tot],[H-m.b,m.t]),pg=el.closest('.page'),er=el.getBoundingClientRect(),k=W/(er.width||W);
  const cx=(sel,f)=>{const t=pg&&pg.querySelector(sel);if(!t||!er.width)return W*f;const b=t.getBoundingClientRect();return(b.left+b.width/2-er.left)*k};
  const xs=[cx('.t1',.12),cx('.t2',.4),cx('.t3',.65),cx('.t4',.88)],bw=Math.min(96,W*.085);
  sv.append('line').attr('x1',0).attr('x2',W).attr('y1',H-m.b).attr('y2',H-m.b).attr('stroke','var(--cds-chart-axis)').attr('stroke-width',1);
  // value axis: arrow and unit (bars carry their own labels, so no ticks)
  {const ax0=Math.max(4,xs[0]-bw/2-28);sv.append('defs').append('marker').attr('id','wfArr').attr('viewBox','0 0 10 10').attr('refX',8).attr('refY',5).attr('markerWidth',7).attr('markerHeight',7).attr('orient','auto').append('path').attr('d','M0,0 L10,5 L0,10 z').attr('fill','var(--color-fg-muted)');
   sv.append('line').attr('x1',ax0).attr('x2',ax0).attr('y1',H-m.b).attr('y2',m.t-14).attr('stroke','var(--cds-chart-axis)').attr('stroke-width',1).attr('marker-end','url(#wfArr)');
   sv.append('text').attr('transform',`translate(${ax0-8},${(H-m.b+m.t)/2}) rotate(-90)`).attr('text-anchor','middle').attr('font-size','var(--cds-font-size-caption)').attr('fill','var(--color-fg-muted)').text('US$, 12 months')}
  const bar=(x,a,b,fill,cls)=>sv.append('rect').attr('class',cls).attr('x',x-bw/2).attr('y',y(Math.max(a,b))).attr('width',bw).attr('height',Math.max(1,y(Math.min(a,b))-y(Math.max(a,b)))).attr('rx',4).attr('fill',fill);
  const lab=(x,yy,t,cls,col,anc)=>sv.append('text').attr('class',cls).attr('x',x).attr('y',yy).attr('text-anchor',anc||'middle').attr('font-weight',700).attr('fill',col||'var(--color-fg)').text(t);
  const con=(x1,x2,yy,cls)=>sv.append('line').attr('class',cls).attr('x1',x1).attr('x2',x2).attr('y1',y(yy)).attr('y2',y(yy)).attr('stroke','#9AA8BD').attr('stroke-dasharray','3 4');
  // first column: the full revenue at risk (dashed, as on the stake slide), the part our top customers hold, the part we contact personally
  sv.append('rect').attr('class','wf0').attr('x',xs[0]-bw/2).attr('y',y(tot)).attr('width',bw).attr('height',y(0)-y(tot)).attr('rx',4).attr('fill','none').attr('stroke','#D9732E').attr('stroke-width',1.5).attr('stroke-dasharray','5 4');
  sv.append('rect').attr('class','wf0').attr('x',xs[0]-bw/2).attr('y',y(top)).attr('width',bw).attr('height',y(0)-y(top)).attr('rx',4).attr('fill','#D9732E').attr('fill-opacity',.22);
  bar(xs[0],0,reach,'#D9732E','wf1');
  const side=(yy,t,col,w)=>sv.append('text').attr('x',xs[0]+bw/2+10).attr('y',yy).attr('text-anchor','start').attr('dy','0.35em').attr('font-size','var(--cds-font-size-caption)').attr('font-weight',w||400).attr('fill',col).text(t);
  side(y(tot),usd(tot)+' at risk','#D9732E',700);side(y(top),usd(top)+' · top '+d3.format(',')(c.n),'var(--color-fg-muted)');side(y(reach),usd(reach)+' · personal offer','#D9732E',700);
  bar(xs[0],0,saved,'#3BB273','gr s1');lab(xs[0]+bw/2+8,y(saved/2)+5,d3.format('.0%')(c.s)+' kept','s1','#3BB273','start');
  con(xs[0]+bw/2,xs[1]-bw/2,saved,'s1');bar(xs[1],0,saved,'#3BB273','gr s1');lab(xs[1],y(saved)-8,'+'+usd(saved),'s1','#3BB273');
  con(xs[1]+bw/2,xs[2]-bw/2,saved,'s2');bar(xs[2],net,saved,'#FF6B5E','gr top s2');lab(xs[2],y(saved)-8,'−'+usd(cost),'s2','#FF6B5E');
  con(xs[2]+bw/2,xs[3]-bw/2,net,'s3');bar(xs[3],0,net,'#3BB273','gr s3');lab(xs[3],y(net)-8,(net>=0?'+':'−')+usd(Math.abs(net)),'s3','#3BB273');
});
dash.draw('be2',el=>{el.replaceChildren();const v=reachV();if(!v){el.textContent='—';return}
  const {reach,cost,c}=v,W=el.clientWidth||600,H=cardH(el,((el.previousElementSibling||{}).offsetHeight||0)+10,220),m={t:30,r:40,b:40,l:84},net=s=>reach*s-cost,be=cost/reach,smax=.3;
  const svg=d3.select(el).append('svg').attr('width','100%').attr('viewBox',`0 0 ${W} ${H}`);
  svg.append('defs').append('marker').attr('id','tcArr').attr('viewBox','0 0 10 10').attr('refX',8).attr('refY',5).attr('markerWidth',7).attr('markerHeight',7).attr('orient','auto-start-reverse').append('path').attr('d','M0,0 L10,5 L0,10 z').attr('fill','var(--color-fg-muted)');
  const x=d3.scaleLinear([0,smax],[m.l,W-m.r-20]),y=d3.scaleLinear([net(0),net(smax)],[H-m.b,m.t+16]).nice();
  const nd=g=>g.select('.domain').remove();
  svg.append('g').attr('transform',`translate(0,${y(0)})`).call(d3.axisBottom(x).ticks(6).tickFormat(v=>v?d3.format('.0%')(v):'')).call(ax).call(nd);
  svg.append('g').attr('transform',`translate(${m.l},0)`).call(d3.axisLeft(y).ticks(5).tickFormat(v=>(v<0?'−':v>0?'+':'')+usd(Math.abs(v)))).call(ax).call(nd);
  svg.selectAll('.tick text').attr('fill','var(--color-fg-muted)');svg.selectAll('.tick line').attr('stroke','var(--cds-chart-axis)');
  svg.selectAll('.tick text').filter(d=>typeof d==='number'&&d>0&&d<be+.01).style('opacity',0);
  svg.append('line').attr('x1',m.l).attr('x2',W-m.r).attr('y1',y(0)).attr('y2',y(0)).attr('stroke','var(--color-fg-muted)').attr('stroke-width',1.2).attr('marker-end','url(#tcArr)');
  svg.append('line').attr('x1',m.l).attr('x2',m.l).attr('y1',H-m.b).attr('y2',m.t-6).attr('stroke','var(--color-fg-muted)').attr('stroke-width',1.2).attr('marker-end','url(#tcArr)');
  svg.append('line').attr('x1',x(0)).attr('x2',x(be)).attr('y1',y(net(0))).attr('y2',y(0)).attr('stroke','#FF6B5E').attr('stroke-width',3).attr('stroke-linecap','round').attr('class','s5');
  svg.append('line').attr('x1',x(be)).attr('x2',x(smax)).attr('y1',y(0)).attr('y2',y(net(smax))).attr('stroke','#3BB273').attr('stroke-width',3).attr('stroke-linecap','round').attr('class','s5');
  svg.append('text').attr('x',x(be*.45)).attr('y',y(net(be*.45))+22).attr('text-anchor','middle').attr('font-size','var(--cds-font-size-caption)').attr('fill','#FF6B5E').attr('class','s5').text('loss');
  svg.append('text').attr('x',x(smax*.82)).attr('y',y(net(smax*.82))+24).attr('text-anchor','middle').attr('font-size','var(--cds-font-size-caption)').attr('fill','#3BB273').attr('class','s5').text('gain');
  svg.append('circle').attr('cx',x(be)).attr('cy',y(0)).attr('r',7).attr('fill','var(--color-fg)').attr('class','s5');
  svg.append('text').attr('x',x(be)-6).attr('y',y(0)-14).attr('text-anchor','end').attr('font-size','var(--cds-font-size-caption)').attr('font-weight',700).attr('fill','var(--color-fg)').attr('class','s5').attr('dy','-1.2em').text('Break-even');
  svg.append('text').attr('x',x(be)-6).attr('y',y(0)-14).attr('text-anchor','end').attr('font-size','var(--cds-font-size-caption)').attr('font-weight',700).attr('fill','var(--color-fg)').attr('class','s5').text(`keep ${d3.format('.1%')(be)} (1 in ${Math.floor(1/be)})`);
  const s=c.s;svg.append('line').attr('x1',x(s)).attr('x2',x(s)).attr('y1',y(net(s))).attr('y2',y(0)).attr('stroke','#9AA8BD').attr('stroke-dasharray','2 3').attr('class','s1');
  svg.selectAll('.tick text').filter(function(){return this.textContent===d3.format('.0%')(s)}).attr('class','s0h');
  {const gp=svg.append('g').attr('class','s1'),t=gp.append('text').attr('x',x(s)).attr('y',y(0)+16).attr('dy','0.35em').attr('text-anchor','middle').attr('font-size','var(--cds-font-size-caption)').attr('font-weight',700).attr('fill','#050B16').text(d3.format('.0%')(s));
   const bb=t.node().getBBox();gp.insert('rect','text').attr('x',bb.x-6).attr('y',bb.y-3).attr('width',bb.width+12).attr('height',bb.height+6).attr('rx',4).attr('fill','#9AA8BD')}
  svg.append('circle').attr('cx',x(s)).attr('cy',y(net(s))).attr('r',7).attr('fill','#9AA8BD').attr('class','s1');
  svg.append('circle').attr('cx',x(s)).attr('cy',y(net(s))).attr('r',7).attr('fill','#EAF0F8').attr('class','s4');
  svg.append('line').attr('x1',m.l).attr('x2',x(s)).attr('y1',y(net(s))).attr('y2',y(net(s))).attr('stroke','#3BB273').attr('stroke-dasharray','2 3').attr('class','s4');
  svg.append('text').attr('x',x(s)-10).attr('y',y(net(s))-14).attr('text-anchor','end').attr('font-size','var(--cds-font-size-caption)').attr('font-weight',700).attr('fill','#C9D3E2').attr('class','s1').text('At our assumed 20% (1 in 5)');
  {const gp=svg.append('g').attr('class','s4'),t=gp.append('text').attr('x',m.l-6).attr('y',y(net(s))).attr('dy','0.35em').attr('text-anchor','end').attr('font-size','var(--cds-font-size-caption)').attr('font-weight',700).attr('fill','#050B16').text('+'+usd(net(s)));
   const bb=t.node().getBBox();gp.insert('rect','text').attr('x',bb.x-6).attr('y',bb.y-3).attr('width',bb.width+12).attr('height',bb.height+6).attr('rx',4).attr('fill','#3BB273');
   svg.selectAll('.tick').filter(function(){const tr=this.getAttribute('transform')||'';const m2=tr.match(/,([\d.]+)\)/);return m2&&Math.abs(+m2[1]-y(net(s)))<26&&this.parentNode.getAttribute('transform')===`translate(${m.l},0)`}).style('opacity',0)}
  svg.append('text').attr('x',m.l+10).attr('y',m.t+4).attr('font-size','var(--cds-font-size-caption)').attr('fill','var(--color-fg-muted)').text('Net gain, 12 months');
  svg.append('text').attr('x',W-m.r).attr('y',y(0)+38).attr('text-anchor','end').attr('font-size','var(--cds-font-size-caption)').attr('fill','var(--color-fg-muted)').text('Share of would-be leavers we keep');
});
dash.draw('mix',el=>{
  el.replaceChildren();const c=dash.data('customers'),s=dash.data('segments');if(c.status!=='ok'||s.status!=='ok'){el.textContent='—';return}
  const order=s.data.map(r=>({seg:r.segment,z:+r.revenue_at_risk_12m})).sort((a,b)=>b.z-a.z).map(r=>r.seg);
  const n=ctl().n,picked=c.data.filter(r=>r.churned==='No').sort((a,b)=>+b.revenue_at_risk_12m-+a.revenue_at_risk_12m).slice(0,n);
  const cnt=d3.rollup(picked,v=>v.length,r=>r.segment),rows=order.map((seg,i)=>({seg,key:seg,i,v:cnt.get(seg)||0}));
  const W=el.clientWidth||600,avail=el.clientHeight||0,rh=Math.max(24,Math.min(48,(avail-14)/(rows.length+1))),H=(rows.length+1)*rh+10,lw=Math.min(205,W*.5);
  const fn={'Month-to-month · Fiber · >15 months':'Est. fiber','Month-to-month · Fiber · ≤15 months':'New fiber','1- or 2-year contract':'Long-Term Contract','Month-to-month · DSL/no internet · >5 months':'Est. DSL/basic','Month-to-month · DSL/no internet · ≤5 months':'New DSL/basic'};
  rows.forEach(r=>{r.seg=fn[r.seg]||r.seg});
  const svg=d3.select(el).append('svg').attr('width','100%').attr('viewBox',`0 0 ${W} ${H}`);
  const x=d3.scaleLinear([0,Math.max(1,d3.max(rows,r=>r.v))],[0,Math.max(20,W-lw-80)]);
  rows.forEach(r=>{const y=r.i*rh;
    svg.append('circle').attr('cx',11).attr('cy',y+rh/2).attr('r',8).attr('fill',r.i<2?'#D9732E':'var(--cds-chart-muted)').attr('data-seg',r.key);
    svg.append('text').attr('x',11).attr('y',y+rh/2).attr('dy','0.35em').attr('text-anchor','middle').attr('font-size','var(--cds-font-size-caption)').attr('font-weight',700).attr('fill','#FFFFFF').text(r.i+1);
    svg.append('text').attr('x',28).attr('y',y+rh/2).attr('dy','0.35em').attr('font-size','var(--cds-font-size-caption)').attr('fill','var(--color-fg)').text(r.seg);
    svg.append('rect').attr('x',lw).attr('y',y+rh/2-6).attr('height',12).attr('width',Math.max(1,x(r.v))).attr('rx',3).attr('fill','#3FC1E8').attr('opacity',r.i<2?1:.45);
    svg.append('text').attr('x',lw+x(r.v)+8).attr('y',y+rh/2).attr('dy','0.35em').attr('font-size','var(--cds-font-size-caption)').attr('font-weight',700).attr('fill','var(--color-fg)')
      .text(`${d3.format(',')(r.v)} (${d3.format('.0%')(r.v/Math.max(1,picked.length))})`)});
  const ty=rows.length*rh+4;
  svg.append('line').attr('x1',0).attr('x2',W-10).attr('y1',ty).attr('y2',ty).attr('stroke','var(--color-fg)').attr('stroke-width',1);
  svg.append('text').attr('x',28).attr('y',ty+rh/2+2).attr('dy','0.35em').attr('font-size','var(--cds-font-size-caption)').attr('font-weight',700).attr('fill','var(--color-fg)').text('Total');
  svg.append('text').attr('x',lw).attr('y',ty+rh/2+2).attr('dy','0.35em').attr('font-size','var(--cds-font-size-caption)').attr('font-weight',700).attr('fill','#3FC1E8').text(`${d3.format(',')(picked.length)} (100%)`);
});
