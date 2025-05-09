/// archivo que define el modelo de la tabla Turno

const { DataTypes } = require("sequelize")
const { db } = require("../config/db")
const Usuario = require("./Usuario")
const Servicio = require("./Servicio")

const Turno = db.define(
  "Turno",
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
    servicioId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Servicio,
        key: "id",
      },
    },
    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    hora: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    estado: {
      type: DataTypes.ENUM("pendiente", "confirmado", "completado", "cancelado"),
      allowNull: false,
      defaultValue: "pendiente",
    },
    notas: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: "turnos",
    timestamps: true,
  },
)

// Definir relaciones
Turno.belongsTo(Usuario, { as: "paciente", foreignKey: "pacienteId" })
Turno.belongsTo(Usuario, { as: "medico", foreignKey: "medicoId" })
Turno.belongsTo(Servicio, { foreignKey: "servicioId" })

module.exports = Turno

