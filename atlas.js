// The ranges follow the numbered points in the review booklet, in reading order.
const branches = {
  4: [
    [1,5,'差异从哪里来','从诊断差异追到遗传、细胞通路与发育时间。'],
    [6,10,'差异怎么测','把个体脑网络与常模比较，再匹配支持。'],
    [11,18,'经验怎样改变大脑','从突触、结构、功能的变化，连到复习与认知储备。'],
    [19,25,'证据怎样解释','对照 tDCS 案例与测量工具，区分观察和解释。']
  ],
  5: [
    [1,4,'跨诊断研究','先控制任务偏差，再比较 ASD 与 ADHD 的共有和特异结果。'],
    [5,9,'读写障碍','从白质局部子网，连到图论指标与识字表现。'],
    [10,14,'ADHD 的异质性','用不同模型解释抑制、动机与能量状态。'],
    [15,21,'灵活性与负荷','从规则转换看行为，再用脑电和外周指标检验解释。'],
    [22,28,'课堂支持','从学生的具体需要，选择多感官材料、节奏和提示。']
  ],
  6: [
    [1,5,'课程设计','UDL 预先提供多条路径，DI 随课堂表现调整教学。'],
    [6,9,'神经证据','沿着 Boysen 的引文审查，区分脑网络假设与教学成效。'],
    [10,13,'跨诊断评估','用功能画像和 CALM 因素解释个体需要。'],
    [14,17,'训练与迁移','用基线、训练后与随访，区分即时改善和延迟迁移。'],
    [18,25,'教师与课堂','把培训、协同教学和支架设计放回实际课例检验。']
  ],
  7: [
    [1,4,'研究如何转译','沿 NIES 四步，把神经原理落到可观察的课堂行动。'],
    [5,10,'数学困难在哪里','从数感、算术事实与语言加工，形成个别评估。'],
    [11,16,'教学怎样支持','用 RTI 决定强度，DA 观察进步，CRA 架起表征阶梯。'],
    [17,21,'家校怎样配合','以动机、安全和具体反馈支持长期学习。'],
    [22,25,'如何检验成效','用教师调查和课堂情境反思研究证据。']
  ],
  8: [
    [1,4,'先看需要再选工具','按 SETT 依次看学生、环境、任务和工具。'],
    [5,11,'测量与脑机接口','对照主动控制、被动监测和课堂应用条件。'],
    [12,17,'神经调控证据','区分研究对象、任务和状态依赖，保留证据边界。'],
    [18,21,'自适应教学','把感知、决策、反馈连成闭环，教师参与判断。'],
    [22,25,'神经权利','把数据隐私、持续同意和公平可及落到学校决策。']
  ],
  9: [
    [1,8,'脑友善学习','把认知负荷、动机和元认知支架连到课堂设计。'],
    [9,12,'课程框架','用 CEN-STEM 和 CIRCLE 检查原则、层次与研究结果。'],
    [13,16,'提取与适配','从必要难度走到教学循环，再为不同学生提供路径。'],
    [17,23,'行动研究与教案','观察三轮改进，找出材料、提示和情境各解决什么问题。'],
    [24,25,'评估与协同','从灵活评估走到普特分工与持续反思。']
  ]
};
const knowledgeById = Object.fromEntries(knowledge.map(item => [item.id,item]));
const pdfUrl = 'assets/psy6094-review.pdf';
const passScore = 8;
let atlasLesson = 6, atlasBranch = 0, pointFilter = 'all', pointId = null;
let pointFrom = 'atlas', pointStep = 'read', mini = null;

