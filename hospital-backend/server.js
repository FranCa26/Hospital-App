/// archivo principal de la aplicación backend

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const path = require("path");
const fs = require("fs");
const routes = require("./routes");
const { sincronizar } = require("./utils/sync");

// Inicializar la aplicación Express
const app = express();

// Configurar middleware
app.use(
  cors({
    origin: "http://localhost:5173", // Permite solo este origen
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev")); // Uso de morgan para logs de solicitudes HTTP

// Crear directorios necesarios si no existen
const uploadsDir = path.join(__dirname, "uploads");
const historialesDir = path.join(uploadsDir, "historiales");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

if (!fs.existsSync(historialesDir)) {
  fs.mkdirSync(historialesDir);
}

// Configurar rutas
app.use("/api", routes);

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    mensaje: "Error en el servidor",
    error: process.env.NODE_ENV === "development" ? err.message : {},
  });
});

// Puerto
const PORT = process.env.PORT || 3000;

// Iniciar servidor
app.listen(PORT, async () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);

  // Sincronizar base de datos al iniciar
  if (process.env.NODE_ENV === "development") {
    await sincronizar(); // Sincroniza sin logs adicionales
  }
});
