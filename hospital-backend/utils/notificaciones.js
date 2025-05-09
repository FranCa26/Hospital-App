/// archivo para enviar notificaciones a los usuarios 

const { Notificacion } = require("../models")
const { enviarEmail } = require("./email")
require("dotenv").config();

// Enviar notificación para un turno
const enviarNotificacionTurno = async (turno, tipo) => {
  try {
    // Obtener información del turno
    const paciente = await turno.getPaciente()
    const medico = await turno.getMedico()
    const servicio = await turno.getServicio()

    let titulo = ""
    let mensajePaciente = ""
    let mensajeMedico = ""

    // Configurar mensajes según el tipo de notificación
    switch (tipo) {
      case "creacion":
        titulo = "Nuevo turno programado"
        mensajePaciente = `Se ha programado un turno para el ${turno.fecha} a las ${turno.hora} con el Dr. ${medico.nombre} para el servicio de ${servicio.nombre}.`
        mensajeMedico = `Se ha programado un nuevo turno para el ${turno.fecha} a las ${turno.hora} con el paciente ${paciente.nombre} para el servicio de ${servicio.nombre}.`
        break

      case "actualizacion":
        titulo = "Turno actualizado"
        mensajePaciente = `Su turno del ${turno.fecha} a las ${turno.hora} con el Dr. ${medico.nombre} ha sido actualizado. Estado: ${turno.estado}.`
        mensajeMedico = `El turno del ${turno.fecha} a las ${turno.hora} con el paciente ${paciente.nombre} ha sido actualizado. Estado: ${turno.estado}.`
        break

      case "cancelacion":
        titulo = "Turno cancelado"
        mensajePaciente = `Su turno del ${turno.fecha} a las ${turno.hora} con el Dr. ${medico.nombre} ha sido cancelado.`
        mensajeMedico = `El turno del ${turno.fecha} a las ${turno.hora} con el paciente ${paciente.nombre} ha sido cancelado.`
        break

      case "recordatorio":
        titulo = "Recordatorio de turno"
        mensajePaciente = `Recordatorio: Tiene un turno programado para mañana ${turno.fecha} a las ${turno.hora} con el Dr. ${medico.nombre}.`
        mensajeMedico = `Recordatorio: Tiene un turno programado para mañana ${turno.fecha} a las ${turno.hora} con el paciente ${paciente.nombre}.`
        break
    }

    // Crear notificación para el paciente
    await Notificacion.create({
      usuarioId: paciente.id,
      titulo,
      mensaje: mensajePaciente,
      tipo: "turno",
      referencia: turno.id.toString(),
      leida: false,
    })

    // Crear notificación para el médico
    await Notificacion.create({
      usuarioId: medico.id,
      titulo,
      mensaje: mensajeMedico,
      tipo: "turno",
      referencia: turno.id.toString(),
      leida: false,
    })

    // Enviar emails
    await enviarEmail(paciente.email, titulo, mensajePaciente)

    await enviarEmail(medico.email, titulo, mensajeMedico)

    return true
  } catch (error) {
    console.error("Error al enviar notificación de turno:", error)
    return false
  }
}

// Enviar notificación general
const enviarNotificacionGeneral = async (usuarioId, titulo, mensaje, tipo = "sistema", referencia) => {
  try {
    // Crear notificación
    const notificacion = await Notificacion.create({
      usuarioId,
      titulo,
      mensaje,
      tipo,
      referencia,
      leida: false,
    })

    return notificacion
  } catch (error) {
    console.error("Error al enviar notificación general:", error)
    return null
  }
}

module.exports = {
  enviarNotificacionTurno,
  enviarNotificacionGeneral,
}

