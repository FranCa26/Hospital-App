/// archivo que define el modelo de Usuario

const { DataTypes } = require("sequelize")
const { db } = require("../config/db")

const Usuario = db.define(
  "Usuario",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    rol: {
      type: DataTypes.ENUM("admin", "medico", "paciente"),
      allowNull: false,
      defaultValue: "paciente",
    },
    telefono: {
      type: DataTypes.STRING,
    },
    direccion: {
      type: DataTypes.STRING,
    },
    especialidad: {
      type: DataTypes.STRING,
      // Para médicos
    },
  },
  {
    tableName: "usuarios",
    timestamps: true,
  },
)

module.exports = Usuario

