export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {

    const { description } = req.body

    const prompt = `
Eres un técnico municipal experto en gestión urbana, mantenimiento de ciudad y servicios públicos.

Tu trabajo es analizar incidencias ciudadanas reales.

RESPONDE SOLO EN JSON VÁLIDO.

REGLAS OBLIGATORIAS:
- "resumen": SIEMPRE obligatorio, 2-3 frases técnicas, nunca vacío
- "acciones": 3 a 6 acciones concretas como un ayuntamiento real
- lenguaje profesional (brigadas, inspección, mantenimiento, servicio urbano)
- NO texto fuera del JSON

FORMATO EXACTO:

{
  "resumen": "texto técnico obligatorio",
  "acciones": ["acción 1", "acción 2", "acción 3"]
}

Incidencia:
${description}
`

    const response = await fetch(
      "https://router.huggingface.co/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "mistralai/Mistral-7B-Instruct-v0.3",
          messages: [
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.4
        })
      }
    )

    const data = await response.json()

    console.log("HF RAW:", data)

    const text = data?.choices?.[0]?.message?.content || ""

    let json = {
      resumen: "",
      acciones: []
    }

    try {

      const match = text.match(/\{[\s\S]*\}/)

      if (match) {
        json = JSON.parse(match[0])
      }

    } catch (e) {
      console.log("JSON ERROR:", e)
    }

    // 🔥 GARANTÍA RESUMEN (FIX REAL)
    if (!json.resumen || json.resumen.trim() === "") {
      json.resumen =
        "Incidencia detectada en el espacio público que requiere evaluación técnica por parte de los servicios municipales competentes."
    }

    // 🔥 GARANTÍA ACCIONES
    if (!json.acciones || json.acciones.length === 0) {
      json.acciones = [
        "Inspección técnica por brigada municipal",
        "Evaluación del estado del espacio afectado",
        "Asignación de intervención por servicio competente"
      ]
    }

    return res.status(200).json(json)

  } catch (err) {

    console.log("AI ERROR:", err)

    return res.status(200).json({
      resumen: "Incidencia registrada pendiente de evaluación técnica.",
      acciones: [
        "Revisión por equipo municipal",
        "Asignación de responsable de área",
        "Seguimiento del expediente"
      ]
    })

  }
}
