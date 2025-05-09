// archivo que exporta todos los modelos de la carpeta models

const Usuario = require("./Usuario")
const Categoria = require("./Categoria")
const Servicio = require("./Servicio")
const Turno = require("./Turno")
const Notificacion = require("./Notificacion")
const DisponibilidadMedico = require("./DisponibilidadMedico")
const ExcepcionDisponibilidad = require("./ExcepcionDisponibilidad")
const HistorialMedico = require("./HistorialMedico")
const ArchivoHistorial = require("./ArchivoHistorial")

// Exportar todos los modelos
module.exports = {
  Usuario,
  Categoria,
  Servicio,
  Turno,
  Notificacion,
  DisponibilidadMedico,
  ExcepcionDisponibilidad,
  HistorialMedico,
  ArchivoHistorial,
}

