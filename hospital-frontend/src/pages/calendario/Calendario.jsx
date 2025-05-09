// Este componente muestra un calendario con los horarios disponibles y turnos de un médico. Los pacientes pueden ver los horarios disponibles y reservar turnos, mientras que los médicos y administradores pueden ver y administrar los horarios de disponibilidad.

"use client";

import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../../components/ui/Button";
import Select from "../../components/ui/Select";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/Card";
import api from "../../services/api";

const Calendario = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [medicos, setMedicos] = useState([]);
  const [selectedMedico, setSelectedMedico] = useState("");
  const [disponibilidad, setDisponibilidad] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [horarioForm, setHorarioForm] = useState({
    fecha: "",
    horaInicio: "08:00",
    horaFin: "17:00",
    intervalo: 30,
  });

  // Cargar médicos si el usuario es admin o paciente
  useEffect(() => {
    const fetchMedicos = async () => {
      if (user.rol !== "medico") {
        try {
          const response = await api.get("/usuarios/medicos");
          setMedicos(response.data);
          // Si es admin y no hay médico seleccionado, seleccionar el primero automáticamente
          if (
            user.rol === "admin" &&
            response.data.length > 0 &&
            !selectedMedico
          ) {
            setSelectedMedico(response.data[0].id);
          }
        } catch (error) {
          console.error("Error al cargar médicos:", error);
          showToast("Error al cargar la lista de médicos", "error");
        }
      }
    };

    fetchMedicos();
  }, [user.rol]);

  // Cargar disponibilidad y turnos cuando cambia la fecha o el médico seleccionado
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const medicoId = user.rol === "medico" ? user.id : selectedMedico;
        if (!medicoId) return;

        const fecha = selectedDate.toISOString().split("T")[0];

        // Obtener horarios disponibles para la fecha seleccionada
        const disponibilidadResponse = await api.get(
          `/disponibilidad/medico/${medicoId}/horarios-disponibles`,
          {
            params: { fecha },
          }
        );

        // Si la respuesta tiene horarios, establecerlos
        if (
          disponibilidadResponse.data &&
          disponibilidadResponse.data.horarios
        ) {
          setDisponibilidad(
            disponibilidadResponse.data.horarios.map((hora) => ({
              horaInicio: hora,
              horaFin: getNextHour(hora),
              intervalo: 30,
            }))
          );
        } else {
          setDisponibilidad([]);
        }

        // Obtener turnos
        const turnosResponse = await api.get("/turnos", {
          params: {
            fecha,
            medicoId,
          },
        });

        setTurnos(turnosResponse.data);
      } catch (error) {
        console.error("Error al cargar datos del calendario:", error);
        showToast("Error al cargar datos del calendario", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedDate, selectedMedico, user.rol, user.id]);

  // Función auxiliar para calcular la siguiente hora
  const getNextHour = (horaStr) => {
    const [hora, minutos] = horaStr.split(":").map(Number);
    const date = new Date();
    date.setHours(hora, minutos + 30, 0);
    return `${date.getHours().toString().padStart(2, "0")}:${date
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  };

  const handlePrevMonth = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  const handleMedicoChange = (e) => {
    setSelectedMedico(e.target.value);
  };

  const handleHorarioChange = (e) => {
    const { name, value } = e.target;
    setHorarioForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddDisponibilidad = async () => {
    try {
      setLoading(true);

      const medicoId = user.rol === "medico" ? user.id : selectedMedico;
      if (!medicoId) {
        showToast("Debe seleccionar un médico", "error");
        return;
      }

      // Crear excepción de disponibilidad para la fecha específica
      const excepcionData = {
        fecha: selectedDate.toISOString().split("T")[0],
        esDisponible: true,
        horaInicio: horarioForm.horaInicio,
        horaFin: horarioForm.horaFin,
        motivo: "Disponibilidad agregada manualmente",
      };

      // Usar la ruta correcta para crear una excepción de disponibilidad
      await api.post(
        `/disponibilidad/medico/${medicoId}/excepciones`,
        excepcionData
      );

      showToast("Disponibilidad agregada exitosamente", "success");
      setShowModal(false);

      // Recargar horarios disponibles
      const fecha = selectedDate.toISOString().split("T")[0];
      const disponibilidadResponse = await api.get(
        `/disponibilidad/medico/${medicoId}/horarios-disponibles`,
        {
          params: { fecha },
        }
      );

      if (disponibilidadResponse.data && disponibilidadResponse.data.horarios) {
        setDisponibilidad(
          disponibilidadResponse.data.horarios.map((hora) => ({
            horaInicio: hora,
            horaFin: getNextHour(hora),
            intervalo: 30,
          }))
        );
      } else {
        setDisponibilidad([]);
      }

      // Recargar turnos
      const turnosResponse = await api.get("/turnos", {
        params: {
          fecha,
          medicoId,
        },
      });
      setTurnos(turnosResponse.data);
    } catch (error) {
      console.error("Error al agregar disponibilidad:", error);
      showToast(
        error.response?.data?.mensaje || "Error al agregar disponibilidad",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const renderCalendar = () => {
    const monthStart = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const monthEnd = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );
    const startDate = new Date(monthStart);
    const endDate = new Date(monthEnd);

    // Ajustar startDate al primer día de la semana (domingo)
    startDate.setDate(startDate.getDate() - startDate.getDay());

    // Ajustar endDate al último día de la semana (sábado)
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

    const rows = [];
    let days = [];
    const day = new Date(startDate);

    // Encabezados de los días de la semana
    const weekDays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

    // Renderizar días de la semana
    const dayHeaders = weekDays.map((weekDay) => (
      <div
        key={weekDay}
        className="text-center font-medium text-gray-500 dark:text-gray-400 py-2"
      >
        {weekDay}
      </div>
    ));

    // Renderizar días del mes
    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = new Date(day);
        const isCurrentMonth = day.getMonth() === currentDate.getMonth();
        const isToday = day.toDateString() === new Date().toDateString();
        const isSelected = day.toDateString() === selectedDate.toDateString();

        days.push(
          <motion.div
            key={day.toISOString()}
            className={`
              p-2 text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md
              ${
                isCurrentMonth
                  ? "text-gray-900 dark:text-gray-100"
                  : "text-gray-400 dark:text-gray-600"
              }
              ${isToday ? "bg-blue-50 dark:bg-blue-900/20" : ""}
              ${isSelected ? "bg-primary/10 border border-primary" : ""}
            `}
            onClick={() => handleDateClick(new Date(cloneDay))}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {day.getDate()}
          </motion.div>
        );

        day.setDate(day.getDate() + 1);
      }

      rows.push(
        <div key={day.toISOString()} className="grid grid-cols-7 gap-1">
          {days}
        </div>
      );

      days = [];
    }

    return (
      <div className="space-y-2">
        <div className="grid grid-cols-7 gap-1">{dayHeaders}</div>
        {rows}
      </div>
    );
  };

  const renderHorarios = () => {
    if (loading) {
      return (
        <motion.div
          className="text-center py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Cargando horarios...
          </p>
        </motion.div>
      );
    }

    if (!disponibilidad || disponibilidad.length === 0) {
      return (
        <motion.div
          className="text-center py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-gray-500 dark:text-gray-400">
            No hay horarios disponibles para esta fecha
          </p>
          {(user.rol === "medico" || user.rol === "admin") && (
            <motion.div
              className="mt-4"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => setShowModal(true)}
                className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600"
              >
                <Plus className="mr-2 h-4 w-4" /> Agregar Disponibilidad
              </Button>
            </motion.div>
          )}
        </motion.div>
      );
    }

    // Obtener horarios disponibles
    const horariosDisponibles = [];

    // Primero, agregar todos los turnos existentes (incluso los cancelados)
    turnos.forEach((turno) => {
      horariosDisponibles.push({
        hora: turno.hora,
        disponible: turno.estado === "cancelado",
        turno: turno,
        estado: turno.estado,
      });
    });

    // Luego, agregar los horarios de disponibilidad que no tienen turnos
    disponibilidad.forEach((disp) => {
      const [horaInicio, minInicio] = disp.horaInicio.split(":").map(Number);
      const [horaFin, minFin] = disp.horaFin.split(":").map(Number);

      const intervalo = disp.intervalo || 30; // Intervalo en minutos

      const hora = new Date();
      hora.setHours(horaInicio, minInicio, 0);

      const fin = new Date();
      fin.setHours(horaFin, minFin, 0);

      while (hora < fin) {
        const horaStr = hora.getHours().toString().padStart(2, "0");
        const minStr = hora.getMinutes().toString().padStart(2, "0");
        const horarioStr = `${horaStr}:${minStr}`;

        // Verificar si ya existe un turno para esta hora
        const existeTurno = horariosDisponibles.some(
          (h) => h.hora === horarioStr
        );

        if (!existeTurno) {
          horariosDisponibles.push({
            hora: horarioStr,
            disponible: true,
            turno: null,
            estado: null,
          });
        }

        // Avanzar al siguiente intervalo
        hora.setMinutes(hora.getMinutes() + intervalo);
      }
    });

    // Ordenar los horarios por hora
    horariosDisponibles.sort((a, b) => {
      const [horaA, minA] = a.hora.split(":").map(Number);
      const [horaB, minB] = b.hora.split(":").map(Number);

      if (horaA !== horaB) return horaA - horaB;
      return minA - minB;
    });

    return (
      <motion.div
        className="mt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Horarios para{" "}
            {selectedDate.toLocaleDateString("es-ES", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </h3>

          {(user.rol === "medico" || user.rol === "admin") && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => setShowModal(true)}
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600"
              >
                <Plus className="mr-2 h-4 w-4" /> Agregar Disponibilidad
              </Button>
            </motion.div>
          )}
        </div>

        {horariosDisponibles.length > 0 ? (
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.05,
                },
              },
            }}
            initial="hidden"
            animate="show"
          >
            {horariosDisponibles
              .map((horario, index) => {
                // Si es paciente, solo mostrar horarios disponibles
                if (user.rol === "paciente" && !horario.disponible) {
                  return null;
                }

                // Determinar las clases y el contenido según el estado
                let cardClasses = "";
                let statusIcon = null;

                if (horario.disponible) {
                  // Horario disponible
                  cardClasses =
                    "bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400";
                  statusIcon = <Clock className="h-4 w-4 mr-1" />;
                } else if (horario.turno) {
                  // Verificar el estado del turno
                  switch (horario.turno.estado) {
                    case "confirmado":
                      cardClasses =
                        "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400";
                      statusIcon = <CheckCircle className="h-4 w-4 mr-1" />;
                      break;
                    case "pendiente":
                      cardClasses =
                        "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400";
                      statusIcon = <Clock className="h-4 w-4 mr-1" />;
                      break;
                    case "cancelado":
                      // No debería entrar aquí porque los cancelados tienen disponible=true
                      cardClasses =
                        "bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400";
                      statusIcon = <AlertCircle className="h-4 w-4 mr-1" />;
                      break;
                    default:
                      cardClasses =
                        "bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-400";
                      statusIcon = <CheckCircle className="h-4 w-4 mr-1" />;
                  }
                } else {
                  // Otros estados (no debería entrar aquí)
                  cardClasses =
                    "bg-gray-50 border-gray-200 text-gray-700 dark:bg-gray-900/20 dark:border-gray-800 dark:text-gray-400";
                  statusIcon = <AlertCircle className="h-4 w-4 mr-1" />;
                }

                return (
                  <motion.div
                    key={index}
                    className={`p-3 rounded-md border text-center ${cardClasses}`}
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      show: {
                        opacity: 1,
                        y: 0,
                        transition: {
                          type: "spring",
                          stiffness: 300,
                          damping: 24,
                        },
                      },
                    }}
                    whileHover={{
                      scale: 1.05,
                      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    <div className="flex items-center justify-center">
                      {statusIcon}
                      <span>{horario.hora}</span>
                    </div>

                    {!horario.disponible &&
                      horario.turno &&
                      (user.rol === "admin" || user.rol === "medico") && (
                        <div className="mt-1 text-xs flex flex-col items-center justify-center">
                          <div className="flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            <span>
                              {horario.turno.paciente?.nombre || "Reservado"}
                            </span>
                          </div>
                          <span className="text-xs mt-1">
                            {horario.turno.estado === "confirmado"
                              ? "Confirmado"
                              : horario.turno.estado === "pendiente"
                              ? "Pendiente"
                              : horario.turno.estado}
                          </span>
                        </div>
                      )}
                  </motion.div>
                );
              })
              .filter(Boolean)}
          </motion.div>
        ) : (
          <div className="text-center py-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md">
            <div className="flex items-center justify-center text-amber-700 dark:text-amber-400 mb-2">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>No se pudieron generar horarios</span>
            </div>
            <p className="text-sm text-amber-600 dark:text-amber-500">
              Aunque hay disponibilidad configurada, no se pudieron generar los
              horarios. Verifica los intervalos.
            </p>
          </div>
        )}
      </motion.div>
    );
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
          Calendario
        </motion.h1>

        {user.rol !== "medico" && (
          <motion.div
            className="mt-4 sm:mt-0 w-full sm:w-64"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Select value={selectedMedico} onChange={handleMedicoChange}>
              <option value="">Seleccione un médico</option>
              {medicos.map((medico) => (
                <option key={medico.id} value={medico.id}>
                  Dr. {medico.nombre}{" "}
                  {medico.especialidad ? `- ${medico.especialidad}` : ""}
                </option>
              ))}
            </Select>
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
            <div className="flex items-center justify-between">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button variant="outline" size="sm" onClick={handlePrevMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </motion.div>

              <CardTitle className="text-center text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-500 text-transparent bg-clip-text">
                {currentDate.toLocaleDateString("es-ES", {
                  month: "long",
                  year: "numeric",
                })}
              </CardTitle>

              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button variant="outline" size="sm" onClick={handleNextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </motion.div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {renderCalendar()}

            {(user.rol === "medico" || selectedMedico) && renderHorarios()}
          </CardContent>
        </Card>
      </motion.div>

      {/* Modal para agregar disponibilidad */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Agregar Disponibilidad
              </h3>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="horaInicio"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Hora de Inicio
                  </label>
                  <input
                    type="time"
                    id="horaInicio"
                    name="horaInicio"
                    value={horarioForm.horaInicio}
                    onChange={handleHorarioChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="horaFin"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Hora de Fin
                  </label>
                  <input
                    type="time"
                    id="horaFin"
                    name="horaFin"
                    value={horarioForm.horaFin}
                    onChange={handleHorarioChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="intervalo"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Intervalo (minutos)
                  </label>
                  <select
                    id="intervalo"
                    name="intervalo"
                    value={horarioForm.intervalo}
                    onChange={handleHorarioChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="15">15 minutos</option>
                    <option value="30">30 minutos</option>
                    <option value="45">45 minutos</option>
                    <option value="60">60 minutos</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button variant="outline" onClick={() => setShowModal(false)}>
                    Cancelar
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={handleAddDisponibilidad}
                    disabled={loading}
                    className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600"
                  >
                    {loading ? "Guardando..." : "Guardar"}
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Calendario;

