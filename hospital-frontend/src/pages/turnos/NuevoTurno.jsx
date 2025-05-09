/// Este componente permite a los pacientes agendar un nuevo turno con un médico.
/// El paciente debe seleccionar un médico, un servicio, una fecha y una hora.
/// La hora se selecciona de los horarios disponibles del médico en la fecha seleccionada.
/// El paciente también puede agregar notas adicionales para el médico.

"use client";

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Stethoscope,
  ClipboardList,
  ArrowLeft,
  Check,
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

const NuevoTurno = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    medicoId: location.state?.medicoId || "",
    servicioId: "",
    fecha: "",
    hora: "",
    notas: "",
  });

  const [medicos, setMedicos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingHorarios, setLoadingHorarios] = useState(false);
  const [errors, setErrors] = useState({});

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

  // Cargar médicos y servicios al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Obtener médicos
        const medicosResponse = await api.get("/usuarios/medicos");
        setMedicos(medicosResponse.data);

        // Obtener categorías
        const categoriasResponse = await api.get("/categorias");
        setCategorias(categoriasResponse.data);

        // Obtener todos los servicios
        const serviciosResponse = await api.get("/servicios");
        setServicios(serviciosResponse.data);
      } catch (error) {
        console.error("Error al cargar datos iniciales:", error);
        showToast("Error al cargar datos necesarios", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Cargar horarios disponibles cuando se selecciona médico y fecha
  useEffect(() => {
    const fetchHorariosDisponibles = async () => {
      if (!formData.medicoId || !formData.fecha) return;

      try {
        setLoadingHorarios(true);
        const response = await api.get(
          `/disponibilidad/medico/${formData.medicoId}/horarios-disponibles`,
          {
            params: { fecha: formData.fecha },
          }
        );

        setHorariosDisponibles(response.data.horarios || []);

        // Limpiar hora seleccionada si ya no está disponible
        if (formData.hora && !response.data.horarios.includes(formData.hora)) {
          setFormData((prev) => ({ ...prev, hora: "" }));
        }
      } catch (error) {
        console.error("Error al obtener horarios disponibles:", error);
        showToast("Error al cargar horarios disponibles", "error");
        setHorariosDisponibles([]);
      } finally {
        setLoadingHorarios(false);
      }
    };

    fetchHorariosDisponibles();
  }, [formData.medicoId, formData.fecha]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Limpiar error al cambiar el valor
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Si cambia el médico o la fecha, resetear la hora
    if (name === "medicoId" || name === "fecha") {
      setFormData((prev) => ({ ...prev, hora: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.medicoId) {
      newErrors.medicoId = "Seleccione un médico";
    }

    if (!formData.servicioId) {
      newErrors.servicioId = "Seleccione un servicio";
    }

    if (!formData.fecha) {
      newErrors.fecha = "Seleccione una fecha";
    } else {
      const selectedDate = new Date(formData.fecha);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.fecha = "La fecha no puede ser anterior a hoy";
      }
    }

    if (!formData.hora) {
      newErrors.hora = "Seleccione una hora";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      // Si el usuario es paciente, no es necesario enviar pacienteId
      // El backend lo tomará del token
      const response = await api.post("/turnos", formData);

      showToast("Turno agendado exitosamente", "success");
      navigate("/dashboard/appointments");
    } catch (error) {
      console.error("Error al agendar turno:", error);
      showToast(
        error.response?.data?.mensaje || "Error al agendar turno",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // Filtrar servicios por categoría seleccionada
  const handleCategoriaChange = async (e) => {
    const categoriaId = e.target.value;

    try {
      if (categoriaId) {
        const response = await api.get("/servicios", {
          params: { categoriaId },
        });
        setServicios(response.data);
      } else {
        // Si no hay categoría seleccionada, cargar todos los servicios
        const response = await api.get("/servicios");
        setServicios(response.data);
      }

      // Resetear servicio seleccionado
      setFormData((prev) => ({ ...prev, servicioId: "" }));
    } catch (error) {
      console.error("Error al filtrar servicios:", error);
      showToast("Error al cargar servicios", "error");
    }
  };

  // Formatear fecha para mostrar
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("es-ES", options);
  };

  if (loading && !formData.medicoId) {
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
          Agendar Nuevo Turno
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
              <Calendar className="mr-2 h-5 w-5 text-primary" />
              Información del Turno
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div className="space-y-4" variants={containerVariants}>
                <motion.div variants={itemVariants}>
                  <label
                    htmlFor="medicoId"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center"
                  >
                    <Stethoscope className="h-4 w-4 mr-1 text-primary" />
                    Médico
                  </label>
                  <div className="mt-1">
                    <Select
                      id="medicoId"
                      name="medicoId"
                      value={formData.medicoId}
                      onChange={handleChange}
                      error={errors.medicoId}
                      className="border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary"
                    >
                      <option value="">Seleccione un médico</option>
                      {medicos.map((medico) => (
                        <option key={medico.id} value={medico.id}>
                          Dr. {medico.nombre}{" "}
                          {medico.especialidad
                            ? `- ${medico.especialidad}`
                            : ""}
                        </option>
                      ))}
                    </Select>
                    {errors.medicoId && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.medicoId}
                      </p>
                    )}
                  </div>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label
                    htmlFor="categoria"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Categoría (opcional)
                  </label>
                  <div className="mt-1">
                    <Select
                      id="categoria"
                      name="categoria"
                      onChange={handleCategoriaChange}
                      className="border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary"
                    >
                      <option value="">Todas las categorías</option>
                      {categorias.map((categoria) => (
                        <option key={categoria.id} value={categoria.id}>
                          {categoria.nombre}
                        </option>
                      ))}
                    </Select>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label
                    htmlFor="servicioId"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center"
                  >
                    <ClipboardList className="h-4 w-4 mr-1 text-primary" />
                    Servicio
                  </label>
                  <div className="mt-1">
                    <Select
                      id="servicioId"
                      name="servicioId"
                      value={formData.servicioId}
                      onChange={handleChange}
                      error={errors.servicioId}
                      className="border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary"
                    >
                      <option value="">Seleccione un servicio</option>
                      {servicios.map((servicio) => (
                        <option key={servicio.id} value={servicio.id}>
                          {servicio.nombre}{" "}
                          {servicio.precio ? `- $${servicio.precio}` : ""}
                        </option>
                      ))}
                    </Select>
                    {errors.servicioId && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.servicioId}
                      </p>
                    )}
                  </div>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label
                    htmlFor="fecha"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center"
                  >
                    <Calendar className="h-4 w-4 mr-1 text-primary" />
                    Fecha
                  </label>
                  <div className="mt-1">
                    <Input
                      id="fecha"
                      name="fecha"
                      type="date"
                      value={formData.fecha}
                      onChange={handleChange}
                      error={errors.fecha}
                      min={new Date().toISOString().split("T")[0]} // No permitir fechas anteriores a hoy
                      className="border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary"
                    />
                    {errors.fecha && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.fecha}
                      </p>
                    )}
                  </div>
                </motion.div>

                {formData.medicoId && formData.fecha && (
                  <motion.div
                    variants={itemVariants}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{
                      opacity: 1,
                      height: "auto",
                      transition: {
                        height: { duration: 0.3 },
                      },
                    }}
                  >
                    <label
                      htmlFor="hora"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center"
                    >
                      <Clock className="h-4 w-4 mr-1 text-primary" />
                      Hora
                    </label>
                    <div className="mt-1">
                      {loadingHorarios ? (
                        <div className="flex items-center space-x-2">
                          <motion.div
                            className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Number.POSITIVE_INFINITY,
                              ease: "linear",
                            }}
                          />
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Cargando horarios disponibles...
                          </span>
                        </div>
                      ) : horariosDisponibles.length > 0 ? (
                        <motion.div
                          className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2"
                          variants={containerVariants}
                          initial="hidden"
                          animate="visible"
                        >
                          {horariosDisponibles.map((hora, index) => (
                            <motion.button
                              key={hora}
                              type="button"
                              className={`py-2 px-3 text-sm rounded-md border transition-all duration-200 ${
                                formData.hora === hora
                                  ? "bg-primary text-primary-foreground border-primary shadow-md"
                                  : "bg-background text-foreground border-border hover:bg-accent hover:text-accent-foreground hover:scale-105"
                              }`}
                              onClick={() =>
                                setFormData((prev) => ({ ...prev, hora }))
                              }
                              variants={itemVariants}
                              custom={index}
                              whileHover={{
                                scale: formData.hora === hora ? 1 : 1.05,
                              }}
                              whileTap={{ scale: 0.98 }}
                            >
                              {hora}
                            </motion.button>
                          ))}
                        </motion.div>
                      ) : (
                        <motion.div
                          className="text-sm text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md border border-yellow-200 dark:border-yellow-800"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          No hay horarios disponibles para la fecha
                          seleccionada. Por favor, seleccione otra fecha.
                        </motion.div>
                      )}
                      {errors.hora && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {errors.hora}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}

                <motion.div variants={itemVariants}>
                  <label
                    htmlFor="notas"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Notas adicionales (opcional)
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="notas"
                      name="notas"
                      rows={3}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent border-gray-300 dark:border-gray-600 bg-background text-foreground transition-colors"
                      value={formData.notas}
                      onChange={handleChange}
                      placeholder="Información adicional para el médico..."
                    />
                  </div>
                </motion.div>
              </motion.div>

              {formData.medicoId &&
                formData.servicioId &&
                formData.fecha &&
                formData.hora && (
                  <motion.div
                    className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 100,
                      damping: 15,
                      delay: 0.2,
                    }}
                  >
                    <h3 className="text-lg font-medium text-blue-800 dark:text-blue-300 flex items-center">
                      <Check className="h-5 w-5 mr-2 text-primary" />
                      Resumen del Turno
                    </h3>
                    <div className="mt-2 space-y-2">
                      <motion.div
                        className="flex items-start"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <Stethoscope className="h-5 w-5 text-primary mr-2 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Médico:
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {medicos.find(
                              (m) =>
                                m.id.toString() === formData.medicoId.toString()
                            )?.nombre || ""}
                          </p>
                        </div>
                      </motion.div>
                      <motion.div
                        className="flex items-start"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <ClipboardList className="h-5 w-5 text-primary mr-2 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Servicio:
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {servicios.find(
                              (s) =>
                                s.id.toString() ===
                                formData.servicioId.toString()
                            )?.nombre || ""}
                          </p>
                        </div>
                      </motion.div>
                      <motion.div
                        className="flex items-start"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        <Calendar className="h-5 w-5 text-primary mr-2 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Fecha:
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {formatDate(formData.fecha)}
                          </p>
                        </div>
                      </motion.div>
                      <motion.div
                        className="flex items-start"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                      >
                        <Clock className="h-5 w-5 text-primary mr-2 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Hora:
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {formData.hora}
                          </p>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
            </form>
          </CardContent>
          <CardFooter className="flex justify-end space-x-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30">
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard/appointments")}
              className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300"
            >
              {loading ? (
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
                  Agendando...
                </motion.div>
              ) : (
                "Agendar Turno"
              )}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default NuevoTurno;





