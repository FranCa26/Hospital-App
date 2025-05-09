/// archivo que contiene las funciones para las notificaciones

const { Notificacion } = require("../models")

// Obtener notificaciones del usuario autenticado
const obtenerNotificaciones = async (req, res) => {
  try {
    const usuario = req.usuario

    const { leida } = req.query

    // Construir condiciones de búsqueda
    const where = {
      usuarioId: usuario.id,
    }

    if (leida !== undefined) {
      where.leida = leida === "true"
    }

    const notificaciones = await Notificacion.findAll({
      where,
      order: [["createdAt", "DESC"]],
    })

    res.status(200).json(notificaciones)
  } catch (error) {
    console.error("Error al obtener notificaciones:", error)
    res.status(500).json({ mensaje: "Error en el servidor" })
  }
}

// Marcar notificación como leída
const marcarComoLeida = async (req, res) => {
  try {
    const { id } = req.params
    const usuario = req.usuario

    const notificacion = await Notificacion.findByPk(id)

    if (!notificacion) {
      return res.status(404).json({ mensaje: "Notificación no encontrada" })
    }

    // Verificar que la notificación pertenezca al usuario
    if (notificacion.usuarioId !== usuario.id) {
      return res.status(403).json({ mensaje: "Acceso denegado" })
    }

    // Marcar como leída
    notificacion.leida = true
    await notificacion.save()

    res.status(200).json({
      mensaje: "Notificación marcada como leída",
      notificacion,
    })
  } catch (error) {
    console.error("Error al actualizar notificación:", error)
    res.status(500).json({ mensaje: "Error en el servidor" })
  }
}

// Eliminar notificación
const eliminarNotificacion = async (req, res) => {
  try {
    const { id } = req.params
    const usuario = req.usuario

    const notificacion = await Notificacion.findByPk(id)

    if (!notificacion) {
      return res.status(404).json({ mensaje: "Notificación no encontrada" })
    }

    // Verificar que la notificación pertenezca al usuario
    if (notificacion.usuarioId !== usuario.id) {
      return res.status(403).json({ mensaje: "Acceso denegado" })
    }

    await notificacion.destroy()

    res.status(200).json({
      mensaje: "Notificación eliminada exitosamente",
    })
  } catch (error) {
    console.error("Error al eliminar notificación:", error)
    res.status(500).json({ mensaje: "Error en el servidor" })
  }
}

// Marcar todas las notificaciones como leídas
const marcarTodasComoLeidas = async (req, res) => {
  try {
    const usuario = req.usuario

    await Notificacion.update({ leida: true }, { where: { usuarioId: usuario.id, leida: false } })

    res.status(200).json({
      mensaje: "Todas las notificaciones marcadas como leídas",
    })
  } catch (error) {
    console.error("Error al marcar notificaciones como leídas:", error)
    res.status(500).json({ mensaje: "Error en el servidor" })
  }
}

module.exports = {
  obtenerNotificaciones,
  marcarComoLeida,
  eliminarNotificacion,
  marcarTodasComoLeidas,
}

