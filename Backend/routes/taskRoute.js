const express = require("express");

const {
  verifyAdminHR,
  verifyManager
} = require("../middleware/authMiddleware");

const {
  FindAllTask,
  CreateTask,
  UpdateTaskAdminEmployee,
  UpdateTaskAdminManager,
  CreateTaskEmployee
} = require("../controllers/taskController");

const taskRoute = express.Router();

taskRoute.get("/tasks", FindAllTask);
taskRoute.post("/tasks", CreateTask);
taskRoute.patch("/tasks/:taskId/employees", CreateTaskEmployee);
taskRoute.delete("/tasks/:taskId", UpdateTaskAdminManager);
taskRoute.delete("/tasks/:taskId/employees/:empEmail", UpdateTaskAdminEmployee);

module.exports = { taskRoute };
