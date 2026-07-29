
const STORAGE_KEY = "projeto_fenix_save_v1";

const MISSIONS = [
  ["treino","Treino concluído",100],
  ["cardio","Cardio concluído",50],
  ["sem_cigarro","Dia sem cigarro",120],
  ["sem_doces","Dia sem doces",70],
  ["agua","Meta de água",40],
  ["sono","Dormiu 7 horas ou mais",40],
  ["alongamento","Alongamento ou mobilidade",20],
];

const WORKOUTS = {
  A:{title:"A • Peito, Ombro e Tríceps",exercises:[
    ["Supino inclinado",3,"8–12",90,["Máquina inclinada","Smith inclinado","Halteres inclinados"]],
    ["Supino reto na máquina",3,"8–12",90,["Chest press","Smith reto","Halteres"]],
    ["Peck deck",3,"12–15",60,["Crossover","Crucifixo articulado","Halteres"]],
    ["Desenvolvimento na máquina",3,"8–12",90,["Smith sentado","Halteres sentado","Máquina articulada"]],
    ["Elevação lateral",3,"12–20",60,["Máquina lateral","Polia unilateral","Halteres sentado"]],
    ["Tríceps na polia",3,"10–15",60,["Corda","Barra reta","Máquina"]],
    ["Tríceps francês na polia",2,"10–15",60,["Corda acima da cabeça","Máquina","Halter unilateral"]],
  ]},
  B:{title:"B • Costas e Bíceps",exercises:[
    ["Puxada alta pronada",3,"8–12",90,["Puxada neutra","Máquina convergente","Pulldown articulado"]],
    ["Remada baixa",3,"8–12",90,["Remada máquina","Remada articulada","Polia unilateral"]],
    ["Remada articulada com apoio",3,"10–12",90,["Cavalinho com apoio","Unilateral máquina","Remada neutra"]],
    ["Pulldown na polia",2,"12–15",60,["Pullover máquina","Corda","Braços estendidos"]],
    ["Rosca direta na máquina",3,"8–12",60,["Barra W","Polia baixa","Scott"]],
    ["Rosca martelo",3,"10–15",60,["Corda","Máquina","Halteres alternados"]],
    ["Crucifixo inverso",3,"12–20",60,["Peck deck invertido","Polia","Máquina posterior"]],
  ]},
  C:{title:"C • Pernas e Abdômen",exercises:[
    ["Leg press 45°",4,"10–15",120,["Leg horizontal","Smith com banco","Pendular leve"]],
    ["Cadeira extensora",3,"12–15",75,["Unilateral","Articulada","Alternativa"]],
    ["Mesa flexora",3,"10–15",75,["Cadeira flexora","Em pé","Unilateral"]],
    ["Cadeira adutora",3,"12–20",60,["Máquina combinada","Polia","Unilateral"]],
    ["Cadeira abdutora",3,"12–20",60,["Inclinada","Polia","Glúteo médio"]],
    ["Panturrilha sentada",4,"12–20",60,["Leg press","Máquina em pé","Smith"]],
    ["Abdominal na máquina",3,"12–20",60,["Polia alta","Articulada","Sentado"]],
  ]}
};

const BOSSES = [
 ["O RETORNO","Seu corpo protesta porque estava em modo sofá. A missão é aparecer."],
 ["A FISSURA","Seu cérebro tenta vender um cigarro como solução universal. Não compre a propaganda."],
 ["O ESPELHO IMPACIENTE","O resultado visual pode atrasar. O processo, não."],
 ["A ROTINA CINZENTA","A novidade acabou. Agora começa a disciplina."],
 ["O NEGOCIADOR","Só hoje, só um, só desta vez. O vendedor insiste, você não compra."],
 ["A RETA FINAL","Cansaço é informação, não ordem de parada."],
 ["A FÊNIX","Terminar prova que você consegue reconstruir o próprio sistema."]
];

function today(dateObj=new Date()){
  const y=dateObj.getFullYear();
  const m=String(dateObj.getMonth()+1).padStart(2,"0");
  const d=String(dateObj.getDate()).padStart(2,"0");
  return `${y}-${m}-${d}`;
}

function normalizeSave(data){
  const base=defaultSave();
  return {
    ...base,...data,
    profile:{...base.profile,...(data.profile||{})},
    days:data.days||{},
    measurements:data.measurements||[],
    workouts:data.workouts||[],
    journals:data.journals||{},
    achievements:data.achievements||{},
    backupMeta:data.backupMeta||{lastBackup:null},
    settings:data.settings||{lastSeenVersion:"1.4.0"},
    activeWorkout:data.activeWorkout||null
  };
}
function missionStats(key){
  const entries=Object.entries(save.days).filter(([d])=>d<=today()).sort((a,b)=>a[0].localeCompare(b[0]));
  const total=entries.reduce((s,[,d])=>s+(d[key]?1:0),0);
  let current=0,cursor=new Date(today()+"T12:00:00");
  while(save.days[today(cursor)]?.[key]){current++;cursor.setDate(cursor.getDate()-1);}
  let best=0,run=0,prev=null;
  for(const [iso,d] of entries){
    const dt=new Date(iso+"T12:00:00");
    const consecutive=prev && Math.round((dt-prev)/86400000)===1;
    run=d[key]?(consecutive?run+1:1):0;
    best=Math.max(best,run); prev=dt;
  }
  return {total,current,best};
}
function completedMissionCount(day){return MISSIONS.reduce((s,[k])=>s+(day?.[k]?1:0),0);}
function perfectDays(){return Object.values(save.days).filter(d=>completedMissionCount(d)===MISSIONS.length).length;}
function recentMissionDays(limit=14){
  const rows=[],cursor=new Date(today()+"T12:00:00");
  for(let i=0;i<limit;i++){const iso=today(cursor);rows.push([iso,save.days[iso]||null]);cursor.setDate(cursor.getDate()-1);}
  return rows;
}


