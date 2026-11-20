const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const modules = [
  ["dashboard","▦","Dashboard","System overview"],["library","▤","Offline Library","Knowledge archive"],["resources","⇧","Resource Manager","Upload and organize files"],["search","⌕","Search","Local index"],["assistant","▣","AI Assistant","Local AI setup"],["courses","▧","Courses","Learning paths"],["books","▥","Books & Documents","Document vault"],["games","▨","Games & Quizzes","Learning arcade"],["maps","⌖","Offline Maps","Atlas module"],["notes","✎","Notes & Notebooks","Personal log"],["launcher","▦","App Launcher","Program manager"],["settings","⚙","Settings","System config"]
];
function navigate(view){
  $$(".view").forEach(el=>el.classList.toggle("active",el.id===`view-${view}`));
  $$(".nav-item").forEach(el=>el.classList.toggle("active",el.dataset.view===view));
  $("#sidebar").classList.remove("open");
  window.scrollTo({top:0,behavior:"smooth"});
}
$$("[data-view]").forEach(el=>el.addEventListener("click",()=>navigate(el.dataset.view)));
$$("[data-go]").forEach(el=>el.addEventListener("click",()=>navigate(el.dataset.go)));
$("#mobileMenu").addEventListener("click",()=>$("#sidebar").classList.toggle("open"));

function updateClock(){
  const d=new Date();
  $("#clock").textContent=d.toLocaleTimeString([], {hour12:false});
  $("#dateChip").textContent=d.toLocaleDateString([], {weekday:"short",year:"numeric",month:"short",day:"numeric"}).toUpperCase();
}
updateClock();setInterval(updateClock,1000);

// Small local catalog for the starter search experience.
const catalog=[
  {title:"Offline-first computing",type:"REFERENCE",desc:"Design principles for apps that remain useful without a network connection."},
  {title:"The scientific method",type:"COURSE",desc:"Observe, ask questions, form hypotheses, test, and evaluate evidence."},
  {title:"World history timeline",type:"COURSE",desc:"A framework for organizing events, people, and civilizations across time."},
  {title:"Open educational resources",type:"LIBRARY",desc:"Learning and teaching materials that can be openly shared and adapted."},
  {title:"Map data basics",type:"REFERENCE",desc:"Learn about map tiles, vector data, offline atlases, and geographic information."},
  {title:"Computer science foundations",type:"COURSE",desc:"Explore algorithms, data, hardware, software, and networks."},
  {title:"Digital privacy",type:"REFERENCE",desc:"Understand local storage, permissions, backups, and responsible data handling."}
];
function renderSearch(q){
  const target=$("#searchResults");const query=q.trim().toLowerCase();
  if(!query){target.innerHTML='<div class="empty-state">TYPE A QUERY TO SEARCH THE LOCAL INDEX<span class="blink">_</span></div>';return;}
  const notes=loadNotes().map(n=>({title:n.title,type:"YOUR NOTE",desc:n.body.slice(0,180)}));
  const hits=[...catalog,...notes].filter(x=>(x.title+" "+x.type+" "+x.desc).toLowerCase().includes(query));
  target.innerHTML=hits.length?hits.map(x=>`<article class="result-item"><span class="eyebrow">${escapeHTML(x.type)}</span><br><b>${escapeHTML(x.title)}</b><p>${escapeHTML(x.desc)}</p></article>`).join(""):'<div class="empty-state">NO MATCHES IN THE LOCAL INDEX</div>';
}
$("#searchInput").addEventListener("input",e=>renderSearch(e.target.value));
function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}

// Notes are intentionally stored only in this browser.
const NOTE_KEY="mkh_notes_v1";
function loadNotes(){try{return JSON.parse(localStorage.getItem(NOTE_KEY)||"[]")}catch{return []}}
function storeNotes(notes){localStorage.setItem(NOTE_KEY,JSON.stringify(notes))}
function renderNotes(){
  const notes=loadNotes();$("#noteCount").textContent=`${notes.length} NOTES`;
  $("#notesList").innerHTML=notes.length?notes.map((n,i)=>`<div class="note-entry"><div><strong>${escapeHTML(n.title)}</strong><small>${new Date(n.updated).toLocaleString()}</small></div><div><button data-open-note="${i}">OPEN</button><button data-delete-note="${i}">DEL</button></div></div>`).join(""):'<div class="empty-state">NO NOTES YET</div>';
  $$("[data-open-note]").forEach(b=>b.addEventListener("click",()=>{const n=loadNotes()[+b.dataset.openNote];$("#noteTitle").value=n.title;$("#noteBody").value=n.body;}));
  $$("[data-delete-note]").forEach(b=>b.addEventListener("click",()=>{const ns=loadNotes();ns.splice(+b.dataset.deleteNote,1);storeNotes(ns);renderNotes();}));
}
$("#saveNote").addEventListener("click",()=>{
  const title=$("#noteTitle").value.trim()||"Untitled note",body=$("#noteBody").value.trim();
  if(!body){$("#noteStatus").textContent="ADD SOME TEXT FIRST";return;}
  const notes=loadNotes();notes.unshift({title,body,updated:Date.now()});storeNotes(notes);
  $("#noteStatus").textContent="NOTE SAVED LOCALLY";$("#noteTitle").value="";$("#noteBody").value="";renderNotes();
});
renderNotes();

