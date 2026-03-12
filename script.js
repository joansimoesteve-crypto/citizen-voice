// Configuración Supabase
const SUPABASE_URL = https://saiclsejxsycmeefuhvs.supabase.co;
const SUPABASE_KEY = sb_publishable_47xYI_TzRSCVKyule8JK4g_mDx3t0VI;
const supabase = Supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const chat = document.getElementById("chat");
const controls = document.getElementById("controls");

let data = {};

// Función voz
function speak(text){
  let msg = new SpeechSynthesisUtterance(text);
  msg.lang = "es-ES";
  speechSynthesis.cancel();
  speechSynthesis.speak(msg);
}

// Bot con avatar simple
function bot(text){
  const div = document.createElement("div");
  div.className = "bot";
  div.innerHTML = `<div class="avatar">🤖</div><span>${text}</span>`;
  chat.appendChild(div);
  speak(text);
  chat.scrollTop = chat.scrollHeight + 500;
}

// Usuario
function user(text){
  const div = document.createElement("div");
  div.className = "user";
  div.innerText = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight + 500;
}

// Botones
function buttons(arr, callback){
  controls.innerHTML="";
  arr.forEach(o=>{
    const b = document.createElement("button");
    b.className="option";
    b.innerText=o;
    b.onclick = ()=> { user(o); callback(o); };
    controls.appendChild(b);
  });
}

// Inicio
function start(){
  bot("Hola 👋 puedes registrar una incidencia en segundos");
  buttons(["Incidencia","Propuesta"], v=>{
    data.tipo=v;
    askArea();
  });
}

// Preguntar área
function askArea(){
  bot("¿Qué área?");
  buttons(["Limpieza","Movilidad","Seguridad","Espacio público"], v=>{
    data.area=v;
    askLocation();
  });
}

// Ubicación con Leaflet o GPS simple
function askLocation(){
  bot("Indica calle, número, CP o código de urna");
  controls.innerHTML="";
  const input = document.createElement("input");
  input.placeholder="Ej: Calle Mayor 10, CP 46001 o URNA-03";
  input.style.flex="1";
  const btn = document.createElement("button");
  btn.innerText="Enviar ubicación";
  btn.onclick = ()=>{
    data.ubicacion=input.value;
    user(input.value);
    askVoice();
  }
  controls.appendChild(input);
  controls.appendChild(btn);
}

// Voz
function askVoice(){
  bot("Describe brevemente el problema 🎤");
  const rec = new webkitSpeechRecognition();
  rec.lang="es-ES";
  rec.start();
  rec.onresult = e=>{
    const text = e.results[0][0].transcript;
    data.descripcion=text;
    user(text);
    sendData();
  }
}

// Enviar a Supabase
async function sendData(){
  bot("Registrando incidencia...");
  const { error } = await supabase.from("incidencias").insert([data]);
  if(error){
    bot("❌ Error al registrar. Intenta de nuevo.");
    console.log(error);
  } else {
    bot("✅ Incidencia registrada correctamente!");
  }
  controls.innerHTML="";
}

// Iniciar automáticamente
start();
