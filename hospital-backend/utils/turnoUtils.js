/// archivo con funciones de utilidad para la gestión de turnos

const { Op } = require("sequelize")
const moment = require("moment")
const { DisponibilidadMedico, ExcepcionDisponibilidad, Turno } = require("../models")

// Verificar si un horario está disponible para un médico
const verificarDisponibilidadHorario = async (medicoId, fecha, hora) => {
  try {
    // Verificar si ya existe un turno en ese horario
    const turnoExistente = await Turno.findOne({
      where: {
        medicoId,
        fecha,
        hora,
        estado: { [Op.ne]: "cancelado" },
      },
    })

    if (turnoExistente) {
      return {
        disponible: false,
        mensaje: "Ya existe un turno agendado en este horario",
      }
    }

    // Obtener día de la semana (0-6, donde 0 es domingo)
    const diaSemana = moment(fecha).day()

    // Verificar si hay una excepción para esta fecha
    const excepcion = await ExcepcionDisponibilidad.findOne({
      where: { medicoId, fecha },
    })

    // Si hay una excepción de no disponibilidad para todo el día
    if (excepcion && !excepcion.esDisponible && !excepcion.horaInicio) {
      return {
        disponible: false,
        mensaje: "El médico no está disponible en esta fecha",
      }
    }

    // Si hay una excepción de no disponibilidad para un horario específico
    if (excepcion && !excepcion.esDisponible && excepcion.horaInicio && excepcion.horaFin) {
      const horaSlot = moment(hora, "HH:mm")
      const horaInicio = moment(excepcion.horaInicio, "HH:mm")
      const horaFin = moment(excepcion.horaFin, "HH:mm")

      if (horaSlot >= horaInicio && horaSlot < horaFin) {
        return {
          disponible: false,
          mensaje: "El médico no está disponible en este horario",
        }
      }
    }

    // Si hay una excepción de disponibilidad para un horario específico
    if (excepcion && excepcion.esDisponible && excepcion.horaInicio && excepcion.horaFin) {
      const horaSlot = moment(hora, "HH:mm")
      const horaInicio = moment(excepcion.horaInicio, "HH:mm")
      const horaFin = moment(excepcion.horaFin, "HH:mm")

      if (horaSlot >= horaInicio && horaSlot < horaFin) {
        return {
          disponible: true,
          mensaje: "Horario disponible (excepción)",
        }
      }
    }

    // Verificar disponibilidad regular
    const disponibilidadRegular = await DisponibilidadMedico.findOne({
      where: {
        medicoId,
        diaSemana,
        activo: true,
        horaInicio: { [Op.lte]: hora },
        horaFin: { [Op.gt]: hora },
      },
    })

    if (!disponibilidadRegular && !(excepcion && excepcion.esDisponible)) {
      return {
        disponible: false,
        mensaje: "El médico no atiende en este horario",
      }
    }

    // Si llegamos aquí, el horario está disponible
    return {
      disponible: true,
      mensaje: "Horario disponible",
    }
  } catch (error) {
    console.error("Error al verificar disponibilidad de horario:", error)
    return {
      disponible: false,
      mensaje: "Error al verificar disponibilidad",
    }
  }
}

module.exports = {
  verificarDisponibilidadHorario,
}