// Launcher tiles use the same navigation system as the sidebar.
$("#launcherGrid").innerHTML=modules.map(([id,icon,title,desc])=>`<button class="launch-tile" data-launch="${id}"><span>${icon}</span><b>${title}</b><small>${desc}</small></button>`).join("");
$$("[data-launch]").forEach(b=>b.addEventListener("click",()=>navigate(b.dataset.launch)));

// Sample quiz.
const quiz=[{q:"Which planet is known as the Red Planet?",a:["Venus","Mars","Jupiter"],correct:1,why:"Mars appears reddish because of iron-rich dust on its surface."},{q:"What is the largest ocean on Earth?",a:["Atlantic","Indian","Pacific"],correct:2,why:"The Pacific Ocean is the largest and deepest ocean."},{q:"Which gas do plants absorb from the atmosphere?",a:["Carbon dioxide","Oxygen","Helium"],correct:0,why:"Plants use carbon dioxide during photosynthesis."}];
let quizIndex=0,quizScore=0;
function showQuestion(){
  const q=quiz[quizIndex];const area=$("#quizArea");
  area.classList.remove("hidden");
  area.innerHTML=`<div class="eyebrow">QUESTION ${quizIndex+1} / ${quiz.length}</div><h3>${escapeHTML(q.q)}</h3>${q.a.map((a,i)=>`<button class="secondary-btn quiz-answer" data-answer="${i}">${escapeHTML(a)}</button>`).join("")}<p class="muted" id="quizFeedback"></p>`;
  $$(".quiz-answer",area).forEach(b=>b.addEventListener("click",()=>{
    $$(".quiz-answer",area).forEach(x=>x.disabled=true);
    const ok=+b.dataset.answer===q.correct;if(ok)quizScore++;
    $("#quizFeedback").textContent=(ok?"CORRECT. ":"NOT QUITE. ")+q.why;
    const next=document.createElement("button");next.className="primary-btn";next.textContent=quizIndex===quiz.length-1?"SHOW SCORE":"NEXT QUESTION";next.addEventListener("click",()=>{quizIndex++;if(quizIndex<quiz.length)showQuestion();else area.innerHTML=`<h3>QUIZ COMPLETE</h3><p>You scored ${quizScore} / ${quiz.length}.</p><button class="primary-btn" id="retryQuiz">TRY AGAIN</button>`;$("#retryQuiz")?.addEventListener("click",startQuiz)});area.append(next);
  }));
}
function startQuiz(){quizIndex=0;quizScore=0;showQuestion()}
$("#startQuiz").addEventListener("click",startQuiz);

