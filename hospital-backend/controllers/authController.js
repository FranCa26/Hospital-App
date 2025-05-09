/// archivo para controlar la autenticación de usuarios


const bcrypt = require("bcrypt")
const { Usuario } = require("../models")
const { generarToken } = require("../utils/auth")

// Controlador para iniciar sesión
const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Validar datos de entrada
    if (!email || !password) {
      return res.status(400).json({ mensaje: "Email y contraseña son requeridos" })
    }

    // Buscar usuario por email
    const usuario = await Usuario.findOne({ where: { email } })

    if (!usuario) {
      return res.status(401).json({ mensaje: "Credenciales inválidas" })
    }

    // Verificar contraseña
    const passwordValida = await bcrypt.compare(password, usuario.password)

    if (!passwordValida) {
      return res.status(401).json({ mensaje: "Credenciales inválidas" })
    }

    // Generar token JWT
    const token = generarToken(usuario)

    // Configurar cookie con el token
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
    })

    // Respuesta exitosa
    res.status(200).json({
      mensaje: "Inicio de sesión exitoso",
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
      },
      token,
    })
  } catch (error) {
    console.error("Error en inicio de sesión:", error)
    res.status(500).json({ mensaje: "Error en el servidor" })
  }
}

// Controlador para registrar un nuevo usuario
const registro = async (req, res) => {
  try {
    const { nombre, email, password, rol = "paciente", telefono, direccion, especialidad } = req.body

    // Validar datos
    if (!nombre || !email || !password) {
      return res.status(400).json({ mensaje: "Nombre, email y contraseña son requeridos" })
    }

    // Verificar si el email ya existe
    const usuarioExistente = await Usuario.findOne({ where: { email } })

    if (usuarioExistente) {
      return res.status(400).json({ mensaje: "El email ya está registrado" })
    }

    // Hash de la contraseña
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)

    // Crear usuario
    const nuevoUsuario = await Usuario.create({
      nombre,
      email,
      password: passwordHash,
      rol,
      telefono,
      direccion,
      especialidad, // Añadir especialidad aquí
    })

    // Generar token
    const token = generarToken(nuevoUsuario)

    // Configurar cookie con el token
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
    })

    // Respuesta exitosa (sin devolver la contraseña)
    res.status(201).json({
      mensaje: "Usuario registrado exitosamente",
      usuario: {
        id: nuevoUsuario.id,
        nombre: nuevoUsuario.nombre,
        email: nuevoUsuario.email,
        rol: nuevoUsuario.rol,
        telefono: nuevoUsuario.telefono,
        direccion: nuevoUsuario.direccion,
        especialidad: nuevoUsuario.especialidad, // Añadir especialidad aquí
      },
      token,
    })
  } catch (error) {
    console.error("Error en registro de usuario:", error)
    res.status(500).json({ mensaje: "Error en el servidor" })
  }
}
// Controlador para cerrar sesión
const logout = (req, res) => {
  // Eliminar cookie
  res.clearCookie("token")
  res.status(200).json({ mensaje: "Sesión cerrada exitosamente" })
}

// Controlador para obtener el perfil del usuario actual
const perfil = async (req, res) => {
  try {
    // El middleware de autenticación ya ha verificado y añadido el usuario a req
    const usuario = req.usuario

    // Respuesta exitosa (sin devolver la contraseña)
    res.status(200).json({
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      telefono: usuario.telefono,
      direccion: usuario.direccion,
      especialidad: usuario.especialidad,
    })
  } catch (error) {
    console.error("Error al obtener perfil:", error)
    res.status(500).json({ mensaje: "Error en el servidor" })
  }
}

module.exports = {
  login,
  registro,
  logout,
  perfil,
}

