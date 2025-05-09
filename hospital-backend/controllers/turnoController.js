/// archivo para controlar los turnos de los pacientes y médicos

const { Op } = require("sequelize")
const { Turno, Usuario, Servicio } = require("../models")
const { enviarNotificacionTurno } = require("../utils/notificaciones")
const { verificarDisponibilidadHorario } = require("../utils/turnoUtils")

// Obtener todos los turnos (filtrados según el rol del usuario)
const obtenerTurnos = async (req, res) => {
  try {
    const usuario = req.usuario

    const { fecha, medicoId, pacienteId, estado } = req.query

    // Construir condiciones de búsqueda
    const where = {}

    if (fecha) where.fecha = fecha
    if (estado) where.estado = estado

    // Filtrar por rol
    if (usuario.rol === "paciente") {
      where.pacienteId = usuario.id
    } else if (usuario.rol === "medico") {
      where.medicoId = usuario.id
    } else if (usuario.rol === "admin") {
      if (medicoId) where.medicoId = medicoId
      if (pacienteId) where.pacienteId = pacienteId
    }

    // Obtener turnos con relaciones
    const turnos = await Turno.findAll({
      where,
      include: [
        {
          model: Usuario,
          as: "paciente",
          attributes: ["id", "nombre", "email"],
        },
        {
          model: Usuario,
          as: "medico",
          attributes: ["id", "nombre", "email"],
        },
        {
          model: Servicio,
          attributes: ["id", "nombre", "descripcion"],
        },
      ],
      order: [
        ["fecha", "ASC"],
        ["hora", "ASC"],
      ],
    })

    res.status(200).json(turnos)
  } catch (error) {
    console.error("Error al obtener turnos:", error)
    res.status(500).json({ mensaje: "Error en el servidor" })
  }
}

// Obtener turno por ID
const obtenerTurnoPorId = async (req, res) => {
  try {
    const { id } = req.params
    const usuario = req.usuario

    const turno = await Turno.findByPk(id, {
      include: [
        {
          model: Usuario,
          as: "paciente",
          attributes: ["id", "nombre", "email"],
        },
        {
          model: Usuario,
          as: "medico",
          attributes: ["id", "nombre", "email"],
        },
        {
          model: Servicio,
          attributes: ["id", "nombre", "descripcion"],
        },
      ],
    })

    if (!turno) {
      return res.status(404).json({ mensaje: "Turno no encontrado" })
    }

    // Verificar permisos (solo admin, el médico asignado o el paciente pueden ver el turno)
    if (usuario.rol !== "admin" && usuario.id !== turno.medicoId && usuario.id !== turno.pacienteId) {
      return res.status(403).json({ mensaje: "Acceso denegado" })
    }

    res.status(200).json(turno)
  } catch (error) {
    console.error("Error al obtener turno:", error)
    res.status(500).json({ mensaje: "Error en el servidor" })
  }
}

// Modificar la función crearTurno para verificar disponibilidad
const crearTurno = async (req, res) => {
  try {
    const usuario = req.usuario

    const { medicoId, pacienteId, servicioId, fecha, hora, notas } = req.body

    // Validar datos
    if (!medicoId || !servicioId || !fecha || !hora) {
      return res.status(400).json({ mensaje: "Faltan datos requeridos para el turno" })
    }

    // Determinar el pacienteId (si es un paciente creando su propio turno)
    const idPaciente = usuario.rol === "paciente" ? usuario.id : pacienteId

    if (!idPaciente) {
      return res.status(400).json({ mensaje: "Se requiere ID del paciente" })
    }

    // Verificar disponibilidad usando la nueva utilidad
    const disponibilidad = await verificarDisponibilidadHorario(medicoId, fecha, hora)

    if (!disponibilidad.disponible) {
      return res.status(400).json({ mensaje: disponibilidad.mensaje })
    }

    // Crear turno
    const nuevoTurno = await Turno.create({
      medicoId,
      pacienteId: idPaciente,
      servicioId,
      fecha,
      hora,
      notas,
      estado: "pendiente",
    })

    // Cargar relaciones para la respuesta
    const turnoConRelaciones = await Turno.findByPk(nuevoTurno.id, {
      include: [
        {
          model: Usuario,
          as: "paciente",
          attributes: ["id", "nombre", "email"],
        },
        {
          model: Usuario,
          as: "medico",
          attributes: ["id", "nombre", "email"],
        },
        {
          model: Servicio,
          attributes: ["id", "nombre", "descripcion"],
        },
      ],
    })

    // Enviar notificación
    await enviarNotificacionTurno(turnoConRelaciones, "creacion")

    res.status(201).json({
      mensaje: "Turno creado exitosamente",
      turno: turnoConRelaciones,
    })
  } catch (error) {
    console.error("Error al crear turno:", error)
    res.status(500).json({ mensaje: "Error en el servidor" })
  }
}

