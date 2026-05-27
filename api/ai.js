export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {

    const { description } = req.body

    const prompt = `
Devuelve SOLO JSON válido:

{
  "resumen": "",
  "acciones": []
}

Texto:
${description}
`

    const response = await fetch(
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 300,
            temperature: 0.3,
            return_full_text: false
          }
        })
      }
    )

    const data = await response.json()

    let text = ""

    if (Array.isArray(data)) {
      text = data?.[0]?.generated_text || ""
    } else {
      text = data?.generated_text || ""
    }

    const match = text.match(/\{[\s\S]*\}/)

    if (!match) {
      return res.status(200).json({
        resumen: "",
        acciones: []
      })
    }

    return res.status(200).json(JSON.parse(match[0]))

  } catch (err) {

    console.log(err)

    return res.status(500).json({
      resumen: "",
      acciones: []
    })

  }
}
