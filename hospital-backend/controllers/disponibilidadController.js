/// archivo para controlar la disponibilidad de los medicos

const { Op } = require("sequelize")
const moment = require("moment")
const { DisponibilidadMedico, ExcepcionDisponibilidad, Turno, Usuario } = require("../models")

// Obtener disponibilidad de un médico
const obtenerDisponibilidadMedico = async (req, res) => {
  try {
    const { medicoId } = req.params

    // Verificar que el médico existe
    const medico = await Usuario.findOne({
      where: { id: medicoId, rol: "medico" },
    })

    if (!medico) {
      return res.status(404).json({ mensaje: "Médico no encontrado" })
    }

    // Obtener horarios regulares
    const disponibilidad = await DisponibilidadMedico.findAll({
      where: { medicoId, activo: true },
      order: [
        ["diaSemana", "ASC"],
        ["horaInicio", "ASC"],
      ],
    })

    res.status(200).json(disponibilidad)
  } catch (error) {
    console.error("Error al obtener disponibilidad del médico:", error)
    res.status(500).json({ mensaje: "Error en el servidor" })
  }
}

// Crear o actualizar disponibilidad de un médico
const configurarDisponibilidad = async (req, res) => {
  try {
    const { medicoId } = req.params
    const usuario = req.usuario

    // Verificar permisos (solo el propio médico o un admin)
    if (usuario.rol !== "admin" && usuario.id.toString() !== medicoId) {
      return res.status(403).json({ mensaje: "Acceso denegado" })
    }

    // Verificar que el médico existe
    const medico = await Usuario.findOne({
      where: { id: medicoId, rol: "medico" },
    })

    if (!medico) {
      return res.status(404).json({ mensaje: "Médico no encontrado" })
    }

    const { disponibilidad } = req.body

    if (!Array.isArray(disponibilidad)) {
      return res.status(400).json({ mensaje: "El formato de disponibilidad es inválido" })
    }

    // Desactivar todas las disponibilidades actuales
    await DisponibilidadMedico.update({ activo: false }, { where: { medicoId } })

    // Crear nuevas disponibilidades
    const nuevasDisponibilidades = []

    for (const horario of disponibilidad) {
      const { diaSemana, horaInicio, horaFin, intervalo } = horario

      // Validar datos
      if (diaSemana === undefined || !horaInicio || !horaFin || diaSemana < 0 || diaSemana > 6) {
        continue // Saltar entradas inválidas
      }

      // Crear disponibilidad
      const nuevaDisponibilidad = await DisponibilidadMedico.create({
        medicoId,
        diaSemana,
        horaInicio,
        horaFin,
        intervalo: intervalo || 30,
        activo: true,
      })

      nuevasDisponibilidades.push(nuevaDisponibilidad)
    }

    res.status(200).json({
      mensaje: "Disponibilidad configurada exitosamente",
      disponibilidad: nuevasDisponibilidades,
    })
  } catch (error) {
    console.error("Error al configurar disponibilidad:", error)
    res.status(500).json({ mensaje: "Error en el servidor" })
  }
}

// Obtener excepciones de disponibilidad
const obtenerExcepciones = async (req, res) => {
  try {
    const { medicoId } = req.params
    const { desde, hasta } = req.query

    // Construir condiciones de búsqueda
    const where = { medicoId }

    if (desde && hasta) {
      where.fecha = {
        [Op.between]: [desde, hasta],
      }
    } else if (desde) {
      where.fecha = {
        [Op.gte]: desde,
      }
    } else if (hasta) {
      where.fecha = {
        [Op.lte]: hasta,
      }
    }

    const excepciones = await ExcepcionDisponibilidad.findAll({
      where,
      order: [["fecha", "ASC"]],
    })

    res.status(200).json(excepciones)
  } catch (error) {
    console.error("Error al obtener excepciones de disponibilidad:", error)
    res.status(500).json({ mensaje: "Error en el servidor" })
  }
}

// Crear excepción de disponibilidad
const crearExcepcion = async (req, res) => {
  try {
    const { medicoId } = req.params
    const usuario = req.usuario

    // Verificar permisos (solo el propio médico o un admin)
    if (usuario.rol !== "admin" && usuario.id.toString() !== medicoId) {
      return res.status(403).json({ mensaje: "Acceso denegado" })
    }

    const { fecha, esDisponible, horaInicio, horaFin, motivo } = req.body

    if (!fecha) {
      return res.status(400).json({ mensaje: "La fecha es requerida" })
    }

    // Crear excepción
    const nuevaExcepcion = await ExcepcionDisponibilidad.create({
      medicoId,
      fecha,
      esDisponible: esDisponible || false,
      horaInicio,
      horaFin,
      motivo,
    })

    res.status(201).json({
      mensaje: "Excepción de disponibilidad creada exitosamente",
      excepcion: nuevaExcepcion,
    })
  } catch (error) {
    console.error("Error al crear excepción de disponibilidad:", error)
    res.status(500).json({ mensaje: "Error en el servidor" })
  }
}

