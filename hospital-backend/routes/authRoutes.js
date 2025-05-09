/// archivo de rutas de autenticación

const express = require("express")
const router = express.Router()
const { login, registro, logout, perfil } = require("../controllers/authController")
const { verificarToken } = require("../utils/auth")

// Rutas de autenticación
router.post("/login", login)
router.post("/registro", registro)
router.post("/logout", logout)
router.get("/perfil", verificarToken, perfil)

module.exports = router