// Settings
const theme=localStorage.getItem("mkh_theme")||"green";document.body.classList.toggle("theme-amber",theme==="amber");document.body.classList.toggle("theme-blue",theme==="blue");$("#themeSelect").value=theme;
$("#themeSelect").addEventListener("change",e=>{const t=e.target.value;document.body.classList.toggle("theme-amber",t==="amber");document.body.classList.toggle("theme-blue",t==="blue");localStorage.setItem("mkh_theme",t)});
const scan=localStorage.getItem("mkh_scan")!=="off";$("#scanToggle").checked=scan;$(".scanlines").style.display=scan?"block":"none";
$("#scanToggle").addEventListener("change",e=>{const on=e.target.checked;$(".scanlines").style.display=on?"block":"none";localStorage.setItem("mkh_scan",on?"on":"off")});
$("#exportNotes").addEventListener("click",()=>{
  const blob=new Blob([JSON.stringify(loadNotes(),null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="my-knowledge-hub-notes.json";a.click();URL.revokeObjectURL(url);
});


// The shell can be cached when hosted over HTTPS or localhost.
if("serviceWorker" in navigator && (location.protocol==="https:"||location.hostname==="localhost")){
  window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
}


// Resource Manager: files are stored as Blob records in IndexedDB on this device.
// This is intentionally local-only: no file is sent to GitHub or a remote server.
const RESOURCE_DB="mkh_resource_vault_v2";
const RESOURCE_STORE="resources";
let selectedResourceFiles=[];
let resourceObjectUrls=[];

function openResourceDB(){
  return new Promise((resolve,reject)=>{
    if(!("indexedDB" in window)){reject(new Error("IndexedDB is not available in this browser."));return;}
    const request=indexedDB.open(RESOURCE_DB,1);
    request.onupgradeneeded=()=>{const db=request.result;if(!db.objectStoreNames.contains(RESOURCE_STORE)){const store=db.createObjectStore(RESOURCE_STORE,{keyPath:"id"});store.createIndex("created","created");store.createIndex("category","category");}};
    request.onsuccess=()=>resolve(request.result);
    request.onerror=()=>reject(request.error||new Error("Could not open local resource storage."));
  });
}
async function resourceTransaction(mode,action){
  const db=await openResourceDB();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(RESOURCE_STORE,mode),store=tx.objectStore(RESOURCE_STORE);
    let request;
    try{request=action(store)}catch(err){db.close();reject(err);return}
    tx.oncomplete=()=>{db.close();resolve(request?.result)};
    tx.onerror=()=>{const err=tx.error;db.close();reject(err||new Error("Storage operation failed."))};
    tx.onabort=()=>{const err=tx.error;db.close();reject(err||new Error("Storage operation was cancelled."))};
  });
}
async function getAllResources(){return (await resourceTransaction("readonly",s=>s.getAll()))||[]}
async function putResource(item){return resourceTransaction("readwrite",s=>s.put(item))}
async function deleteResource(id){return resourceTransaction("readwrite",s=>s.delete(id))}
function formatBytes(bytes){
  if(!bytes)return "0 B";const units=["B","KB","MB","GB"];let n=bytes,i=0;
  while(n>=1024&&i<units.length-1){n/=1024;i++}
  return `${n.toFixed(i===0?0:1)} ${units[i]}`;
}
function renderUploadQueue(){
  const q=$("#uploadQueue"),save=$("#saveResources");
  if(!selectedResourceFiles.length){q.innerHTML='<span class="muted">No files selected yet.</span>';save.disabled=true;return}
  q.innerHTML=selectedResourceFiles.map((f,i)=>`<div class="queue-item"><span>▤</span><div><b>${escapeHTML(f.name)}</b><small>${formatBytes(f.size)} · ${escapeHTML(f.type||"Unknown file type")}</small></div><button type="button" data-remove-queued="${i}" aria-label="Remove ${escapeHTML(f.name)}">×</button></div>`).join("");
  save.disabled=false;
  $$("[data-remove-queued]").forEach(b=>b.addEventListener("click",()=>{selectedResourceFiles.splice(+b.dataset.removeQueued,1);renderUploadQueue()}));
}
function selectResourceFiles(files){
  const incoming=[...files];
  const maxFile=250*1024*1024;
  const tooLarge=incoming.filter(f=>f.size>maxFile);
  selectedResourceFiles=[...selectedResourceFiles,...incoming.filter(f=>f.size<=maxFile)];
  renderUploadQueue();
  if(tooLarge.length)$("#uploadStatus").textContent=`Skipped ${tooLarge.length} file(s) larger than 250 MB.`;
  else $("#uploadStatus").textContent=`${selectedResourceFiles.length} file(s) ready to save.`;
}
const fileInput=$("#resourceFileInput");
fileInput?.addEventListener("change",e=>{selectResourceFiles(e.target.files);e.target.value=""});
const dropZone=$("#dropZone");
if(dropZone){
  ["dragenter","dragover"].forEach(evt=>dropZone.addEventListener(evt,e=>{e.preventDefault();dropZone.classList.add("drag-over")}));
  ["dragleave","drop"].forEach(evt=>dropZone.addEventListener(evt,e=>{e.preventDefault();dropZone.classList.remove("drag-over")}));
  dropZone.addEventListener("drop",e=>selectResourceFiles(e.dataTransfer.files));
}
$("#saveResources")?.addEventListener("click",async()=>{
  if(!selectedResourceFiles.length)return;
  const btn=$("#saveResources"),status=$("#uploadStatus");
  btn.disabled=true;btn.textContent="SAVING...";
  const category=$("#resourceCategory").value;
  const description=$("#resourceDescription").value.trim();
  const tags=$("#resourceTags").value.split(",").map(t=>t.trim()).filter(Boolean);
  let saved=0;
  try{
    for(const file of selectedResourceFiles){
      const record={id:crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(16).slice(2)}`,name:file.name,type:file.type||"application/octet-stream",size:file.size,category,description,tags,created:Date.now(),blob:file};
      await putResource(record);saved++;
    }
    selectedResourceFiles=[];renderUploadQueue();$("#resourceDescription").value="";$("#resourceTags").value="";
    status.textContent=`${saved} resource(s) saved on this device.`;await renderResources();
  }catch(err){
    status.textContent=`Could not save files: ${err.message||"storage error"}`;
  }finally{btn.disabled=!selectedResourceFiles.length;btn.textContent="SAVE TO MY VAULT →"}
});
function releaseResourceUrls(){resourceObjectUrls.forEach(URL.revokeObjectURL);resourceObjectUrls=[]}
async function renderResources(){
  const list=$("#resourceList");if(!list)return;
  try{
    const all=await getAllResources();
    const query=($("#resourceSearch")?.value||"").trim().toLowerCase();
    const category=$("#resourceFilter")?.value||"All";
    const filtered=all.filter(r=>(category==="All"||r.category===category)&&[r.name,r.category,r.description,(r.tags||[]).join(" ")].join(" ").toLowerCase().includes(query)).sort((a,b)=>b.created-a.created);
    $("#resourceCount").textContent=all.length;
    $("#resourceBytes").textContent=formatBytes(all.reduce((n,r)=>n+(r.size||0),0));
    releaseResourceUrls();
    if(!filtered.length){
      list.innerHTML=all.length?'<div class="empty-state">NO RESOURCES MATCH THIS SEARCH.</div>':'<div class="empty-state">YOUR VAULT IS READY. ADD YOUR FIRST RESOURCE ABOVE.</div>';
      return;
    }
    list.innerHTML=filtered.map(r=>{
      const url=URL.createObjectURL(r.blob);resourceObjectUrls.push(url);
      const canPreview=r.type.startsWith("image/")||r.type==="application/pdf"||r.type.startsWith("text/")||/\.(txt|md|html|csv|json)$/i.test(r.name);
      const safeName=escapeHTML(r.name);
      return `<article class="saved-resource"><div class="saved-resource-icon">${r.type.startsWith("image/")?"▧":r.type==="application/pdf"?"PDF":r.type.startsWith("audio/")?"♫":r.type.startsWith("video/")?"▶":"▤"}</div><div class="saved-resource-main"><div class="saved-resource-top"><strong>${safeName}</strong><span class="tag">${escapeHTML(r.category||"General")}</span></div><p>${escapeHTML(r.description||"No description added.")}</p><div class="resource-meta">${formatBytes(r.size)} · ${new Date(r.created).toLocaleDateString()}${(r.tags||[]).length?" · "+escapeHTML(r.tags.join(", ")):""}</div></div><div class="saved-resource-actions">${canPreview?`<button class="secondary-btn" data-preview-resource="${r.id}" data-url="${url}">PREVIEW</button>`:""}<button class="secondary-btn" data-download-resource="${r.id}">DOWNLOAD</button><button class="danger-btn" data-delete-resource="${r.id}">DELETE</button></div></article>`;
    }).join("");
    $$("[data-preview-resource]").forEach(b=>b.addEventListener("click",async()=>{
      const item=all.find(x=>x.id===b.dataset.previewResource);if(!item)return;
      const url=URL.createObjectURL(item.blob);
      const win=window.open(url,"_blank","noopener");
      if(!win){const a=document.createElement("a");a.href=url;a.target="_blank";a.click()}
      setTimeout(()=>URL.revokeObjectURL(url),60000);
    }));
    $$("[data-download-resource]").forEach(b=>b.addEventListener("click",()=>{
      const item=all.find(x=>x.id===b.dataset.downloadResource);if(!item)return;
      const url=URL.createObjectURL(item.blob),a=document.createElement("a");a.href=url;a.download=item.name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
    }));
    $$("[data-delete-resource]").forEach(b=>b.addEventListener("click",async()=>{
      const item=all.find(x=>x.id===b.dataset.deleteResource);if(!item)return;
      if(!confirm(`Delete "${item.name}" from this device's vault?`))return;
      await deleteResource(item.id);await renderResources();
    }));
  }catch(err){list.innerHTML=`<div class="empty-state">LOCAL DATABASE ERROR: ${escapeHTML(err.message||"Unable to load resources")}</div>`}
}
$("#resourceSearch")?.addEventListener("input",renderResources);
$("#resourceFilter")?.addEventListener("change",renderResources);
$("#exportResourceIndex")?.addEventListener("click",async()=>{
  const all=await getAllResources();
  const index=all.map(({blob,...meta})=>meta);
  const blob=new Blob([JSON.stringify({exported:new Date().toISOString(),storage:"local-only",resources:index},null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="my-knowledge-hub-resource-index.json";a.click();URL.revokeObjectURL(url);
});
renderResources();
