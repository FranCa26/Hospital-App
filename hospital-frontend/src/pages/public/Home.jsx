/// Este componente es la página de inicio pública de la aplicación. Muestra una descripción general del sistema y sus características principales.
/// Se muestra un botón para registrarse e iniciar sesión en la aplicación.
/// También se muestra una sección de características principales y una llamada a la acción para registrarse en la aplicación.

"use client";

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar,
  Stethoscope,
  ClipboardList,
  Shield,
  Clock,
  FileText,
  ChevronRight,
  ArrowRight,
} from "lucide-react";

const Home = () => {
  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const featureContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const featureItem = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <div className="bg-white dark:bg-gray-900 pt-16">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-700 opacity-90"></div>
        <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-10"></div>
        <motion.div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="py-20 sm:py-24 md:py-32">
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="max-w-3xl"
            >
              <motion.h1
                variants={item}
                className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl"
              >
                Sistema de Gestión Hospitalaria
              </motion.h1>
              <motion.p
                variants={item}
                className="mt-6 text-xl text-blue-100 max-w-3xl"
              >
                Gestiona tus turnos médicos de manera eficiente. Agenda citas,
                consulta tu historial médico y mantente al día con tus
                tratamientos.
              </motion.p>
              <motion.div
                variants={item}
                className="mt-10 flex flex-col sm:flex-row gap-4"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-cyan-700 bg-white hover:bg-blue-50 shadow-lg transition-all duration-300 hover:shadow-xl"
                  >
                    Registrarse
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center px-5 py-3 border border-white text-base font-medium rounded-md text-white bg-transparent hover:bg-white/10 transition-colors"
                  >
                    Iniciar Sesión
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white dark:from-gray-900 to-transparent"></div>
      </div>

      {/* Features Section */}
      <div className="py-16 sm:py-24 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
              <span className="gradient-text">Características Principales</span>
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-300 mx-auto">
              Nuestro sistema ofrece todo lo que necesitas para gestionar la
              atención médica.
            </p>
          </motion.div>

          <motion.div
            className="mt-16"
            variants={featureContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon={
                  <Calendar className="h-6 w-6 text-white" aria-hidden="true" />
                }
                title="Gestión de Turnos"
                description="Agenda, modifica y cancela turnos médicos de manera sencilla. Recibe recordatorios y notificaciones."
                variants={featureItem}
              />

              <FeatureCard
                icon={
                  <FileText className="h-6 w-6 text-white" aria-hidden="true" />
                }
                title="Historial Médico"
                description="Accede a tu historial médico completo, incluyendo diagnósticos, tratamientos y resultados de estudios."
                variants={featureItem}
              />

              <FeatureCard
                icon={
                  <Stethoscope
                    className="h-6 w-6 text-white"
                    aria-hidden="true"
                  />
                }
                title="Profesionales Médicos"
                description="Encuentra médicos por especialidad y consulta sus horarios disponibles para agendar tu cita."
                variants={featureItem}
              />

              <FeatureCard
                icon={
                  <ClipboardList
                    className="h-6 w-6 text-white"
                    aria-hidden="true"
                  />
                }
                title="Gestión de Servicios"
                description="Explora los servicios médicos disponibles, especialidades y profesionales de la salud."
                variants={featureItem}
              />

              <FeatureCard
                icon={
                  <Clock className="h-6 w-6 text-white" aria-hidden="true" />
                }
                title="Disponibilidad en Tiempo Real"
                description="Consulta la disponibilidad de los médicos en tiempo real y agenda tu cita al instante."
                variants={featureItem}
              />

              <FeatureCard
                icon={
                  <Shield className="h-6 w-6 text-white" aria-hidden="true" />
                }
                title="Seguridad y Privacidad"
                description="Tus datos médicos están protegidos con los más altos estándares de seguridad y privacidad."
                variants={featureItem}
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-700">
        <motion.div
          className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">¿Listo para comenzar?</span>
            <span className="block text-cyan-200">
              Regístrate hoy y gestiona tus turnos médicos.
            </span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0 space-x-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-cyan-700 bg-white hover:bg-blue-50 shadow-lg transition-all duration-300 hover:shadow-xl"
              >
                Registrarse
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-5 py-3 border border-white text-base font-medium rounded-md text-white bg-transparent hover:bg-white/10 transition-colors"
              >
                Iniciar Sesión
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Feature Card Component
const FeatureCard = ({ icon, title, description, variants }) => {
  return (
    <motion.div className="pt-6" variants={variants}>
      <motion.div
        className="flow-root bg-white dark:bg-gray-900 rounded-xl shadow-lg px-6 pb-8 card-hover"
        whileHover={{ y: -8 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
      >
        <div className="-mt-6">
          <div>
            <motion.span
              className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-cyan-500 to-blue-600 dark:from-cyan-600 dark:to-blue-700 rounded-md shadow-lg"
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              {icon}
            </motion.span>
          </div>
          <h3 className="mt-8 text-lg font-medium text-gray-900 dark:text-white tracking-tight">
            {title}
          </h3>
          <p className="mt-5 text-base text-gray-500 dark:text-gray-400">
            {description}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Home;


