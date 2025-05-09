/// Este componente muestra las notificaciones del usuario autenticado.
/// Permite filtrar las notificaciones por estado (leídas/no leídas) y por búsqueda.
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, Trash, Search, X, CheckCircle } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/Card";
import api from "../../services/api";

const Notificaciones = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    leida: "",
    busqueda: "",
  });
  const [notificacionesFiltradas, setNotificacionesFiltradas] = useState([]);

  // Cargar notificaciones
  useEffect(() => {
    const fetchNotificaciones = async () => {
      try {
        setLoading(true);
        const response = await api.get("/notificaciones");
        setNotificaciones(response.data);
        setNotificacionesFiltradas(response.data);
      } catch (error) {
        console.error("Error al cargar notificaciones:", error);
        showToast("Error al cargar notificaciones", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchNotificaciones();
  }, []);

  // Filtrar notificaciones cuando cambian los filtros
  useEffect(() => {
    let resultado = [...notificaciones];

    // Filtrar por estado (leída/no leída)
    if (filtros.leida !== "") {
      const leida = filtros.leida === "true";
      resultado = resultado.filter(
        (notificacion) => notificacion.leida === leida
      );
    }

    // Filtrar por búsqueda
    if (filtros.busqueda) {
      const busqueda = filtros.busqueda.toLowerCase();
      resultado = resultado.filter(
        (notificacion) =>
          notificacion.titulo.toLowerCase().includes(busqueda) ||
          notificacion.mensaje.toLowerCase().includes(busqueda)
      );
    }

    setNotificacionesFiltradas(resultado);
  }, [filtros, notificaciones]);

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({ ...prev, [name]: value }));
  };

  const handleBusquedaChange = (e) => {
    setFiltros((prev) => ({ ...prev, busqueda: e.target.value }));
  };

  const limpiarFiltros = () => {
    setFiltros({
      leida: "",
      busqueda: "",
    });
  };

  const handleMarcarLeida = async (id) => {
    try {
      await api.put(`/notificaciones/${id}`, { leida: true });

      // Actualizar lista de notificaciones
      setNotificaciones((prev) =>
        prev.map((notificacion) =>
          notificacion.id === id
            ? { ...notificacion, leida: true }
            : notificacion
        )
      );

      showToast("Notificación marcada como leída", "success");
    } catch (error) {
      console.error("Error al marcar notificación como leída:", error);
      showToast("Error al marcar notificación como leída", "error");
    }
  };

  const handleEliminar = async (id) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta notificación?")) {
      return;
    }

    try {
      await api.delete(`/notificaciones/${id}`);

      // Actualizar lista de notificaciones
      setNotificaciones((prev) =>
        prev.filter((notificacion) => notificacion.id !== id)
      );

      showToast("Notificación eliminada exitosamente", "success");
    } catch (error) {
      console.error("Error al eliminar notificación:", error);
      showToast("Error al eliminar notificación", "error");
    }
  };

  const handleMarcarTodasLeidas = async () => {
    try {
      await api.put("/notificaciones/leer-todas");

      // Actualizar lista de notificaciones
      setNotificaciones((prev) =>
        prev.map((notificacion) => ({ ...notificacion, leida: true }))
      );

      showToast("Todas las notificaciones marcadas como leídas", "success");
    } catch (error) {
      console.error(
        "Error al marcar todas las notificaciones como leídas:",
        error
      );
      showToast(
        "Error al marcar todas las notificaciones como leídas",
        "error"
      );
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) {
      return "hace unos segundos";
    } else if (diffMins < 60) {
      return `hace ${diffMins} ${diffMins === 1 ? "minuto" : "minutos"}`;
    } else if (diffHours < 24) {
      return `hace ${diffHours} ${diffHours === 1 ? "hora" : "horas"}`;
    } else if (diffDays < 7) {
      return `hace ${diffDays} ${diffDays === 1 ? "día" : "días"}`;
    } else {
      return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  };

  // Variants for animations
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
          Notificaciones
        </motion.h1>

        <motion.div
          className="mt-4 sm:mt-0"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Button
            variant="outline"
            onClick={handleMarcarTodasLeidas}
            className="flex items-center group hover:bg-primary hover:text-white transition-all duration-300"
          >
            <CheckCircle className="mr-2 h-4 w-4 text-primary group-hover:text-white transition-colors" />
            Marcar todas como leídas
          </Button>
        </motion.div>
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <Card className="border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
          <CardHeader className="border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="flex items-center">
                <Bell className="mr-2 h-5 w-5 text-primary" />
                Mis Notificaciones
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <motion.div
              className="mb-6 flex flex-col sm:flex-row gap-4"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
            >
              <div className="relative w-full sm:w-64">
                <Input
                  type="text"
                  placeholder="Buscar notificación..."
                  value={filtros.busqueda}
                  onChange={handleBusquedaChange}
                  className="pl-10 transition-all duration-300 focus:ring-primary"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>

              <div className="w-full sm:w-64">
                <Select
                  name="leida"
                  value={filtros.leida}
                  onChange={handleFiltroChange}
                  className="transition-all duration-300 focus:ring-primary"
                >
                  <option value="">Todas</option>
                  <option value="false">No leídas</option>
                  <option value="true">Leídas</option>
                </Select>
              </div>

              {(filtros.leida || filtros.busqueda) && (
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
            ) : notificacionesFiltradas.length > 0 ? (
              <motion.div
                className="space-y-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <AnimatePresence>
                  {notificacionesFiltradas.map((notificacion) => (
                    <motion.div
                      key={notificacion.id}
                      variants={itemVariants}
                      exit="exit"
                      layout
                      className={`p-4 border rounded-lg transition-all duration-300 hover:shadow-md ${
                        notificacion.leida
                          ? "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                          : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                      }`}
                      whileHover={{ scale: 1.01, y: -2 }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <motion.div
                            className={`p-2 rounded-full ${
                              notificacion.leida
                                ? "bg-gray-200 dark:bg-gray-700"
                                : "bg-blue-200 dark:bg-blue-800"
                            }`}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Bell
                              className={`h-5 w-5 ${
                                notificacion.leida
                                  ? "text-gray-600 dark:text-gray-400"
                                  : "text-blue-600 dark:text-blue-400"
                              }`}
                            />
                          </motion.div>
                          <div>
                            <h3
                              className={`font-medium ${
                                notificacion.leida
                                  ? "text-gray-700 dark:text-gray-300"
                                  : "text-blue-700 dark:text-blue-300"
                              }`}
                            >
                              {notificacion.titulo}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                              {notificacion.mensaje}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                              {formatDate(notificacion.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {!notificacion.leida && (
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleMarcarLeida(notificacion.id)
                                }
                                className="p-2 h-auto hover:bg-green-50 hover:text-green-500 hover:border-green-200 transition-all duration-300"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            </motion.div>
                          )}
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleEliminar(notificacion.id)}
                              className="p-2 h-auto"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
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
                  <Bell className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600" />
                </motion.div>
                <motion.h3
                  className="mt-4 text-xl font-medium text-gray-900 dark:text-white"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  No hay notificaciones
                </motion.h3>
                <motion.p
                  className="mt-2 text-gray-500 dark:text-gray-400 max-w-md mx-auto"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  {filtros.leida || filtros.busqueda
                    ? "No se encontraron notificaciones con los filtros aplicados."
                    : "No tienes notificaciones en este momento."}
                </motion.p>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default Notificaciones;





