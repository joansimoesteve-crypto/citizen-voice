export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {

    const { description } = req.body

    const prompt = `
Eres un técnico municipal experto en gestión urbana y mantenimiento de ciudades.

Analiza la incidencia ciudadana y responde SOLO con JSON válido.

REGLAS OBLIGATORIAS:
- "resumen" debe describir el problema de forma concreta (menciona el elemento urbano: calle, farola, acera, contenedor, tráfico, etc.)
- "acciones" deben ser 2 a 5 acciones operativas reales que haría un ayuntamiento
- lenguaje claro, práctico y no burocrático
- evita frases genéricas como "evaluación técnica" sin acción real
- NO texto fuera del JSON

FORMATO EXACTO:

{
  "resumen": "texto descriptivo del problema urbano",
  "acciones": ["acción 1", "acción 2", "acción 3"]
}

EJEMPLOS DE ACCIONES BUENAS:
- "Limpiar la zona afectada y retirar residuos"
- "Reparar el pavimento deteriorado"
- "Colocar señalización preventiva en la vía"
- "Sustituir luminaria dañada en la calle"
- "Inspeccionar el sistema de contenedores"

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

    // 🔥 FIX RESUMEN
    if (!json.resumen || json.resumen.trim() === "") {
      json.resumen =
        "Incidencia detectada en el espacio urbano que requiere intervención por los servicios municipales."
    }

    // 🔥 FIX ACCIONES
    if (!json.acciones || json.acciones.length === 0) {
      json.acciones = [
        "Inspeccionar la zona afectada",
        "Realizar intervención de mantenimiento urbano",
        "Asignar equipo municipal correspondiente"
      ]
    }

    return res.status(200).json(json)

  } catch (err) {

    console.log("AI ERROR:", err)

    return res.status(200).json({
      resumen: "Incidencia registrada pendiente de revisión municipal.",
      acciones: [
        "Revisión técnica del área",
        "Asignación de brigada municipal",
        "Seguimiento del caso"
      ]
    })

  }
}
