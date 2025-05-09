/// archivo que contiene las rutas para el historial médico

const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const {
  obtenerHistorialPaciente,
  obtenerRegistroHistorial,
  crearEntradaHistorial,
  actualizarEntradaHistorial,
  eliminarEntradaHistorial,
  subirArchivoHistorial,
  descargarArchivoHistorial,
  obtenerTodosHistoriales,
  obtenerHistorialMedico,
  generarPDFHistorial,
} = require("../controllers/historialMedicoController");
const { verificarToken, esMedico } = require("../utils/auth");

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads/historiales"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `historial-${req.params.historialId}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB máximo
  },
});

// Rutas de historial médico
router.get("/", verificarToken, obtenerTodosHistoriales);
router.get("/medico/:id", verificarToken, obtenerHistorialMedico);
router.get("/paciente/:pacienteId", verificarToken, obtenerHistorialPaciente);
router.get("/registro/:id/pdf", verificarToken, generarPDFHistorial);
router.get("/registro/:id", verificarToken, obtenerRegistroHistorial);
router.post("/", verificarToken, esMedico, crearEntradaHistorial);
router.put("/:id", verificarToken, esMedico, actualizarEntradaHistorial);
router.delete("/:id", verificarToken, esMedico, eliminarEntradaHistorial);

// Rutas para archivos
router.post(
  "/:historialId/archivos",
  verificarToken,
  esMedico,
  upload.single("archivo"),
  subirArchivoHistorial
);
router.get("/archivos/:archivoId", verificarToken, descargarArchivoHistorial);

module.exports = router;