const APP_VERSION="1.4.0";
const ACHIEVEMENTS=[
  ["first_workout","Primeira Gota","Conclua o primeiro treino.",()=>totalTrainings()>=1],
  ["three_workouts","Motor Aquecido","Conclua 3 treinos.",()=>totalTrainings()>=3],
  ["ten_workouts","Engrenagem","Conclua 10 treinos.",()=>totalTrainings()>=10],
  ["smoke_3","Primeiro Fôlego","Passe 3 dias seguidos sem cigarro.",()=>missionStats("sem_cigarro").best>=3],
  ["smoke_7","Pulmão em Revolta","Passe 7 dias seguidos sem cigarro.",()=>missionStats("sem_cigarro").best>=7],
  ["smoke_15","Ar Mais Limpo","Passe 15 dias seguidos sem cigarro.",()=>missionStats("sem_cigarro").best>=15],
  ["sweet_7","Domador do Açúcar","Passe 7 dias seguidos sem doces.",()=>missionStats("sem_doces").best>=7],
  ["perfect_day","Dia Impecável","Conclua todas as missões de um dia.",()=>perfectDays()>=1],
  ["diary_7","Cartógrafo Mental","Preencha o diário em 7 dias.",()=>Object.keys(save.journals).length>=7],
  ["level_5","Ascensão","Alcance o nível 5.",()=>levelFromXP(totalXP()).level>=5],
  ["campaign_end","Fênix","Chegue ao dia 45.",()=>currentDay()>=45],
];
function evaluateAchievements(show=false){
  const unlocked=[];
  for(const [code,title,desc,test] of ACHIEVEMENTS){
    if(test()&&!save.achievements[code]){
      save.achievements[code]={date:today(),title,desc};
      unlocked.push(title);
    }
  }
  if(unlocked.length){
    localStorage.setItem(STORAGE_KEY,JSON.stringify(save));
    if(show) setTimeout(()=>alert(`Conquista desbloqueada:\n\n${unlocked.join("\n")}`),50);
  }
}
function nextWorkoutKey(){
  const completed=save.workouts.filter(w=>w&&w.key);
  if(!completed.length)return "A";
  const last=completed[0].key;
  return last==="A"?"B":last==="B"?"C":"A";
}
function lastExerciseLog(name){
  for(const workout of save.workouts){
    const log=workout.logs?.find(x=>x.name===name&&x.done);
    if(log)return log;
  }
  return null;
}
function exerciseHistory(name){
  const rows=[];
  for(const workout of save.workouts){
    const log=workout.logs?.find(x=>x.name===name&&x.done);
    if(log)rows.push({date:workout.data,workout:workout.key,...log});
  }
  return rows;
}
function repsAverage(reps){
  const nums=String(reps||"").match(/\d+/g)?.map(Number)||[];
  return nums.length?nums.reduce((a,b)=>a+b,0)/nums.length:0;
}
function progressionSuggestion(log){
  if(!log)return "Primeiro registro";
  const load=Number(log.load||0), avg=repsAverage(log.reps), rir=Number(log.rir||2);
  if(!load)return "Registre uma carga";
  if(avg>=12&&rir>=2)return `Teste ${formatLoad(load*1.05)} kg`;
  if(avg>=10)return `Mantenha ${formatLoad(load)} kg`;
  return `Repita ${formatLoad(load)} kg e busque mais repetições`;
}
function formatLoad(v){
  const rounded=Math.round(v*2)/2;
  return Number.isInteger(rounded)?String(rounded):rounded.toFixed(1).replace(".",",");
}
function campaignDays(){
  const rows=[];
  const start=new Date(save.profile.dataInicio+"T12:00:00");
  for(let i=0;i<45;i++){
    const d=new Date(start);d.setDate(start.getDate()+i);
    const iso=today(d);
    rows.push({number:i+1,date:iso,day:save.days[iso]||null,journal:save.journals[iso]||null,workouts:save.workouts.filter(w=>w.data===iso),measurements:save.measurements.filter(m=>m.data===iso)});
  }
  return rows;
}
function campaignStats(){
  const days=Object.values(save.days);
  const missionTotal=days.reduce((s,d)=>s+completedMissionCount(d),0);
  const possible=Math.max(1,days.length*MISSIONS.length);
  const journals=Object.values(save.journals);
  const avg=(arr,key)=>arr.length?(arr.reduce((s,x)=>s+Number(x[key]||0),0)/arr.length):0;
  const first=[...save.measurements].sort((a,b)=>a.data.localeCompare(b.data))[0]?.peso??save.profile.pesoInicial;
  const latest=latestWeight();
  return{
    completion:Math.round(missionTotal/possible*100),
    avgSleep:avg(journals,"sono"),
    avgEnergy:avg(journals,"energia"),
    avgMood:avg(journals,"humor"),
    avgSmoke:avg(journals,"fumar"),
    weightChange:Number(latest)-Number(first),
    a:save.workouts.filter(w=>w.key==="A").length,
    b:save.workouts.filter(w=>w.key==="B").length,
    c:save.workouts.filter(w=>w.key==="C").length,
  };
}
function backupDue(){
  if(!save.backupMeta?.lastBackup)return true;
  return daysBetween(new Date(save.backupMeta.lastBackup+"T12:00:00"),new Date())>=7;
}

function defaultSave(){
  return {
    version:1,
    profile:{nome:"Régis",altura:1.68,pesoInicial:120,metaPeso:110,dataInicio:today(),duracao:45},
    days:{},
    measurements:[],
    workouts:[],
    journals:{},
    achievements:{},
    backupMeta:{lastBackup:null},
    settings:{lastSeenVersion:"1.4.0"},
    activeWorkout:null
  };
}
function load(){
  try{
    const raw=localStorage.getItem(STORAGE_KEY);
    return raw?normalizeSave(JSON.parse(raw)):defaultSave();
  }catch(e){return defaultSave();}
}
let save=load();
let screen="painel";
let moreTab="diario";
let timerId=null;
let timerValue=null;
let toastTimer=null;

