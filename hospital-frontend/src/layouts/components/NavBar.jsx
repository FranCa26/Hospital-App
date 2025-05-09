"use client";

import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  Sun,
  Moon,
  ChevronDown,
  User,
  LogOut,
  ClipboardCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";

// Este componente representa la barra de navegación principal de la aplicación.
// Contiene el logo, enlaces de navegación para escritorio y móvil,
// un botón para cambiar el tema (claro/oscuro) y un menú de usuario.
const Navbar = () => {
  // Estado para controlar la visibilidad del menú móvil.
  const [isOpen, setIsOpen] = useState(false);
  // Estado para controlar el tema actual (oscuro/claro).
  const [isDark, setIsDark] = useState(false);
  // Estado para indicar si la página se ha desplazado para aplicar estilos diferentes.
  const [isScrolled, setIsScrolled] = useState(false);
  // Estado para controlar la visibilidad del menú desplegable del usuario.
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  // Utiliza el contexto de autenticación para acceder al usuario y la función de logout.
  const { user, logout } = useAuth();
  // Hook para la navegación entre rutas.
  const navigate = useNavigate();
  // Hook para acceder a la información de la ubicación actual.
  const location = useLocation();

  // Efecto que se ejecuta al montar el componente para verificar la preferencia del sistema
  // para el tema y para agregar un listener al evento de scroll.
  useEffect(() => {
    // Verifica si hay un tema guardado localmente, sino, usa la preferencia del sistema.
    const savedTheme = localStorage.getItem("theme");
    const isDarkMode =
      savedTheme === "dark" ||
      (!savedTheme &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    // Establece el estado del tema y aplica la clase al elemento html.
    setIsDark(isDarkMode);
    document.documentElement.classList.toggle("dark", isDarkMode);

    // Función para verificar si la página se ha desplazado.
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    // Agrega un listener al evento de scroll.
    window.addEventListener("scroll", handleScroll);
    // Limpia el listener al desmontar el componente.
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Función para cambiar entre el tema oscuro y claro.
  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    document.documentElement.classList.toggle("dark", newTheme);
    localStorage.setItem("theme", newTheme ? "dark" : "light");
  };

  // Función para cerrar la sesión del usuario.
  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    setIsOpen(false);
    navigate("/");
  };

  // Función para verificar si la ruta actual coincide con la ruta proporcionada.
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-md"
          : "bg-white dark:bg-gray-900"
      } border-b border-gray-200 dark:border-gray-800`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* Logo de la aplicación */}
            <motion.div
              className="flex-shrink-0 flex items-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/"
                className="flex items-center text-xl font-bold gradient-text"
              >
                <div className="flex items-center justify-center mr-2">
                  <ClipboardCheck size={22} className="text-primary" />
                </div>
                Hospital App
              </Link>
            </motion.div>
            {/* Enlaces de navegación para escritorio */}
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              <NavLink to="/" isActive={isActive("/")}>
                Inicio
              </NavLink>
              {!user && (
                <>
                  <NavLink to="/login" isActive={isActive("/login")}>
                    Iniciar Sesión
                  </NavLink>
                  <NavLink to="/register" isActive={isActive("/register")}>
                    Registrarse
                  </NavLink>
                </>
              )}
              {user && (
                <NavLink to="/dashboard" isActive={isActive("/dashboard")}>
                  Dashboard
                </NavLink>
              )}
            </div>
          </div>
          {/* Sección de iconos y menú de usuario para escritorio */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            {/* Botón para cambiar el tema */}
            <motion.button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none transition-colors"
              aria-label={
                isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"
              }
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </motion.button>

            {/* Menú de usuario */}
            {user && (
              <div className="relative">
                <motion.button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <User size={16} />
                  </div>
                  <span className="text-sm font-medium">
                    {user.nombre?.split(" ")[0]}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${
                      userMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </motion.button>

                {/* Menú desplegable del usuario */}
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      className="absolute right-0 mt-2 w-48 py-2 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Link
                        to="/dashboard/profile"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Mi Perfil
                      </Link>
                      <Link
                        to="/dashboard/appointments"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Mis Turnos
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left block px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <div className="flex items-center">
                          <LogOut size={16} className="mr-2" />
                          Cerrar Sesión
                        </div>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
          {/* Botón del menú móvil */}
          <div className="-mr-2 flex items-center sm:hidden">
            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700 focus:outline-none transition-colors"
              aria-expanded={isOpen}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <span className="sr-only">
                {isOpen ? "Cerrar menú" : "Abrir menú"}
              </span>
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Menú móvil */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="sm:hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="pt-2 pb-3 space-y-1 px-4">
              <MobileNavLink
                to="/"
                isActive={isActive("/")}
                onClick={() => setIsOpen(false)}
              >
                Inicio
              </MobileNavLink>
              {!user && (
                <>
                  <MobileNavLink
                    to="/login"
                    isActive={isActive("/login")}
                    onClick={() => setIsOpen(false)}
                  >
                    Iniciar Sesión
                  </MobileNavLink>
                  <MobileNavLink
                    to="/register"
                    isActive={isActive("/register")}
                    onClick={() => setIsOpen(false)}
                  >
                    Registrarse
                  </MobileNavLink>
                </>
              )}
              {user && (
                <>
                  <MobileNavLink
                    to="/dashboard"
                    isActive={isActive("/dashboard")}
                    onClick={() => setIsOpen(false)}
                  >
                    Dashboard
                  </MobileNavLink>
                  <MobileNavLink
                    to="/dashboard/profile"
                    isActive={isActive("/dashboard/profile")}
                    onClick={() => setIsOpen(false)}
                  >
                    Mi Perfil
                  </MobileNavLink>
                  <MobileNavLink
                    to="/dashboard/appointments"
                    isActive={isActive("/dashboard/appointments")}
                    onClick={() => setIsOpen(false)}
                  >
                    Mis Turnos
                  </MobileNavLink>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-red-500 transition-colors"
                  >
                    <LogOut size={18} className="mr-2" />
                    Cerrar Sesión
                  </button>
                </>
              )}
              <button
                onClick={() => {
                  toggleTheme();
                  setIsOpen(false);
                }}
                className="flex items-center w-full pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-primary hover:text-primary dark:hover:text-primary transition-colors"
              >
                {isDark ? (
                  <>
                    <Sun size={20} className="mr-2" /> Modo Claro
                  </>
                ) : (
                  <>
                    <Moon size={20} className="mr-2" /> Modo Oscuro
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

// Componente para los enlaces de navegación en el escritorio.
const NavLink = ({ children, to, isActive }) => {
  return (
    <Link
      to={to}
      className={`relative inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors ${
        isActive
          ? "text-primary dark:text-primary border-b-2 border-primary"
          : "text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary"
      }`}
    >
      <motion.span
        initial={false}
        animate={isActive ? { y: 0 } : { y: 0 }}
        className="relative"
      >
        {children}
        {/* Barra indicadora de enlace activo */}
        {isActive && (
          <motion.span
            className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary"
            layoutId="navbar-underline"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
      </motion.span>
    </Link>
  );
};

// Componente para los enlaces de navegación en el menú móvil.
const MobileNavLink = ({ children, to, isActive, onClick }) => {
  return (
    <Link
      to={to}
      className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors ${
        isActive
          ? "border-primary text-primary dark:text-primary bg-primary/5"
          : "border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-primary hover:text-primary dark:hover:text-primary"
      }`}
      onClick={onClick}
    >
      {children}
    </Link>
  );
};

export default Navbar;
