const chat=document.getElementById("chat")
const controls=document.getElementById("controls")

function bot(text){

const d=document.createElement("div")

d.className="bot"

d.innerText=text

chat.appendChild(d)

}

function user(text){

const d=document.createElement("div")

d.className="user"

d.innerText=text

chat.appendChild(d)

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

bot("Hola. ¿Qué deseas registrar?")

buttons(["Incidencia","Propuesta"],v=>{

bot("Has seleccionado: "+v)

})

}

start()
const SUPABASE_URL=https://saiclsejxsycmeefuhvs.supabase.co
const SUPABASE_KEY=sb_publishable_47xYI_TzRSCVKyule8JK4g_mDx3t0VI

const supabase = supabase.createClient(
SUPABASE_URL,
SUPABASE_KEY
)