function persist(msg="Salvo no aparelho"){
  localStorage.setItem(STORAGE_KEY,JSON.stringify(save));
  evaluateAchievements(true);
  showToast(msg);
}
function dayRecord(){
  const d=today();
  if(!save.days[d]) save.days[d]={xp:0};
  return save.days[d];
}
function daysBetween(a,b){return Math.floor((b-a)/86400000);}
function currentDay(){
  const start=new Date(save.profile.dataInicio+"T12:00:00");
  return Math.max(1,Math.min(45,daysBetween(start,new Date())+1));
}
function totalXP(){return Object.values(save.days).reduce((a,d)=>a+(d.xp||0),0);}
function totalTrainings(){return save.workouts.length;}
function levelFromXP(xp){
  let level=1,spent=0,needed=500;
  while(xp>=spent+needed){spent+=needed;level++;needed=500+(level-1)*250;}
  return {level,current:xp-spent,needed};
}
function latestWeight(){return save.measurements[0]?.peso??save.profile.pesoInicial;}
function showToast(msg){
  const old=document.querySelector(".toast"); if(old) old.remove();
  const t=document.createElement("div"); t.className="toast"; t.textContent=msg; document.body.appendChild(t);
  clearTimeout(toastTimer); toastTimer=setTimeout(()=>t.remove(),1800);
}
function esc(s=""){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]));}
function appShell(content){
  const nav=[["painel","⌂","Painel"],["missoes","✓","Missões"],["treinos","▲","Treinos"],["progresso","↗","Progresso"],["mais","•••","Mais"]];
  return `<main class="app-shell">${content}</main>
  <nav class="nav"><div class="nav-inner">${nav.map(([k,i,l])=>`<button data-screen="${k}" class="${screen===k?"active":""}"><span class="icon">${i}</span>${l}</button>`).join("")}</div></nav>`;
}
function stat(label,value,sub){return `<div class="stat"><div class="eyebrow">${label}</div><div class="stat-value">${value}</div><div class="muted">${sub}</div></div>`;}
function render(){
  let html="";
  if(screen==="painel") html=dashboard();
  if(screen==="missoes") html=missions();
  if(screen==="treinos") html=workoutList();
  if(screen==="progresso") html=progress();
  if(screen==="mais") html=more();
  document.getElementById("app").innerHTML=appShell(html)+(save.activeWorkout?workoutModal():"")+(timerValue!==null?timerModal():"");
  bind();
}
function dashboard(){
  const day=currentDay(), xp=totalXP(), lv=levelFromXP(xp), week=Math.min(7,Math.ceil(day/7)), boss=BOSSES[week-1];
  return `<div class="topbar"><div><div class="eyebrow">Projeto Fênix</div><h1>Olá, ${esc(save.profile.nome)}</h1><p class="muted">Dia ${day} de 45 • Disciplina é motivação com crachá.</p></div></div>
  <div class="campaign-streaks"><div><span>🚭 Sem cigarro</span><strong>${missionStats("sem_cigarro").current} dias</strong></div><div><span>🍬 Sem doces</span><strong>${missionStats("sem_doces").current} dias</strong></div></div><div class="grid">
    ${stat("NÍVEL",lv.level,`${lv.current}/${lv.needed} XP`)}
    ${stat("PESO",`${Number(latestWeight()).toFixed(1)} kg`,`Meta ${save.profile.metaPeso} kg`)}
    ${stat("TREINOS",totalTrainings(),"concluídos")}
    ${stat("CAMPANHA",`${Math.round(day/45*100)}%`,`${45-day} dias restantes`)}
  </div>
  <section class="card install-note"><div class="eyebrow">Instalação no iPhone</div><h2>Use “Adicionar à Tela de Início”</h2><p class="muted">Abra esta página no Safari, toque em Compartilhar e depois em Adicionar à Tela de Início.</p></section>
  <section class="card"><div class="eyebrow">Próxima missão principal</div><h2>Treino ${nextWorkoutKey()} • ${WORKOUTS[nextWorkoutKey()].title.split("•")[1]}</h2><p>A rotação segue o último treino concluído. Faltar um dia não pula a sequência.</p><button class="primary full" data-start-workout="${nextWorkoutKey()}">INICIAR TREINO ${nextWorkoutKey()}</button></section>
  ${backupDue()?`<section class="card backup-warning"><div class="eyebrow">Proteção do save</div><h2>Backup recomendado</h2><p class="muted">Seu último backup tem mais de sete dias ou ainda não existe.</p><button class="secondary full" data-go-backup>ABRIR BACKUP</button></section>`:""}
  <section class="card"><div class="eyebrow">Boss da semana ${week}</div><h2>${boss[0]}</h2><p class="muted">${boss[1]}</p></section>
  <section class="card"><div class="eyebrow">Campanha</div><div class="progress-track"><div class="progress-bar" style="width:${day/45*100}%"></div></div></section>`;
}
function missions(){
  const d=dayRecord(),recent=recentMissionDays(14);
  return `<h1>Missões do dia</h1>
  <p class="muted">${formatDate(today())} • Uma ficha nova é criada automaticamente a cada dia.</p>
  <section class="quest-date-card"><div><div class="eyebrow">Progresso de hoje</div><strong>${completedMissionCount(d)} de ${MISSIONS.length} missões</strong></div><span class="badge ${completedMissionCount(d)===MISSIONS.length?"good":"warn"}">${d.xp||0} XP</span></section>
  ${MISSIONS.map(([k,l,xp])=>`<button class="mission ${d[k]?"done":""}" data-mission="${k}" data-xp="${xp}"><span class="check">${d[k]?"✓":""}</span><span class="grow" style="text-align:left"><strong>${l}</strong><br><span class="muted">+${xp} XP • sequência: ${missionStats(k).current} dia(s)</span></span></button>`).join("")}
  <section class="card"><div class="eyebrow">Estatísticas da campanha</div><h2>Sequências e totais</h2><div class="quest-stats-grid">
    ${questStat("🚭","Sem cigarro",missionStats("sem_cigarro"))}
    ${questStat("🍬","Sem doces",missionStats("sem_doces"))}
    ${questStat("🏋️","Treinos",missionStats("treino"))}
    ${questStat("💧","Água",missionStats("agua"))}
  </div><div class="perfect-days"><span>Dias perfeitos</span><strong>${perfectDays()}</strong></div></section>
  <section class="card"><div class="eyebrow">Histórico diário</div><h2>Últimos 14 dias</h2><div class="quest-calendar">${recent.map(([iso,day])=>{const c=completedMissionCount(day),state=!day?"empty":c===MISSIONS.length?"perfect":c>0?"partial":"failed";return `<div class="quest-day ${state}"><span>${iso.slice(8)}</span><strong>${c}</strong></div>`;}).join("")}</div>
  <div class="quest-legend"><span><i class="perfect"></i> Completo</span><span><i class="partial"></i> Parcial</span><span><i class="empty"></i> Sem registro</span></div></section>`;
}
function questStat(icon,label,s){return `<div class="quest-stat"><span class="quest-stat-icon">${icon}</span><strong>${label}</strong><small>Atual: ${s.current}</small><small>Melhor: ${s.best}</small><small>Total: ${s.total}</small></div>`;}
function workoutList(){
  return `<h1>Treinos ABC</h1><p class="muted">Máquinas, variações e zero barra fixa. Academia cheia não ganha por W.O.</p>
  <section class="next-workout"><div><div class="eyebrow">Rotação automática</div><strong>Próximo sugerido: Treino ${nextWorkoutKey()}</strong></div><span class="badge good">ABC contínuo</span></section>
  ${Object.entries(WORKOUTS).map(([k,w])=>`<section class="card"><div class="eyebrow">Treino ${k}</div><h2>${w.title}</h2><p class="muted">${w.exercises.length} exercícios • ${w.exercises.reduce((a,e)=>a+e[1],0)} séries</p><button class="primary full" data-start-workout="${k}">INICIAR</button></section>`).join("")}`;
}
function workoutModal(){
  const aw=save.activeWorkout,w=WORKOUTS[aw.key];
  return `<div class="modal"><div class="modal-head"><button class="secondary" data-close-workout>Fechar</button><strong>Treino ${aw.key}</strong><button class="primary" data-finish-workout>Salvar</button></div>
  <main class="app-shell" style="padding-top:0"><h1>${w.title}</h1>
  ${aw.logs.map((log,i)=>`<section class="card"><h2>${i+1}. ${log.name}</h2><p>${log.sets} séries • ${log.target} reps • descanso ${log.rest}s • RIR alvo 2–3</p><p class="muted">Variações: ${log.variants.join(" • ")}</p>
  ${lastExerciseLog(log.name)?`<div class="last-load"><span>Último: ${lastExerciseLog(log.name).load||0} kg • ${lastExerciseLog(log.name).reps||"—"} • RIR ${lastExerciseLog(log.name).rir}</span><strong>${progressionSuggestion(lastExerciseLog(log.name))}</strong></div>`:""}
  <div class="row wrap"><input class="input" style="flex:1 1 110px" data-log="${i}" data-field="load" value="${esc(log.load)}" placeholder="Carga kg" inputmode="decimal"><input class="input" style="flex:1 1 130px" data-log="${i}" data-field="reps" value="${esc(log.reps)}" placeholder="12/11/10"><input class="input" style="flex:1 1 90px" data-log="${i}" data-field="rir" value="${esc(log.rir)}" placeholder="RIR" inputmode="numeric"></div>
  <div class="row"><button class="secondary grow" data-rest="${log.rest}">Descanso ${log.rest}s</button><button class="${log.done?"primary":"secondary"} grow" data-done="${i}">${log.done?"✓ Feito":"Marcar feito"}</button></div></section>`).join("")}
  <button class="primary full" data-finish-workout>FINALIZAR TREINO</button></main></div>`;
}
function timerModal(){
  return `<div class="timer-overlay"><div class="timer-card"><div class="eyebrow">Descanso</div><div class="timer-num">${timerValue===0?"VAI!":timerValue}</div><div class="row"><button class="secondary grow" data-plus-timer>+30s</button><button class="primary grow" data-close-timer>Fechar</button></div></div></div>`;
}
function progress(){
  return `<h1>Progresso</h1><p class="muted">Registre uma vez por semana, nas mesmas condições.</p>
  <section class="card"><input id="peso" class="input" placeholder="Peso em kg" inputmode="decimal"><input id="cintura" class="input" placeholder="Cintura em cm" inputmode="decimal"><button class="primary full" data-save-measure>REGISTRAR</button></section>
  <h2>Histórico</h2>${save.measurements.length?save.measurements.map(m=>`<div class="history-row"><strong>${m.data}</strong><div class="muted">${m.peso} kg${m.cintura?` • ${m.cintura} cm`:""}</div></div>`).join(""):`<p class="muted">Nenhuma medição ainda.</p>`}`;
}
function more(){
  const tabs=[["diario","Diário"],["estatisticas","Estatísticas"],["calendario","Calendário"],["cargas","Cargas"],["conquistas","Conquistas"],["historico","Histórico"],["perfil","Perfil"],["backup","Backup"]];
  let content="";
  if(moreTab==="diario") content=journal();
  if(moreTab==="estatisticas") content=statistics();
  if(moreTab==="calendario") content=calendar45();
  if(moreTab==="cargas") content=loads();
  if(moreTab==="conquistas") content=achievements();
  if(moreTab==="historico") content=history();
  if(moreTab==="perfil") content=profileForm();
  if(moreTab==="backup") content=backup();
  return `<h1>Central</h1><div class="pills">${tabs.map(([k,l])=>`<button class="pill ${moreTab===k?"active":""}" data-tab="${k}">${l}</button>`).join("")}</div>${content}`;
}
function journal(){
  const j=save.journals[today()]||{energia:5,humor:5,fumar:0,doce:0,sono:"",obs:""};
  const registros=Object.entries(save.journals)
    .sort((a,b)=>b[0].localeCompare(a[0]))
    .slice(0,7);

  const status=diaryStatus(j);
  return `<section class="card diary-card">
    <div class="row">
      <div class="grow">
        <div class="eyebrow">Relatório diário</div>
        <h2>Diário de bordo</h2>
        <p class="muted">${formatDate(today())} • Dia ${currentDay()} de 45</p>
      </div>
      <span class="badge ${save.journals[today()]?"good":"warn"}">${save.journals[today()]?"Salvo hoje":"Novo registro"}</span>
    </div>

    <div class="diary-block">
      <label class="diary-label" for="j-energia">Energia</label>
      <p class="diary-help">Como seu corpo respondeu hoje?</p>
      <div class="diary-scale-head"><span>0 • Exausto</span><strong id="v-energia">${j.energia}</strong><span>10 • Ligado no 220</span></div>
      <input id="j-energia" class="range-red" type="range" min="0" max="10" step="1" value="${j.energia}" data-output="v-energia">
    </div>

    <div class="diary-block">
      <label class="diary-label" for="j-humor">Humor</label>
      <p class="diary-help">Como você passou a maior parte do dia?</p>
      <div class="diary-scale-head"><span>0 • Péssimo</span><strong id="v-humor">${j.humor}</strong><span>10 • Excelente</span></div>
      <input id="j-humor" class="range-red" type="range" min="0" max="10" step="1" value="${j.humor}" data-output="v-humor">
    </div>

    <div class="diary-block">
      <label class="diary-label" for="j-fumar">Fissura por cigarro</label>
      <p class="diary-help">Em algum momento você teve vontade de fumar?</p>
      <div class="diary-scale-head"><span>0 • Nem lembrei</span><strong id="v-fumar">${j.fumar}</strong><span>10 • Quase cedi</span></div>
      <input id="j-fumar" class="range-red" type="range" min="0" max="10" step="1" value="${j.fumar}" data-output="v-fumar">
    </div>

    <div class="diary-block">
      <label class="diary-label" for="j-doce">Vontade de doce</label>
      <p class="diary-help">O açúcar tentou negociar com você hoje?</p>
      <div class="diary-scale-head"><span>0 • Nenhuma</span><strong id="v-doce">${j.doce}</strong><span>10 • Muito forte</span></div>
      <input id="j-doce" class="range-red" type="range" min="0" max="10" step="1" value="${j.doce}" data-output="v-doce">
    </div>

    <div class="diary-block">
      <label class="diary-label" for="j-sono">Sono</label>
      <p class="diary-help">Quantas horas você realmente dormiu?</p>
      <input id="j-sono" class="input" value="${j.sono}" placeholder="Ex.: 6,5" inputmode="decimal">
    </div>

    <div class="diary-block">
      <label class="diary-label" for="j-obs">Relatório do dia</label>
      <p class="diary-help">O que aconteceu? Vale registrar dificuldades, vitórias, cargas e gatilhos.</p>
      <textarea id="j-obs" class="input diary-textarea" placeholder="Ex.: Quase fumei depois do trabalho, mas fui treinar. Aumentei 5 kg no supino.">${esc(j.obs)}</textarea>
    </div>

    <button class="primary full" data-save-journal>${save.journals[today()]?"ATUALIZAR DIÁRIO":"SALVAR DIÁRIO"}</button>
  </section>

  ${save.journals[today()]?`
  <section class="card diary-summary">
    <div class="eyebrow">Resumo automático</div>
    <h2>${status.title}</h2>
    <p>${status.text}</p>
    <div class="diary-summary-grid">
      <div><span>Energia</span><strong>${j.energia}</strong></div>
      <div><span>Humor</span><strong>${j.humor}</strong></div>
      <div><span>Fissura</span><strong>${j.fumar}</strong></div>
      <div><span>Doces</span><strong>${j.doce}</strong></div>
      <div><span>Sono</span><strong>${j.sono||"—"}h</strong></div>
    </div>
  </section>`:""}

  <section class="card">
    <div class="eyebrow">Histórico recente</div>
    <h2>Últimos registros</h2>
    ${registros.length?registros.map(([data,r])=>{
      const s=diaryStatus(r);
      return `<details class="diary-history">
        <summary><span><strong>${formatDate(data)}</strong><small>${s.title}</small></span><span class="badge">${r.energia}/10</span></summary>
        <div class="diary-history-body">
          <p><strong>Energia:</strong> ${r.energia} • <strong>Humor:</strong> ${r.humor}</p>
          <p><strong>Fissura:</strong> ${r.fumar} • <strong>Doces:</strong> ${r.doce} • <strong>Sono:</strong> ${r.sono||"—"}h</p>
          ${r.obs?`<p class="diary-note">${esc(r.obs)}</p>`:""}
        </div>
      </details>`;
    }).join(""):`<p class="muted">Nenhum diário salvo ainda.</p>`}
  </section>`;
}

