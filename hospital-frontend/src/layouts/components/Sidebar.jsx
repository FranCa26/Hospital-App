"use client";

import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Home,
  Calendar,
  Users,
  User,
  FileText,
  Bell,
  Stethoscope,
  ClipboardList,
  Tag,
  FilePlus,
  ChevronRight,
  LogOut,
  Menu,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

// Este componente es la barra lateral de la página, contiene los links a las distintas secciones de la página y el botón de cerrar sesión.
const Sidebar = ({ open, setOpen }) => {
  // Utiliza el contexto de autenticación para acceder al usuario y la función de logout.
  const { user, logout } = useAuth();
  // Utiliza el hook useLocation para acceder a la ruta actual.
  const location = useLocation();
  // Crea una referencia al elemento del sidebar para detectar clics fuera de él.
  const sidebarRef = useRef(null);
  // Estado para controlar el elemento del menú al que el usuario está pasando el ratón.
  const [hoveredItem, setHoveredItem] = useState(null);

  // Efecto para cerrar la barra lateral al hacer clic fuera de ella (en dispositivos móviles).
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        open &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, setOpen]);

  // Efecto para cerrar la barra lateral al cambiar de ruta.
  useEffect(() => {
    if (open) {
      setOpen(false);
    }
  }, [location.pathname, setOpen, open]);

  // Función para verificar si una ruta dada está activa (coincide con la ruta actual o es un padre de la ruta actual).
  const isActive = (path) => {
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  // Array que define los elementos de navegación de la barra lateral.
  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <Home size={20} />,
      roles: ["admin", "medico", "paciente"],
    },
    {
      name: "Mi Perfil",
      path: "/dashboard/profile",
      icon: <User size={20} />,
      roles: ["admin", "medico", "paciente"],
    },
    {
      name: "Turnos",
      path: "/dashboard/appointments",
      icon: <Calendar size={20} />,
      roles: ["admin", "medico", "paciente"],
    },
    {
      name: "Nuevo Turno",
      path: "/dashboard/appointments/new",
      icon: <FilePlus size={20} />,
      roles: ["admin", "paciente"],
    },
    {
      name: "Médicos",
      path: "/dashboard/doctors",
      icon: <Stethoscope size={20} />,
      roles: ["admin", "paciente"],
    },
    {
      name: "Servicios",
      path: "/dashboard/services",
      icon: <ClipboardList size={20} />,
      roles: ["admin"],
    },
    {
      name: "Categorías",
      path: "/dashboard/categories",
      icon: <Tag size={20} />,
      roles: ["admin"],
    },
    {
      name: "Usuarios",
      path: "/dashboard/users",
      icon: <Users size={20} />,
      roles: ["admin"],
    },
    {
      name: "Notificaciones",
      path: "/dashboard/notifications",
      icon: <Bell size={20} />,
      roles: ["admin", "medico", "paciente"],
    },
    {
      name: "Historial Médico",
      path: "/dashboard/medical-history",
      icon: <FileText size={20} />,
      roles: ["admin", "medico"],
    },
    {
      name: "Calendario",
      path: "/dashboard/calendar",
      icon: <Calendar size={20} />,
      roles: ["admin", "medico"],
    },
  ];

  // Filtra los elementos de navegación basándose en el rol del usuario actual.
  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(user?.rol || "")
  );

  // Variantes de animación para el sidebar (aparecer/desaparecer).
  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
    closed: {
      x: "-100%",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        staggerChildren: 0.05,
        staggerDirection: -1,
      },
    },
  };

  // Variantes de animación para cada elemento del menú.
  const itemVariants = {
    open: {
      x: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
    closed: {
      x: -20,
      opacity: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  return (
    <>
      {/* Overlay para dispositivos móviles que aparece cuando la barra lateral está abierta */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Barra lateral para dispositivos móviles */}
      <motion.div
        ref={sidebarRef}
        className="fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-800 shadow-xl md:hidden overflow-y-auto"
        variants={sidebarVariants}
        initial="closed"
        animate={open ? "open" : "closed"}
      >
        {/* Encabezado de la barra lateral (título y botón de cierre) */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-750">
          <motion.div
            className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 text-transparent bg-clip-text"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Hospital App
          </motion.div>
          <motion.button
            className="text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none transition-colors"
            onClick={() => setOpen(false)}
            aria-label="Cerrar menú"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X size={24} />
          </motion.button>
        </div>
        {/* Contenido de la navegación */}
        <nav className="mt-5 px-2 space-y-1">
          {/* Mapea los elementos de navegación filtrados */}
          {filteredNavItems.map((item, index) => (
            <motion.div
              key={item.path}
              variants={itemVariants}
              custom={index}
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                to={item.path}
                className={`group flex items-center px-3 py-2.5 text-base font-medium rounded-lg transition-all duration-200 ${
                  isActive(item.path)
                    ? "bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 dark:from-blue-900/30 dark:to-cyan-900/30 dark:text-blue-300 shadow-sm"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400"
                }`}
                onMouseEnter={() => setHoveredItem(item.path)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <span
                  className={`mr-3 transition-transform duration-300 ${
                    isActive(item.path)
                      ? "text-blue-600 dark:text-blue-400"
                      : hoveredItem === item.path
                      ? "text-blue-500 dark:text-blue-300 scale-110"
                      : ""
                  }`}
                >
                  {item.icon}
                </span>
                <span>{item.name}</span>
                {/* Icono de flecha si el elemento está activo */}
                {isActive(item.path) && (
                  <motion.div
                    className="ml-auto"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronRight className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </motion.div>
                )}
              </Link>
            </motion.div>
          ))}

          {/* Sección de cierre de sesión */}
          <div className="pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
            >
              <button
                onClick={logout}
                className="w-full flex items-center px-3 py-2.5 text-base font-medium rounded-lg transition-all duration-200 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <LogOut size={20} className="mr-3" />
                <span>Cerrar Sesión</span>
              </button>
            </motion.div>
          </div>
        </nav>
      </motion.div>

      {/* Barra lateral para escritorio */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-md">
            {/* Encabezado de la barra lateral (título) */}
            <div className="flex items-center h-16 px-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-750">
              <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 text-transparent bg-clip-text">
                Hospital App
              </div>
            </div>
            {/* Contenido de la navegación */}
            <div className="flex-1 flex flex-col overflow-y-auto">
              <nav className="flex-1 px-2 py-4 space-y-1">
                {/* Mapea los elementos de navegación filtrados */}
                {filteredNavItems.map((item) => (
                  <motion.div
                    key={item.path}
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      to={item.path}
                      className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        isActive(item.path)
                          ? "bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 dark:from-blue-900/30 dark:to-cyan-900/30 dark:text-blue-300 shadow-sm"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400"
                      }`}
                      onMouseEnter={() => setHoveredItem(item.path)}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <span
                        className={`mr-3 transition-transform duration-300 ${
                          isActive(item.path)
                            ? "text-blue-600 dark:text-blue-400"
                            : hoveredItem === item.path
                            ? "text-blue-500 dark:text-blue-300 scale-110"
                            : ""
                        }`}
                      >
                        {item.icon}
                      </span>
                      <span>{item.name}</span>
                      {/* Icono de flecha si el elemento está activo */}
                      {isActive(item.path) && (
                        <motion.div
                          className="ml-auto"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <ChevronRight className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </motion.div>
                      )}
                    </Link>
                  </motion.div>
                ))}

                {/* Sección de cierre de sesión */}
                <div className="pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
                  <motion.div
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <button
                      onClick={logout}
                      className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <LogOut size={20} className="mr-3" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </motion.div>
                </div>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Botón de toggle para la barra lateral en dispositivos móviles (puede ser usado en el componente Header) */}
      <motion.button
        className="md:hidden fixed bottom-4 right-4 z-30 bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-3 rounded-full shadow-lg"
        onClick={() => setOpen(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Menu size={24} />
      </motion.button>
    </>
  );
};

export default Sidebar;
