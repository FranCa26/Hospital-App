// Este componente es una página que muestra una lista de usuarios registrados en el sistema.
// Los usuarios pueden ser filtrados por rol y buscados por nombre o email.
// También se pueden agregar, editar y eliminar usuarios.
// Se utiliza el contexto de autenticación para obtener el usuario actual y el contexto de notificaciones para mostrar mensajes al usuario.

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Edit,
  Trash,
  Search,
  X,
  UserPlus,
  UsersIcon,
  Mail,
  Phone,
  Shield,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../components/ui/Table";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/Card";
import api from "../../services/api";

const Usuarios = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    nombre: "",
    email: "",
    password: "",
    confirmPassword: "",
    telefono: "",
    direccion: "",
    rol: "paciente",
    especialidad: "",
  });
  const [filtros, setFiltros] = useState({
    rol: "",
    busqueda: "",
  });
  const [usuariosFiltrados, setUsuariosFiltrados] = useState([]);
  const [errors, setErrors] = useState({});

  // Cargar usuarios
  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        setLoading(true);
        const response = await api.get("/usuarios");
        setUsuarios(response.data);
        setUsuariosFiltrados(response.data);
      } catch (error) {
        console.error("Error al cargar usuarios:", error);
        showToast("Error al cargar usuarios", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchUsuarios();
  }, []);

  // Filtrar usuarios cuando cambian los filtros
  useEffect(() => {
    let resultado = [...usuarios];

    // Filtrar por rol
    if (filtros.rol) {
      resultado = resultado.filter((usuario) => usuario.rol === filtros.rol);
    }

    // Filtrar por búsqueda
    if (filtros.busqueda) {
      const busqueda = filtros.busqueda.toLowerCase();
      resultado = resultado.filter(
        (usuario) =>
          usuario.nombre.toLowerCase().includes(busqueda) ||
          usuario.email.toLowerCase().includes(busqueda) ||
          (usuario.especialidad &&
            usuario.especialidad.toLowerCase().includes(busqueda))
      );
    }

    setUsuariosFiltrados(resultado);
  }, [filtros, usuarios]);

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({ ...prev, [name]: value }));
  };

  const limpiarFiltros = () => {
    setFiltros({
      rol: "",
      busqueda: "",
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      if (name === "rol" && value !== "medico") {
        // Si cambia el rol a algo que no es médico, limpiar especialidad
        newData.especialidad = "";
      }
      return newData;
    });

    // Limpiar error al cambiar el valor
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre) {
      newErrors.nombre = "El nombre es requerido";
    }

    if (!formData.email) {
      newErrors.email = "El email es requerido";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    if (!isEditing && !formData.password) {
      newErrors.password = "La contraseña es requerida";
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    if (!formData.rol) {
      newErrors.rol = "El rol es requerido";
    }

    if (formData.rol === "medico" && !formData.especialidad) {
      newErrors.especialidad = "La especialidad es requerida para médicos";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      // Crear objeto con datos a enviar
      const userData = { ...formData };
      delete userData.confirmPassword;

      // Asegurar que la especialidad se guarde correctamente para médicos
      if (userData.rol === "medico") {
        // Asegurarse de que especialidad no esté vacía para médicos
        if (!userData.especialidad || userData.especialidad.trim() === "") {
          userData.especialidad = "General"; // Valor predeterminado si está vacío
        }
      } else {
        // Para roles que no son médicos, establecer especialidad como null
        userData.especialidad = null;
      }

      // Si estamos editando y no se proporciona contraseña, eliminarla del objeto
      if (isEditing && !userData.password) {
        delete userData.password;
      }

      let response;

      if (isEditing) {
        // Actualizar usuario existente
        response = await api.put(`/usuarios/${formData.id}`, userData);
        showToast("Usuario actualizado exitosamente", "success");

        // Actualizar lista de usuarios
        setUsuarios((prev) =>
          prev.map((usuario) =>
            usuario.id === formData.id ? response.data.usuario : usuario
          )
        );
      } else {
        // Crear nuevo usuario
        response = await api.post("/auth/registro", userData);
        showToast("Usuario creado exitosamente", "success");

        // Agregar a la lista de usuarios
        setUsuarios((prev) => [...prev, response.data.usuario]);
      }

      // Limpiar formulario y cerrar
      resetForm();
    } catch (error) {
      console.error("Error al guardar usuario:", error);
      showToast(
        error.response?.data?.mensaje || "Error al guardar usuario",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (usuario) => {
    setFormData({
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      password: "",
      confirmPassword: "",
      telefono: usuario.telefono || "",
      direccion: usuario.direccion || "",
      rol: usuario.rol,
      especialidad: usuario.especialidad || "",
    });
    setIsEditing(true);
    setShowForm(true);
    setErrors({});
  };

  const handleDelete = async (id) => {
    if (id === user.id) {
      showToast("No puedes eliminar tu propio usuario", "error");
      return;
    }

    if (!confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
      return;
    }

    try {
      setLoading(true);
      await api.delete(`/usuarios/${id}`);

      // Actualizar lista de usuarios
      setUsuarios((prev) => prev.filter((usuario) => usuario.id !== id));
      showToast("Usuario eliminado exitosamente", "success");
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      showToast("Error al eliminar usuario", "error");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      id: null,
      nombre: "",
      email: "",
      password: "",
      confirmPassword: "",
      telefono: "",
      direccion: "",
      rol: "paciente",
      especialidad: "",
    });
    setIsEditing(false);
    setShowForm(false);
    setErrors({});
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
    exit: {
      opacity: 0,
      x: -20,
      transition: {
        duration: 0.2,
      },
    },
  };

  if (loading && usuarios.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <motion.div
          className="w-16 h-16 relative"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        >
          <div className="absolute top-0 left-0 w-full h-full border-4 border-primary border-t-transparent rounded-full"></div>
          <div
            className="absolute top-2 left-2 w-12 h-12 border-4 border-primary/40 border-t-transparent rounded-full"
            style={{ animationDelay: "-0.5s" }}
          ></div>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <motion.h1
          className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Usuarios
        </motion.h1>
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            className="mt-4 sm:mt-0 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary transition-all duration-300"
          >
            {showForm ? (
              <X className="mr-2 h-4 w-4" />
            ) : (
              <UserPlus className="mr-2 h-4 w-4" />
            )}
            {showForm ? "Cancelar" : "Nuevo Usuario"}
          </Button>
        </motion.div>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
              <CardHeader className="border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                <CardTitle className="flex items-center">
                  <UsersIcon className="mr-2 h-5 w-5 text-primary" />
                  {isEditing ? "Editar Usuario" : "Nuevo Usuario"}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="nombre"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center"
                      >
                        <UsersIcon className="h-4 w-4 mr-1 text-primary" />
                        Nombre Completo
                      </label>
                      <Input
                        id="nombre"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleFormChange}
                        error={errors.nombre}
                        className="transition-all duration-300 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center"
                      >
                        <Mail className="h-4 w-4 mr-1 text-primary" />
                        Email
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleFormChange}
                        error={errors.email}
                        className="transition-all duration-300 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="password"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center"
                      >
                        <Shield className="h-4 w-4 mr-1 text-primary" />
                        Contraseña{" "}
                        {isEditing && "(Dejar en blanco para no cambiar)"}
                      </label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleFormChange}
                        error={errors.password}
                        className="transition-all duration-300 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="confirmPassword"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Confirmar Contraseña
                      </label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleFormChange}
                        error={errors.confirmPassword}
                        className="transition-all duration-300 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="telefono"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center"
                      >
                        <Phone className="h-4 w-4 mr-1 text-primary" />
                        Teléfono (opcional)
                      </label>
                      <Input
                        id="telefono"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleFormChange}
                        error={errors.telefono}
                        className="transition-all duration-300 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="direccion"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Dirección (opcional)
                      </label>
                      <Input
                        id="direccion"
                        name="direccion"
                        value={formData.direccion}
                        onChange={handleFormChange}
                        error={errors.direccion}
                        className="transition-all duration-300 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="rol"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Rol
                      </label>
                      <Select
                        id="rol"
                        name="rol"
                        value={formData.rol}
                        onChange={handleFormChange}
                        error={errors.rol}
                        className="transition-all duration-300 focus:ring-primary"
                      >
                        <option value="paciente">Paciente</option>
                        <option value="medico">Médico</option>
                        <option value="admin">Administrador</option>
                      </Select>
                    </div>

                    {formData.rol === "medico" && (
                      <div>
                        <label
                          htmlFor="especialidad"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                          Especialidad
                        </label>
                        <Input
                          id="especialidad"
                          name="especialidad"
                          value={formData.especialidad}
                          onChange={handleFormChange}
                          error={errors.especialidad}
                          placeholder="Ej: Cardiología, Pediatría, etc."
                          className="transition-all duration-300 focus:ring-primary"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end space-x-4 pt-4">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        type="button"
                        variant="outline"
                        onClick={resetForm}
                        className="hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all duration-300"
                      >
                        <X className="mr-2 h-4 w-4" /> Cancelar
                      </Button>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        type="submit"
                        disabled={loading}
                        className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary transition-all duration-300"
                      >
                        {loading ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Guardando...
                          </>
                        ) : isEditing ? (
                          <>
                            <Edit className="mr-2 h-4 w-4" /> Actualizar
                          </>
                        ) : (
                          <>
                            <UserPlus className="mr-2 h-4 w-4" /> Guardar
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <Card className="border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
          <CardHeader className="border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="flex items-center">
                <UsersIcon className="mr-2 h-5 w-5 text-primary" />
                Lista de Usuarios
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <motion.div
              className="mb-6 flex flex-col sm:flex-row gap-4"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
            >
              <div className="relative w-full sm:w-64">
                <Input
                  type="text"
                  name="busqueda"
                  placeholder="Buscar usuario..."
                  value={filtros.busqueda}
                  onChange={handleFiltroChange}
                  className="pl-10 transition-all duration-300 focus:ring-primary"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>

              <div className="w-full sm:w-64">
                <Select
                  name="rol"
                  value={filtros.rol}
                  onChange={handleFiltroChange}
                  className="transition-all duration-300 focus:ring-primary"
                >
                  <option value="">Todos los roles</option>
                  <option value="paciente">Pacientes</option>
                  <option value="medico">Médicos</option>
                  <option value="admin">Administradores</option>
                </Select>
              </div>

              {(filtros.rol || filtros.busqueda) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <Button
                    variant="outline"
                    onClick={limpiarFiltros}
                    className="flex items-center hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all duration-300"
                  >
                    <X className="mr-2 h-4 w-4" /> Limpiar Filtros
                  </Button>
                </motion.div>
              )}
            </motion.div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <motion.div
                  className="w-16 h-16 relative"
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1.5,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  }}
                >
                  <div className="absolute top-0 left-0 w-full h-full border-4 border-primary border-t-transparent rounded-full"></div>
                  <div
                    className="absolute top-2 left-2 w-12 h-12 border-4 border-primary/40 border-t-transparent rounded-full"
                    style={{ animationDelay: "-0.5s" }}
                  ></div>
                </motion.div>
              </div>
            ) : usuariosFiltrados.length > 0 ? (
              <motion.div
                className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Teléfono</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {usuariosFiltrados.map((usuario) => (
                        <motion.tr
                          key={usuario.id}
                          variants={itemVariants}
                          exit="exit"
                          layout
                          className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                        >
                          <TableCell className="font-medium">
                            {usuario.nombre}
                          </TableCell>
                          <TableCell>{usuario.email}</TableCell>
                          <TableCell>
                            <motion.span
                              whileHover={{ scale: 1.05 }}
                              className={`px-2 py-1 text-xs rounded-full ${
                                usuario.rol === "admin"
                                  ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                                  : usuario.rol === "medico"
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                                  : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              }`}
                            >
                              {usuario.rol.charAt(0).toUpperCase() +
                                usuario.rol.slice(1)}
                            </motion.span>
                          </TableCell>
                          <TableCell>{usuario.telefono || "-"}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEdit(usuario)}
                                  className="p-2 h-auto hover:bg-blue-50 hover:text-blue-500 hover:border-blue-200 transition-all duration-300"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </motion.div>
                              {usuario.id !== user.id && (
                                <motion.div
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleDelete(usuario.id)}
                                    className="p-2 h-auto"
                                  >
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </motion.div>
                              )}
                            </div>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </motion.div>
            ) : (
              <motion.div
                className="text-center py-12"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <UsersIcon className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600" />
                </motion.div>
                <motion.h3
                  className="mt-4 text-xl font-medium text-gray-900 dark:text-white"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  No se encontraron usuarios
                </motion.h3>
                <motion.p
                  className="mt-2 text-gray-500 dark:text-gray-400 max-w-md mx-auto"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  {filtros.rol || filtros.busqueda
                    ? "No hay usuarios que coincidan con los filtros aplicados."
                    : "No hay usuarios disponibles en este momento."}
                </motion.p>
                <motion.div
                  className="mt-6"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={() => setShowForm(true)}
                    className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary transition-all duration-300"
                  >
                    <UserPlus className="mr-2 h-4 w-4" /> Agregar Usuario
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default Usuarios;


