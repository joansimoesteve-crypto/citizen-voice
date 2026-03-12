const chat=document.getElementById("chat")
const controls=document.getElementById("controls")

const SUPABASE_URL=https://saiclsejxsycmeefuhvs.supabase.co
const SUPABASE_KEY=sb_publishable_47xYI_TzRSCVKyule8JK4g_mDx3t0VI

let data={}

function bot(text){
  const d=document.createElement("div")
  d.className="bot"
  d.innerText=text
  chat.appendChild(d)
  chat.scrollTop=chat.scrollHeight
}

function user(text){
  const d=document.createElement("div")
  d.className="user"
  d.innerText=text
  chat.appendChild(d)
  chat.scrollTop=chat.scrollHeight
}

function buttons(arr,callback){
  controls.innerHTML=""
  arr.forEach(o=>{
    const b=document.createElement("button")
    b.className="option"
    b.innerText=o
    b.onclick=()=>{
      user(o)
      callback(o)
    }
    controls.appendChild(b)
  })
}

function start(){
  bot("Hola 👋 puedes registrar una incidencia")
  buttons(["Incidencia","Propuesta"],v=>{
    data.tipo=v
    askArea()
  })
}

function askArea(){
  bot("Selecciona el área")
  buttons(["Limpieza","Movilidad","Seguridad","Espacio público"],v=>{
    data.area=v
    askDescription()
  })
}

function askDescription(){
  bot("Describe la incidencia")
  controls.innerHTML=""
  const input=document.createElement("input")
  input.placeholder="Escribe aquí..."
  const send=document.createElement("button")
  send.innerText="Enviar"
  send.className="option"
  send.onclick=()=>{
    data.descripcion=input.value
    user(input.value)
    askAddress()
  }
  controls.appendChild(input)
  controls.appendChild(send)
}

function askAddress(){
  bot("Dirección o código de urna")
  controls.innerHTML=""
  const input=document.createElement("input")
  input.placeholder="Calle, número o código"
  const send=document.createElement("button")
  send.innerText="Enviar"
  send.className="option"
  send.onclick=()=>{
    data.direccion=input.value
    user(input.value)
    saveData()
  }
  controls.appendChild(input)
  controls.appendChild(send)
}

async function saveData(){
  await fetch(SUPABASE_URL+"/rest/v1/incidencias",{
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      "apikey":SUPABASE_KEY,
      "Authorization":"Bearer "+SUPABASE_KEY
    },
    body:JSON.stringify(data)
  })
  bot("✅ Incidencia registrada correctamente")
  controls.innerHTML=""
}

start()
