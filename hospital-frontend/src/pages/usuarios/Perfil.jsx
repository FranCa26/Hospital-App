/// Este componente muestra el perfil del usuario actual y permite editar la información personal y la contraseña.
/// El formulario de edición se muestra solo si se hace clic en el botón "Editar Perfil".
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Save,
  X,
  Edit2,
  Shield,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "../../components/ui/Card";
import { useToast } from "../../contexts/ToastContext";

const Perfil = () => {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    confirmPassword: "",
    telefono: "",
    direccion: "",
    especialidad: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre || "",
        email: user.email || "",
        password: "",
        confirmPassword: "",
        telefono: user.telefono || "",
        direccion: user.direccion || "",
        especialidad: user.especialidad || "",
      });
     /// console.log("User data loaded:", user); // Added console.log to debug
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

    // Solo validar contraseña si se está intentando cambiar
    if (formData.password) {
      if (formData.password.length < 6) {
        newErrors.password = "La contraseña debe tener al menos 6 caracteres";
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Las contraseñas no coinciden";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Crear objeto con datos a actualizar
      const updateData = {
        nombre: formData.nombre,
        email: formData.email,
        telefono: formData.telefono,
        direccion: formData.direccion,
      };

      // Agregar especialidad si es médico
      if (user.rol === "medico") {
        updateData.especialidad = formData.especialidad;
      }

      // Agregar contraseña solo si se proporcionó una nueva
      if (formData.password) {
        updateData.password = formData.password;
      }

      console.log("Updating profile with data:", updateData); // Added console.log to debug

      const success = await updateProfile(updateData);

      if (success) {
        setIsEditing(false);
        // Limpiar contraseñas
        setFormData((prev) => ({
          ...prev,
          password: "",
          confirmPassword: "",
        }));
        showToast("Perfil actualizado exitosamente", "success");
      }
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      showToast("Error al actualizar perfil", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h1
        className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-6"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        Mi Perfil
      </motion.h1>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <Card className="border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
          <CardHeader className="border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5 text-primary" />
              Información Personal
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <motion.div
                  className="space-y-4"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <div>
                    <label
                      htmlFor="nombre"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center"
                    >
                      <User className="h-4 w-4 mr-1 text-primary" />
                      Nombre Completo
                    </label>
                    <div className="mt-1 relative">
                      <Input
                        id="nombre"
                        name="nombre"
                        type="text"
                        value={formData.nombre}
                        onChange={handleChange}
                        error={errors.nombre}
                        disabled={!isEditing}
                        className={`transition-all duration-300 ${
                          isEditing ? "border-primary focus:ring-primary" : ""
                        }`}
                      />
                      {!isEditing && (
                        <div className="absolute inset-0 bg-gray-100/50 dark:bg-gray-800/50 rounded-md pointer-events-none" />
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center"
                    >
                      <Mail className="h-4 w-4 mr-1 text-primary" />
                      Email
                    </label>
                    <div className="mt-1 relative">
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        error={errors.email}
                        disabled={!isEditing}
                        className={`transition-all duration-300 ${
                          isEditing ? "border-primary focus:ring-primary" : ""
                        }`}
                      />
                      {!isEditing && (
                        <div className="absolute inset-0 bg-gray-100/50 dark:bg-gray-800/50 rounded-md pointer-events-none" />
                      )}
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="space-y-4"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  <div>
                    <label
                      htmlFor="telefono"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center"
                    >
                      <Phone className="h-4 w-4 mr-1 text-primary" />
                      Teléfono
                    </label>
                    <div className="mt-1 relative">
                      <Input
                        id="telefono"
                        name="telefono"
                        type="tel"
                        value={formData.telefono}
                        onChange={handleChange}
                        error={errors.telefono}
                        disabled={!isEditing}
                        className={`transition-all duration-300 ${
                          isEditing ? "border-primary focus:ring-primary" : ""
                        }`}
                      />
                      {!isEditing && (
                        <div className="absolute inset-0 bg-gray-100/50 dark:bg-gray-800/50 rounded-md pointer-events-none" />
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="direccion"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center"
                    >
                      <MapPin className="h-4 w-4 mr-1 text-primary" />
                      Dirección
                    </label>
                    <div className="mt-1 relative">
                      <Input
                        id="direccion"
                        name="direccion"
                        type="text"
                        value={formData.direccion}
                        onChange={handleChange}
                        error={errors.direccion}
                        disabled={!isEditing}
                        className={`transition-all duration-300 ${
                          isEditing ? "border-primary focus:ring-primary" : ""
                        }`}
                      />
                      {!isEditing && (
                        <div className="absolute inset-0 bg-gray-100/50 dark:bg-gray-800/50 rounded-md pointer-events-none" />
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>

              {user?.rol === "medico" && (
                <motion.div
                  className="pt-4 border-t border-gray-200 dark:border-gray-700"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  <div>
                    <label
                      htmlFor="especialidad"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center"
                    >
                      <Briefcase className="h-4 w-4 mr-1 text-primary" />
                      Especialidad
                    </label>
                    <div className="mt-1 relative">
                      <Input
                        id="especialidad"
                        name="especialidad"
                        type="text"
                        value={formData.especialidad}
                        onChange={handleChange}
                        error={errors.especialidad}
                        disabled={!isEditing}
                        className={`transition-all duration-300 ${
                          isEditing ? "border-primary focus:ring-primary" : ""
                        }`}
                      />
                      {!isEditing && (
                        <div className="absolute inset-0 bg-gray-100/50 dark:bg-gray-800/50 rounded-md pointer-events-none" />
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {isEditing && (
                <motion.div
                  className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-primary" />
                    Cambiar Contraseña
                  </h3>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <label
                        htmlFor="password"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Nueva Contraseña
                      </label>
                      <div className="mt-1 relative">
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={handleChange}
                          error={errors.password}
                          placeholder="Dejar en blanco para no cambiar"
                          className="pr-10 transition-all duration-300 focus:ring-primary"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="confirmPassword"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Confirmar Nueva Contraseña
                      </label>
                      <div className="mt-1">
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showPassword ? "text" : "password"}
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          error={errors.confirmPassword}
                          className="transition-all duration-300 focus:ring-primary"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </form>
          </CardContent>
          <CardFooter className="flex justify-end space-x-4 border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-800">
            {isEditing ? (
              <>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      // Restaurar datos originales
                      if (user) {
                        setFormData({
                          nombre: user.nombre || "",
                          email: user.email || "",
                          password: "",
                          confirmPassword: "",
                          telefono: user.telefono || "",
                          direccion: user.direccion || "",
                          especialidad: user.especialidad || "",
                        });
                      }
                      setErrors({});
                    }}
                    disabled={isLoading}
                    className="flex items-center hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all duration-300"
                  >
                    <X className="mr-2 h-4 w-4" /> Cancelar
                  </Button>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary transition-all duration-300 flex items-center"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {isLoading ? "Guardando..." : "Guardar Cambios"}
                  </Button>
                </motion.div>
              </>
            ) : (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary transition-all duration-300 flex items-center"
                >
                  <Edit2 className="mr-2 h-4 w-4" /> Editar Perfil
                </Button>
              </motion.div>
            )}
          </CardFooter>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default Perfil;