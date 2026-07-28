
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

function today(){ return new Date().toISOString().slice(0,10); }
function defaultSave(){
  return {
    version:1,
    profile:{nome:"Régis",altura:1.68,pesoInicial:120,metaPeso:110,dataInicio:today(),duracao:45},
    days:{},
    measurements:[],
    workouts:[],
    journals:{},
    achievements:{},
    activeWorkout:null
  };
}
function load(){
  try{
    const raw=localStorage.getItem(STORAGE_KEY);
    return raw?JSON.parse(raw):defaultSave();
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
  <div class="grid">
    ${stat("NÍVEL",lv.level,`${lv.current}/${lv.needed} XP`)}
    ${stat("PESO",`${Number(latestWeight()).toFixed(1)} kg`,`Meta ${save.profile.metaPeso} kg`)}
    ${stat("TREINOS",totalTrainings(),"concluídos")}
    ${stat("CAMPANHA",`${Math.round(day/45*100)}%`,`${45-day} dias restantes`)}
  </div>
  <section class="card install-note"><div class="eyebrow">Instalação no iPhone</div><h2>Use “Adicionar à Tela de Início”</h2><p class="muted">Abra esta página no Safari, toque em Compartilhar e depois em Adicionar à Tela de Início.</p></section>
  <section class="card"><div class="eyebrow">Missão principal</div><h2>Continuar a rotação ABC</h2><p>Abra o treino, registre cargas e conclua apenas o que realmente fez.</p><button class="primary full" data-go="treinos">ABRIR TREINOS</button></section>
  <section class="card"><div class="eyebrow">Boss da semana ${week}</div><h2>${boss[0]}</h2><p class="muted">${boss[1]}</p></section>
  <section class="card"><div class="eyebrow">Campanha</div><div class="progress-track"><div class="progress-bar" style="width:${day/45*100}%"></div></div></section>`;
}
function missions(){
  const d=dayRecord();
  return `<h1>Missões do dia</h1><p class="muted">Marque com honestidade. O aplicativo não é fiscal, é espelho.</p>
  ${MISSIONS.map(([k,l,xp])=>`<button class="mission ${d[k]?"done":""}" data-mission="${k}" data-xp="${xp}">
    <span class="check">${d[k]?"✓":""}</span><span class="grow" style="text-align:left"><strong>${l}</strong><br><span class="muted">+${xp} XP</span></span>
  </button>`).join("")}
  <section class="card"><h2>XP de hoje: ${d.xp||0}</h2><p class="muted">Cada alteração é salva automaticamente neste aparelho.</p></section>`;
}
function workoutList(){
  return `<h1>Treinos ABC</h1><p class="muted">Máquinas, variações e zero barra fixa. Academia cheia não ganha por W.O.</p>
  ${Object.entries(WORKOUTS).map(([k,w])=>`<section class="card"><div class="eyebrow">Treino ${k}</div><h2>${w.title}</h2><p class="muted">${w.exercises.length} exercícios • ${w.exercises.reduce((a,e)=>a+e[1],0)} séries</p><button class="primary full" data-start-workout="${k}">INICIAR</button></section>`).join("")}`;
}
function workoutModal(){
  const aw=save.activeWorkout,w=WORKOUTS[aw.key];
  return `<div class="modal"><div class="modal-head"><button class="secondary" data-close-workout>Fechar</button><strong>Treino ${aw.key}</strong><button class="primary" data-finish-workout>Salvar</button></div>
  <main class="app-shell" style="padding-top:0"><h1>${w.title}</h1>
  ${aw.logs.map((log,i)=>`<section class="card"><h2>${i+1}. ${log.name}</h2><p>${log.sets} séries • ${log.target} reps • descanso ${log.rest}s • RIR alvo 2–3</p><p class="muted">Variações: ${log.variants.join(" • ")}</p>
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
  const tabs=[["diario","Diário"],["conquistas","Conquistas"],["historico","Histórico"],["perfil","Perfil"],["backup","Backup"]];
  let content="";
  if(moreTab==="diario") content=journal();
  if(moreTab==="conquistas") content=achievements();
  if(moreTab==="historico") content=history();
  if(moreTab==="perfil") content=profileForm();
  if(moreTab==="backup") content=backup();
  return `<h1>Central</h1><div class="pills">${tabs.map(([k,l])=>`<button class="pill ${moreTab===k?"active":""}" data-tab="${k}">${l}</button>`).join("")}</div>${content}`;
}
function journal(){
  const j=save.journals[today()]||{energia:5,humor:5,fumar:0,doce:0,sono:"",obs:""};
  return `<section class="card"><div class="row"><h2 class="grow">Diário de bordo</h2><span class="badge ${save.journals[today()]?"good":"warn"}">${save.journals[today()]?"Salvo hoje":"Novo registro"}</span></div>
  <input id="j-energia" class="input" value="${j.energia}" placeholder="Energia 0–10" inputmode="numeric"><input id="j-humor" class="input" value="${j.humor}" placeholder="Humor 0–10" inputmode="numeric"><input id="j-fumar" class="input" value="${j.fumar}" placeholder="Vontade de fumar 0–10" inputmode="numeric"><input id="j-doce" class="input" value="${j.doce}" placeholder="Vontade de doce 0–10" inputmode="numeric"><input id="j-sono" class="input" value="${j.sono}" placeholder="Horas de sono" inputmode="decimal"><textarea id="j-obs" class="input" placeholder="Observação do dia">${esc(j.obs)}</textarea><button class="primary full" data-save-journal>SALVAR DIÁRIO</button></section>`;
}
function achievements(){
  const lv=levelFromXP(totalXP()).level;
  const list=[
    [totalTrainings()>=1,"Primeira Gota","Conclua o primeiro treino."],
    [totalTrainings()>=10,"Engrenagem","Complete 10 treinos."],
    [lv>=5,"Ascensão","Alcance o nível 5."],
    [currentDay()>=45,"Fênix","Chegue ao 45º dia da campanha."]
  ];
  return list.map(([u,t,d])=>`<div class="history-row"><strong>${u?"🏆":"🔒"} ${t}</strong><div class="muted">${d}</div></div>`).join("");
}
function history(){
  return save.workouts.length?save.workouts.map(h=>`<div class="history-row"><strong>${h.data} • Treino ${h.key}</strong><div class="muted">${h.duration} min • concluído</div></div>`).join(""):`<p class="muted">Nenhum treino registrado.</p>`;
}
function profileForm(){
  const p=save.profile;
  return `<section class="card"><h2>Perfil da campanha</h2><input id="p-nome" class="input" value="${esc(p.nome)}" placeholder="Nome"><input id="p-altura" class="input" value="${p.altura}" placeholder="Altura" inputmode="decimal"><input id="p-inicial" class="input" value="${p.pesoInicial}" placeholder="Peso inicial" inputmode="decimal"><input id="p-meta" class="input" value="${p.metaPeso}" placeholder="Meta de peso" inputmode="decimal"><input id="p-data" class="input" value="${p.dataInicio}" placeholder="AAAA-MM-DD"><button class="primary full" data-save-profile>SALVAR PERFIL</button></section>`;
}
function backup(){
  return `<section class="card"><h2>Backup do save</h2><p class="muted">Exporte regularmente e guarde no iCloud Drive, Google Drive ou outro lugar seguro.</p><button class="primary full" data-export>EXPORTAR BACKUP</button><label class="secondary full" style="display:block;text-align:center;margin-top:10px">IMPORTAR BACKUP<input id="import-file" type="file" accept=".json,application/json" hidden></label></section>
  <section class="card"><h2>Zona de perigo</h2><p class="muted">Apaga todos os dados deste aparelho.</p><button class="danger full" data-reset>APAGAR TODO O SAVE</button></section>`;
}
function bind(){
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
  const blob=new Blob([JSON.stringify(save,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=`fenix-backup-${today()}.json`;a.click();URL.revokeObjectURL(url);showToast("Backup exportado");
}
function importBackup(e){
  const file=e.target.files[0];if(!file)return;const r=new FileReader();r.onload=()=>{try{save=JSON.parse(r.result);persist("Backup importado");render();}catch{alert("Arquivo de backup inválido.");}};r.readAsText(file);
}
function resetAll(){if(confirm("Apagar todo o save? Esta ação não pode ser desfeita.")){save=defaultSave();persist("Save reiniciado");render();}}
render();
if("serviceWorker" in navigator){window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js"));}
