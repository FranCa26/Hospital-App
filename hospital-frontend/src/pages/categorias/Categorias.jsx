// Este componente es la página de categorías del panel de control. Permite a los administradores ver, crear, editar y eliminar categorías.

"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash, Search, X, Tag } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
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

const Categorias = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    nombre: "",
    descripcion: "",
  });
  const [busqueda, setBusqueda] = useState("");
  const [categoriasFiltradas, setCategoriasFiltradas] = useState([]);
  const [errors, setErrors] = useState({});

  // Cargar categorías
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        setLoading(true);
        const response = await api.get("/categorias");
        setCategorias(response.data);
        setCategoriasFiltradas(response.data);
      } catch (error) {
        console.error("Error al cargar categorías:", error);
        showToast("Error al cargar categorías", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchCategorias();
  }, []);

  // Filtrar categorías cuando cambia la búsqueda
  useEffect(() => {
    if (!busqueda) {
      setCategoriasFiltradas(categorias);
      return;
    }

    const filtradas = categorias.filter(
      (categoria) =>
        categoria.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        (categoria.descripcion &&
          categoria.descripcion.toLowerCase().includes(busqueda.toLowerCase()))
    );

    setCategoriasFiltradas(filtradas);
  }, [busqueda, categorias]);

  const handleBusquedaChange = (e) => {
    setBusqueda(e.target.value);
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      let response;

      if (isEditing) {
        // Actualizar categoría existente
        response = await api.put(`/categorias/${formData.id}`, formData);
        showToast("Categoría actualizada exitosamente", "success");

        // Actualizar lista de categorías
        setCategorias((prev) =>
          prev.map((categoria) =>
            categoria.id === formData.id ? response.data.categoria : categoria
          )
        );
      } else {
        // Crear nueva categoría
        response = await api.post("/categorias", formData);
        showToast("Categoría creada exitosamente", "success");

        // Agregar a la lista de categorías
        setCategorias((prev) => [...prev, response.data.categoria]);
      }

      // Limpiar formulario y cerrar
      resetForm();
    } catch (error) {
      console.error("Error al guardar categoría:", error);
      showToast(
        error.response?.data?.mensaje || "Error al guardar categoría",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (categoria) => {
    setFormData({
      id: categoria.id,
      nombre: categoria.nombre,
      descripcion: categoria.descripcion || "",
    });
    setIsEditing(true);
    setShowForm(true);
    setErrors({});
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta categoría?")) {
      return;
    }

    try {
      setLoading(true);
      await api.delete(`/categorias/${id}`);

      // Actualizar lista de categorías
      setCategorias((prev) => prev.filter((categoria) => categoria.id !== id));
      showToast("Categoría eliminada exitosamente", "success");
    } catch (error) {
      console.error("Error al eliminar categoría:", error);
      showToast(
        "Error al eliminar categoría. Es posible que tenga servicios asociados.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      id: null,
      nombre: "",
      descripcion: "",
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

  if (loading && categorias.length === 0) {
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <motion.h1
          className="text-2xl font-bold text-gray-900 dark:text-white"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          Categorías
        </motion.h1>
        {user.rol === "admin" && (
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              onClick={() => {
                resetForm();
                setShowForm(!showForm);
              }}
              className="mt-4 sm:mt-0 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600"
            >
              {showForm ? (
                <X className="mr-2 h-4 w-4" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              {showForm ? "Cancelar" : "Nueva Categoría"}
            </Button>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border border-gray-200 dark:border-gray-700 shadow-md overflow-hidden">
              <CardHeader className="border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-750">
                <CardTitle className="flex items-center">
                  <Tag className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
                  {isEditing ? "Editar Categoría" : "Nueva Categoría"}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="nombre"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Nombre
                    </label>
                    <Input
                      id="nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleFormChange}
                      error={errors.nombre}
                      placeholder="Nombre de la categoría"
                      className="focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
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
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
                      value={formData.descripcion}
                      onChange={handleFormChange}
                      placeholder="Descripción opcional de la categoría"
                    />
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
                      >
                        Cancelar
                      </Button>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        type="submit"
                        disabled={loading}
                        className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600"
                      >
                        {loading
                          ? "Guardando..."
                          : isEditing
                          ? "Actualizar"
                          : "Guardar"}
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
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border border-gray-200 dark:border-gray-700 shadow-md overflow-hidden">
          <CardHeader className="border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-750">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="flex items-center">
                <Tag className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
                Lista de Categorías
              </CardTitle>
              <div className="mt-2 sm:mt-0 relative w-full sm:w-64">
                <Input
                  type="text"
                  placeholder="Buscar categoría..."
                  value={busqueda}
                  onChange={handleBusquedaChange}
                  className="pl-10 focus:ring-blue-500 focus:border-blue-500"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
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
            ) : categoriasFiltradas.length > 0 ? (
              <motion.div
                className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/3">Nombre</TableHead>
                      <TableHead className="w-1/2">Descripción</TableHead>
                      {user.rol === "admin" && (
                        <TableHead className="w-1/6 text-right">
                          Acciones
                        </TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categoriasFiltradas.map((categoria, index) => (
                      <motion.tr
                        key={categoria.id}
                        variants={itemVariants}
                        custom={index}
                        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <TableCell className="font-medium">
                          {categoria.nombre}
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400">
                          {categoria.descripcion || "-"}
                        </TableCell>
                        {user.rol === "admin" && (
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEdit(categoria)}
                                  className="p-2 h-auto"
                                  title="Editar categoría"
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
                                  onClick={() => handleDelete(categoria.id)}
                                  className="p-2 h-auto"
                                  title="Eliminar categoría"
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </motion.div>
                            </div>
                          </TableCell>
                        )}
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </motion.div>
            ) : (
              <motion.div
                className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Tag className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
                  No se encontraron categorías
                </h3>
                <p className="mt-1 text-gray-500 dark:text-gray-400">
                  {busqueda
                    ? "No hay categorías que coincidan con la búsqueda."
                    : "No hay categorías disponibles en este momento."}
                </p>
                {user.rol === "admin" && (
                  <motion.div
                    className="mt-6"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={() => setShowForm(true)}
                      className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600"
                    >
                      <Plus className="mr-2 h-4 w-4" /> Agregar Categoría
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

export default Categorias;


