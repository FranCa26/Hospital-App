/// Este componente muestra la lista de médicos disponibles en el sistema.
"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Star,
  UserRound,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { Card } from "../../components/ui/Card";
import api from "../../services/api";

const Medicos = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [medicos, setMedicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [medicosFiltrados, setMedicosFiltrados] = useState([]);

  useEffect(() => {
    const fetchMedicos = async () => {
      try {
        setLoading(true);
        const response = await api.get("/usuarios/medicos");
        setMedicos(response.data);
        setMedicosFiltrados(response.data);
      } catch (error) {
        console.error("Error al obtener médicos:", error);
        showToast("Error al cargar la lista de médicos", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchMedicos();
  }, []);

  const handleBusquedaChange = (e) => {
    const valor = e.target.value.toLowerCase();
    setBusqueda(valor);

    if (!valor) {
      setMedicosFiltrados(medicos);
      return;
    }

    const filtrados = medicos.filter(
      (medico) =>
        medico.nombre.toLowerCase().includes(valor) ||
        (medico.especialidad &&
          medico.especialidad.toLowerCase().includes(valor))
    );

    setMedicosFiltrados(filtrados);
  };

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
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
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

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div>
        <motion.h1
          className="text-2xl font-bold text-gray-900 dark:text-white"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          Médicos
        </motion.h1>
        <motion.p
          className="mt-1 text-gray-600 dark:text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Explora nuestro equipo de profesionales de la salud.
        </motion.p>
      </div>

      <motion.div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="relative w-full sm:w-64">
          <Input
            type="text"
            placeholder="Buscar médico o especialidad..."
            value={busqueda}
            onChange={handleBusquedaChange}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>
      </motion.div>

      {medicosFiltrados.length === 0 ? (
        <motion.div
          className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <UserRound className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
            No se encontraron médicos
          </h3>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            {busqueda
              ? "Intenta con otra búsqueda."
              : "No hay médicos disponibles en este momento."}
          </p>
        </motion.div>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {medicosFiltrados.map((medico) => (
            <motion.div key={medico.id} variants={itemVariants}>
              <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl group">
                <div className="h-24 bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 relative overflow-hidden">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 opacity-0 group-hover:opacity-100"
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <div className="relative px-6 pb-6">
                  <div className="flex justify-center">
                    <motion.div
                      className="w-20 h-20 rounded-full bg-white dark:bg-gray-800 border-4 border-white dark:border-gray-800 -mt-10 flex items-center justify-center shadow-md group-hover:shadow-lg"
                      whileHover={{ scale: 1.05 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 10,
                      }}
                    >
                      <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 text-transparent bg-clip-text">
                        {medico.nombre.charAt(0)}
                      </span>
                    </motion.div>
                  </div>
                  <div className="mt-4 text-center">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {medico.nombre}
                    </h3>
                    {medico.especialidad && (
                      <div className="flex items-center justify-center mt-1">
                        <Star className="h-4 w-4 text-blue-600 dark:text-blue-400 mr-1" />
                        <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                          {medico.especialidad}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 space-y-2">
                    {medico.telefono && (
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Phone className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-500" />
                        <span>{medico.telefono}</span>
                      </div>
                    )}
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Mail className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-500" />
                      <span>{medico.email}</span>
                    </div>
                    {medico.direccion && (
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-500" />
                        <span>{medico.direccion}</span>
                      </div>
                    )}
                  </div>
                  {user.rol === "paciente" && (
                    <motion.div
                      className="mt-6"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link
                        to="/dashboard/appointments/new"
                        state={{ medicoId: medico.id }}
                      >
                        <Button className="w-full flex items-center justify-center transition-colors bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          Agendar Turno
                        </Button>
                      </Link>
                    </motion.div>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

export default Medicos;






