/// Este componente permite crear o editar un historial médico de un paciente.
/// Si se proporciona un ID de historial en la URL, se cargan los datos del historial para editarlos.

"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Upload,
  X,
  FileText,
  Calendar,
  FileCheck,
  User,
  Clock,
} from "lucide-react";
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
  CardFooter,
} from "../../components/ui/Card";
import api from "../../services/api";

const HistorialMedicoForm = () => {
  const { id, pacienteId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pacientes, setPacientes] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [historial, setHistorial] = useState(null);
  const [archivosSeleccionados, setArchivosSeleccionados] = useState([]);
  const [formData, setFormData] = useState({
    pacienteId: "",
    turnoId: "",
    fecha: new Date().toISOString().split("T")[0],
    motivo: "",
    sintomas: "",
    diagnostico: "",
    tratamiento: "",
    observaciones: "",
    esPrivado: false,
  });

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

  // Cargar datos necesarios
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Si es edición, cargar el historial
        if (id) {
          const historialResponse = await api.get(
            `/historial-medico/registro/${id}`
          );
          setHistorial(historialResponse.data);

          // Llenar el formulario con los datos del historial
          setFormData({
            pacienteId: historialResponse.data.pacienteId,
            turnoId: historialResponse.data.turnoId || "",
            fecha: new Date(historialResponse.data.fecha)
              .toISOString()
              .split("T")[0],
            motivo: historialResponse.data.motivo || "",
            sintomas: historialResponse.data.sintomas || "",
            diagnostico: historialResponse.data.diagnostico || "",
            tratamiento: historialResponse.data.tratamiento || "",
            observaciones: historialResponse.data.observaciones || "",
            esPrivado: historialResponse.data.esPrivado || false,
          });
        }
        // Si se proporciona un pacienteId en la URL, usarlo
        else if (pacienteId) {
          setFormData((prev) => ({ ...prev, pacienteId }));
        }

        // Si es médico o admin, cargar lista de pacientes
        if (user.rol === "medico" || user.rol === "admin") {
          const pacientesResponse = await api.get("/usuarios", {
            params: { rol: "paciente" },
          });
          setPacientes(pacientesResponse.data);
        }
      } catch (error) {
        console.error("Error al cargar datos:", error);
        showToast("Error al cargar datos", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, pacienteId, user.rol]);

  // Cargar turnos cuando cambia el paciente seleccionado
  useEffect(() => {
    const fetchTurnos = async () => {
      if (!formData.pacienteId) return;

      try {
        const response = await api.get("/turnos", {
          params: {
            pacienteId: formData.pacienteId,
            estado: "completado",
          },
        });
        setTurnos(response.data);
      } catch (error) {
        console.error("Error al cargar turnos:", error);
        showToast("Error al cargar turnos del paciente", "error");
      }
    };

    fetchTurnos();
  }, [formData.pacienteId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    // Validar tamaño de archivos (máximo 10MB por archivo)
    const validFiles = files.filter((file) => file.size <= 10 * 1024 * 1024);

    if (validFiles.length !== files.length) {
      showToast("Algunos archivos exceden el tamaño máximo de 10MB", "error");
    }

    setArchivosSeleccionados((prev) => [...prev, ...validFiles]);
  };

  const handleRemoveFile = (index) => {
    setArchivosSeleccionados((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.pacienteId) {
      showToast("Debe seleccionar un paciente", "error");
      return;
    }

    try {
      setSubmitting(true);

      let response;

      if (id) {
        // Actualizar historial existente
        response = await api.put(`/historial-medico/${id}`, formData);
        showToast("Historial médico actualizado exitosamente", "success");
      } else {
        // Crear nuevo historial
        const historialData = {
          ...formData,
          medicoId: user.id,
        };

        response = await api.post("/historial-medico", historialData);
        showToast("Historial médico creado exitosamente", "success");
      }

      const historialId = id || response.data.historial.id;

      // Subir archivos adjuntos si hay alguno
      if (archivosSeleccionados.length > 0) {
        const formDataFiles = new FormData();

        archivosSeleccionados.forEach((file) => {
          formDataFiles.append("archivo", file);
        });

        await api.post(
          `/historial-medico/${historialId}/archivos`,
          formDataFiles,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }

      navigate(`/dashboard/medical-history/${historialId}`);
    } catch (error) {
      console.error("Error al guardar historial médico:", error);
      showToast(
        error.response?.data?.mensaje || "Error al guardar historial médico",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Formatear fecha y hora para mostrar en el select de turnos
  const formatTurnoLabel = (turno) => {
    const fecha = new Date(turno.fecha).toLocaleDateString("es-ES");
    return `${fecha} - ${turno.hora} - ${turno.servicio?.nombre || "Consulta"}`;
  };

  if (loading) {
    return (
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
    );
  }

  return (
    <motion.div
      className="max-w-3xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="flex items-center mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-primary hover:text-primary/80 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver
        </button>
        <h1 className="text-2xl font-bold ml-4 text-gray-900 dark:text-white">
          {id ? "Editar Historial Médico" : "Nuevo Historial Médico"}
        </h1>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Card className="border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-750 border-b border-gray-200 dark:border-gray-700">
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5 text-primary" />
              Información del Historial
            </CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 p-6">
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                variants={itemVariants}
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                    <User className="h-4 w-4 mr-1 text-primary" />
                    Paciente
                  </label>
                  <Select
                    name="pacienteId"
                    value={formData.pacienteId}
                    onChange={handleChange}
                    disabled={!!pacienteId || !!id}
                    required
                    className="border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary"
                  >
                    <option value="">Seleccione un paciente</option>
                    {pacientes.map((paciente) => (
                      <option key={paciente.id} value={paciente.id}>
                        {paciente.nombre}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-primary" />
                    Turno asociado
                  </label>
                  <Select
                    name="turnoId"
                    value={formData.turnoId}
                    onChange={handleChange}
                    className="border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary"
                  >
                    <option value="">Ninguno</option>
                    {turnos.map((turno) => (
                      <option key={turno.id} value={turno.id}>
                        {formatTurnoLabel(turno)}
                      </option>
                    ))}
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    Opcional: Seleccione un turno para asociarlo a este registro
                    médico
                  </p>
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                  <Calendar className="h-4 w-4 mr-1 text-primary" />
                  Fecha
                </label>
                <Input
                  type="date"
                  name="fecha"
                  value={formData.fecha}
                  onChange={handleChange}
                  required
                  className="border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary"
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Motivo de Consulta
                </label>
                <Input
                  name="motivo"
                  value={formData.motivo}
                  onChange={handleChange}
                  placeholder="Ej: Control rutinario, Dolor abdominal, etc."
                  required
                  className="border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary"
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Síntomas
                </label>
                <textarea
                  name="sintomas"
                  value={formData.sintomas}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent border-gray-300 dark:border-gray-600 bg-background text-foreground transition-colors"
                  placeholder="Describa los síntomas del paciente"
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Diagnóstico
                </label>
                <textarea
                  name="diagnostico"
                  value={formData.diagnostico}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent border-gray-300 dark:border-gray-600 bg-background text-foreground transition-colors"
                  placeholder="Diagnóstico del paciente"
                  required
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tratamiento
                </label>
                <textarea
                  name="tratamiento"
                  value={formData.tratamiento}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent border-gray-300 dark:border-gray-600 bg-background text-foreground transition-colors"
                  placeholder="Tratamiento recomendado"
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Observaciones
                </label>
                <textarea
                  name="observaciones"
                  value={formData.observaciones}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent border-gray-300 dark:border-gray-600 bg-background text-foreground transition-colors"
                  placeholder="Observaciones adicionales"
                />
              </motion.div>

              <motion.div
                className="flex items-center"
                variants={itemVariants}
                whileHover={{ x: 5 }}
              >
                <input
                  type="checkbox"
                  id="esPrivado"
                  name="esPrivado"
                  checked={formData.esPrivado}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded transition-colors"
                />
                <label
                  htmlFor="esPrivado"
                  className="ml-2 block text-sm text-gray-900 dark:text-gray-100"
                >
                  Registro privado (solo visible para el médico que lo crea y
                  administradores)
                </label>
              </motion.div>

              <motion.div
                className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4"
                variants={itemVariants}
              >
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                  <FileCheck className="h-4 w-4 mr-1 text-primary" />
                  Archivos adjuntos
                </label>
                <div className="mt-1 flex items-center">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current.click()}
                    className="flex items-center hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    <Upload className="h-4 w-4 mr-2" /> Seleccionar archivos
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    multiple
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                  />
                  <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">
                    Máximo 10MB por archivo
                  </span>
                </div>

                {archivosSeleccionados.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Archivos seleccionados:
                    </p>
                    <div className="space-y-2">
                      {archivosSeleccionados.map((file, index) => (
                        <motion.div
                          key={index}
                          className="flex items-center justify-between p-2 border rounded-md bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2 }}
                          whileHover={{ scale: 1.01, x: 5 }}
                        >
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-primary" />
                            <span className="text-sm truncate max-w-xs text-gray-700 dark:text-gray-300">
                              {file.name}
                            </span>
                            <span className="text-xs text-gray-500 ml-2">
                              ({(file.size / 1024).toFixed(1)} KB)
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveFile(index)}
                            className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300"
              >
                {submitting ? (
                  <motion.div className="flex items-center">
                    <motion.div
                      className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "linear",
                      }}
                    />
                    {id ? "Actualizando..." : "Guardando..."}
                  </motion.div>
                ) : id ? (
                  "Actualizar"
                ) : (
                  "Guardar"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default HistorialMedicoForm;