function formatDate(iso){
  const [y,m,d]=iso.split("-");
  return `${d}/${m}/${y}`;
}
function diaryStatus(j){
  const energia=Number(j.energia||0), humor=Number(j.humor||0), fumar=Number(j.fumar||0), doce=Number(j.doce||0), sono=Number(j.sono||0);
  const base=(energia+humor)/2;
  const pressao=(fumar+doce)/2;
  if(humor<=3 || energia<=2 || fumar>=9) return {title:"Zona crítica",text:"O dia exigiu bastante. Reduza a pressão, evite gatilhos e trate amanhã como uma nova rodada, não como continuação do dano."};
  if(pressao>=7 || sono>0 && sono<5) return {title:"Atenção elevada",text:"Fissuras ou sono baixo aumentaram o risco de decisões impulsivas. Deixe o próximo passo simples e previsível."};
  if(base>=8 && pressao<=3) return {title:"Dia forte",text:"Energia e humor altos, com pouca pressão de cigarro e doce. Bom terreno para consolidar a rotina."};
  if(base>=6 && pressao<=5) return {title:"Estável",text:"O dia ficou sob controle. Não precisa ser épico para contar como avanço."};
  return {title:"Dia oscilante",text:"Houve desgaste, mas o registro permite enxergar o padrão. Ajuste o próximo dia sem transformar dificuldade em sentença."};
}
function achievements(){
  evaluateAchievements(false);
  const unlocked=ACHIEVEMENTS.filter(([code])=>save.achievements[code]).length;
  return `<section class="card"><div class="eyebrow">Inventário</div><h2>${unlocked} de ${ACHIEVEMENTS.length} conquistas</h2><div class="progress-track"><div class="progress-bar" style="width:${unlocked/ACHIEVEMENTS.length*100}%"></div></div></section>
  ${ACHIEVEMENTS.map(([code,title,desc])=>{const u=save.achievements[code];return `<div class="achievement-card ${u?"unlocked":""}"><span class="achievement-icon">${u?"🏆":"🔒"}</span><div class="grow"><strong>${title}</strong><p class="muted">${desc}</p>${u?`<small>Desbloqueada em ${formatDate(u.date)}</small>`:""}</div></div>`;}).join("")}`;
}

