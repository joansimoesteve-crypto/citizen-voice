const prompt = `
Eres un asistente de gestión municipal.

Analiza esta incidencia y responde SOLO con JSON válido.

IMPORTANTE:
- "acciones" DEBE ser una lista con al menos 2 acciones concretas.
- No puede estar vacía.
- No incluyas texto fuera del JSON.

Formato obligatorio:

{
  "resumen": "texto breve claro",
  "acciones": ["acción 1", "acción 2", "acción 3"]
}

Incidencia:
${description}
`
