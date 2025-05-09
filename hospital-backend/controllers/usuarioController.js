/// archivo que hace referencia a las funciones de los usuarios


const bcrypt = require("bcrypt")
const { Usuario } = require("../models")




// Obtener usuarios (filtrados por rol si se especifica)
const obtenerUsuarios = async (req, res) => {
  try {
    const { rol } = req.query;
    const usuario = req.usuario;
    
    // Construir condiciones de búsqueda
    const where = {};
    if (rol) {
      where.rol = rol;
    } else if (usuario.rol === "medico") {
      // Si es médico y no se especifica rol, mostrar solo pacientes
      where.rol = "paciente";
    }
    
    const usuarios = await Usuario.findAll({
      where,
      attributes: { exclude: ["password"] },
    });

    res.status(200).json(usuarios);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
};

// Obtener usuario por ID
const obtenerUsuarioPorId = async (req, res) => {
  try {
    const { id } = req.params
    const usuarioAutenticado = req.usuario

    // Solo permitir acceso al propio usuario o a un admin
    if (usuarioAutenticado.id.toString() !== id && usuarioAutenticado.rol !== "admin") {
      return res.status(403).json({ mensaje: "Acceso denegado" })
    }

    const usuario = await Usuario.findByPk(id, {
      attributes: { exclude: ["password"] },
    })

    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" })
    }

    res.status(200).json(usuario)
  } catch (error) {
    console.error("Error al obtener usuario:", error)
    res.status(500).json({ mensaje: "Error en el servidor" })
  }
}

// Crear nuevo usuario (solo admin)
const crearUsuario = async (req, res) => {
  try {
    const { nombre, email, password, rol, telefono, direccion, especialidad } = req.body

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
      especialidad,
    })

    // Respuesta exitosa (sin devolver la contraseña)
    const { password: _, ...usuarioSinPassword } = nuevoUsuario.toJSON()

    res.status(201).json({
      mensaje: "Usuario creado exitosamente",
      usuario: usuarioSinPassword,
    })
  } catch (error) {
    console.error("Error al crear usuario:", error)
    res.status(500).json({ mensaje: "Error en el servidor" })
  }
}

// Actualizar usuario
const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params
    const usuarioAutenticado = req.usuario

    // Solo permitir actualización al propio usuario o a un admin
    if (usuarioAutenticado.id.toString() !== id && usuarioAutenticado.rol !== "admin") {
      return res.status(403).json({ mensaje: "Acceso denegado" })
    }

    const { nombre, email, password, rol, telefono, direccion, especialidad } = req.body

    const usuario = await Usuario.findByPk(id)

    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" })
    }

    // Actualizar campos
    if (nombre) usuario.nombre = nombre
    if (email) usuario.email = email

    // Solo admin puede cambiar roles
    if (rol && usuarioAutenticado.rol === "admin") {
      usuario.rol = rol
    }

    if (telefono !== undefined) usuario.telefono = telefono
    if (direccion !== undefined) usuario.direccion = direccion
    if (especialidad !== undefined) usuario.especialidad = especialidad

    // Actualizar contraseña si se proporciona
    if (password) {
      const salt = await bcrypt.genSalt(10)
      usuario.password = await bcrypt.hash(password, salt)
    }

    await usuario.save()

    // Respuesta exitosa (sin devolver la contraseña)
    const { password: _, ...usuarioActualizado } = usuario.toJSON()

    res.status(200).json({
      mensaje: "Usuario actualizado exitosamente",
      usuario: usuarioActualizado,
    })
  } catch (error) {
    console.error("Error al actualizar usuario:", error)
    res.status(500).json({ mensaje: "Error en el servidor" })
  }
}

// Eliminar usuario
const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params
    const usuarioAutenticado = req.usuario

    // Solo permitir eliminación al propio usuario o a un admin
    if (usuarioAutenticado.id.toString() !== id && usuarioAutenticado.rol !== "admin") {
      return res.status(403).json({ mensaje: "Acceso denegado" })
    }

    const usuario = await Usuario.findByPk(id)

    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" })
    }

    await usuario.destroy()

    res.status(200).json({
      mensaje: "Usuario eliminado exitosamente",
    })
  } catch (error) {
    console.error("Error al eliminar usuario:", error)
    res.status(500).json({ mensaje: "Error en el servidor" })
  }
}

// Obtener médicos
const obtenerMedicos = async (req, res) => {
  try {
    const medicos = await Usuario.findAll({
      where: { rol: "medico" },
      attributes: { exclude: ["password"] },
    })

    res.status(200).json(medicos)
  } catch (error) {
    console.error("Error al obtener médicos:", error)
    res.status(500).json({ mensaje: "Error en el servidor" })
  }
}

module.exports = {
  obtenerUsuarios,
  obtenerUsuarioPorId,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
  obtenerMedicos,
}

