const map = L.map('map').setView([39.47,-0.37],13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

fetch("https://YOUR_SUPABASE_URL/rest/v1/incidencias?select=*", {
  headers: { "apikey":"TU_SUPABASE_KEY" }
})
.then(r=>r.json())
.then(data=>{
  data.forEach(i=>{
    if(i.lat && i.lng){
      L.marker([i.lat,i.lng]).addTo(map).bindPopup(`${i.tipo}: ${i.descripcion}`);
    }
  })
});
