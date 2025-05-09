/// archivo para definir el modelo de la tabla Servicio

const { DataTypes } = require("sequelize")
const { db } = require("../config/db")
const Categoria = require("./Categoria")

const Servicio = db.define(
  "Servicio",
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
    descripcion: {
      type: DataTypes.TEXT,
    },
    duracion: {
      type: DataTypes.INTEGER,
      comment: "Duración en minutos",
    },
    precio: {
      type: DataTypes.DECIMAL(10, 2),
    },
    categoriaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Categoria,
        key: "id",
      },
    },
  },
  {
    tableName: "servicios",
    timestamps: true,
  },
)

// Definir relaciones
Servicio.belongsTo(Categoria, { foreignKey: "categoriaId" })
Categoria.hasMany(Servicio, { foreignKey: "categoriaId" })

module.exports = Servicio

