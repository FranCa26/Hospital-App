/// Este componente es la página de turnos del panel de control. Muestra una lista de turnos y permite filtrarlos y cancelarlos.

"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Plus,
  Search,
  Filter,
  X,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../components/ui/Table";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/Card";
import api from "../../services/api";

const Turnos = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    fecha: "",
    estado: "",
    busqueda: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  const fetchTurnos = async () => {
    try {
      setLoading(true);

      // Construir parámetros de consulta
      const params = {};
      if (filtros.fecha) params.fecha = filtros.fecha;
      if (filtros.estado) params.estado = filtros.estado;

      const response = await api.get("/turnos", { params });

      // Filtrar por búsqueda si existe
      let turnosFiltrados = response.data;
      if (filtros.busqueda) {
        const busqueda = filtros.busqueda.toLowerCase();
        turnosFiltrados = turnosFiltrados.filter(
          (turno) =>
            turno.paciente?.nombre?.toLowerCase().includes(busqueda) ||
            turno.medico?.nombre?.toLowerCase().includes(busqueda) ||
            turno.servicio?.nombre?.toLowerCase().includes(busqueda)
        );
      }

      // Cargar información de servicios si es necesario
      const turnosConServicios = await Promise.all(
        turnosFiltrados.map(async (turno) => {
          // Si el turno ya tiene la información del servicio, usarla
          if (turno.servicio && turno.servicio.nombre) {
            return turno;
          }

          // Si no tiene la información del servicio pero tiene servicioId, cargarla
          if (turno.servicioId) {
            try {
              const servicioResponse = await api.get(
                `/servicios/${turno.servicioId}`
              );
              return {
                ...turno,
                servicio: servicioResponse.data,
              };
            } catch (error) {
              console.error(
                `Error al cargar servicio ID ${turno.servicioId}:`,
                error
              );
              return turno;
            }
          }

          return turno;
        })
      );

      setTurnos(turnosConServicios);
    } catch (error) {
      console.error("Error al obtener turnos:", error);
      showToast("Error al cargar los turnos", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTurnos();
  }, [filtros.fecha, filtros.estado]);

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({ ...prev, [name]: value }));
  };

  const handleBusquedaChange = (e) => {
    setFiltros((prev) => ({ ...prev, busqueda: e.target.value }));
  };

  const handleBusquedaSubmit = (e) => {
    e.preventDefault();
    fetchTurnos();
  };

  const limpiarFiltros = () => {
    setFiltros({
      fecha: "",
      estado: "",
      busqueda: "",
    });
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("es-ES", options);
  };

  // Función para obtener el nombre del servicio
  const getNombreServicio = (turno) => {
    // Si el turno tiene el objeto servicio con nombre, usarlo
    if (turno.servicio && turno.servicio.nombre) {
      return turno.servicio.nombre;
    }

    // Si no tiene el objeto servicio pero tiene servicioId, mostrar ID
    if (turno.servicioId) {
      return `Servicio #${turno.servicioId}`;
    }

    return "-";
  };

  const handleCancelarTurno = async (id) => {
    if (!confirm("¿Estás seguro de que deseas cancelar este turno?")) {
      return;
    }

    try {
      await api.delete(`/turnos/${id}`);
      showToast("Turno cancelado exitosamente", "success");
      fetchTurnos(); // Recargar turnos
    } catch (error) {
      console.error("Error al cancelar turno:", error);
      showToast("Error al cancelar el turno", "error");
    }
  };

  const handleActualizarEstado = async (id, nuevoEstado) => {
    try {
      await api.put(`/turnos/${id}`, { estado: nuevoEstado });
      showToast(`Turno ${nuevoEstado} exitosamente`, "success");
      fetchTurnos(); // Recargar turnos
    } catch (error) {
      console.error("Error al actualizar estado del turno:", error);
      showToast("Error al actualizar el estado del turno", "error");
    }
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
          className="text-2xl font-bold text-gray-900 dark:text-white"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          Turnos
        </motion.h1>
        {user.rol !== "medico" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/dashboard/appointments/new">
              <Button className="mt-4 sm:mt-0 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600">
                <Plus className="mr-2 h-4 w-4" /> Nuevo Turno
              </Button>
            </Link>
          </motion.div>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-0 shadow-md overflow-hidden">
          <CardHeader className="border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-750">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
                Mis Turnos
              </CardTitle>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="mt-2 sm:mt-0"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  {showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
                </Button>
              </motion.div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-800"
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label
                        htmlFor="fecha"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Fecha
                      </label>
                      <Input
                        id="fecha"
                        name="fecha"
                        type="date"
                        value={filtros.fecha}
                        onChange={handleFiltroChange}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="estado"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Estado
                      </label>
                      <Select
                        id="estado"
                        name="estado"
                        value={filtros.estado}
                        onChange={handleFiltroChange}
                      >
                        <option value="">Todos</option>
                        <option value="pendiente">Pendiente</option>
                        <option value="confirmado">Confirmado</option>
                        <option value="completado">Completado</option>
                        <option value="cancelado">Cancelado</option>
                      </Select>
                    </div>
                    <div>
                      <label
                        htmlFor="busqueda"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Búsqueda
                      </label>
                      <form onSubmit={handleBusquedaSubmit} className="flex">
                        <Input
                          id="busqueda"
                          name="busqueda"
                          type="text"
                          placeholder="Buscar por nombre..."
                          value={filtros.busqueda}
                          onChange={handleBusquedaChange}
                          className="rounded-r-none"
                        />
                        <Button type="submit" className="rounded-l-none">
                          <Search className="h-4 w-4" />
                        </Button>
                      </form>
                    </div>
                  </div>
                  <motion.div
                    className="mt-4 flex justify-end"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Button
                      variant="outline"
                      onClick={limpiarFiltros}
                      className="flex items-center"
                    >
                      <X className="mr-2 h-4 w-4" /> Limpiar Filtros
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <motion.div
                  className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  }}
                />
              </div>
            ) : turnos.length > 0 ? (
              <motion.div
                className="overflow-hidden rounded-lg border border-gray-100 dark:border-gray-800"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Hora</TableHead>
                      {(user.rol === "paciente" || user.rol === "admin") && (
                        <TableHead>Médico</TableHead>
                      )}
                      {(user.rol === "medico" || user.rol === "admin") && (
                        <TableHead>Paciente</TableHead>
                      )}
                      <TableHead>Servicio</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {turnos.map((turno, index) => (
                      <motion.tr
                        key={turno.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <TableCell>{formatDate(turno.fecha)}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1 text-blue-500 dark:text-blue-400" />
                            {turno.hora}
                          </div>
                        </TableCell>
                        {(user.rol === "paciente" || user.rol === "admin") && (
                          <TableCell>{turno.medico?.nombre || "-"}</TableCell>
                        )}
                        {(user.rol === "medico" || user.rol === "admin") && (
                          <TableCell>{turno.paciente?.nombre || "-"}</TableCell>
                        )}
                        <TableCell>{getNombreServicio(turno)}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              turno.estado === "pendiente"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300"
                                : turno.estado === "confirmado"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300"
                                : turno.estado === "completado"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                                : "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"
                            }`}
                          >
                            {turno.estado.charAt(0).toUpperCase() +
                              turno.estado.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            {turno.estado === "pendiente" && (
                              <>
                                {user.rol === "medico" && (
                                  <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    <Button
                                      size="sm"
                                      onClick={() =>
                                        handleActualizarEstado(
                                          turno.id,
                                          "confirmado"
                                        )
                                      }
                                      className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600"
                                    >
                                      <CheckCircle className="h-4 w-4 mr-1" />{" "}
                                      Confirmar
                                    </Button>
                                  </motion.div>
                                )}
                                <motion.div
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() =>
                                      handleCancelarTurno(turno.id)
                                    }
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />{" "}
                                    Cancelar
                                  </Button>
                                </motion.div>
                              </>
                            )}
                            {turno.estado === "confirmado" &&
                              user.rol === "medico" && (
                                <motion.div
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      handleActualizarEstado(
                                        turno.id,
                                        "completado"
                                      )
                                    }
                                    className="bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />{" "}
                                    Completar
                                  </Button>
                                </motion.div>
                              )}
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </motion.div>
            ) : (
              <motion.div
                className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-800"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
                  No hay turnos
                </h3>
                <p className="mt-1 text-gray-500 dark:text-gray-400">
                  {filtros.fecha || filtros.estado || filtros.busqueda
                    ? "No se encontraron turnos con los filtros aplicados."
                    : "Aún no tienes turnos agendados."}
                </p>
                {user.rol !== "medico" &&
                  !filtros.fecha &&
                  !filtros.estado &&
                  !filtros.busqueda && (
                    <motion.div
                      className="mt-6"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link to="/dashboard/appointments/new">
                        <Button className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600">
                          <Plus className="mr-2 h-4 w-4" /> Agendar Turno
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

export default Turnos;

