"use client";

import { Bell, Menu, User, Sun, Moon, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Este componente es el encabezado de la página, contiene el logo (título), el buscador, el botón de notificaciones y el botón de perfil.
const Header = ({ sidebarOpen, setSidebarOpen }) => {
  // Utiliza el contexto de autenticación para acceder al usuario y la función de logout.
  const { user, logout } = useAuth();
  // Estado para controlar el tema oscuro/claro. Inicialmente se establece según la preferencia del sistema o el almacenamiento local.
  const [isDark, setIsDark] = useState(false);
  // Estado para controlar si el encabezado tiene el estilo de "scrolled" (cuando la página se desplaza).
  const [isScrolled, setIsScrolled] = useState(false);
  // Estado para controlar la visibilidad del menú de usuario desplegable.
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Efecto para verificar la preferencia del sistema al montar el componente.
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const isDarkMode =
      savedTheme === "dark" ||
      (!savedTheme &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    setIsDark(isDarkMode);
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, []);

  // Efecto para escuchar el evento de scroll y actualizar el estado isScrolled.
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Efecto para cerrar el menú desplegable del usuario al hacer clic fuera de él.
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest(".user-menu-container")) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showUserMenu]);

  // Función para cambiar entre el tema oscuro y claro.
  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    document.documentElement.classList.toggle("dark", newTheme);
    localStorage.setItem("theme", newTheme ? "dark" : "light");
  };

  return (
    <motion.header
      className={`sticky top-0 z-10 transition-all duration-300 ${
        isScrolled
          ? "bg-white/90 dark:bg-gray-800/90 backdrop-blur-md shadow-md"
          : "bg-white dark:bg-gray-800 shadow-sm"
      } border-b border-gray-200 dark:border-gray-700`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            {/* Botón para abrir el menú lateral en dispositivos móviles */}
            <motion.button
              type="button"
              className="md:hidden text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none transition-colors"
              onClick={() => setSidebarOpen(true)}
              aria-label="Abrir menú"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Menu size={24} />
            </motion.button>
            {/* Título del dashboard, visible en dispositivos de escritorio */}
            <div className="hidden md:block">
              <h1 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-cyan-500 text-transparent bg-clip-text">
                Dashboard
              </h1>
            </div>
          </div>

          {/* Barra de búsqueda, visible en dispositivos de escritorio */}
          <div className="flex-1 max-w-md mx-4 hidden md:block">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar..."
                className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          {/* Iconos de tema, notificaciones y perfil */}
          <div className="flex items-center space-x-4">
            {/* Botón para cambiar el tema */}
            <motion.button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none transition-colors"
              aria-label={
                isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"
              }
              whileHover={{ scale: 1.1, rotate: 15 }}
              whileTap={{ scale: 0.9 }}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </motion.button>

            {/* Botón de notificaciones */}
            <motion.div whileHover={{ scale: 1.05 }}>
              <Link
                to="/dashboard/notifications"
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full focus:outline-none transition-colors relative"
                aria-label="Ver notificaciones"
              >
                <Bell size={20} />
                {/* Indicador de nuevas notificaciones */}
                <motion.span
                  className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-800"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 15,
                    delay: 0.5,
                  }}
                ></motion.span>
              </Link>
            </motion.div>

            {/* Menú de usuario */}
            <div className="relative user-menu-container">
              <motion.div
                className="flex items-center"
                whileHover={{ scale: 1.02 }}
              >
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {/* Avatar del usuario */}
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center mr-2 border border-blue-200 dark:border-blue-700 shadow-md overflow-hidden">
                    <User size={16} className="text-white" />
                  </div>
                  {/* Nombre del usuario (visible en dispositivos medianos y grandes) */}
                  <span className="hidden sm:inline-block">
                    {user?.nombre || "Usuario"}
                  </span>
                  {/* Icono de flecha para el menú desplegable */}
                  <motion.svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="ml-1"
                    animate={{ rotate: showUserMenu ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </motion.svg>
                </button>

                {/* Menú desplegable del usuario */}
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      className="absolute right-0 top-full mt-3 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 border border-gray-200 dark:border-gray-700 z-10"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      {/* Enlace al perfil del usuario */}
                      <Link
                        to="/dashboard/profile"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Mi Perfil
                      </Link>
                      {/* Separador */}
                      <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                      {/* Botón de cerrar sesión */}
                      <button
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        Cerrar Sesión
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
