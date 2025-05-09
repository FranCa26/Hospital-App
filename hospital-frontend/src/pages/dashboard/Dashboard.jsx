/// Este componente es la página de inicio del panel de control. Muestra un resumen de la actividad reciente del usuario. 
"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Clock,
  Users,
  FileText,
  Bell,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import api from "../../services/api";
import { motion } from "framer-motion";

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    proximosTurnos: [],
    totalTurnos: 0,
    notificacionesSinLeer: 0,
    totalMedicos: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Obtener próximos turnos
        const turnosResponse = await api.get("/turnos", {
          params: {
            estado: "pendiente",
          },
        });

        // Obtener notificaciones sin leer
        const notificacionesResponse = await api.get("/notificaciones", {
          params: {
            leida: false,
          },
        });

        // Si es admin o paciente, obtener total de médicos
        let medicosTotal = 0;
        if (user.rol !== "medico") {
          const medicosResponse = await api.get("/usuarios/medicos");
          medicosTotal = medicosResponse.data.length;
        }

        setStats({
          proximosTurnos: turnosResponse.data.slice(0, 5), // Mostrar solo los 5 próximos
          totalTurnos: turnosResponse.data.length,
          notificacionesSinLeer: notificacionesResponse.data.length,
          totalMedicos: medicosTotal,
        });
      } catch (error) {
        console.error("Error al cargar datos del dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user.rol]);

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("es-ES", options);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <motion.div
          className="w-12 h-12 border-4 border-blue-600 dark:border-blue-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
      </div>
    );
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 text-transparent bg-clip-text">
          Bienvenido, {user.nombre}
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Aquí tienes un resumen de tu actividad reciente.
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants}>
          <Card className="border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6 flex items-center">
              <div className="p-3 rounded-full bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 mr-4">
                <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Turnos Pendientes
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {stats.totalTurnos}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6 flex items-center">
              <div className="p-3 rounded-full bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 mr-4">
                <Bell className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Notificaciones
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {stats.notificacionesSinLeer}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {user.rol !== "medico" && (
          <motion.div variants={itemVariants}>
            <Card className="border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6 flex items-center">
                <div className="p-3 rounded-full bg-gradient-to-r from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 mr-4">
                  <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Médicos Disponibles
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {stats.totalMedicos}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Solo mostrar la tarjeta de historial médico si NO es paciente */}
        {user.rol !== "paciente" && (
          <motion.div variants={itemVariants}>
            <Card className="border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6 flex items-center">
                <div className="p-3 rounded-full bg-gradient-to-r from-yellow-100 to-yellow-200 dark:from-yellow-900 dark:to-yellow-800 mr-4">
                  <FileText className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Historial Médico
                  </p>
                  <motion.div whileHover={{ x: 5 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      to="/dashboard/medical-history"
                      className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium flex items-center"
                    >
                      Ver historial
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>

      {/* Próximos Turnos */}
      <motion.div variants={itemVariants}>
        <Card className="border border-gray-200 dark:border-gray-700 shadow-md">
          <CardHeader className="border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-750">
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
              Próximos Turnos
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {stats.proximosTurnos.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {stats.proximosTurnos.map((turno, index) => (
                  <motion.div
                    key={turno.id}
                    className="flex items-start p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.05)" }}
                  >
                    <div className="flex-shrink-0 mr-4">
                      <div className="p-2 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900 rounded-full">
                        <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.rol === "paciente"
                          ? `Dr. ${turno.medico?.nombre}`
                          : `Paciente: ${turno.paciente?.nombre}`}
                      </p>
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        {turno.servicio?.nombre || "Consulta general"}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {formatDate(turno.fecha)} - {turno.hora}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                        {turno.estado.charAt(0).toUpperCase() +
                          turno.estado.slice(1)}
                      </span>
                    </div>
                  </motion.div>
                ))}
                <div className="p-4 text-center">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      to="/dashboard/appointments"
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium inline-flex items-center transition-colors"
                    >
                      Ver todos los turnos
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </motion.div>
                </div>
              </div>
            ) : (
              <motion.div
                className="text-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                    transition: {
                      repeat: Number.POSITIVE_INFINITY,
                      duration: 2,
                      repeatType: "reverse",
                    },
                  }}
                >
                  <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                </motion.div>
                <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
                  No tienes turnos pendientes
                </h3>
                <p className="mt-1 text-gray-500 dark:text-gray-400">
                  Agenda un turno para comenzar a gestionar tus citas médicas.
                </p>
                {user.rol !== "medico" && (
                  <motion.div
                    className="mt-6"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link to="/dashboard/appointments/new">
                      <Button>
                        <Calendar className="mr-2 h-4 w-4" /> Agendar un turno
                      </Button>
                    </Link>
                  </motion.div>
                )}
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;

