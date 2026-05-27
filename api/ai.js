export default async function handler(req, res) {

  console.log("API AI LLAMADA")

  return res.status(200).json({
    resumen: "FUNCIONA",
    acciones: ["test 1", "test 2"]
  })

}
