/// archivo para verificar token y roles de usuario en la API


const jwt = require("jsonwebtoken")
const { Usuario } = require("../models")

// Verificar token de autenticación
const verificarToken = async (req, res, next) => {
  try {
    // Obtener token del encabezado o de las cookies
    let token = null

    // Verificar si el token está en el encabezado
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1]
    }
    // Verificar si el token está en las cookies
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token
    }

    if (!token) {
      return res.status(401).json({ mensaje: "No autorizado - Token no proporcionado" })
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "clave_secreta_por_defecto")

    // Buscar usuario en la base de datos
    const usuario = await Usuario.findByPk(decoded.id)

    if (!usuario) {
      return res.status(401).json({ mensaje: "No autorizado - Usuario no encontrado" })
    }

    // Agregar usuario a la solicitud
    req.usuario = usuario
    next()
  } catch (error) {
    console.error("Error al verificar token:", error)
    return res.status(401).json({ mensaje: "No autorizado - Token inválido" })
  }
}

// Verificar si el usuario es administrador
const esAdmin = (req, res, next) => {
  if (req.usuario && req.usuario.rol === "admin") {
    next()
  } else {
    return res.status(403).json({ mensaje: "Acceso denegado - Se requiere rol de administrador" })
  }
}
// Middleware personalizado para permitir admin o médico
const esAdminOMedico = (req, res, next) => {
  if (req.usuario && (req.usuario.rol === "admin" || req.usuario.rol === "medico")) {
    next()
  } else {
    return res.status(403).json({ mensaje: "Acceso denegado - Se requiere rol de administrador o médico" })
  }
}

// Verificar si el usuario es médico
const esMedico = (req, res, next) => {
  if (req.usuario && (req.usuario.rol === "medico" || req.usuario.rol === "admin")) {
    next()
  } else {
    return res.status(403).json({ mensaje: "Acceso denegado - Se requiere rol de médico" })
  }
}

// Verificar si el usuario es paciente
const esPaciente = (req, res, next) => {
  if (req.usuario && req.usuario.rol === "paciente") {
    next()
  } else {
    return res.status(403).json({ mensaje: "Acceso denegado - Se requiere rol de paciente" })
  }
}

// Generar token JWT
const generarToken = (usuario) => {
  return jwt.sign(
    {
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
    },
    process.env.JWT_SECRET || "clave_secreta_por_defecto",
    { expiresIn: "5h" },
  )
}

module.exports = {
  verificarToken,
  esAdmin,
  esMedico,
  esPaciente,
  esAdminOMedico,
  generarToken,
}

