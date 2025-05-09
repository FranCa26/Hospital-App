/// archivo para sincronizar la base de datos

const { sincronizarBD } = require("../config/db");

// Función para sincronizar la base de datos
const sincronizar = async () => {
  try {
    await sincronizarBD();
    console.log("Conexión exitosa a la base de datos.");
  } catch (error) {
    console.error("Error al sincronizar la base de datos:", error);
  }
};

module.exports = { sincronizar };
