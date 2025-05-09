/// archivo de configuración de la base de datos


const { Sequelize } = require("sequelize");

// Configuración de la base de datos
const db = new Sequelize(
  process.env.DB_NAME || "hospital_turnos",
  process.env.DB_USER || "root",
  process.env.DB_PASSWORD || "",
  {
    host: process.env.DB_HOST || "localhost",
    dialect: "mariadb",
    port: Number.parseInt(process.env.DB_PORT || "3306"),
    logging: false, // Desactiva los logs de sincronización
    define: {
      timestamps: true,
      underscored: true,
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

// Función para sincronizar la base de datos
const sincronizarBD = async () => {
  try {
    await db.authenticate();
    console.log("Conexión a la base de datos establecida correctamente.");
  } catch (error) {
    console.error("Error al conectar con la base de datos:", error);
  }
};

module.exports = { db, sincronizarBD };
