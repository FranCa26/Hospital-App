// archivo que define el modelo de HistorialMedico

const { DataTypes } = require("sequelize")
const { db } = require("../config/db")
const Usuario = require("./Usuario")
const Turno = require("./Turno")

const HistorialMedico = db.define(
  "HistorialMedico",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    pacienteId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Usuario,
        key: "id",
      },
    },
    medicoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Usuario,
        key: "id",
      },
    },
    turnoId: {
      type: DataTypes.INTEGER,
      references: {
        model: Turno,
        key: "id",
      },
      comment: "Opcional, si el registro está asociado a un turno",
    },
    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    motivo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sintomas: {
      type: DataTypes.TEXT,
    },
    diagnostico: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    tratamiento: {
      type: DataTypes.TEXT,
    },
    observaciones: {
      type: DataTypes.TEXT,
    },
    esPrivado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: "Si es privado, solo el médico que lo creó y administradores pueden verlo",
    },
  },
  {
    tableName: "historiales_medicos",
    timestamps: true,
  },
)

// Definir relaciones
HistorialMedico.belongsTo(Usuario, { as: "paciente", foreignKey: "pacienteId" })
HistorialMedico.belongsTo(Usuario, { as: "medico", foreignKey: "medicoId" })
HistorialMedico.belongsTo(Turno, { foreignKey: "turnoId" })

Usuario.hasMany(HistorialMedico, { as: "historialesPaciente", foreignKey: "pacienteId" })
Usuario.hasMany(HistorialMedico, { as: "historialesMedico", foreignKey: "medicoId" })
Turno.hasOne(HistorialMedico, { foreignKey: "turnoId" })

module.exports = HistorialMedico

