/// archivo que contiene las rutas de notificaciones
const express = require("express")
const router = express.Router()
const {
  obtenerNotificaciones,
  marcarComoLeida,
  eliminarNotificacion,
  marcarTodasComoLeidas,
} = require("../controllers/notificacionController")
const { verificarToken } = require("../utils/auth")

// Rutas de notificaciones
router.get("/", verificarToken, obtenerNotificaciones)
router.put("/leer-todas", verificarToken, marcarTodasComoLeidas)
router.put("/:id", verificarToken, marcarComoLeida)
router.delete("/:id", verificarToken, eliminarNotificacion)

module.exports = router

