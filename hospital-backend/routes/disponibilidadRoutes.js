/// archivo que contiene las rutas de disponibilidad

const express = require("express");
const router = express.Router();
const {
  obtenerDisponibilidadMedico,
  configurarDisponibilidad,
  obtenerExcepciones,
  crearExcepcion,
  eliminarExcepcion,
  obtenerHorariosDisponibles,
} = require("../controllers/disponibilidadController");
const { verificarToken, esMedico } = require("../utils/auth");

// Rutas de disponibilidad
router.get("/medico/:medicoId", obtenerDisponibilidadMedico);
router.post("/medico/:medicoId", verificarToken, configurarDisponibilidad);
router.get("/medico/:medicoId/excepciones", obtenerExcepciones);
router.post("/medico/:medicoId/excepciones", verificarToken, crearExcepcion);
router.delete("/excepciones/:id", verificarToken, eliminarExcepcion);
router.get(
  "/medico/:medicoId/horarios-disponibles",
  obtenerHorariosDisponibles
);

module.exports = router;
