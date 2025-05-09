"use client";

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Mail, Phone, MapPin, ClipboardCheck } from "lucide-react";

// Este componente es el pie de página de la aplicación. Contiene información de contacto, enlaces rápidos y derechos de autor.
const Footer = () => {
  // Obtiene el año actual para mostrarlo en la sección de derechos de autor.
  const currentYear = new Date().getFullYear();

  // Variantes de animación para el contenedor del pie de página.
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        // Anima los hijos del contenedor con un pequeño retraso entre ellos.
        staggerChildren: 0.1,
      },
    },
  };

  // Variantes de animación para cada elemento dentro del pie de página.
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <footer className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-inner">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Contenedor principal de la información del pie de página */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={container}
        >
          {/* Sección de información de la aplicación */}
          <motion.div
            variants={item}
            className="flex flex-col items-center md:items-start"
          >
            <Link
              to="/"
              className="text-2xl font-bold gradient-text flex items-center"
            >
              <ClipboardCheck className="mr-2 text-primary" size={24} />
              Hospital App
            </Link>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 max-w-xs text-center md:text-left">
              Brindando atención médica de calidad y accesible para todos.
            </p>
            {/* Enlaces a redes sociales o donaciones */}
            <div className="flex items-center mt-4 space-x-2">
              <motion.a
                href="https://cruzroja.org.ar/dona/"
                className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Heart size={18} />
              </motion.a>
              <motion.a
                href="mailto:francatania81@gmail.com"
                className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Mail size={18} />
              </motion.a>
              <motion.a
                href="tel:+543813920095"
                className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Phone size={18} />
              </motion.a>
            </div>
          </motion.div>

          {/* Sección de enlaces rápidos */}
          <motion.div
            variants={item}
            className="flex flex-col items-center md:items-start"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Enlaces rápidos
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/"
                  className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary animated-underline"
                >
                  Inicio
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary animated-underline"
                >
                  Iniciar Sesión
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary animated-underline"
                >
                  Registrarse
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Sección de información de contacto */}
          <motion.div
            variants={item}
            className="flex flex-col items-center md:items-start"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Contacto
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center text-gray-600 dark:text-gray-300">
                <MapPin size={18} className="mr-2 text-primary" />
                <a
                  href="https://maps.app.goo.gl/wGzu3E6uEfGoXYoq6"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary dark:hover:text-primary"
                >
                  Salta, Argentina
                </a>
              </li>
              <li className="flex items-center text-gray-600 dark:text-gray-300">
                <Phone size={18} className="mr-2 text-primary" />
                <a
                  href="tel:+543813920095"
                  className="hover:text-primary dark:hover:text-primary"
                >
                  +54 3813920095
                </a>
              </li>
              <li className="flex items-center text-gray-600 dark:text-gray-300">
                <Mail size={18} className="mr-2 text-primary" />
                <a
                  href="francatania81@gmail.com"
                  className="hover:text-primary dark:hover:text-primary"
                >
                  francatania81@gmail.com
                </a>
              </li>
            </ul>
          </motion.div>
        </motion.div>

        {/* Sección de derechos de autor */}
        <motion.div
          className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          viewport={{ once: true }}
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © {currentYear} Hospital App. Todos los derechos reservados.
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            Desarrollado por Franco Catania, Programador
            <br />
            Developed by Franco Catania, Programmer
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
