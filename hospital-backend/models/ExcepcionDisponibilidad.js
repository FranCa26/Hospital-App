/// archivo para el modelo de excepciones de disponibilidad de los médicos

const { DataTypes } = require("sequelize")
const { db } = require("../config/db")
const Usuario = require("./Usuario")

const ExcepcionDisponibilidad = db.define(
  "ExcepcionDisponibilidad",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    medicoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Usuario,
        key: "id",
      },
    },
    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    esDisponible: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: "true: día disponible excepcionalmente, false: día no disponible excepcionalmente",
    },
    horaInicio: {
      type: DataTypes.STRING, // Formato: HH:MM (opcional si es día completo)
      validate: {
        is: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
      },
    },
    horaFin: {
      type: DataTypes.STRING, // Formato: HH:MM (opcional si es día completo)
      validate: {
        is: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
      },
    },
    motivo: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: "excepciones_disponibilidad",
    timestamps: true,
  },
)

// Definir relaciones
ExcepcionDisponibilidad.belongsTo(Usuario, { as: "medico", foreignKey: "medicoId" })
Usuario.hasMany(ExcepcionDisponibilidad, { foreignKey: "medicoId" })

module.exports = ExcepcionDisponibilidad

