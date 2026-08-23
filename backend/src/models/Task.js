import { Model, DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

// Extending Sequelize Model class
export class Task extends Model {}

Task.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Task title is required" },
      },
    },
    assignee: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: "Unassigned",
    },
    priority: {
      type: DataTypes.ENUM("Low", "Medium", "High"),
      defaultValue: "Medium",
    },
    status: {
      type: DataTypes.ENUM("Pending", "In Progress", "Completed"),
      defaultValue: "Pending",
    },
    dueDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "Task",
    tableName: "tasks",
    timestamps: true,
  },
);
