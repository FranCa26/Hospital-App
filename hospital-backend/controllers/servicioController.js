/// archivo que contiene las funciones para gestionar los servicios


const { Servicio, Categoria } = require("../models")

// Obtener todos los servicios
const obtenerServicios = async (req, res) => {
  try {
    const { categoriaId } = req.query

    // Construir condiciones de búsqueda
    const where = {}
    if (categoriaId) where.categoriaId = categoriaId

    const servicios = await Servicio.findAll({
      where,
      include: [
        {
          model: Categoria,
          attributes: ["id", "nombre"],
        },
      ],
      order: [["nombre", "ASC"]],
    })

    res.status(200).json(servicios)
  } catch (error) {
    console.error("Error al obtener servicios:", error)
    res.status(500).json({ mensaje: "Error en el servidor" })
  }
}

// Obtener servicio por ID
const obtenerServicioPorId = async (req, res) => {
  try {
    const { id } = req.params

    const servicio = await Servicio.findByPk(id, {
      include: [
        {
          model: Categoria,
          attributes: ["id", "nombre"],
        },
      ],
    })

    if (!servicio) {
      return res.status(404).json({ mensaje: "Servicio no encontrado" })
    }

    res.status(200).json(servicio)
  } catch (error) {
    console.error("Error al obtener servicio:", error)
    res.status(500).json({ mensaje: "Error en el servidor" })
  }
}

// Crear nuevo servicio (solo admin)
const crearServicio = async (req, res) => {
  try {
    const { nombre, descripcion, duracion, precio, categoriaId } = req.body

    if (!nombre || !categoriaId) {
      return res.status(400).json({ mensaje: "El nombre y la categoría son requeridos" })
    }

    // Verificar si ya existe
    const servicioExistente = await Servicio.findOne({
      where: { nombre },
    })

    if (servicioExistente) {
      return res.status(400).json({ mensaje: "Ya existe un servicio con ese nombre" })
    }

    // Crear servicio
    const nuevoServicio = await Servicio.create({
      nombre,
      descripcion,
      duracion,
      precio,
      categoriaId,
    })

    // Cargar relación para la respuesta
    const servicioConCategoria = await Servicio.findByPk(nuevoServicio.id, {
      include: [
        {
          model: Categoria,
          attributes: ["id", "nombre"],
        },
      ],
    })

    res.status(201).json({
      mensaje: "Servicio creado exitosamente",
      servicio: servicioConCategoria,
    })
  } catch (error) {
    console.error("Error al crear servicio:", error)
    res.status(500).json({ mensaje: "Error en el servidor" })
  }
}

// Actualizar servicio (solo admin)
const actualizarServicio = async (req, res) => {
  try {
    const { id } = req.params

    const servicio = await Servicio.findByPk(id)

    if (!servicio) {
      return res.status(404).json({ mensaje: "Servicio no encontrado" })
    }

    const { nombre, descripcion, duracion, precio, categoriaId } = req.body

    // Actualizar campos
    if (nombre) servicio.nombre = nombre
    if (descripcion !== undefined) servicio.descripcion = descripcion
    if (duracion !== undefined) servicio.duracion = duracion
    if (precio !== undefined) servicio.precio = precio
    if (categoriaId) servicio.categoriaId = categoriaId

    await servicio.save()

    // Cargar relación para la respuesta
    const servicioActualizado = await Servicio.findByPk(servicio.id, {
      include: [
        {
          model: Categoria,
          attributes: ["id", "nombre"],
        },
      ],
    })

    res.status(200).json({
      mensaje: "Servicio actualizado exitosamente",
      servicio: servicioActualizado,
    })
  } catch (error) {
    console.error("Error al actualizar servicio:", error)
    res.status(500).json({ mensaje: "Error en el servidor" })
  }
}

// Eliminar servicio (solo admin)
const eliminarServicio = async (req, res) => {
  try {
    const { id } = req.params

    const servicio = await Servicio.findByPk(id)

    if (!servicio) {
      return res.status(404).json({ mensaje: "Servicio no encontrado" })
    }

    await servicio.destroy()

    res.status(200).json({
      mensaje: "Servicio eliminado exitosamente",
    })
  } catch (error) {
    console.error("Error al eliminar servicio:", error)
    res.status(500).json({ mensaje: "Error en el servidor" })
  }
}

module.exports = {
  obtenerServicios,
  obtenerServicioPorId,
  crearServicio,
  actualizarServicio,
  eliminarServicio,
}

