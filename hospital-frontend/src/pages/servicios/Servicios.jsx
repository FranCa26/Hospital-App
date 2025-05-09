// Este componente contiene la página de servicios del dashboard, donde se pueden ver, crear, editar y eliminar servicios.

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit,
  Trash,
  Search,
  X,
  Package,
  Clock,
  DollarSign,
} from "lucide-react";
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

const Services = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [servicios, setServicios] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    nombre: "",
    descripcion: "",
    duracion: "",
    precio: "",
    categoriaId: "",
  });
  const [filtros, setFiltros] = useState({
    categoriaId: "",
    busqueda: "",
  });
  const [serviciosFiltrados, setServiciosFiltrados] = useState([]);
  const [errors, setErrors] = useState({});

  // Cargar servicios y categorías
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Obtener categorías
        const categoriasResponse = await api.get("/categorias");
        setCategorias(categoriasResponse.data);

        // Obtener servicios
        const serviciosResponse = await api.get("/servicios");
        setServicios(serviciosResponse.data);
        setServiciosFiltrados(serviciosResponse.data);
      } catch (error) {
        console.error("Error al cargar datos:", error);
        showToast("Error al cargar datos", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtrar servicios cuando cambian los filtros
  useEffect(() => {
    let resultado = [...servicios];

    // Filtrar por categoría
    if (filtros.categoriaId) {
      resultado = resultado.filter(
        (servicio) => servicio.categoriaId.toString() === filtros.categoriaId
      );
    }

    // Filtrar por búsqueda
    if (filtros.busqueda) {
      const busqueda = filtros.busqueda.toLowerCase();
      resultado = resultado.filter(
        (servicio) =>
          servicio.nombre.toLowerCase().includes(busqueda) ||
          (servicio.descripcion &&
            servicio.descripcion.toLowerCase().includes(busqueda))
      );
    }

    setServiciosFiltrados(resultado);
  }, [filtros, servicios]);

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({ ...prev, [name]: value }));
  };

  const limpiarFiltros = () => {
    setFiltros({
      categoriaId: "",
      busqueda: "",
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Limpiar error al cambiar el valor
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre) {
      newErrors.nombre = "El nombre es requerido";
    }

    if (!formData.categoriaId) {
      newErrors.categoriaId = "La categoría es requerida";
    }

    if (formData.duracion && isNaN(Number(formData.duracion))) {
      newErrors.duracion = "La duración debe ser un número";
    }

    if (formData.precio && isNaN(Number(formData.precio))) {
      newErrors.precio = "El precio debe ser un número";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      // Convertir campos numéricos
      const servicioData = {
        ...formData,
        duracion: formData.duracion ? Number(formData.duracion) : null,
        precio: formData.precio ? Number(formData.precio) : null,
      };

      let response;

      if (isEditing) {
        // Actualizar servicio existente
        response = await api.put(`/servicios/${formData.id}`, servicioData);
        showToast("Servicio actualizado exitosamente", "success");

        // Actualizar lista de servicios
        setServicios((prev) =>
          prev.map((servicio) =>
            servicio.id === formData.id ? response.data.servicio : servicio
          )
        );
      } else {
        // Crear nuevo servicio
        response = await api.post("/servicios", servicioData);
        showToast("Servicio creado exitosamente", "success");

        // Agregar a la lista de servicios
        setServicios((prev) => [...prev, response.data.servicio]);
      }

      // Limpiar formulario y cerrar
      resetForm();
    } catch (error) {
      console.error("Error al guardar servicio:", error);
      showToast(
        error.response?.data?.mensaje || "Error al guardar servicio",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (servicio) => {
    setFormData({
      id: servicio.id,
      nombre: servicio.nombre,
      descripcion: servicio.descripcion || "",
      duracion: servicio.duracion || "",
      precio: servicio.precio || "",
      categoriaId: servicio.categoriaId.toString(),
    });
    setIsEditing(true);
    setShowForm(true);
    setErrors({});
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este servicio?")) {
      return;
    }

    try {
      setLoading(true);
      await api.delete(`/servicios/${id}`);

      // Actualizar lista de servicios
      setServicios((prev) => prev.filter((servicio) => servicio.id !== id));
      showToast("Servicio eliminado exitosamente", "success");
    } catch (error) {
      console.error("Error al eliminar servicio:", error);
      showToast("Error al eliminar servicio", "error");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      id: null,
      nombre: "",
      descripcion: "",
      duracion: "",
      precio: "",
      categoriaId: "",
    });
    setIsEditing(false);
    setShowForm(false);
    setErrors({});
  };

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

  if (loading && servicios.length === 0) {
    return (
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
    );
  }

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
          Servicios
        </motion.h1>
        {user.rol === "admin" && (
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={() => {
                resetForm();
                setShowForm(!showForm);
              }}
              className="mt-4 sm:mt-0 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary transition-all duration-300"
            >
              {showForm ? (
                <X className="mr-2 h-4 w-4" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              {showForm ? "Cancelar" : "Nuevo Servicio"}
            </Button>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
              <CardHeader className="border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                <CardTitle className="flex items-center">
                  <Package className="mr-2 h-5 w-5 text-primary" />
                  {isEditing ? "Editar Servicio" : "Nuevo Servicio"}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="nombre"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center"
                      >
                        <Package className="h-4 w-4 mr-1 text-primary" />
                        Nombre
                      </label>
                      <Input
                        id="nombre"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleFormChange}
                        error={errors.nombre}
                        className="transition-all duration-300 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="categoriaId"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Categoría
                      </label>
                      <Select
                        id="categoriaId"
                        name="categoriaId"
                        value={formData.categoriaId}
                        onChange={handleFormChange}
                        error={errors.categoriaId}
                        className="transition-all duration-300 focus:ring-primary"
                      >
                        <option value="">Seleccione una categoría</option>
                        {categorias.map((categoria) => (
                          <option key={categoria.id} value={categoria.id}>
                            {categoria.nombre}
                          </option>
                        ))}
                      </Select>
                    </div>

                    <div>
                      <label
                        htmlFor="duracion"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center"
                      >
                        <Clock className="h-4 w-4 mr-1 text-primary" />
                        Duración (minutos)
                      </label>
                      <Input
                        id="duracion"
                        name="duracion"
                        type="number"
                        value={formData.duracion}
                        onChange={handleFormChange}
                        error={errors.duracion}
                        className="transition-all duration-300 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="precio"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center"
                      >
                        <DollarSign className="h-4 w-4 mr-1 text-primary" />
                        Precio
                      </label>
                      <Input
                        id="precio"
                        name="precio"
                        type="number"
                        step="0.01"
                        value={formData.precio}
                        onChange={handleFormChange}
                        error={errors.precio}
                        className="transition-all duration-300 focus:ring-primary"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label
                        htmlFor="descripcion"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Descripción
                      </label>
                      <textarea
                        id="descripcion"
                        name="descripcion"
                        rows={3}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
                        value={formData.descripcion}
                        onChange={handleFormChange}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4 pt-4">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        type="button"
                        variant="outline"
                        onClick={resetForm}
                        className="hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all duration-300"
                      >
                        <X className="mr-2 h-4 w-4" /> Cancelar
                      </Button>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        type="submit"
                        disabled={loading}
                        className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary transition-all duration-300"
                      >
                        {loading ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Guardando...
                          </>
                        ) : isEditing ? (
                          <>
                            <Edit className="mr-2 h-4 w-4" /> Actualizar
                          </>
                        ) : (
                          <>
                            <Plus className="mr-2 h-4 w-4" /> Guardar
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <Card className="border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
          <CardHeader className="border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="flex items-center">
                <Package className="mr-2 h-5 w-5 text-primary" />
                Lista de Servicios
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <motion.div
              className="mb-6 flex flex-col sm:flex-row gap-4"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
            >
              <div className="relative w-full sm:w-64">
                <Input
                  type="text"
                  name="busqueda"
                  placeholder="Buscar servicio..."
                  value={filtros.busqueda}
                  onChange={handleFiltroChange}
                  className="pl-10 transition-all duration-300 focus:ring-primary"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>

              <div className="w-full sm:w-64">
                <Select
                  name="categoriaId"
                  value={filtros.categoriaId}
                  onChange={handleFiltroChange}
                  className="transition-all duration-300 focus:ring-primary"
                >
                  <option value="">Todas las categorías</option>
                  {categorias.map((categoria) => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.nombre}
                    </option>
                  ))}
                </Select>
              </div>

              {(filtros.categoriaId || filtros.busqueda) && (
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
            ) : serviciosFiltrados.length > 0 ? (
              <motion.div
                className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Duración</TableHead>
                      <TableHead>Precio</TableHead>
                      {user.rol === "admin" && <TableHead>Acciones</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {serviciosFiltrados.map((servicio) => (
                        <motion.tr
                          key={servicio.id}
                          variants={itemVariants}
                          exit="exit"
                          layout
                          className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                        >
                          <TableCell className="font-medium">
                            {servicio.nombre}
                          </TableCell>
                          <TableCell>{servicio.Categoria?.nombre}</TableCell>
                          <TableCell>
                            {servicio.duracion ? (
                              <span className="flex items-center">
                                <Clock className="h-4 w-4 mr-1 text-primary" />
                                {servicio.duracion} min
                              </span>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell>
                            {servicio.precio ? (
                              <span className="flex items-center">
                                <DollarSign className="h-4 w-4 mr-1 text-primary" />
                                {servicio.precio}
                              </span>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          {user.rol === "admin" && (
                            <TableCell>
                              <div className="flex space-x-2">
                                <motion.div
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEdit(servicio)}
                                    className="p-2 h-auto hover:bg-blue-50 hover:text-blue-500 hover:border-blue-200 transition-all duration-300"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </motion.div>
                                <motion.div
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleDelete(servicio.id)}
                                    className="p-2 h-auto"
                                  >
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </motion.div>
                              </div>
                            </TableCell>
                          )}
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
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
                  <Package className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600" />
                </motion.div>
                <motion.h3
                  className="mt-4 text-xl font-medium text-gray-900 dark:text-white"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  No se encontraron servicios
                </motion.h3>
                <motion.p
                  className="mt-2 text-gray-500 dark:text-gray-400 max-w-md mx-auto"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  {filtros.categoriaId || filtros.busqueda
                    ? "No hay servicios que coincidan con los filtros aplicados."
                    : "No hay servicios disponibles en este momento."}
                </motion.p>
                {user.rol === "admin" && (
                  <motion.div
                    className="mt-6"
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={() => setShowForm(true)}
                      className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary transition-all duration-300"
                    >
                      <Plus className="mr-2 h-4 w-4" /> Agregar Servicio
                    </Button>
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

export default Services;




