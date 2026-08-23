import { Model, DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

// Extending Sequelize Model class
export class Employee extends Model {}

Employee.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Employee name is required" },
      },
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: { msg: "Must be a valid email address" },
        notEmpty: { msg: "Email is required" },
      },
    },
    role: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Role is required" },
      },
    },
    department: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: "Engineering",
    },
    status: {
      type: DataTypes.ENUM("Active", "On Leave", "Inactive"),
      defaultValue: "Active",
    },
  },
  {
    sequelize,
    modelName: "Employee",
    tableName: "employees",
    timestamps: true, // adds createdAt and updatedAt columns
  }
);
