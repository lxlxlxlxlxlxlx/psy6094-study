// Active course material and independent examinations share the same question lookup.
function makeCatalog(original) {
  const corrections = {
    '5-mc-2':'共有低活化为左额中回和左颞上回。共有高活化在右舌回和右直回。',
    '5-mc-8':'按课件，此处负荷增加时 Theta 增强、Alpha 受抑。Theta 与 Alpha 是频段，P300 是事件相关电位成分。',
    '8-mc-3':'被动 BCI 在自然任务中读取状态并调整支持。运动想象和选择字母是有意控制，tDCS 属于神经调控。',
    '8-mc-6':'课件将作用指向静息膜电位和兴奋性。记录脑电、观察血氧和解码控制指令属于其他技术。'
  };
  const legacy=original.filter(q=>q.kind==='mc').map(q=>({...q,a:corrections[q.id]||q.a,id:'legacy-'+q.id}));
  const practice=original.map(q=>q.kind==='mc'?{...q,opts:practiceChoices[q.id],a:corrections[q.id]||q.a}:q);
  const exams=[];
  for(const [topic,prompt,answer] of recallAdditions){
    const k=knowledgeById[topic];
    practice.push({id:'recall-'+topic,lesson:k.lesson,kind:'flash',q:prompt,a:answer,p:k.page,source:k.source});
  }
  for(const [topic,prompt,correct,wrong1,wrong2,wrong3,explanation,relatedTopic] of examItems){
    const k=knowledgeById[topic],n=exams.filter(q=>q.lesson===k.lesson).length+1;
    const ans=n%4, opts=[wrong1,wrong2,wrong3];opts.splice(ans,0,correct);
    exams.push({id:k.lesson+'-exam-'+n,lesson:k.lesson,kind:'mc',q:prompt,opts,ans,a:explanation,p:k.page,source:k.source,relatedPage:relatedTopic&&knowledgeById[relatedTopic].page});
  }
  return {practice,exams,legacy};
}
const DAY=86400000, reviewDays=[0,1,2,4,7,15];
function canonical(id){return id.replace(/^legacy-/,'')}
function reviewable(){return [...bank,...examBank.filter(q=>state.records[q.id])]}
function due(q,now=Date.now()){
  const r=record(q.id);return !!r.status && (r.dueAt??0)<=now;
}
function nextRecallAfter(last){
  const tomorrow=new Date(last);
  tomorrow.setHours(24,0,0,0);
  return Math.max(tomorrow.getTime(),last+DAY/2);
}
function recordAnswer(id,result,again=false,now=Date.now()){
  id=canonical(id);
  const old=record(id), good=result==='good';
  if(good&&again&&old.status==='good')return false;
  const lastMiss=good?(old.lastMiss??(old.wasWeak?old.last:undefined)):now;
  const pending=old.status&&old.status!=='good';
  const early=pending&&now<(old.status==='repaired'?old.dueAt:nextRecallAfter(old.last??now));
  let status=result, stage=old.stage||0, dueAt=old.dueAt;
  if(!good){stage=0;dueAt=now}
  else if(again||early){
    status='repaired';stage=0;dueAt=nextRecallAfter(now);
  }else if(!stage||dueAt==null||now>=dueAt){
    stage=Math.min(stage+1,reviewDays.length-1);dueAt=now+reviewDays[stage]*DAY;
  }
  const won=status==='good'&&!old.star&&Number.isFinite(lastMiss)&&now-lastMiss>=DAY/2&&now-(old.last??0)>=DAY/2;
  state.records[id]={status,wasWeak:!!old.wasWeak||status!=='good',star:!!old.star||won,last:now,lastMiss,stage,dueAt};
  return won;
}
function dueScreen(){
  const qs=reviewable().filter(q=>due(q)).sort(priority), weakN=qs.filter(weak).length;
  return '<div class="viewer">'+back()+'<section class="sheet"><div class="kindlbl">间隔复习</div><h1>今日待复习 · '+qs.length+' 题</h1><p class="soft">'+(qs.length?'其中 '+weakN+' 题需要巩固。先做错题，再做最早到期的题，每轮最多 10 题。':'本次到期的题已完成。继续学新题，答对后会按 1、2、4、7、15 天安排复习。')+'</p><div class="actions">'+(qs.length||state.sessions.due?btn(state.sessions.due?'继续本轮复习':'开始今日复习','startDue'):btn('返回学习','home'))+'</div></section></div>';
}
function dashboard(){
  const n=bank.filter(q=>record(q.id).status==='good').length;
  return '<section class="today"><div><span class="kindlbl">今日待复习</span><strong>'+reviewable().filter(q=>due(q)).length+' <small>题</small></strong></div><div class="today-progress"><b>练习已掌握 '+n+' / '+bank.length+'</b><span class="star today-stars" title="错题间隔至少 12 小时独立答全后得星">★ '+stars()+' 颗攻克星</span><progress value="'+n+'" max="'+bank.length+'" aria-label="练习掌握进度"></progress></div>'+btn('进入今日复习','due','secondary')+'</section>';
}
const clarifications=[
  ['8-mc-3 8-short-3 8-flash-3','课件按是否有意控制来对比主动与被动，将 P300 拼写器列为主动控制例子。Zander 与 Kothe 的三分法另列反应式 BCI，依靠外部刺激诱发信号的 P300 拼写器属于这一类。','https://doi.org/10.1088/1741-2560/8/2/025005','Zander 与 Kothe（2011）'],
  ['8-flash-8 8-short-9','按本课列出五项权利。Neurorights Foundation 的版本另列个人身份及自主行动／自由意志。Ienca 与 Andorno 的框架明确列出精神完整权。','https://www.neurorightsfoundation.org/mission/impact','基金会的五项权利','https://doi.org/10.1186/s40504-017-0050-1','Ienca 与 Andorno（2017）'],
  ['4-flash-9','第 4 课案例写通常 1–2 mA。第 8 课综述概述写 0.25–1.5 mA，儿童建议页写 0.5–1.0 mA。数字须随课次和研究条件作答。','assets/psy6094-review.pdf#page=118','复习册第 118 页，第 36 条'],
  ['5-mc-8 5-flash-8 5-short-7','课件给出典型负荷配对。Jensen 等在短时记忆保持阶段观察到，后部 Alpha 可随记忆负荷增加而升高。解释时写清任务阶段。','https://pubmed.ncbi.nlm.nih.gov/12122036/','Jensen 等（2002）'],
  ['6-mc-8 6-short-7','课件称“增加 35%”。由 4.90 到 7.43 μV 按基线计算，增幅约 51.6%。资料列出的 ANCOVA p=.051，以 .05 为阈值未达显著；该检验与组内均值的描述性增幅应分别报告。','assets/psy6094-review.pdf#page=115','复习册第 115–116 页，第 17–18 条'],
  ['7-mc-2','课件作答采用右侧 IPS 与非符号、左侧与符号数量的侧重配对。跨记号适应研究在顶内沟观察到点阵和数字共用的数量编码，实际加工也有重叠。','https://pubmed.ncbi.nlm.nih.gov/17224409/','Piazza 等（2007）'],
  ['4-flash-6','LTD 描述突触传递的持久减弱。复习册还用它解释连接精简、网络优化与弱化旧概念。回答机制题时，先交代传递强度的变化。','assets/psy6094-review.pdf#page=80','复习册第 80 页，知识点 9.2']
];
function extraNote(q){
  const note=clarifications.find(([ids])=>ids.split(' ').includes(canonical(q.id)));if(!note)return '';
  let links='';for(let i=2;i<note.length;i+=2)links+=' <a href="'+note[i]+'" target="_blank" rel="noopener">'+note[i+1]+'</a>';
  return '<details class="course-note"><summary>易混点</summary><p>'+note[1]+'</p>'+links+'</details>';
}
function readProgress(raw){
  const fail=()=>{throw Error('备份结构无效或来自其他课程。')};
  const dict=x=>x&&typeof x==='object'&&!Array.isArray(x);
  const requireValue=ok=>{if(!ok)fail()};
  const int=(x,min,max)=>Number.isSafeInteger(x)&&x>=min&&x<=max;
  const validId=id=>typeof id==='string'&&Object.hasOwn(byId,id);
  const course=n=>int(Number(n),4,9);
  const perm=x=>Array.isArray(x)&&x.length===4&&new Set(x).size===4&&x.every(n=>int(n,0,3));
  const keyOK=k=>/^(weak|due|[4-9]-(all|mc|short|flash))$/.test(k);
  requireValue(dict(raw)&&dict(raw.sessions)&&dict(raw.records)&&dict(raw.first)&&course(raw.last));
  requireValue(raw.version===undefined||raw.version===2||raw.version===3);
  const old=raw.version===undefined, output=freshState();
  const priorId=id=>old&&byId['legacy-'+id]?'legacy-'+id:id;
  output.last=Number(raw.last);
  for(const [l,v] of Object.entries(raw.first)){requireValue(course(l)&&typeof v==='boolean');output.first[Number(l)]=v}
  for(const [id,r] of Object.entries(raw.records)){
    requireValue(validId(id)&&dict(r)&&['good','partial','miss','repaired'].includes(r.status));
    for(const f of ['last','dueAt','lastMiss'])requireValue(r[f]===undefined||int(r[f],0,8640000000000000));
    requireValue(r.stage===undefined||int(r.stage,0,5));
    const last=r.last??0;
    // Older clients promoted an immediate correction to the first spaced interval.
    const quickCorrection=raw.version===2&&r.status==='good'&&r.wasWeak&&r.stage===1&&Number.isFinite(r.lastMiss)&&last>r.lastMiss&&last-r.lastMiss<DAY/2;
    if(r.status==='repaired'||quickCorrection){
      const dueAt=quickCorrection?nextRecallAfter(last):(r.dueAt??nextRecallAfter(last));
      output.records[canonical(id)]={status:'repaired',star:r.star===true,wasWeak:true,last,lastMiss:r.lastMiss??last,stage:0,dueAt};
      continue;
    }
    const good=r.status==='good';
    output.records[canonical(id)]={status:r.status,star:r.star===true,wasWeak:!!r.wasWeak||!good,last,
      stage:r.stage??(good?1:0),dueAt:r.dueAt??(last+(good?DAY:0)),lastMiss:r.lastMiss??(r.wasWeak||!good?last:undefined)};
  }
  for(const [id,v] of Object.entries(raw.points||{})){requireValue(Object.hasOwn(knowledgeById,id)&&['learning','lit'].includes(v));output.points[id]=v}
  for(const [key,s] of Object.entries(raw.sessions)){
    requireValue(keyOK(key)&&dict(s)&&course(s.lesson)&&['weak','due','chapter'].includes(s.mode)&&['study','quiz'].includes(s.phase));
    requireValue(Array.isArray(s.queue)&&s.queue.length>0&&s.queue.length<=100&&int(s.index,0,s.queue.length-1)&&int(s.total,1,40));
    const queue=s.queue.map(t=>{requireValue(dict(t)&&validId(t.id)&&typeof t.retry==='boolean');return {id:priorId(t.id),retry:t.retry}});
    requireValue(Array.isArray(s.cards)&&s.cards.length<=5&&s.cards.every(validId)&&int(s.preview,0,Math.max(0,s.cards.length-1))&&(s.phase!=='study'||s.cards.length>0));
    const r=s.response, kind=byId[queue[s.index].id];
    requireValue(dict(r)&&typeof r.text==='string'&&(r.pick===null||int(r.pick,0,3))&&Array.isArray(r.checked)&&r.checked.every(i=>int(i,0,(kind.points?.length||1)-1)));
    requireValue(r.graded===null||['good','partial','miss'].includes(r.graded));requireValue(!r.order||perm(r.order));
    const response={...emptyResponse(),text:r.text,pick:r.pick,checked:[...new Set(r.checked)],graded:r.graded,revealed:r.revealed===true,won:r.won===true,usedHint:r.usedHint===true,blank:r.blank===true};
    if(r.order)response.order=r.order;else if(old&&kind.kind==='mc'&&(r.pick!==null||r.revealed))response.order=[0,1,2,3];
    requireValue(dict(s.initial)&&int(s.starCount,0,100));
    const initial={};for(const [id,v] of Object.entries(s.initial)){requireValue(validId(id)&&['good','partial','miss'].includes(v));initial[canonical(id)]=v}
    output.sessions[key]={lesson:Number(s.lesson),mode:s.mode,phase:s.phase,preview:s.preview,cards:s.cards.map(priorId),total:s.total,queue,index:s.index,initial,starCount:s.starCount,response};
  }
  requireValue(raw.lastKey==null||(keyOK(raw.lastKey)&&Object.hasOwn(output.sessions,raw.lastKey)));output.lastKey=raw.lastKey||null;
  for(const [l,r] of Object.entries(raw.exams||{})){
    requireValue(course(l)&&dict(r)&&int(r.pos,0,9)&&Array.isArray(r.questions)&&r.questions.length===10&&dict(r.picks));
    const questions=r.questions.map(t=>{requireValue(validId(t.id)&&byId[t.id].lesson===Number(l)&&byId[t.id].kind==='mc'&&perm(t.order));return {id:priorId(t.id),order:t.order}});
    const ids=new Set(questions.map(x=>x.id));requireValue(ids.size===10);
    const picks={};for(const [id,v] of Object.entries(r.picks)){const k=priorId(id);requireValue(ids.has(k)&&int(v,0,3));picks[k]=v}
    output.exams[Number(l)]={questions,picks,pos:r.pos};
  }
  for(const [l,h] of Object.entries(raw.examHistory||{})){
    requireValue(course(l)&&dict(h)&&int(h.best,0,10)&&int(h.score,0,h.best)&&int(h.attempts,1,1000000)&&Array.isArray(h.answers)&&h.answers.length===10);
    const answers=h.answers.map(a=>{requireValue(validId(a.id)&&byId[a.id].kind==='mc'&&byId[a.id].lesson===Number(l)&&int(a.pick,0,3));return {id:priorId(a.id),pick:a.pick}});
    output.examHistory[Number(l)]={best:h.best,score:h.score,attempts:h.attempts,answers};
  }
  return output;
}
function setupBackups(){
  const file=document.querySelector('#backupFile'), msg=document.querySelector('#backupMsg'),dialog=document.querySelector('#importDialog');
  let candidate=null;
  document.querySelector('#downloadBackup').onclick=()=>{
    const data=JSON.stringify({course:'PSY6094',format:1,progress:state},null,2);
    const url=URL.createObjectURL(new Blob([data],{type:'application/json'})),a=document.createElement('a');
    a.href=url;a.download='PSY6094-进度-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),3000);
  };
  document.querySelector('#uploadBackup').onclick=()=>file.click();
  file.onchange=async()=>{
    const f=file.files[0];file.value='';if(!f)return;
    try{
      const payload=JSON.parse(await f.text());
      if(payload.course!=='PSY6094'||payload.format!==1)throw Error();
      candidate=readProgress(payload.progress);msg.textContent='';
      document.querySelector('#importCount').textContent='备份包含 '+Object.keys(candidate.records).length+' 条答题记录。导入会替换这个浏览器里本课程的进度。';
      dialog.showModal();
    }catch{candidate=null;msg.textContent='无法导入此文件。请选择从本课程导出的有效 JSON 备份。'}
  };
  document.querySelector('#cancelImport').onclick=()=>dialog.close();
  document.querySelector('#acceptImport').onclick=()=>{
    if(!candidate)return;state=candidate;chapter=state.last;activeKey=null;mini=null;report=null;
    save();dialog.close();turn('home');msg.textContent='已恢复学习进度。';
  };
  dialog.addEventListener('close',()=>{candidate=null});
}
function setupKeys(){
  document.addEventListener('keydown',e=>{
    if(e.defaultPrevented||e.isComposing||e.keyCode===229||e.repeat||e.altKey||e.ctrlKey||e.metaKey||e.shiftKey||document.querySelector('dialog[open]'))return;
    if(screen==='session'&&e.key==='Enter'&&e.target.id==='draft'){
      e.preventDefault();
      if(e.target.value.trim())app.querySelector('[data-action="reveal"]:not(:disabled)')?.click();
      return;
    }
    if(e.target.closest('input,textarea,select,[contenteditable="true"],a'))return;
    if(!['exam','session','point'].includes(screen))return;
    let target;
    if(/^[1-4]$/.test(e.key))target=app.querySelectorAll('.option:not(:disabled)')[Number(e.key)-1];
    if(e.key==='Enter'){
      if(e.target.closest('button')&&!e.target.closest('.option'))return;
      const selector=screen==='exam'?'[data-action="examNext"]':screen==='point'?'[data-action="miniSubmit"]:not(:disabled)':'[data-action="next"],[data-action="reveal"]:not(:disabled),[data-action="studyNext"]';
      target=app.querySelector(selector);
    }
    if(target){e.preventDefault();target.click()}
  });
}
