// ⚡ Conexión a Supabase
const SUPABASE_URL = https://saiclsejxsycmeefuhvs.supabase.co;
const SUPABASE_KEY = sb_publishable_47xYI_TzRSCVKyule8JK4g_mDx3t0VI;
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const chat = document.getElementById("chat");
const controls = document.getElementById("controls");
let step = 0;
let data = {};

function scroll() { setTimeout(()=>{ chat.scrollTop = chat.scrollHeight + 500; }, 200); }
function speak(text){ let msg=new SpeechSynthesisUtterance(text); msg.lang="es-ES"; speechSynthesis.cancel(); speechSynthesis.speak(msg); }

function addBot(text){
  const div = document.createElement("div");
  div.className = "bubble bubble-avatar";
  div.innerHTML = `<img src="https://i.imgur.com/ZF6s192.png" alt="Bot"/> <span>${text}</span>`;
  chat.appendChild(div);
  speak(text);
  scroll();
}

function addUser(text){
  const div = document.createElement("div");
  div.className = "user";
  div.innerText = text;
  chat.appendChild(div);
  scroll();
}

function startSurvey(){
  controls.innerHTML = "";
  step = 1;
  next();
}

function next(){
  controls.innerHTML = "";
  if(step === 1){
    addBot("¿Sobre qué área quieres opinar?");
    buttons(["Movilidad","Limpieza","Urbanismo","Cultura","Seguridad","Tramitación","Otros"], val => { data.area=val; addUser(val); step=2; next(); });
  }
  else if(step === 2){
    addBot("¿Es una incidencia o propuesta?");
    buttons(["Incidencia","Propuesta"], val => { data.tipo=val; addUser(val); step=3; next(); });
  }
  else if(step === 3){
    addBot("Describe tu incidencia o propuesta");
    controls.innerHTML = `<textarea id="desc"></textarea>
      <div class="controls">
        <button class="small" onclick="voice()">🎤</button>
        <button class="small" onclick="sendDesc()">Enviar</button>
      </div>`;
  }
  else if(step === 4){
    addBot("Indica calle, número, código postal o código de urna");
    controls.innerHTML = `<input id="loc" placeholder="Ej: Calle Mayor 10 o URNA-03">
      <div class="controls">
        <button class="small" onclick="sendLocation()">📍 Enviar ubicación</button>
      </div>`;
  }
  else if(step === 5){
    addBot("Valora el servicio del 1 al 5");
    buttons(["1","2","3","4","5"], val => { data.valoracion=val; addUser("Valoración: "+val); sendData(); });
  }
}

function buttons(arr, callback){
  controls.innerHTML="";
  arr.forEach(val => {
    const b = document.createElement("button");
    b.innerText = val;
    b.onclick = ()=>{ callback(val); };
    controls.appendChild(b);
  });
}

function sendDesc(){ 
  let val = document.getElementById("desc").value;
  data.descripcion = val;
  addUser(val);
  step=4; next();
}

function sendLocation(){
  let val = document.getElementById("loc").value;
  data.ubicacion = val;
  addUser(val);
  step=5; next();
}

// Reconocimiento de voz
function voice(){
  if(!('webkitSpeechRecognition' in window)){ alert("Voz no soportada"); return; }
  const r = new webkitSpeechRecognition();
  r.lang="es-ES";
  r.onresult = e => { document.getElementById("desc").value = e.results[0][0].transcript; }
  r.start();
}

// Enviar datos a Supabase
async function sendData(){
  addBot("Registrando incidencia...");
  const { error } = await supabase.from("incidencias").insert([{
    tipo: data.tipo,
    area: data.area,
    descripcion: data.descripcion,
    ubicacion: data.ubicacion,
    lat: data.lat || null,
    lng: data.lng || null
  }]);
  if(error){ console.error(error); addBot("❌ Error al registrar"); }
  else{ addBot("✅ Incidencia registrada correctamente"); controls.innerHTML=""; }
}