function statistics(){
  const s=campaignStats();
  return `<section class="card"><div class="eyebrow">Campanha em números</div><h2>Estatísticas gerais</h2>
    <div class="analytics-grid">
      ${metric("Missões",s.completion+"%","concluídas")}
      ${metric("Peso",`${s.weightChange>0?"+":""}${s.weightChange.toFixed(1)} kg`,"desde o início")}
      ${metric("Sono",s.avgSleep.toFixed(1)+"h","média")}
      ${metric("Energia",s.avgEnergy.toFixed(1)+"/10","média")}
      ${metric("Humor",s.avgMood.toFixed(1)+"/10","média")}
      ${metric("Fissura",s.avgSmoke.toFixed(1)+"/10","média")}
    </div>
  </section>
  <section class="card"><div class="eyebrow">Distribuição de treinos</div><h2>Rotação ABC</h2>
    <div class="abc-bars">
      ${abcBar("A",s.a,totalTrainings())}${abcBar("B",s.b,totalTrainings())}${abcBar("C",s.c,totalTrainings())}
    </div>
  </section>
  <section class="card"><div class="eyebrow">Hábitos</div><h2>Sequências principais</h2>
    <div class="analytics-grid">
      ${metric("Sem cigarro",missionStats("sem_cigarro").current,"sequência atual")}
      ${metric("Recorde cigarro",missionStats("sem_cigarro").best,"melhor sequência")}
      ${metric("Sem doces",missionStats("sem_doces").current,"sequência atual")}
      ${metric("Recorde doces",missionStats("sem_doces").best,"melhor sequência")}
    </div>
  </section>`;
}
function metric(label,value,sub){return `<div class="metric"><span>${label}</span><strong>${value}</strong><small>${sub}</small></div>`;}
function abcBar(key,count,total){
  const pct=total?Math.round(count/total*100):0;
  return `<div class="abc-row"><strong>${key}</strong><div class="abc-track"><i style="width:${pct}%"></i></div><span>${count}</span></div>`;
}
function calendar45(){
  const rows=campaignDays();
  return `<section class="card"><div class="eyebrow">Mapa da campanha</div><h2>Os 45 dias</h2><p class="muted">Toque em um dia para abrir os detalhes registrados.</p>
    <div class="calendar45">${rows.map(r=>{const count=completedMissionCount(r.day),state=!r.day?"empty":count===MISSIONS.length?"perfect":count>0?"partial":"failed";return `<button class="campaign-day ${state}" data-campaign-day="${r.date}"><small>${r.number}</small><strong>${r.date.slice(8)}</strong><span>${count}/${MISSIONS.length}</span></button>`;}).join("")}</div>
  </section><div id="day-detail"></div>`;
}
function dayDetail(iso){
  const r=campaignDays().find(x=>x.date===iso);if(!r)return "";
  const d=r.day||{};
  return `<section class="card day-detail-card"><div class="row"><div class="grow"><div class="eyebrow">Dia ${r.number}</div><h2>${formatDate(iso)}</h2></div><button class="secondary" data-close-day>Fechar</button></div>
    <p><strong>Missões:</strong> ${completedMissionCount(d)}/${MISSIONS.length} • <strong>XP:</strong> ${d.xp||0}</p>
    <div class="day-tags">${MISSIONS.map(([k,l])=>`<span class="${d[k]?"on":""}">${d[k]?"✓":"○"} ${l}</span>`).join("")}</div>
    <p><strong>Treinos:</strong> ${r.workouts.length?r.workouts.map(w=>w.key).join(", "):"nenhum"}</p>
    <p><strong>Diário:</strong> ${r.journal?`energia ${r.journal.energia}, humor ${r.journal.humor}, sono ${r.journal.sono||"—"}h`:"não preenchido"}</p>
    <p><strong>Medição:</strong> ${r.measurements.length?r.measurements.map(m=>`${m.peso} kg`).join(", "):"nenhuma"}</p>
  </section>`;
}
function loads(){
  const names=[...new Set(Object.values(WORKOUTS).flatMap(w=>w.exercises.map(e=>e[0])))];
  return `<section class="card"><div class="eyebrow">Progressão</div><h2>Cargas por exercício</h2><p class="muted">A sugestão usa sua última carga, média de repetições e RIR registrado.</p></section>
  ${names.map(name=>{const last=lastExerciseLog(name),hist=exerciseHistory(name);return `<details class="load-card"><summary><div class="grow"><strong>${name}</strong><small>${last?`${last.load||0} kg • ${last.reps||"sem reps"} • RIR ${last.rir}`:"sem histórico"}</small></div><span class="badge ${last?"good":""}">${progressionSuggestion(last)}</span></summary>
  <div class="load-history">${hist.slice(0,6).map(x=>`<div><span>${formatDate(x.date)}</span><strong>${x.load||0} kg</strong><small>${x.reps||"—"} • RIR ${x.rir}</small></div>`).join("")||`<p class="muted">Conclua esse exercício para criar o histórico.</p>`}</div></details>`;}).join("")}`;
}