// Actualizar turno
const actualizarTurno = async (req, res) => {
  try {
    const { id } = req.params
    const usuario = req.usuario

    const turno = await Turno.findByPk(id)

    if (!turno) {
      return res.status(404).json({ mensaje: "Turno no encontrado" })
    }

    // Verificar permisos
    const esPropietario = usuario.id === turno.pacienteId || usuario.id === turno.medicoId

    if (usuario.rol !== "admin" && !esPropietario) {
      return res.status(403).json({ mensaje: "Acceso denegado" })
    }

    const { medicoId, pacienteId, servicioId, fecha, hora, notas, estado } = req.body

    // Actualizar campos
    if (medicoId && (usuario.rol === "admin" || usuario.rol === "medico")) turno.medicoId = medicoId
    if (pacienteId && usuario.rol === "admin") turno.pacienteId = pacienteId
    if (servicioId) turno.servicioId = servicioId
    if (fecha) turno.fecha = fecha
    if (hora) turno.hora = hora
    if (notas !== undefined) turno.notas = notas
    if (estado) turno.estado = estado

    await turno.save()

    // Cargar relaciones para la respuesta
    const turnoActualizado = await Turno.findByPk(turno.id, {
      include: [
        {
          model: Usuario,
          as: "paciente",
          attributes: ["id", "nombre", "email"],
        },
        {
          model: Usuario,
          as: "medico",
          attributes: ["id", "nombre", "email"],
        },
        {
          model: Servicio,
          attributes: ["id", "nombre", "descripcion"],
        },
      ],
    })

    // Enviar notificación
    await enviarNotificacionTurno(turnoActualizado, "actualizacion")

    res.status(200).json({
      mensaje: "Turno actualizado exitosamente",
      turno: turnoActualizado,
    })
  } catch (error) {
    console.error("Error al actualizar turno:", error)
    res.status(500).json({ mensaje: "Error en el servidor" })
  }
}

// Cancelar turno
const cancelarTurno = async (req, res) => {
  try {
    const { id } = req.params
    const usuario = req.usuario

    const turno = await Turno.findByPk(id, {
      include: [
        {
          model: Usuario,
          as: "paciente",
          attributes: ["id", "nombre", "email"],
        },
        {
          model: Usuario,
          as: "medico",
          attributes: ["id", "nombre", "email"],
        },
        {
          model: Servicio,
          attributes: ["id", "nombre", "descripcion"],
        },
      ],
    })

    if (!turno) {
      return res.status(404).json({ mensaje: "Turno no encontrado" })
    }

    // Verificar permisos
    const esPropietario = usuario.id === turno.pacienteId || usuario.id === turno.medicoId

    if (usuario.rol !== "admin" && !esPropietario) {
      return res.status(403).json({ mensaje: "Acceso denegado" })
    }

    // Marcar como cancelado en lugar de eliminar
    turno.estado = "cancelado"
    await turno.save()

    // Enviar notificación
    await enviarNotificacionTurno(turno, "cancelacion")

    res.status(200).json({
      mensaje: "Turno cancelado exitosamente",
    })
  } catch (error) {
    console.error("Error al cancelar turno:", error)
    res.status(500).json({ mensaje: "Error en el servidor" })
  }
}

// Exportar la función modificada junto con las demás
module.exports = {
  obtenerTurnos,
  obtenerTurnoPorId,
  crearTurno,
  actualizarTurno,
  cancelarTurno,
}

