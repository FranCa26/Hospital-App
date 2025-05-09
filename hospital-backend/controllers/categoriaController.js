/// archivo que contiene las funciones para las rutas de categorías

const { Categoria } = require("../models")

// Obtener todas las categorías
const obtenerCategorias = async (req, res) => {
  try {
    const categorias = await Categoria.findAll({
      order: [["nombre", "ASC"]],
    })

    res.status(200).json(categorias)
  } catch (error) {
    console.error("Error al obtener categorías:", error)
    res.status(500).json({ mensaje: "Error en el servidor" })
  }
}

// Obtener categoría por ID
const obtenerCategoriaPorId = async (req, res) => {
  try {
    const { id } = req.params

    const categoria = await Categoria.findByPk(id)

    if (!categoria) {
      return res.status(404).json({ mensaje: "Categoría no encontrada" })
    }

    res.status(200).json(categoria)
  } catch (error) {
    console.error("Error al obtener categoría:", error)
    res.status(500).json({ mensaje: "Error en el servidor" })
  }
}

// Crear nueva categoría (solo admin)
const crearCategoria = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body

    if (!nombre) {
      return res.status(400).json({ mensaje: "El nombre de la categoría es requerido" })
    }

    // Verificar si ya existe
    const categoriaExistente = await Categoria.findOne({
      where: { nombre },
    })

    if (categoriaExistente) {
      return res.status(400).json({ mensaje: "Ya existe una categoría con ese nombre" })
    }

    // Crear categoría
    const nuevaCategoria = await Categoria.create({
      nombre,
      descripcion,
    })

    res.status(201).json({
      mensaje: "Categoría creada exitosamente",
      categoria: nuevaCategoria,
    })
  } catch (error) {
    console.error("Error al crear categoría:", error)
    res.status(500).json({ mensaje: "Error en el servidor" })
  }
}

// Actualizar categoría (solo admin)
const actualizarCategoria = async (req, res) => {
  try {
    const { id } = req.params

    const categoria = await Categoria.findByPk(id)

    if (!categoria) {
      return res.status(404).json({ mensaje: "Categoría no encontrada" })
    }

    const { nombre, descripcion } = req.body

    // Actualizar campos
    if (nombre) categoria.nombre = nombre
    if (descripcion !== undefined) categoria.descripcion = descripcion

    await categoria.save()

    res.status(200).json({
      mensaje: "Categoría actualizada exitosamente",
      categoria,
    })
  } catch (error) {
    console.error("Error al actualizar categoría:", error)
    res.status(500).json({ mensaje: "Error en el servidor" })
  }
}

// Eliminar categoría (solo admin)
const eliminarCategoria = async (req, res) => {
  try {
    const { id } = req.params

    const categoria = await Categoria.findByPk(id)

    if (!categoria) {
      return res.status(404).json({ mensaje: "Categoría no encontrada" })
    }

    await categoria.destroy()

    res.status(200).json({
      mensaje: "Categoría eliminada exitosamente",
    })
  } catch (error) {
    console.error("Error al eliminar categoría:", error)
    res.status(500).json({ mensaje: "Error en el servidor" })
  }
}

module.exports = {
  obtenerCategorias,
  obtenerCategoriaPorId,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
}

