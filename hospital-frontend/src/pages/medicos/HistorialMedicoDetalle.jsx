/// Este componente muestra los detalles de un registro médico específico.
/// Permite descargar el registro en formato PDF, editar o eliminar el registro.

"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Download,
  Edit,
  Trash,
  Paperclip,
  Calendar,
  User,
  Mail,
  Phone,
  Stethoscope,
  Clock,
  FileText,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import Button from "../../components/ui/Button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "../../components/ui/Card";
import api from "../../services/api";

const HistorialMedicoDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [historial, setHistorial] = useState(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const fetchHistorial = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/historial-medico/registro/${id}`);
        setHistorial(response.data);
      } catch (error) {
        console.error("Error al cargar historial médico:", error);
        showToast("Error al cargar el historial médico", "error");
        navigate("/dashboard/medical-history");
      } finally {
        setLoading(false);
      }
    };

    fetchHistorial();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (
      !window.confirm(
        "¿Estás seguro de que deseas eliminar este registro médico?"
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      await api.delete(`/historial-medico/${id}`);
      showToast("Registro médico eliminado exitosamente", "success");
      navigate("/dashboard/medical-history");
    } catch (error) {
      console.error("Error al eliminar historial médico:", error);
      showToast("Error al eliminar el historial médico", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
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

  const handleDownloadFile = async (archivoId, nombreArchivo) => {
    try {
      const response = await api.get(
        `/historial-medico/archivos/${archivoId}`,
        {
          responseType: "blob",
        }
      );

      // Crear URL para el blob
      const url = window.URL.createObjectURL(new Blob([response.data]));

      // Crear enlace temporal y hacer clic en él
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", nombreArchivo);
      document.body.appendChild(link);
      link.click();

      // Limpiar
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);

      showToast("Archivo descargado exitosamente", "success");
    } catch (error) {
      console.error("Error al descargar archivo:", error);
      showToast("Error al descargar archivo", "error");
    }
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("es-ES", options);
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

  if (!historial) {
    return (
      <motion.div
        className="text-center py-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          No se encontró el historial médico
        </h3>
        <div className="mt-6">
          <Link to="/dashboard/medical-history">
            <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300">
              <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Historiales
            </Button>
          </Link>
        </div>
      </motion.div>
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
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Link
          to="/dashboard/medical-history"
          className="flex items-center text-primary hover:text-primary/80 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Historiales
        </Link>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={handleDownloadPDF}
            className="flex items-center hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <Download className="mr-2 h-4 w-4" /> Descargar PDF
          </Button>

          {(user.rol === "admin" ||
            (user.rol === "medico" && historial.medicoId === user.id)) && (
            <>
              <Link to={`/dashboard/medical-history/${id}/edit`}>
                <Button
                  variant="outline"
                  className="flex items-center hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <Edit className="mr-2 h-4 w-4" /> Editar
                </Button>
              </Link>

              <Button
                variant="destructive"
                onClick={handleDelete}
                className="flex items-center hover:bg-red-600 transition-colors"
              >
                <Trash className="mr-2 h-4 w-4" /> Eliminar
              </Button>
            </>
          )}
        </div>
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
              Historial Médico - {formatDate(historial.fecha)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
              variants={itemVariants}
            >
              <motion.div
                className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                  <User className="mr-2 h-5 w-5 text-primary" />
                  Información del Paciente
                </h3>
                <div className="space-y-2">
                  <p className="flex items-center text-sm">
                    <User className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                    <span className="font-medium text-gray-700 dark:text-gray-300 mr-1">
                      Nombre:
                    </span>{" "}
                    <span className="text-gray-600 dark:text-gray-400">
                      {historial.paciente?.nombre}
                    </span>
                  </p>
                  <p className="flex items-center text-sm">
                    <Mail className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                    <span className="font-medium text-gray-700 dark:text-gray-300 mr-1">
                      Email:
                    </span>{" "}
                    <span className="text-gray-600 dark:text-gray-400">
                      {historial.paciente?.email}
                    </span>
                  </p>
                  {historial.paciente?.telefono && (
                    <p className="flex items-center text-sm">
                      <Phone className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                      <span className="font-medium text-gray-700 dark:text-gray-300 mr-1">
                        Teléfono:
                      </span>{" "}
                      <span className="text-gray-600 dark:text-gray-400">
                        {historial.paciente.telefono}
                      </span>
                    </p>
                  )}
                </div>
              </motion.div>

              <motion.div
                className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                  <Stethoscope className="mr-2 h-5 w-5 text-primary" />
                  Información del Médico
                </h3>
                <div className="space-y-2">
                  <p className="flex items-center text-sm">
                    <User className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                    <span className="font-medium text-gray-700 dark:text-gray-300 mr-1">
                      Nombre:
                    </span>{" "}
                    <span className="text-gray-600 dark:text-gray-400">
                      {historial.medico?.nombre}
                    </span>
                  </p>
                  <p className="flex items-center text-sm">
                    <Stethoscope className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                    <span className="font-medium text-gray-700 dark:text-gray-300 mr-1">
                      Especialidad:
                    </span>{" "}
                    <span className="text-gray-600 dark:text-gray-400">
                      {historial.medico?.especialidad || "No especificada"}
                    </span>
                  </p>
                  <p className="flex items-center text-sm">
                    <Mail className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                    <span className="font-medium text-gray-700 dark:text-gray-300 mr-1">
                      Email:
                    </span>{" "}
                    <span className="text-gray-600 dark:text-gray-400">
                      {historial.medico?.email}
                    </span>
                  </p>
                </div>
              </motion.div>
            </motion.div>

            {/* Mostrar información del turno si existe */}
            {historial.Turno && (
              <motion.div
                className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 hover:shadow-md transition-shadow"
                variants={itemVariants}
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                  <Calendar className="mr-2 h-5 w-5 text-primary" />
                  Turno Asociado
                </h3>
                <div className="space-y-2">
                  <p className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-primary" />
                    <span className="font-medium text-gray-700 dark:text-gray-300 mr-1">
                      Fecha:
                    </span>{" "}
                    <span className="text-gray-600 dark:text-gray-400">
                      {formatDate(historial.Turno.fecha)}
                    </span>
                  </p>
                  <p className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2 text-primary" />
                    <span className="font-medium text-gray-700 dark:text-gray-300 mr-1">
                      Hora:
                    </span>{" "}
                    <span className="text-gray-600 dark:text-gray-400">
                      {historial.Turno.hora}
                    </span>
                  </p>
                  {historial.Turno.servicio && (
                    <p className="flex items-center text-sm">
                      <FileText className="h-4 w-4 mr-2 text-primary" />
                      <span className="font-medium text-gray-700 dark:text-gray-300 mr-1">
                        Servicio:
                      </span>{" "}
                      <span className="text-gray-600 dark:text-gray-400">
                        {historial.Turno.servicio.nombre}
                      </span>
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            <motion.div
              className="border-t border-gray-200 dark:border-gray-700 pt-6"
              variants={itemVariants}
            >
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <FileText className="mr-2 h-5 w-5 text-primary" />
                Detalles Médicos
              </h3>

              <div className="space-y-4">
                <motion.div
                  variants={itemVariants}
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-2 flex items-center">
                    <span className="w-1 h-4 bg-primary rounded-full mr-2"></span>
                    Motivo de Consulta
                  </h4>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-md border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                    <p className="text-gray-700 dark:text-gray-300">
                      {historial.motivo}
                    </p>
                  </div>
                </motion.div>

                {historial.sintomas && (
                  <motion.div
                    variants={itemVariants}
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-2 flex items-center">
                      <span className="w-1 h-4 bg-primary rounded-full mr-2"></span>
                      Síntomas
                    </h4>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-md border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                      <p className="text-gray-700 dark:text-gray-300">
                        {historial.sintomas}
                      </p>
                    </div>
                  </motion.div>
                )}

                <motion.div
                  variants={itemVariants}
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-2 flex items-center">
                    <span className="w-1 h-4 bg-primary rounded-full mr-2"></span>
                    Diagnóstico
                  </h4>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-md border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                    <p className="text-gray-700 dark:text-gray-300">
                      {historial.diagnostico}
                    </p>
                  </div>
                </motion.div>

                {historial.tratamiento && (
                  <motion.div
                    variants={itemVariants}
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-2 flex items-center">
                      <span className="w-1 h-4 bg-primary rounded-full mr-2"></span>
                      Tratamiento
                    </h4>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-md border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                      <p className="text-gray-700 dark:text-gray-300">
                        {historial.tratamiento}
                      </p>
                    </div>
                  </motion.div>
                )}

                {historial.observaciones && (
                  <motion.div
                    variants={itemVariants}
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-2 flex items-center">
                      <span className="w-1 h-4 bg-primary rounded-full mr-2"></span>
                      Observaciones
                    </h4>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-md border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                      <p className="text-gray-700 dark:text-gray-300">
                        {historial.observaciones}
                      </p>
                    </div>
                  </motion.div>
                )}

                {historial.ArchivoHistorials &&
                  historial.ArchivoHistorials.length > 0 && (
                    <motion.div
                      variants={itemVariants}
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-2 flex items-center">
                        <span className="w-1 h-4 bg-primary rounded-full mr-2"></span>
                        Archivos Adjuntos
                      </h4>
                      <div className="space-y-2">
                        {historial.ArchivoHistorials.map((archivo) => (
                          <motion.div
                            key={archivo.id}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
                            whileHover={{ scale: 1.02 }}
                            transition={{ type: "spring", stiffness: 400 }}
                          >
                            <div className="flex items-center">
                              <Paperclip className="h-4 w-4 mr-2 text-primary" />
                              <span className="text-gray-700 dark:text-gray-300">
                                {archivo.nombre}
                              </span>
                              {archivo.descripcion && (
                                <span className="ml-2 text-xs text-gray-500 dark:text-gray-500">
                                  ({archivo.descripcion})
                                </span>
                              )}
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleDownloadFile(archivo.id, archivo.nombre)
                              }
                              className="flex items-center hover:bg-primary/10 hover:text-primary transition-colors"
                            >
                              <Download className="h-4 w-4 mr-1" /> Descargar
                            </Button>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
              </div>
            </motion.div>
          </CardContent>
          <CardFooter className="text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30">
            Creado el {formatDate(historial.createdAt)}
            {historial.updatedAt !== historial.createdAt &&
              ` • Actualizado el ${formatDate(historial.updatedAt)}`}
          </CardFooter>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default HistorialMedicoDetalle;


