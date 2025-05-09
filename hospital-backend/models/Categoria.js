/// archivo que define el modelo de la tabla categorias

const { DataTypes } = require("sequelize")
const { db } = require("../config/db")

const Categoria = db.define(
  "Categoria",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    descripcion: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: "categorias",
    timestamps: true,
  },
)

module.exports = Categoria

