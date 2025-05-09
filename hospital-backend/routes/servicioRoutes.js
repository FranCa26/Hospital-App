/// archivo de rutas de servicios
const express = require("express")
const router = express.Router()
const {
  obtenerServicios,
  obtenerServicioPorId,
  crearServicio,
  actualizarServicio,
  eliminarServicio,
} = require("../controllers/servicioController")
const { verificarToken, esAdmin } = require("../utils/auth")

// Rutas de servicios
router.get("/", obtenerServicios)
router.get("/:id", obtenerServicioPorId)
router.post("/", verificarToken, esAdmin, crearServicio)
router.put("/:id", verificarToken, esAdmin, actualizarServicio)
router.delete("/:id", verificarToken, esAdmin, eliminarServicio)

module.exports = router

