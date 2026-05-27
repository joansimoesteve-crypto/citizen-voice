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
      "https://router.huggingface.co/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "HuggingFaceH4/zephyr-7b-beta",
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

    const text = data?.choices?.[0]?.message?.content || ""

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
