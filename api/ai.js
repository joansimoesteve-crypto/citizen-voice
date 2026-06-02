export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {

    const { description } = req.body

    const prompt = `
Eres un técnico municipal experto en gestión urbana y mantenimiento de ciudades.

Analiza la incidencia ciudadana y genera una respuesta REALISTA y DESCRIPTIVA.

IMPORTANTE:
- NO seas genérico
- SIEMPRE menciona el elemento urbano afectado (ej: calle, acera, farola, contenedor, tráfico, iluminación, basura, ruido, etc.)
- "resumen" debe describir el problema concreto observado
- "acciones" deben ser operativas como un ayuntamiento real
- lenguaje técnico pero natural (no robotizado)
- NO texto fuera del JSON

FORMATO OBLIGATORIO:

{
  "resumen": "descripción concreta del problema urbano detectado",
  "acciones": ["acción 1", "acción 2", "acción 3"]
}

EJEMPLOS DE BUENA RESPUESTA:
- "Baches en la calzada de la calle principal que dificultan el tráfico"
- "Acumulación de residuos en contenedores de zona residencial"
- "Farola apagada en vía peatonal con riesgo de seguridad"

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
          temperature: 0.5
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

    // 🔥 FIX RESUMEN MÁS NATURAL
    if (!json.resumen || json.resumen.trim() === "") {
      json.resumen =
        "Incidencia detectada en la vía pública que requiere revisión por parte de los servicios municipales."
    }

    // 🔥 FIX ACCIONES
    if (!json.acciones || json.acciones.length === 0) {
      json.acciones = [
        "Inspección técnica en la ubicación señalada",
        "Evaluación del estado del elemento urbano afectado",
        "Asignación de brigada municipal correspondiente"
      ]
    }

    return res.status(200).json(json)

  } catch (err) {

    console.log("AI ERROR:", err)

    return res.status(200).json({
      resumen: "Incidencia registrada en espacio urbano pendiente de análisis.",
      acciones: [
        "Revisión técnica municipal",
        "Asignación de equipo de mantenimiento",
        "Seguimiento del caso"
      ]
    })

  }
}
