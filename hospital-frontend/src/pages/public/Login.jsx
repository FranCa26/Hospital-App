/// Este componente es la página de inicio de sesión. Aquí los usuarios pueden iniciar sesión en sus cuentas existentes.
/// El formulario de inicio de sesión contiene campos para el email y la contraseña, y un botón para enviar el formulario.

"use client";

import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { Eye, EyeOff, LogIn, Mail, Lock, AlertCircle } from "lucide-react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "../../components/ui/Card";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Limpiar error al cambiar el valor
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (loginError) {
      setLoginError("");
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "El email es requerido";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es requerida";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await login(formData);
    } catch (error) {
      console.error("Error en el formulario de login:", error);
      setLoginError("Credenciales inválidas. Por favor, intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  // Animation variants
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
            Bienvenido de nuevo
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Inicia sesión para acceder a tu cuenta
          </p>
        </motion.div>

        <motion.div variants={item}>
          <Card className="shadow-glossy dark:shadow-dark-lg border-gray-200 dark:border-gray-700 overflow-hidden">
            <CardHeader className="pb-0 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-gray-800 dark:to-gray-800">
              <CardTitle className="text-center text-xl font-semibold gradient-text">
                Iniciar Sesión
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {loginError && (
                <motion.div
                  className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md flex items-start"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 mr-2 mt-0.5" />
                  <span className="text-sm text-red-600 dark:text-red-400">
                    {loginError}
                  </span>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
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
                      autoComplete="current-password"
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
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label
                      htmlFor="remember-me"
                      className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                    >
                      Recordarme
                    </label>
                  </div>

                  <div className="text-sm">
                    <motion.a
                      href="#"
                      className="font-medium text-primary hover:text-primary/80 dark:text-primary dark:hover:text-primary/80 transition-colors animated-underline"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      ¿Olvidaste tu contraseña?
                    </motion.a>
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
                      <LogIn size={18} className="mr-2" />
                      {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
                    </Button>
                  </motion.div>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex justify-center border-t border-gray-200 dark:border-gray-700 pt-6 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-gray-800 dark:to-gray-800">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                ¿No tienes una cuenta?{" "}
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-block"
                >
                  <Link
                    to="/register"
                    className="font-medium text-primary hover:text-primary/80 dark:text-primary dark:hover:text-primary/80 transition-colors animated-underline"
                  >
                    Regístrate
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

export default Login;



