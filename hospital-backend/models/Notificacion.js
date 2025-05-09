/// archivo que define el modelo de Notificacion

const { DataTypes } = require("sequelize")
const { db } = require("../config/db")
const Usuario = require("./Usuario")

const Notificacion = db.define(
  "Notificacion",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    usuarioId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Usuario,
        key: "id",
      },
    },
    titulo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mensaje: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    tipo: {
      type: DataTypes.ENUM("turno", "sistema", "recordatorio"),
      defaultValue: "sistema",
    },
    referencia: {
      type: DataTypes.STRING,
      // ID de referencia (ej: ID de turno)
    },
    leida: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: "notificaciones",
    timestamps: true,
  },
)

// Definir relaciones
Notificacion.belongsTo(Usuario, { foreignKey: "usuarioId" })
Usuario.hasMany(Notificacion, { foreignKey: "usuarioId" })

module.exports = Notificacion

