export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {

    const { description } = req.body

    const prompt = `
Eres un experto en gestión urbana y smart cities.

Analiza esta incidencia municipal y responde SOLO con JSON válido.

REGLAS:
- "resumen": breve y claro (máx 2 frases)
- "acciones": entre 2 y 5 acciones concretas, operativas y realistas
- NO texto fuera del JSON
- NO acciones genéricas tipo "revisar el problema" sin contexto

FORMATO OBLIGATORIO:

{
  "resumen": "texto",
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
          temperature: 0.3
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

    // 🔥 fallback seguro
    if (!json.acciones || json.acciones.length === 0) {
      json.acciones = [
        "Inspección técnica en el lugar",
        "Asignación de equipo responsable",
        "Seguimiento del incidente"
      ]
    }

    return res.status(200).json(json)

  } catch (err) {

    console.log("AI ERROR:", err)

    return res.status(200).json({
      resumen: "",
      acciones: [
        "Revisión manual de la incidencia",
        "Contacto con equipo técnico",
        "Seguimiento del caso"
      ]
    })

  }
}
