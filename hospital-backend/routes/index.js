/// archivo de rutas principal de la API

const express = require("express")
const router = express.Router()

// Importar rutas
const authRoutes = require("./authRoutes")
const usuarioRoutes = require("./usuarioRoutes")
const turnoRoutes = require("./turnoRoutes")
const categoriaRoutes = require("./categoriaRoutes")
const servicioRoutes = require("./servicioRoutes")
const notificacionRoutes = require("./notificacionRoutes")
const disponibilidadRoutes = require("./disponibilidadRoutes")
const historialMedicoRoutes = require("./historialMedicoRoutes")

// Configurar rutas
router.use("/auth", authRoutes)
router.use("/usuarios", usuarioRoutes)
router.use("/turnos", turnoRoutes)
router.use("/categorias", categoriaRoutes)
router.use("/servicios", servicioRoutes)
router.use("/notificaciones", notificacionRoutes)
router.use("/disponibilidad", disponibilidadRoutes)
router.use("/historial-medico", historialMedicoRoutes)

// Ruta para verificar que la API está funcionando
router.get("/", (req, res) => {
  res.json({ mensaje: "API de Sistema de Turnos Hospital funcionando correctamente" })
})

module.exports = router

