/// archivo para el modelo de disponibilidad de médicos

const { DataTypes } = require("sequelize")
const { db } = require("../config/db")
const Usuario = require("./Usuario")

const DisponibilidadMedico = db.define(
  "DisponibilidadMedico",
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
    diaSemana: {
      type: DataTypes.INTEGER, // 0: Domingo, 1: Lunes, ..., 6: Sábado
      allowNull: false,
      validate: {
        min: 0,
        max: 6,
      },
    },
    horaInicio: {
      type: DataTypes.STRING, // Formato: HH:MM
      allowNull: false,
      validate: {
        is: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
      },
    },
    horaFin: {
      type: DataTypes.STRING, // Formato: HH:MM
      allowNull: false,
      validate: {
        is: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
      },
    },
    intervalo: {
      type: DataTypes.INTEGER, // Duración de cada turno en minutos
      allowNull: false,
      defaultValue: 30,
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "disponibilidad_medicos",
    timestamps: true,
  },
)

// Definir relaciones
DisponibilidadMedico.belongsTo(Usuario, { as: "medico", foreignKey: "medicoId" })
Usuario.hasMany(DisponibilidadMedico, { foreignKey: "medicoId" })

module.exports = DisponibilidadMedico

