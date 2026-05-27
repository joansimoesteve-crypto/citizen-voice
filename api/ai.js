const response = await fetch(
  "https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta",
  {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.HF_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        max_new_tokens: 250,
        temperature: 0.3
      }
    })
  }
)
