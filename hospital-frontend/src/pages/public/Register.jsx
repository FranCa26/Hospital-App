// Este componente permite a los usuarios registrarse en la aplicación.


"use client";

import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import {
  Eye,
  EyeOff,
  UserPlus,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  AlertCircle,
  CheckCircle,
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

const Register = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    confirmPassword: "",
    telefono: "",
    direccion: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registerError, setRegisterError] = useState("");
  const { register } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Limpiar error al cambiar el valor
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (registerError) {
      setRegisterError("");
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

    if (!formData.password) {
      newErrors.password = "La contraseña es requerida";
    } else if (formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Registrar como paciente por defecto
      const userData = {
        ...formData,
        rol: "paciente",
      };

      // Eliminar confirmPassword ya que no es parte del modelo
      delete userData.confirmPassword;

      await register(userData);
    } catch (error) {
      console.error("Error en el formulario de registro:", error);
      setRegisterError(
        "Error al registrar usuario. Por favor, intenta de nuevo."
      );
    } finally {
      setIsLoading(false);
    }
  };

  
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, text: "", color: "" };

    let strength = 0;
    if (password.length >= 6) strength += 1;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    const strengthMap = {
      0: { text: "", color: "" },
      1: { text: "Muy débil", color: "bg-red-500" },
      2: { text: "Débil", color: "bg-orange-500" },
      3: { text: "Media", color: "bg-yellow-500" },
      4: { text: "Fuerte", color: "bg-lime-500" },
      5: { text: "Muy fuerte", color: "bg-green-500" },
    };

    return {
      strength,
      text: strengthMap[strength].text,
      color: strengthMap[strength].color,
      width: `${(strength / 5) * 100}%`,
    };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  // Animation 
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
      <motion.div
        className="w-full max-w-md space-y-8"
        initial="hidden"
        animate="show"
        variants={container}
      >
        <motion.div className="text-center" variants={item}>
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            Crea tu cuenta
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Regístrate para acceder a todos nuestros servicios
          </p>
        </motion.div>

        <motion.div variants={item}>
          <Card className="shadow-glossy dark:shadow-dark-lg border-gray-200 dark:border-gray-700 overflow-hidden">
            <CardHeader className="pb-0 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-gray-800 dark:to-gray-800">
              <CardTitle className="text-center text-xl font-semibold gradient-text">
                Registro de Paciente
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {registerError && (
                <motion.div
                  className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md flex items-start"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 mr-2 mt-0.5" />
                  <span className="text-sm text-red-600 dark:text-red-400">
                    {registerError}
                  </span>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="nombre"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Nombre Completo
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User
                        size={18}
                        className="text-gray-400 dark:text-gray-500"
                      />
                    </div>
                    <Input
                      id="nombre"
                      name="nombre"
                      type="text"
                      autoComplete="name"
                      required
                      value={formData.nombre}
                      onChange={handleChange}
                      error={errors.nombre}
                      placeholder="Juan Pérez"
                      className="pl-10"
                    />
                  </div>
                  {errors.nombre && (
                    <motion.p
                      className="mt-1 text-sm text-red-600 dark:text-red-400"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {errors.nombre}
                    </motion.p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail
                        size={18}
                        className="text-gray-400 dark:text-gray-500"
                      />
                    </div>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      error={errors.email}
                      placeholder="tu@email.com"
                      className="pl-10"
                    />
                  </div>
                  {errors.email && (
                    <motion.p
                      className="mt-1 text-sm text-red-600 dark:text-red-400"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {errors.email}
                    </motion.p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock
                        size={18}
                        className="text-gray-400 dark:text-gray-500"
                      />
                    </div>
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      error={errors.password}
                      placeholder="••••••••"
                      className="pl-10"
                    />
                    <motion.button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={
                        showPassword
                          ? "Ocultar contraseña"
                          : "Mostrar contraseña"
                      }
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </motion.button>
                  </div>
                  {errors.password && (
                    <motion.p
                      className="mt-1 text-sm text-red-600 dark:text-red-400"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {errors.password}
                    </motion.p>
                  )}

                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Seguridad:
                        </span>
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          {passwordStrength.text}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full ${passwordStrength.color}`}
                          initial={{ width: "0%" }}
                          animate={{ width: passwordStrength.width }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Confirmar Contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock
                        size={18}
                        className="text-gray-400 dark:text-gray-500"
                      />
                    </div>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      error={errors.confirmPassword}
                      placeholder="••••••••"
                      className="pl-10"
                    />
                    {formData.password &&
                      formData.confirmPassword &&
                      formData.password === formData.confirmPassword && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          <CheckCircle size={18} className="text-green-500" />
                        </div>
                      )}
                  </div>
                  {errors.confirmPassword && (
                    <motion.p
                      className="mt-1 text-sm text-red-600 dark:text-red-400"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {errors.confirmPassword}
                    </motion.p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="telefono"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Teléfono (opcional)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone
                        size={18}
                        className="text-gray-400 dark:text-gray-500"
                      />
                    </div>
                    <Input
                      id="telefono"
                      name="telefono"
                      type="tel"
                      autoComplete="tel"
                      value={formData.telefono}
                      onChange={handleChange}
                      error={errors.telefono}
                      placeholder="+54 11 1234-5678"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="direccion"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Dirección (opcional)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin
                        size={18}
                        className="text-gray-400 dark:text-gray-500"
                      />
                    </div>
                    <Input
                      id="direccion"
                      name="direccion"
                      type="text"
                      autoComplete="street-address"
                      value={formData.direccion}
                      onChange={handleChange}
                      error={errors.direccion}
                      placeholder="Av. Rivadavia 1234, CABA"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="submit"
                      className="w-full flex justify-center items-center bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 btn-pulse"
                      disabled={isLoading}
                    >
                      <UserPlus size={18} className="mr-2" />
                      {isLoading ? "Registrando..." : "Registrarse"}
                    </Button>
                  </motion.div>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex justify-center border-t border-gray-200 dark:border-gray-700 pt-6 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-gray-800 dark:to-gray-800">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                ¿Ya tienes una cuenta?{" "}
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-block"
                >
                  <Link
                    to="/login"
                    className="font-medium text-primary hover:text-primary/80 dark:text-primary dark:hover:text-primary/80 transition-colors animated-underline"
                  >
                    Iniciar Sesión
                  </Link>
                </motion.span>
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Register;