function history(){
  return save.workouts.length?save.workouts.map(h=>`<div class="history-row"><strong>${h.data} • Treino ${h.key}</strong><div class="muted">${h.duration} min • concluído</div></div>`).join(""):`<p class="muted">Nenhum treino registrado.</p>`;
}
function profileForm(){
  const p=save.profile;
  return `<section class="card"><h2>Perfil da campanha</h2><input id="p-nome" class="input" value="${esc(p.nome)}" placeholder="Nome"><input id="p-altura" class="input" value="${p.altura}" placeholder="Altura" inputmode="decimal"><input id="p-inicial" class="input" value="${p.pesoInicial}" placeholder="Peso inicial" inputmode="decimal"><input id="p-meta" class="input" value="${p.metaPeso}" placeholder="Meta de peso" inputmode="decimal"><input id="p-data" class="input" value="${p.dataInicio}" placeholder="AAAA-MM-DD"><button class="primary full" data-save-profile>SALVAR PERFIL</button></section>`;
}
function backup(){
  const last=save.backupMeta?.lastBackup;
  return `<section class="card"><div class="eyebrow">Proteção do save</div><h2>Backup local</h2>
  <p class="muted">${last?`Último backup registrado em ${formatDate(last)}.`:"Você ainda não registrou nenhum backup."}</p>
  <div class="backup-health ${backupDue()?"warn":"good"}"><strong>${backupDue()?"Backup recomendado":"Save protegido"}</strong><span>${backupDue()?"Exporte uma cópia agora.":"Próxima revisão em até sete dias."}</span></div>
  <button class="primary full" data-export>EXPORTAR BACKUP</button>
  <label class="secondary full" style="display:block;text-align:center;margin-top:10px">IMPORTAR BACKUP<input id="import-file" type="file" accept=".json,application/json" hidden></label>
  <button class="secondary full" data-copy-save>COPIAR SAVE COMO TEXTO</button></section>
  <section class="card"><div class="eyebrow">Diagnóstico</div><h2>Versão e armazenamento</h2><p class="muted">Versão ${APP_VERSION} • ${Object.keys(save.days).length} dias registrados • ${save.workouts.length} treinos • ${save.measurements.length} medições.</p></section>
  <section class="card"><h2>Zona de perigo</h2><p class="muted">Apaga todos os dados deste aparelho.</p><button class="danger full" data-reset>APAGAR TODO O SAVE</button></section>`;
}
function bind(){
  document.querySelectorAll(".range-red").forEach(r=>r.oninput=()=>{
    const out=document.getElementById(r.dataset.output);
    if(out) out.textContent=r.value;
  });

  document.querySelectorAll("[data-screen]").forEach(b=>b.onclick=()=>{screen=b.dataset.screen;render();});
  document.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>{screen=b.dataset.go;render();});
  document.querySelectorAll("[data-tab]").forEach(b=>b.onclick=()=>{moreTab=b.dataset.tab;render();});
  document.querySelectorAll("[data-mission]").forEach(b=>b.onclick=()=>{
    const d=dayRecord(),k=b.dataset.mission,xp=Number(b.dataset.xp),next=!d[k]; d[k]=next; d.xp=Math.max(0,(d.xp||0)+(next?xp:-xp)); persist(); render();
  });
  document.querySelectorAll("[data-start-workout]").forEach(b=>b.onclick=()=>{
    const key=b.dataset.startWorkout;
    save.activeWorkout={key,started:Date.now(),logs:WORKOUTS[key].exercises.map(e=>({name:e[0],sets:e[1],target:e[2],rest:e[3],variants:e[4],load:"",reps:"",rir:"2",done:false}))};
    persist("Treino iniciado"); render();
  });
  document.querySelectorAll("[data-log]").forEach(i=>i.oninput=()=>{save.activeWorkout.logs[Number(i.dataset.log)][i.dataset.field]=i.value; localStorage.setItem(STORAGE_KEY,JSON.stringify(save));});
  document.querySelectorAll("[data-done]").forEach(b=>b.onclick=()=>{const i=Number(b.dataset.done);save.activeWorkout.logs[i].done=!save.activeWorkout.logs[i].done;persist();render();});
  document.querySelectorAll("[data-rest]").forEach(b=>b.onclick=()=>startTimer(Number(b.dataset.rest)));
  document.querySelectorAll("[data-finish-workout]").forEach(b=>b.onclick=finishWorkout);
  const close=document.querySelector("[data-close-workout]"); if(close) close.onclick=()=>{if(confirm("Fechar o treino? O rascunho continuará salvo.")){render();}};
  const plus=document.querySelector("[data-plus-timer]"); if(plus) plus.onclick=()=>{timerValue=(timerValue||0)+30;render();};
  const ct=document.querySelector("[data-close-timer]"); if(ct) ct.onclick=closeTimer;
  const sm=document.querySelector("[data-save-measure]"); if(sm) sm.onclick=saveMeasure;
  const sj=document.querySelector("[data-save-journal]"); if(sj) sj.onclick=saveJournal;
  const sp=document.querySelector("[data-save-profile]"); if(sp) sp.onclick=saveProfile;
  const ex=document.querySelector("[data-export]"); if(ex) ex.onclick=exportBackup;
  const imp=document.getElementById("import-file"); if(imp) imp.onchange=importBackup;
  const reset=document.querySelector("[data-reset]"); if(reset) reset.onclick=resetAll;
  const copy=document.querySelector("[data-copy-save]"); if(copy) copy.onclick=async()=>{try{await navigator.clipboard.writeText(JSON.stringify({version:APP_VERSION,save},null,2));showToast("Save copiado");}catch{alert("Não foi possível copiar automaticamente.");}};
  document.querySelectorAll("[data-campaign-day]").forEach(b=>b.onclick=()=>{const box=document.getElementById("day-detail");box.innerHTML=dayDetail(b.dataset.campaignDay);box.scrollIntoView({behavior:"smooth"});const c=box.querySelector("[data-close-day]");if(c)c.onclick=()=>box.innerHTML="";});
  const gb=document.querySelector("[data-go-backup]");if(gb)gb.onclick=()=>{screen="mais";moreTab="backup";render();};
}
function finishWorkout(){
  const aw=save.activeWorkout;if(!aw.logs.some(x=>x.done)){alert("Marque ao menos um exercício concluído.");return;}
  save.workouts.unshift({data:today(),key:aw.key,duration:Math.max(1,Math.round((Date.now()-aw.started)/60000)),logs:aw.logs});
  const d=dayRecord();if(!d.treino){d.treino=true;d.xp=(d.xp||0)+100;}
  save.activeWorkout=null;screen="painel";persist("Treino salvo • +100 XP");render();
}
function startTimer(sec){
  clearInterval(timerId);timerValue=sec;render();
  timerId=setInterval(()=>{timerValue--;if(timerValue<=0){clearInterval(timerId);timerValue=0;if(navigator.vibrate)navigator.vibrate([200,100,200]);}render();},1000);
}
function closeTimer(){clearInterval(timerId);timerValue=null;render();}
function num(v){return Number(String(v).replace(",","."));}
function saveMeasure(){
  const peso=num(document.getElementById("peso").value),c=document.getElementById("cintura").value;
  if(!peso){alert("Informe o peso.");return;}
  save.measurements.unshift({id:Date.now(),data:today(),peso,cintura:c?num(c):null});persist("Medição salva");render();
}
function saveJournal(){
  save.journals[today()]={energia:num(jv("j-energia")),humor:num(jv("j-humor")),fumar:num(jv("j-fumar")),doce:num(jv("j-doce")),sono:num(jv("j-sono")),obs:jv("j-obs")};persist("Diário salvo");render();
}
function jv(id){return document.getElementById(id).value;}
function saveProfile(){
  save.profile={...save.profile,nome:jv("p-nome")||"Régis",altura:num(jv("p-altura")),pesoInicial:num(jv("p-inicial")),metaPeso:num(jv("p-meta")),dataInicio:jv("p-data")};persist("Perfil salvo");render();
}
function exportBackup(){
  save.backupMeta={lastBackup:today()};
  localStorage.setItem(STORAGE_KEY,JSON.stringify(save));
  const payload={app:"Projeto Fênix",version:APP_VERSION,exportedAt:new Date().toISOString(),save};
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");
  a.href=url;a.download=`fenix-backup-v${APP_VERSION}-${today()}.json`;a.click();URL.revokeObjectURL(url);showToast("Backup exportado");render();
}
function importBackup(e){
  const file=e.target.files[0];if(!file)return;
  const r=new FileReader();
  r.onload=()=>{try{
    const parsed=JSON.parse(r.result);
    const incoming=parsed.save||parsed;
    if(!incoming.profile||!incoming.days||!incoming.workouts)throw new Error("estrutura");
    if(!confirm(`Importar backup e substituir o save atual?

Dias: ${Object.keys(incoming.days).length}
Treinos: ${incoming.workouts.length}`))return;
    save=normalizeSave(incoming);persist("Backup importado");render();
  }catch{alert("Arquivo de backup inválido ou incompatível.");}};
  r.readAsText(file);
}
function resetAll(){if(confirm("Apagar todo o save? Esta ação não pode ser desfeita.")){save=defaultSave();persist("Save reiniciado");render();}}
let renderedDate=today();
render();
setInterval(()=>{const now=today();if(now!==renderedDate){renderedDate=now;render();showToast("Novo dia iniciado • missões renovadas");}},60000);
document.addEventListener("visibilitychange",()=>{if(!document.hidden&&today()!==renderedDate){renderedDate=today();render();showToast("Novo dia iniciado • missões renovadas");}});
if("serviceWorker" in navigator){
  window.addEventListener("load",async()=>{
    const reg=await navigator.serviceWorker.register("./sw.js");
    reg.addEventListener("updatefound",()=>{
      const worker=reg.installing;
      worker?.addEventListener("statechange",()=>{
        if(worker.state==="installed"&&navigator.serviceWorker.controller){
          const bar=document.createElement("div");
          bar.className="update-banner";
          bar.innerHTML=`<span>Nova versão disponível</span><button>ATUALIZAR</button>`;
          bar.querySelector("button").onclick=()=>location.reload();
          document.body.appendChild(bar);
        }
      });
    });
  });
}
