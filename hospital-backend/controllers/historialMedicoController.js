/// archivo para controlar el historial médico de los pacientes

const {
  HistorialMedico,
  ArchivoHistorial,
  Usuario,
  Turno,
  Op,
} = require("../models");
const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const unlinkAsync = promisify(fs.unlink);

// Obtener historial médico de un paciente
const obtenerHistorialPaciente = async (req, res) => {
  try {
    const { pacienteId } = req.params;
    const usuario = req.usuario;

    // Verificar permisos (solo el propio paciente, médicos o admin)
    const esPaciente = usuario.id.toString() === pacienteId;
    const esMedico = usuario.rol === "medico";
    const esAdmin = usuario.rol === "admin";

    if (!esPaciente && !esMedico && !esAdmin) {
      return res.status(403).json({ mensaje: "Acceso denegado" });
    }

    // Construir condiciones de búsqueda
    const where = { pacienteId };

    // Si es médico y no es admin, solo mostrar registros no privados o creados por él
    if (esMedico && !esAdmin) {
      where[Op.or] = [{ esPrivado: false }, { medicoId: usuario.id }];
    }

    const historial = await HistorialMedico.findAll({
      where,
      include: [
        {
          model: Usuario,
          as: "medico",
          attributes: ["id", "nombre", "especialidad"],
        },
        {
          model: ArchivoHistorial,
          attributes: ["id", "nombre", "tipo", "descripcion", "createdAt"],
        },
      ],
      order: [["fecha", "DESC"]],
    });

    res.status(200).json(historial);
  } catch (error) {
    console.error("Error al obtener historial médico:", error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
};


// Obtener un registro específico del historial
const obtenerRegistroHistorial = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = req.usuario;

    const registro = await HistorialMedico.findByPk(id, {
      include: [
        {
          model: Usuario,
          as: "paciente",
          attributes: ["id", "nombre", "email"],
        },
        {
          model: Usuario,
          as: "medico",
          attributes: ["id", "nombre", "especialidad"],
        },
        {
          model: ArchivoHistorial,
          attributes: ["id", "nombre", "tipo", "descripcion", "createdAt"],
        },
        {
          model: Turno,
          attributes: ["id", "fecha", "hora", "estado"],
        },
      ],
    });

    if (!registro) {
      return res.status(404).json({ mensaje: "Registro no encontrado" });
    }

    // Verificar permisos
    const esPaciente = usuario.id === registro.pacienteId;
    const esMedicoCreador = usuario.id === registro.medicoId;
    const esAdmin = usuario.rol === "admin";
    const esMedico = usuario.rol === "medico";

    // Si es privado, solo el médico creador y admin pueden verlo
    if (registro.esPrivado && !esMedicoCreador && !esAdmin) {
      return res
        .status(403)
        .json({ mensaje: "Acceso denegado a registro privado" });
    }

    // Si no es el paciente, ni el médico creador, ni admin, ni otro médico
    if (!esPaciente && !esMedicoCreador && !esAdmin && !esMedico) {
      return res.status(403).json({ mensaje: "Acceso denegado" });
    }

    res.status(200).json(registro);
  } catch (error) {
    console.error("Error al obtener registro de historial:", error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
};

// Crear entrada de historial médico
const crearEntradaHistorial = async (req, res) => {
  try {
    const usuario = req.usuario;

    // Solo médicos pueden crear entradas
    if (usuario.rol !== "medico" && usuario.rol !== "admin") {
      return res
        .status(403)
        .json({
          mensaje: "Acceso denegado - Solo médicos pueden crear registros",
        });
    }

    const {
      pacienteId,
      turnoId,
      fecha,
      motivo,
      sintomas,
      diagnostico,
      tratamiento,
      observaciones,
      esPrivado,
    } = req.body;

    // Validar datos requeridos
    if (!pacienteId || !fecha || !motivo || !diagnostico) {
      return res.status(400).json({
        mensaje:
          "Datos incompletos. Se requiere pacienteId, fecha, motivo y diagnóstico",
      });
    }

    // Verificar que el paciente existe
    const paciente = await Usuario.findOne({
      where: { id: pacienteId, rol: "paciente" },
    });

    if (!paciente) {
      return res.status(404).json({ mensaje: "Paciente no encontrado" });
    }

    // Crear entrada de historial
    const nuevaEntrada = await HistorialMedico.create({
      pacienteId,
      medicoId: usuario.id,
      turnoId,
      fecha,
      motivo,
      sintomas,
      diagnostico,
      tratamiento,
      observaciones,
      esPrivado: esPrivado || false,
    });

    res.status(201).json({
      mensaje: "Registro de historial médico creado exitosamente",
      historial: nuevaEntrada,
    });
  } catch (error) {
    console.error("Error al crear entrada de historial médico:", error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
};

// Actualizar entrada de historial médico
const actualizarEntradaHistorial = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = req.usuario;

    const registro = await HistorialMedico.findByPk(id);

    if (!registro) {
      return res.status(404).json({ mensaje: "Registro no encontrado" });
    }

    // Verificar permisos (solo el médico que lo creó o un admin)
    if (usuario.rol !== "admin" && usuario.id !== registro.medicoId) {
      return res.status(403).json({ mensaje: "Acceso denegado" });
    }

    const {
      motivo,
      sintomas,
      diagnostico,
      tratamiento,
      observaciones,
      esPrivado,
    } = req.body;

    // Actualizar campos
    if (motivo) registro.motivo = motivo;
    if (sintomas !== undefined) registro.sintomas = sintomas;
    if (diagnostico) registro.diagnostico = diagnostico;
    if (tratamiento !== undefined) registro.tratamiento = tratamiento;
    if (observaciones !== undefined) registro.observaciones = observaciones;
    if (esPrivado !== undefined) registro.esPrivado = esPrivado;

    await registro.save();

    res.status(200).json({
      mensaje: "Registro de historial médico actualizado exitosamente",
      historial: registro,
    });
  } catch (error) {
    console.error("Error al actualizar entrada de historial médico:", error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
};

// Eliminar entrada de historial médico
const eliminarEntradaHistorial = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = req.usuario;

    const registro = await HistorialMedico.findByPk(id);

    if (!registro) {
      return res.status(404).json({ mensaje: "Registro no encontrado" });
    }

    // Verificar permisos (solo el médico que lo creó o un admin)
    if (usuario.rol !== "admin" && usuario.id !== registro.medicoId) {
      return res.status(403).json({ mensaje: "Acceso denegado" });
    }

    // Eliminar archivos asociados
    const archivos = await ArchivoHistorial.findAll({
      where: { historialId: id },
    });

    // Eliminar archivos físicos
    for (const archivo of archivos) {
      try {
        await unlinkAsync(archivo.ruta);
      } catch (err) {
        console.error(`Error al eliminar archivo físico ${archivo.ruta}:`, err);
      }
    }

    // Eliminar registro
    await registro.destroy();

    res.status(200).json({
      mensaje: "Registro de historial médico eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error al eliminar entrada de historial médico:", error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
};

// Subir archivo al historial médico
const subirArchivoHistorial = async (req, res) => {
  try {
    const { historialId } = req.params;
    const usuario = req.usuario;

    if (!req.file) {
      return res
        .status(400)
        .json({ mensaje: "No se ha proporcionado ningún archivo" });
    }

    const registro = await HistorialMedico.findByPk(historialId);

    if (!registro) {
      // Eliminar archivo subido si el registro no existe
      await unlinkAsync(req.file.path);
      return res
        .status(404)
        .json({ mensaje: "Registro de historial no encontrado" });
    }

    // Verificar permisos (solo el médico que lo creó o un admin)
    if (usuario.rol !== "admin" && usuario.id !== registro.medicoId) {
      // Eliminar archivo subido si no tiene permisos
      await unlinkAsync(req.file.path);
      return res.status(403).json({ mensaje: "Acceso denegado" });
    }

    // Crear registro de archivo
    const nuevoArchivo = await ArchivoHistorial.create({
      historialId,
      nombre: req.file.originalname,
      ruta: req.file.path,
      tipo: req.file.mimetype,
      tamaño: req.file.size,
      descripcion: req.body.descripcion || "",
    });

    res.status(201).json({
      mensaje: "Archivo subido exitosamente",
      archivo: {
        id: nuevoArchivo.id,
        nombre: nuevoArchivo.nombre,
        tipo: nuevoArchivo.tipo,
        tamaño: nuevoArchivo.tamaño,
        descripcion: nuevoArchivo.descripcion,
        createdAt: nuevoArchivo.createdAt,
      },
    });
  } catch (error) {
    console.error("Error al subir archivo al historial médico:", error);

    // Intentar eliminar el archivo si hubo un error
    if (req.file) {
      try {
        await unlinkAsync(req.file.path);
      } catch (err) {
        console.error("Error al eliminar archivo tras fallo:", err);
      }
    }

    res.status(500).json({ mensaje: "Error en el servidor" });
  }
};

// Descargar archivo del historial médico
const descargarArchivoHistorial = async (req, res) => {
  try {
    const { archivoId } = req.params;
    const usuario = req.usuario;

    const archivo = await ArchivoHistorial.findByPk(archivoId, {
      include: [
        {
          model: HistorialMedico,
          attributes: ["id", "pacienteId", "medicoId", "esPrivado"],
        },
      ],
    });

    if (!archivo || !archivo.HistorialMedico) {
      return res.status(404).json({ mensaje: "Archivo no encontrado" });
    }

    const historial = archivo.HistorialMedico;

    // Verificar permisos
    const esPaciente = usuario.id === historial.pacienteId;
    const esMedicoCreador = usuario.id === historial.medicoId;
    const esAdmin = usuario.rol === "admin";
    const esMedico = usuario.rol === "medico";

    // Si es privado, solo el médico creador y admin pueden verlo
    if (historial.esPrivado && !esMedicoCreador && !esAdmin) {
      return res
        .status(403)
        .json({ mensaje: "Acceso denegado a archivo privado" });
    }

    // Si no es el paciente, ni el médico creador, ni admin, ni otro médico
    if (!esPaciente && !esMedicoCreador && !esAdmin && !esMedico) {
      return res.status(403).json({ mensaje: "Acceso denegado" });
    }

    // Verificar si el archivo existe físicamente
    if (!fs.existsSync(archivo.ruta)) {
      return res
        .status(404)
        .json({ mensaje: "El archivo físico no se encuentra disponible" });
    }

    // Enviar archivo
    res.download(archivo.ruta, archivo.nombre);
  } catch (error) {
    console.error("Error al descargar archivo del historial médico:", error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
};

// Y en historialMedicoController.js, añade esta función:
const obtenerTodosHistoriales = async (req, res) => {
  try {
    const usuario = req.usuario;
    
    // Construir condiciones de búsqueda según el rol
    let where = {};
    
    if (usuario.rol === "medico") {
      // Médicos solo ven historiales de sus pacientes
      where.medicoId = usuario.id;
    } else if (usuario.rol === "paciente") {
      // Pacientes solo ven sus propios historiales
      where.pacienteId = usuario.id;
    }
    // Admin ve todos los historiales
    
    const historiales = await HistorialMedico.findAll({
      where,
      include: [
        {
          model: Usuario,
          as: "paciente",
          attributes: ["id", "nombre", "email"]
        },
        {
          model: Usuario,
          as: "medico",
          attributes: ["id", "nombre", "especialidad"]
        }
      ],
      order: [["fecha", "DESC"]]
    });
    
    res.status(200).json(historiales);
  } catch (error) {
    console.error("Error al obtener historiales médicos:", error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
};
///nuevo
const obtenerHistorialMedico = async (req, res) => {
  try {
    const { id } = req.params; // ID del médico
    const usuario = req.usuario;

    // Verificar permisos (solo el propio médico o admin)
    if (usuario.rol !== "admin" && usuario.id.toString() !== id) {
      return res.status(403).json({ mensaje: "Acceso denegado" });
    }

    const historiales = await HistorialMedico.findAll({
      where: { medicoId: id },
      include: [
        {
          model: Usuario,
          as: "paciente",
          attributes: ["id", "nombre", "email"],
        },
        {
          model: Usuario,
          as: "medico",
          attributes: ["id", "nombre", "especialidad"],
        },
      ],
      order: [["fecha", "DESC"]],
    });

    res.status(200).json(historiales);
  } catch (error) {
    console.error("Error al obtener historial médico:", error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
};


// Obtener todos los historiales (para admin)

// Generar PDF de un registro de historial médico
const generarPDFHistorial = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = req.usuario;

    // Buscar el registro con sus relaciones
    const registro = await HistorialMedico.findByPk(id, {
      include: [
        {
          model: Usuario,
          as: "paciente",
          attributes: ["id", "nombre", "email", "telefono"],
        },
        {
          model: Usuario,
          as: "medico",
          attributes: ["id", "nombre", "especialidad", "email"],
        },
      ],
    });

    if (!registro) {
      return res.status(404).json({ mensaje: "Registro no encontrado" });
    }

    // Verificar permisos
    const esPaciente = usuario.id === registro.pacienteId;
    const esMedicoCreador = usuario.id === registro.medicoId;
    const esAdmin = usuario.rol === "admin";
    const esMedico = usuario.rol === "medico";

    // Si es privado, solo el médico creador y admin pueden verlo
    if (registro.esPrivado && !esMedicoCreador && !esAdmin) {
      return res.status(403).json({ mensaje: "Acceso denegado a registro privado" });
    }

    // Si no es el paciente, ni el médico creador, ni admin, ni otro médico
    if (!esPaciente && !esMedicoCreador && !esAdmin && !esMedico) {
      return res.status(403).json({ mensaje: "Acceso denegado" });
    }

    // Crear el PDF
    const PDFDocument = require("pdfkit");
    const doc = new PDFDocument({ margin: 50 });

    // Configurar respuesta HTTP
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=historial-medico-${id}.pdf`);

    // Pipe el PDF a la respuesta
    doc.pipe(res);

    // Añadir contenido al PDF
    doc.fontSize(20).text("Historial Médico", { align: "center" });
    doc.moveDown();

    // Fecha
    const fecha = new Date(registro.fecha).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    doc.fontSize(12).text(`Fecha: ${fecha}`, { align: "right" });
    doc.moveDown();

    // Información del paciente
    doc.fontSize(16).text("Información del Paciente");
    doc.moveDown(0.5);
    doc.fontSize(12).text(`Nombre: ${registro.paciente?.nombre || "No disponible"}`);
    doc.fontSize(12).text(`Email: ${registro.paciente?.email || "No disponible"}`);
    if (registro.paciente?.telefono) {
      doc.fontSize(12).text(`Teléfono: ${registro.paciente.telefono}`);
    }
    doc.moveDown();

    // Información del médico
    doc.fontSize(16).text("Información del Médico");
    doc.moveDown(0.5);
    doc.fontSize(12).text(`Nombre: ${registro.medico?.nombre || "No disponible"}`);
    doc.fontSize(12).text(`Especialidad: ${registro.medico?.especialidad || "No especificada"}`);
    doc.fontSize(12).text(`Email: ${registro.medico?.email || "No disponible"}`);
    doc.moveDown();

    // Detalles médicos
    doc.fontSize(16).text("Detalles Médicos");
    doc.moveDown(0.5);

    // Motivo
    doc.fontSize(14).text("Motivo de Consulta");
    doc.moveDown(0.5);
    doc.fontSize(12).text(registro.motivo || "No especificado");
    doc.moveDown();

    // Síntomas
    if (registro.sintomas) {
      doc.fontSize(14).text("Síntomas");
      doc.moveDown(0.5);
      doc.fontSize(12).text(registro.sintomas);
      doc.moveDown();
    }

    // Diagnóstico
    doc.fontSize(14).text("Diagnóstico");
    doc.moveDown(0.5);
    doc.fontSize(12).text(registro.diagnostico || "No especificado");
    doc.moveDown();

    // Tratamiento
    if (registro.tratamiento) {
      doc.fontSize(14).text("Tratamiento");
      doc.moveDown(0.5);
      doc.fontSize(12).text(registro.tratamiento);
      doc.moveDown();
    }

    // Observaciones
    if (registro.observaciones) {
      doc.fontSize(14).text("Observaciones");
      doc.moveDown(0.5);
      doc.fontSize(12).text(registro.observaciones);
      doc.moveDown();
    }

    // Pie de página
    doc.fontSize(10).text(
      `Documento generado el ${new Date().toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })}`,
      { align: "center" }
    );

    // Finalizar el PDF
    doc.end();
  } catch (error) {
    console.error("Error al generar PDF de historial médico:", error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
};

module.exports = {
  obtenerHistorialPaciente,
  obtenerRegistroHistorial,
  crearEntradaHistorial,
  actualizarEntradaHistorial,
  eliminarEntradaHistorial,
  subirArchivoHistorial,
  descargarArchivoHistorial,
  obtenerTodosHistoriales,
  obtenerHistorialMedico,
  generarPDFHistorial,
};
