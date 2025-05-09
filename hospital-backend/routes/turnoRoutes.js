/// archivo de rutas de turnos

const express = require("express")
const router = express.Router()
const {
  obtenerTurnos,
  obtenerTurnoPorId,
  crearTurno,
  actualizarTurno,
  cancelarTurno,
} = require("../controllers/turnoController")
const { verificarToken } = require("../utils/auth")

// Rutas de turnos
router.get("/", verificarToken, obtenerTurnos)
router.get("/:id", verificarToken, obtenerTurnoPorId)
router.post("/", verificarToken, crearTurno)
router.put("/:id", verificarToken, actualizarTurno)
router.delete("/:id", verificarToken, cancelarTurno)

module.exports = router

