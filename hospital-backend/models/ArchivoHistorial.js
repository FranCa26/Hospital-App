/// archivo que define el modelo de la tabla ArchivoHistorial

const { DataTypes } = require("sequelize")
const { db } = require("../config/db")
const HistorialMedico = require("./HistorialMedico")

const ArchivoHistorial = db.define(
  "ArchivoHistorial",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    historialId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: HistorialMedico,
        key: "id",
      },
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ruta: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tipo: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Tipo MIME del archivo",
    },
    tamaño: {
      type: DataTypes.INTEGER,
      comment: "Tamaño en bytes",
    },
    descripcion: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: "archivos_historial",
    timestamps: true,
  },
)

// Definir relaciones
ArchivoHistorial.belongsTo(HistorialMedico, { foreignKey: "historialId" })
HistorialMedico.hasMany(ArchivoHistorial, { foreignKey: "historialId" })

module.exports = ArchivoHistorial

