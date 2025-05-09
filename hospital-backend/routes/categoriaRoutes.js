/// archivo de rutas de categorías

const express = require("express")
const router = express.Router()
const {
  obtenerCategorias,
  obtenerCategoriaPorId,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
} = require("../controllers/categoriaController")
const { verificarToken, esAdmin } = require("../utils/auth")

// Rutas de categorías
router.get("/", obtenerCategorias)
router.get("/:id", obtenerCategoriaPorId)
router.post("/", verificarToken, esAdmin, crearCategoria)
router.put("/:id", verificarToken, esAdmin, actualizarCategoria)
router.delete("/:id", verificarToken, esAdmin, eliminarCategoria)

module.exports = router

