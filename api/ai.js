export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {

    const { description } = req.body

    const prompt = `
Eres un asistente de gestión municipal.

Analiza esta incidencia y responde SOLO con JSON válido.

IMPORTANTE:
- "resumen" debe ser claro y breve
- "acciones" debe tener mínimo 2 y máximo 5 acciones concretas
- NO puede estar vacío
- NO añadas texto fuera del JSON

FORMATO OBLIGATORIO:

{
  "resumen": "texto breve",
  "acciones": ["acción 1", "acción 2"]
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
          model: "meta-llama/Meta-Llama-3-8B-Instruct",
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
      console.log("JSON PARSE ERROR:", e)
    }

    // 🔥 FIX FINAL: asegurar acciones nunca vacías
    if (!json.acciones || json.acciones.length === 0) {
      json.acciones = [
        "Revisar la incidencia en el lugar",
        "Asignar equipo técnico responsable"
      ]
    }

    return res.status(200).json(json)

  } catch (err) {

    console.log("AI ERROR:", err)

    return res.status(200).json({
      resumen: "",
      acciones: [
        "Revisar manualmente la incidencia",
        "Contactar con el equipo técnico"
      ]
    })

  }
}
