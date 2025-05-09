/// Este componente muestra los registros médicos de los pacientes.
/// Los pacientes pueden ver sus propios registros, mientras que los médicos y administradores pueden ver los registros de todos los pacientes.
"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FileText, Search, Filter, X, Plus, Download } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
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

const MedicalHistory = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [historiales, setHistoriales] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    pacienteId: "",
    fecha: "",
    busqueda: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [historialesFiltrados, setHistorialesFiltrados] = useState([]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
  };

  const filterVariants = {
    hidden: { opacity: 0, height: 0, overflow: "hidden" },
    visible: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  };

  // Cargar historiales médicos
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Si es médico o admin, obtener lista de pacientes
        if (user.rol !== "paciente") {
          const pacientesResponse = await api.get("/usuarios", {
            params: { rol: "paciente" },
          });
          setPacientes(pacientesResponse.data);
        }

        // Obtener historiales médicos según el rol
        let url = "/historial-medico";

        if (user.rol === "paciente") {
          url = `/historial-medico/paciente/${user.id}`;
        } else if (user.rol === "medico") {
          // Para médicos, obtener los historiales de sus pacientes
          url = `/historial-medico/medico/${user.id}`;
        }

        const historialesResponse = await api.get(url);
        setHistoriales(historialesResponse.data);
        setHistorialesFiltrados(historialesResponse.data);
      } catch (error) {
        console.error("Error al cargar historiales médicos:", error);
        showToast("Error al cargar historiales médicos", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user.rol, user.id]);

  // Filtrar historiales cuando cambian los filtros
  useEffect(() => {
    let resultado = [...historiales];

    // Filtrar por paciente
    if (filtros.pacienteId) {
      resultado = resultado.filter(
        (historial) => historial.pacienteId.toString() === filtros.pacienteId
      );
    }

    // Filtrar por fecha
    if (filtros.fecha) {
      const fechaFiltro = new Date(filtros.fecha).toISOString().split("T")[0];
      resultado = resultado.filter((historial) => {
        const fechaHistorial = new Date(historial.fecha)
          .toISOString()
          .split("T")[0];
        return fechaHistorial === fechaFiltro;
      });
    }

    // Filtrar por búsqueda
    if (filtros.busqueda) {
      const busqueda = filtros.busqueda.toLowerCase();
      resultado = resultado.filter(
        (historial) =>
          (historial.diagnostico &&
            historial.diagnostico.toLowerCase().includes(busqueda)) ||
          (historial.tratamiento &&
            historial.tratamiento.toLowerCase().includes(busqueda)) ||
          (historial.observaciones &&
            historial.observaciones.toLowerCase().includes(busqueda)) ||
          (historial.motivo &&
            historial.motivo.toLowerCase().includes(busqueda))
      );
    }

    setHistorialesFiltrados(resultado);
  }, [filtros, historiales]);

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({ ...prev, [name]: value }));
  };

  const handleBusquedaChange = (e) => {
    setFiltros((prev) => ({ ...prev, busqueda: e.target.value }));
  };

  const handleBusquedaSubmit = (e) => {
    e.preventDefault();
  };

  const limpiarFiltros = () => {
    setFiltros({
      pacienteId: "",
      fecha: "",
      busqueda: "",
    });
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("es-ES", options);
  };

  const handleDownloadPDF = async (id) => {
    try {
      const response = await api.get(`/historial-medico/registro/${id}/pdf`, {
        responseType: "blob",
      });

      // Crear URL para el blob
      const url = window.URL.createObjectURL(new Blob([response.data]));

      // Crear enlace temporal y hacer clic en él
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `historial-medico-${id}.pdf`);
      document.body.appendChild(link);
      link.click();

      // Limpiar
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);

      showToast("PDF descargado exitosamente", "success");
    } catch (error) {
      console.error("Error al descargar PDF:", error);
      showToast("Error al descargar PDF", "error");
    }
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <motion.h1
          className="text-2xl font-bold text-gray-900 dark:text-white"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          Historial Médico
        </motion.h1>
        {(user.rol === "medico" || user.rol === "admin") && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Link to="/dashboard/medical-history/new">
              <Button className="mt-4 sm:mt-0 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300">
                <Plus className="mr-2 h-4 w-4" /> Nuevo Registro
              </Button>
            </Link>
          </motion.div>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Card className="border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-750 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5 text-primary" />
                Registros Médicos
              </CardTitle>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="mt-2 sm:mt-0 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Filter className="mr-2 h-4 w-4" />
                {showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <motion.div
              variants={filterVariants}
              initial="hidden"
              animate={showFilters ? "visible" : "hidden"}
            >
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {user.rol !== "paciente" && (
                    <div>
                      <label
                        htmlFor="pacienteId"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Paciente
                      </label>
                      <Select
                        id="pacienteId"
                        name="pacienteId"
                        value={filtros.pacienteId}
                        onChange={handleFiltroChange}
                      >
                        <option value="">Todos los pacientes</option>
                        {pacientes.map((paciente) => (
                          <option key={paciente.id} value={paciente.id}>
                            {paciente.nombre}
                          </option>
                        ))}
                      </Select>
                    </div>
                  )}

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
                        placeholder="Buscar en diagnóstico, tratamiento..."
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

                <div className="mt-4 flex justify-end">
                  <Button
                    variant="outline"
                    onClick={limpiarFiltros}
                    className="flex items-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <X className="mr-2 h-4 w-4" /> Limpiar Filtros
                  </Button>
                </div>
              </div>
            </motion.div>

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
            ) : historialesFiltrados.length > 0 ? (
              <motion.div
                className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      {user.rol !== "paciente" && (
                        <TableHead>Paciente</TableHead>
                      )}
                      {user.rol === "paciente" && <TableHead>Médico</TableHead>}
                      <TableHead>Motivo</TableHead>
                      <TableHead>Diagnóstico</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historialesFiltrados.map((historial, index) => (
                      <motion.tr
                        key={historial.id}
                        variants={itemVariants}
                        custom={index}
                        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <TableCell>{formatDate(historial.fecha)}</TableCell>
                        {user.rol !== "paciente" && (
                          <TableCell>{historial.paciente?.nombre}</TableCell>
                        )}
                        {user.rol === "paciente" && (
                          <TableCell>{historial.medico?.nombre}</TableCell>
                        )}
                        <TableCell>{historial.motivo}</TableCell>
                        <TableCell>{historial.diagnostico}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Link
                              to={`/dashboard/medical-history/${historial.id}`}
                            >
                              <Button
                                size="sm"
                                variant="outline"
                                className="p-2 h-auto hover:bg-primary/10 hover:text-primary transition-colors"
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownloadPDF(historial.id)}
                              className="p-2 h-auto hover:bg-primary/10 hover:text-primary transition-colors"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </motion.div>
            ) : (
              <motion.div
                className="text-center py-12"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                </motion.div>
                <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
                  No hay registros médicos
                </h3>
                <p className="mt-1 text-gray-500 dark:text-gray-400">
                  {filtros.pacienteId || filtros.fecha || filtros.busqueda
                    ? "No se encontraron registros con los filtros aplicados."
                    : "Aún no hay registros médicos disponibles."}
                </p>
                {(user.rol === "medico" || user.rol === "admin") && (
                  <motion.div
                    className="mt-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Link to="/dashboard/medical-history/new">
                      <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300">
                        <Plus className="mr-2 h-4 w-4" /> Crear Registro Médico
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

export default MedicalHistory;