// Eliminar excepción de disponibilidad
const eliminarExcepcion = async (req, res) => {
  try {
    const { id } = req.params
    const usuario = req.usuario

    const excepcion = await ExcepcionDisponibilidad.findByPk(id)

    if (!excepcion) {
      return res.status(404).json({ mensaje: "Excepción no encontrada" })
    }

    // Verificar permisos (solo el propio médico o un admin)
    if (usuario.rol !== "admin" && usuario.id.toString() !== excepcion.medicoId.toString()) {
      return res.status(403).json({ mensaje: "Acceso denegado" })
    }

    await excepcion.destroy()

    res.status(200).json({
      mensaje: "Excepción de disponibilidad eliminada exitosamente",
    })
  } catch (error) {
    console.error("Error al eliminar excepción de disponibilidad:", error)
    res.status(500).json({ mensaje: "Error en el servidor" })
  }
}

// Obtener horarios disponibles para un médico en una fecha específica
const obtenerHorariosDisponibles = async (req, res) => {
  try {
    const { medicoId } = req.params
    const { fecha } = req.query

    if (!fecha) {
      return res.status(400).json({ mensaje: "La fecha es requerida" })
    }

    // Verificar que el médico existe
    const medico = await Usuario.findOne({
      where: { id: medicoId, rol: "medico" },
    })

    if (!medico) {
      return res.status(404).json({ mensaje: "Médico no encontrado" })
    }

    // Obtener día de la semana (0-6, donde 0 es domingo)
    const diaSemana = moment(fecha).day()

    // Verificar si hay una excepción para esta fecha
    const excepcion = await ExcepcionDisponibilidad.findOne({
      where: { medicoId, fecha },
    })

    // Si hay una excepción de no disponibilidad para todo el día
    if (excepcion && !excepcion.esDisponible && !excepcion.horaInicio) {
      return res.status(200).json({
        mensaje: "No hay horarios disponibles para esta fecha",
        horarios: [],
      })
    }

    // Obtener la disponibilidad regular para este día de la semana
    const disponibilidadRegular = await DisponibilidadMedico.findAll({
      where: { medicoId, diaSemana, activo: true },
      order: [["horaInicio", "ASC"]],
    })

    // Si no hay disponibilidad regular y no hay excepción de disponibilidad
    if (disponibilidadRegular.length === 0 && !(excepcion && excepcion.esDisponible)) {
      return res.status(200).json({
        mensaje: "No hay horarios configurados para esta fecha",
        horarios: [],
      })
    }

    // Obtener turnos ya agendados para esta fecha
    const turnosAgendados = await Turno.findAll({
      where: {
        medicoId,
        fecha,
        estado: {
          [Op.ne]: "cancelado",
        },
      },
      attributes: ["hora"],
    })

    const horasOcupadas = turnosAgendados.map((turno) => turno.hora)

    // Generar horarios disponibles
    let horariosDisponibles = []

    // Función para generar slots de tiempo
    const generarSlots = (inicio, fin, intervalo) => {
      const slots = []
      const horaActual = moment(inicio, "HH:mm")
      const horaFinal = moment(fin, "HH:mm")

      while (horaActual < horaFinal) {
        const hora = horaActual.format("HH:mm")
        if (!horasOcupadas.includes(hora)) {
          slots.push(hora)
        }
        horaActual.add(intervalo, "minutes")
      }

      return slots
    }

    // Si hay una excepción de disponibilidad con horas específicas
    if (excepcion && excepcion.esDisponible && excepcion.horaInicio && excepcion.horaFin) {
      horariosDisponibles = generarSlots(
        excepcion.horaInicio,
        excepcion.horaFin,
        30, // Intervalo por defecto
      )
    }
    // Si hay disponibilidad regular
    else if (disponibilidadRegular.length > 0) {
      // Para cada bloque de disponibilidad regular
      for (const bloque of disponibilidadRegular) {
        const slots = generarSlots(bloque.horaInicio, bloque.horaFin, bloque.intervalo)
        horariosDisponibles = [...horariosDisponibles, ...slots]
      }

      // Si hay una excepción de no disponibilidad con horas específicas, quitar esas horas
      if (excepcion && !excepcion.esDisponible && excepcion.horaInicio && excepcion.horaFin) {
        const horaInicio = moment(excepcion.horaInicio, "HH:mm")
        const horaFin = moment(excepcion.horaFin, "HH:mm")

        horariosDisponibles = horariosDisponibles.filter((hora) => {
          const horaSlot = moment(hora, "HH:mm")
          return horaSlot < horaInicio || horaSlot >= horaFin
        })
      }
    }

    // Ordenar horarios
    horariosDisponibles.sort()

    res.status(200).json({
      fecha,
      horarios: horariosDisponibles,
    })
  } catch (error) {
    console.error("Error al obtener horarios disponibles:", error)
    res.status(500).json({ mensaje: "Error en el servidor" })
  }
}

module.exports = {
  obtenerDisponibilidadMedico,
  configurarDisponibilidad,
  obtenerExcepciones,
  crearExcepcion,
  eliminarExcepcion,
  obtenerHorariosDisponibles,
}

