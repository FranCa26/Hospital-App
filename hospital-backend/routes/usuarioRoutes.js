/// archivo de rutas de usuarios

const express = require("express")
const router = express.Router()
const {
  obtenerUsuarios,
  obtenerUsuarioPorId,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
  obtenerMedicos,
} = require("../controllers/usuarioController")
const { verificarToken, esAdmin,esAdminOMedico} = require("../utils/auth")

// Rutas de usuarios
router.get("/", verificarToken, esAdminOMedico, obtenerUsuarios);
router.get("/medicos", verificarToken, obtenerMedicos)
router.get("/:id", verificarToken, obtenerUsuarioPorId)
router.post("/", verificarToken, esAdmin, crearUsuario)
router.put("/:id", verificarToken, actualizarUsuario)
router.delete("/:id", verificarToken, eliminarUsuario)

module.exports = router