function freshState() {
  return {first:{},records:{},sessions:{},last:6,lastKey:null,points:{},exams:{},examHistory:{}};
}
function pdfLink(page,label) {
  return '<a class="pdf-link" href="'+pdfUrl+'#page='+page+'" target="_blank" rel="noopener">'+esc(label)+'</a>';
}
function sticker(name,style) {
  return '<img class="'+style+'" src="assets/'+name+'.webp" alt="小羊肖恩" decoding="async">';
}
function shuffled(list) {
  const copy=[...list];
  for(let i=copy.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]]}
  return copy;
}
function pointStatus(id) {return state.points[id] || 'new'}
function inBranch(lesson,index) {
  const [start,end]=branches[lesson][index];
  return knowledge.filter(p=>p.lesson===lesson&&p.n>=start&&p.n<=end);
}
function lessonLit(l) {return (state.examHistory[l]?.best??0)>=passScore}
function pointCount(list) {return list.filter(p=>pointStatus(p.id)==='lit').length}
function chapterTabs() {
  return '<div class="pills chapters" aria-label="选择课程">'+lessons.map(l=>btn('第 '+l+' 课'+(lessonLit(l)?' ★':''),'atlasLesson',atlasLesson===l?'active':'','data-l="'+l+'" aria-pressed="'+(atlasLesson===l)+'"')).join('')+'</div>';
}
function atlasFrame(heading,body) {
  const total=pointCount(knowledge),chapters=lessons.filter(lessonLit).length;
  return '<div class="atlaswrap">'+back()+'<div class="atlas-title"><h1>'+heading+'</h1><span>已点亮 '+total+' / 153 个知识点 · '+chapters+' / 6 课</span></div>'+chapterTabs()+body+'</div>';
}
function branchButton(index) {
  const l=atlasLesson, b=branches[l][index], items=inBranch(l,index), active=index===atlasBranch;
  return '<button type="button" class="treebranch '+(active?'chosen':'')+'" data-action="branch" data-i="'+index+'" aria-pressed="'+active+'"><strong>'+esc(b[2])+'</strong><small>'+pointCount(items)+' / '+items.length+' 已点亮</small></button>';
}
function mindScreen(){
  const l=atlasLesson, b=branches[l][atlasBranch];
  const leaves=inBranch(l,atlasBranch).map(p=>'<button class="treeleaf" data-action="point" data-id="'+p.id+'"><span class="tag">'+p.id+(pointStatus(p.id)==='lit'?' ★':'')+'</span><span>'+esc(p.title)+'</span></button>').join('');
  return atlasFrame('思维导图','<div class="tree"><div class="tree-root"><span>第 '+l+' 课</span><h2>'+titles[l]+'</h2></div><div class="branchcol">'+branches[l].map((_,i)=>branchButton(i)).join('')+'</div><section class="tree-leaves"><div class="kindlbl">主题分支</div><h2>'+esc(b[2])+'</h2><p>'+esc(b[3])+'</p><div class="leaves">'+leaves+'</div></section></div>'+examBanner(l));
}
const statusLabels={new:'未学',learning:'待自测',lit:'已点亮'};
function mapScreen(){
  const l=atlasLesson,groups=branches[l], lessonItems=knowledge.filter(p=>p.lesson===l);
  const matching=lessonItems.filter(p=>pointFilter==='all'||pointStatus(p.id)===pointFilter);
  const filters=Object.entries({all:'全部',...statusLabels}).map(([k,v])=>btn(v,'pointFilter',pointFilter===k?'active':'','data-k="'+k+'" aria-pressed="'+(k===pointFilter)+'"')).join('');
  const sections=groups.map((b,i)=>{
    const items=inBranch(l,i), visible=items.filter(p=>matching.includes(p));
    if(!visible.length)return '';
    const nodes=visible.map(p=>{
      const status=pointStatus(p.id);
      return '<button class="point-node '+status+'" data-action="point" data-id="'+p.id+'"><span class="node-status">'+(status==='lit'?'★ ':status==='learning'?'◐ ':'○ ')+statusLabels[status]+'</span><span class="topic-num">'+p.id+'</span><strong>'+esc(p.title)+'</strong></button>';
    }).join('');
    return '<section class="terrain"><div class="heading"><h2>'+esc(b[2])+'</h2><span>'+pointCount(items)+' / '+items.length+' 已点亮</span></div><div class="nodes">'+nodes+'</div></section>';
  }).join('');
  return atlasFrame('知识点地图','<div class="atlas-intro"><h2>'+titles[l]+'</h2><p>读一个知识点，再合上资料答对一道辨析题，即可点亮。</p></div>'+examBanner(l)+'<div class="pills" aria-label="筛选学习状态">'+filters+'</div>'+ (sections||'<div class="sheet">本课还没有符合此状态的知识点。</div>'));
}
function examBanner(l){
  const h=state.examHistory[l], draft=state.exams[l];
  const info='10 道单选，答对 '+passScore+' 道点亮章节。'+(h?' 历史最高 '+h.best+' / 10。':'');
  return '<div class="exam-banner"><div><strong>'+(lessonLit(l)?'★ 章节已点亮':'☆ 章节考试')+'</strong><p>'+info+'</p></div>'+btn(draft?'继续考试':h?'再次挑战':'参加考试','examStart','primary','data-l="'+l+'"')+'</div>';
}
function openPoint(id){
  if(!knowledgeById[id])return;
  if(screen==='mind'||screen==='atlas')pointFrom=screen;
  pointId=id;pointStep='read';mini=null;
  if(!state.points[id]){state.points[id]='learning';save()}
  turn('point');
}
function beginMini(){
  const p=knowledgeById[pointId];
  const group=branches[p.lesson].findIndex(([a,b])=>p.n>=a&&p.n<=b);
  const nearby=shuffled(inBranch(p.lesson,group).filter(x=>x.id!==p.id));
  const extra=shuffled(knowledge.filter(x=>x.lesson===p.lesson&&x.id!==p.id&&!nearby.includes(x)));
  mini={options:shuffled([p,...[...nearby,...extra].slice(0,3)]).map(x=>x.id),pick:null,submitted:false};
  pointStep='test';turn('point');
}
function pointScreen(){
  const p=knowledgeById[pointId],status=pointStatus(p.id);
  let body='';
  if(pointStep==='read'){
    body='<div class="kindlbl">知识点 '+p.id+' · '+statusLabels[status]+'</div><h1>'+esc(p.title)+'</h1><div class="studybody">'+esc(p.plain)+'</div><h2 class="subttl">答题要点</h2><p>'+esc(p.answer)+'</p><p class="hint spaced">关键词　'+esc(p.words)+'</p><p class="source">'+pdfLink(p.page,'打开复习册第 '+p.page+' 页')+' · '+esc(p.source)+'</p><div class="actions">'+btn(status==='lit'?'再测一次':'合上资料，自测','miniStart')+'</div>';
  }else{
    const passed=mini.pick===p.id;
    body='<div class="kindlbl">知识点 '+p.id+' · 自测</div><h1>'+esc(p.title)+'</h1><p>下面哪一句最能解释这个知识点？</p><div class="options">'+mini.options.map((id,i)=>{
      const picked=mini.pick===id, checked=mini.submitted;
      let cls='option'+(picked?' selected':'')+(checked&&id===p.id?' correct':'')+(checked&&picked&&!passed?' wrong':'');
      return '<button class="'+cls+'" data-action="miniPick" data-id="'+id+'" aria-pressed="'+picked+'" '+(checked?'disabled':'')+'><i>'+String.fromCharCode(65+i)+'</i><span>'+esc(knowledgeById[id].plain)+'</span>'+(checked&&id===p.id?'<span class="optmark">正确答案</span>':'')+'</button>';
    }).join('')+'</div>';
    if(!mini.submitted)body+=btn('确认答案','miniSubmit','primary',mini.pick?'':'disabled');
    else{
      const selected=knowledgeById[mini.pick];
      body+='<div class="feedback '+(passed?'':'bad')+'"><b class="title">'+(passed?'★ 这个知识点已点亮':'再分辨一次')+'</b>'+(passed?esc(p.words):'你选的解释对应「'+esc(selected.title)+'」。本题要抓住「'+esc(p.words)+'」。')+'</div><div class="actions">'+btn(passed?'回到地图':'重读这一点',passed?'pointBack':'miniRead')+(passed?btn('下一个知识点','nextPoint','secondary'):'')+'</div>';
    }
  }
  return '<div class="viewer"><div class="rail">'+btn(pointFrom==='mind'?'返回思维导图':'返回知识点地图','pointBack','back')+'<span class="soft">第 '+p.lesson+' 课</span></div><section class="sheet">'+body+'</section></div>';
}
function startExam(l){
  atlasLesson=l;
  if(!state.exams[l]){
    state.exams[l]={questions:shuffled(pool(l,'mc')).map(q=>({id:q.id,order:shuffled([0,1,2,3])})),picks:{},pos:0};
  }
  save();turn('exam');
}
function examScreen(){
  const l=atlasLesson,run=state.exams[l], item=run.questions[run.pos],q=byId[item.id],n=Object.keys(run.picks).length;
  const choices=item.order.map((original,i)=>'<button data-action="examPick" data-i="'+original+'" class="option '+(run.picks[q.id]===original?'selected':'')+'" aria-pressed="'+(run.picks[q.id]===original)+'"><i>'+String.fromCharCode(65+i)+'</i><span>'+esc(q.opts[original])+'</span></button>').join('');
  const nav=run.questions.map((x,i)=>btn(String(i+1),'examGoto','exam-number '+(i===run.pos?'here ':'')+(Object.hasOwn(run.picks,x.id)?'answered':''),'data-i="'+i+'" aria-label="第 '+(i+1)+' 题'+(Object.hasOwn(run.picks,x.id)?'，已作答':'，未作答')+'"')).join('');
  return '<div class="viewer"><div class="rail">'+btn('保存并返回地图','examBack','back')+'<span>已答 '+n+' / 10</span></div><section class="sheet"><div class="kindlbl">第 '+l+' 课 · 章节考试 · 第 '+(run.pos+1)+' 题</div><h1>'+esc(q.q)+'</h1><div class="options">'+choices+'</div><div class="actions">'+(run.pos>0?btn('上一题','examPrev','secondary'):'')+(run.pos<9?btn('下一题','examNext'):'')+(n===10||run.pos===9?btn('交卷评分','examFinish','primary',n===10?'':'disabled'):'')+'</div><div class="exam-nav" aria-label="跳转题号">'+nav+'</div><p class="soft">答对 '+passScore+' 题通关。交卷前可以改答案。</p></section></div>';
}
function finishExam(){
  const l=atlasLesson,run=state.exams[l];
  if(!run||Object.keys(run.picks).length!==10)return;
  const answers=run.questions.map(({id})=>({id,pick:run.picks[id]}));
  const score=answers.filter(a=>byId[a.id].ans===a.pick).length;
  const h=state.examHistory[l]||{best:0,attempts:0};
  for(const a of answers){
    const prev=record(a.id),correct=byId[a.id].ans===a.pick;
    state.records[a.id]={...prev,status:correct?'good':'miss',last:Date.now(),wasWeak:prev.wasWeak||!correct,star:prev.star||(correct&&!!prev.wasWeak)};
  }
  state.examHistory[l]={best:Math.max(score,h.best),attempts:h.attempts+1,score,answers};
  delete state.exams[l];save();turn('examResult');
}
function examResult(){
  const l=atlasLesson,h=state.examHistory[l],passed=h.score>=passScore;
  const wrong=h.answers.filter(a=>byId[a.id].ans!==a.pick);
  const list=wrong.map(a=>{const q=byId[a.id];return '<details class="listitem"><summary>'+esc(q.q)+'</summary><p>所选　'+esc(q.opts[a.pick])+'</p><p>正确　'+esc(q.opts[q.ans])+'</p><p>'+esc(q.a)+'</p>'+source(q)+'</details>'}).join('');
  return '<div class="viewer">'+back()+'<section class="sheet result">'+(passed?sticker('celebrate','result-sheep'):'')+'<div class="kindlbl">第 '+l+' 课 · 考试结果</div><h1>'+h.score+' / 10 · '+(passed?'章节已点亮':'还差 '+(passScore-h.score)+' 题通关')+'</h1><p>共考 '+h.attempts+' 次，最高 '+h.best+' 分。'+(wrong.length?'本次错题已收入错题本。':'本轮全部答对。')+'</p><div class="actions">'+btn('查看知识点地图','examBack')+(wrong.length?btn('复习错题','mistakes','secondary'):'')+'</div>'+(wrong.length?'<h2 class="subttl">逐题订正</h2>'+list:'')+'</section></div>';
}
function handleAtlasAction(action, data){
  switch(action){
    case 'atlas': case 'mind':
      if(screen==='chapter')atlasLesson=chapter;else if(!['mind','atlas','point','exam','examResult'].includes(screen))atlasLesson=state.last;
      atlasBranch=0;pointFilter='all';turn(action);break;
    case 'atlasLesson': atlasLesson=Number(data.l);atlasBranch=0;pointFilter='all';render();break;
    case 'branch': atlasBranch=Number(data.i);render();break;
    case 'pointFilter': pointFilter=data.k;render();break;
    case 'point': openPoint(data.id);break;
    case 'pointBack': turn(pointFrom);break;
    case 'miniStart': beginMini();break;
    case 'miniPick': if(!mini.submitted){mini.pick=data.id;render()}break;
    case 'miniSubmit':
      if(!mini.submitted&&mini.pick){
        mini.submitted=true;if(mini.pick===pointId)state.points[pointId]='lit';
        save();render();
      }break;
    case 'miniRead': pointStep='read';turn('point');break;
    case 'nextPoint':{
      const points=knowledge.filter(p=>p.lesson===atlasLesson),idx=points.findIndex(p=>p.id===pointId);
      const next=points.slice(idx+1).concat(points.slice(0,idx)).find(p=>pointStatus(p.id)!=='lit');
      if(next){atlasBranch=branches[atlasLesson].findIndex(([a,b])=>next.n>=a&&next.n<=b);openPoint(next.id)}else turn('atlas');
      break;
    }
    case 'examStart': startExam(Number(data.l));break;
    case 'examBack': pointFilter='all';turn('atlas');break;
    case 'examNext': case 'examPrev': case 'examGoto':{
      const run=state.exams[atlasLesson];
      run.pos=action==='examGoto'?Number(data.i):Math.min(9,Math.max(0,run.pos+(action==='examNext'?1:-1)));
      save();turn('exam');break;
    }
    case 'examPick':{
      const run=state.exams[atlasLesson];run.picks[run.questions[run.pos].id]=Number(data.i);save();render();break;
    }
    case 'examFinish': finishExam();break;
    default:return false;
  }
  return true;
}
