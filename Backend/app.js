var express = require("express"),
  mongoose = require("mongoose"),
  autoIncrement = require("mongoose-auto-increment"),
  Joi = require("joi"),
  app = express();
jwt = require("jsonwebtoken");
require("dotenv").config();
const cors = require("cors");

const bodyParser = require("body-parser");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;

// custom  Routes import file
const loginRoute = require("./routes/loginRoute");
const contery = require("./routes/countryRoutes");
const stateRoute = require("./routes/stateRoute");
const cityRoute = require("./routes/cityRoute");
const companyRoute = require("./routes/companyRoute");
const departmentRoute = require("./routes/departmentRoute");
const roleRoute = require("./routes/roleRoute");
const positionRoute = require("./routes/positionRoute");
const employeeRoute = require("./routes//familyRoute");
const familyRoute = require("./routes/employeeRoute");
const workExperienceRoute = require("./routes//workExperienceRoute");
const portalRoute = require("./routes/portalRoute");
const projectRoute = require("./routes/projectRoute");
const salaryRoute = require("./routes/salaryRoute");
const leaveRoute = require("./routes/leaveRoute");
const educationRoute = require("./routes/educationRoute");
const personalInfoRoute = require("./routes/personalInfoRoute");
const { forgotePassRoute } = require("./routes/forgotePassRoute");
const { attendanceRoute } = require("./routes/attendanceRoute");

// const { taskRoute } = require("./routes/taskRoute");

const { Employee } = require("./models/employeeModel");
const { requiredKeys } = require("joi/lib/types/object");

//seting up jwt token
let jwtKey = process.env.JWTKEY;

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});

//for request body
app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// create a custom  route
app.use("/api", forgotePassRoute);
app.use("/api", contery);
app.use("/api", stateRoute);
app.use("/api", cityRoute);
app.use("/api", companyRoute);
app.use("/api", roleRoute);
app.use("/api", positionRoute);
app.use("/api", departmentRoute);
app.use("/api", employeeRoute);
app.use("/api", familyRoute);
app.use("/api", educationRoute);
app.use("/api", workExperienceRoute);
app.use("/api", projectRoute);
app.use("/api", portalRoute);
app.use("/api", salaryRoute);
app.use("/api", leaveRoute);
app.use("/api", personalInfoRoute);
app.use("/api", loginRoute);
app.use("/api", attendanceRoute);
// app.use("/api", taskRoute);

// *************task management model***************
var taskSchema = new mongoose.Schema({
  Taskname: String,
  description: String,
  startDate: Date,
  endDate: Date,
  managerEmail: String,
  status: String,
  duration: Number,
  department: String,
  comment: String,
  employees: [
    {
      empname: String,
      empemail: {
        type: String
      },
      empdesignation: String,
      emptaskStatus: String,
      empTaskComment: String
    }
  ]
});

var Task = mongoose.model("Task", taskSchema);

app.post("/api/create-user", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      address,
      designation,
      doj,
      role,
      reportTo
    } = req.body;

    const userEmployee = new User({
      name,
      email,
      password,
      phone,
      address,
      designation,
      doj,
      role,
      reportTo
    });

    await userEmployee.save();

    res.status(201).json(userEmployee);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Create New Task
app.post("/api/tasks", async (req, res) => {
  try {
    const {
      Taskname,
      description,
      startDate,
      endDate,
      managerEmail,
      department,
      comment
    } = req.body;

    const dateDifference = Math.ceil(
      (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)
    );
    const extradate = dateDifference;

    const newTask = new Task({
      Taskname,
      description,
      startDate,
      endDate,
      managerEmail,
      status: "Assigned",
      duration: extradate,
      department,
      comment: "Task Assigned"
    });

    await newTask.save();

    res.status(201).json(newTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// POST TASK TO EMPLOYEE
// POST TASK TO EMPLOYEE
app.post("/api/tasks/:taskId/employees", async (req, res) => {
  const taskId = req.params.taskId;

  try {
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    const employeesArray = req.body.employees;

    if (!Array.isArray(employeesArray)) {
      return res.status(400).json({ error: "Invalid data format" });
    }

    const newEmployees = [];

    for (const employeeData of employeesArray) {
      const { empname, empemail, empdesignation, emptaskStatus } = employeeData;

      // Check if empemail already exists in the task's employees array
      const existingEmployee = task.employees.find(
        (emp) => emp.empemail === empemail
      );

      if (existingEmployee) {
        // If the employee already exists, throw an error
        throw new Error(`Duplicate empemail: ${empemail}`);
      } else {
        // Create a new employee object and add it to the array
        const newEmployee = {
          empname,
          empemail,
          empdesignation,
          emptaskStatus
        };
        newEmployees.push(newEmployee);
      }
    }

    // Add the new employees to the task's employees array
    task.employees.push(...newEmployees);

    // Save the updated task
    await task.save();

    // Respond with the updated task
    res.status(201).json(task);
  } catch (error) {
    console.error(error.message);

    // Check if the error is due to a duplicate empemail
    if (error.message.includes("Duplicate empemail")) {
      return res
        .status(400)
        .json({ error: "Duplicate empemail found in the request" });
    }

    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Add Comment between Admin & Manager
app.put("/api/tasks/:taskId", async (req, res) => {
  try {
    const { status, comment } = req.body;

    const task = await Task.findById(req.params.taskId);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    let taskComment = comment || "";
    task.status = status || task.status;
    task.comment = taskComment;

    await task.save();

    res.status(200).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Add Comment between Manager & Employee
app.put("/api/tasks/:taskId/employees/:empEmail", async (req, res) => {
  const { emptaskStatus, empTaskComment } = req.body;
  const { empEmail } = req.params;

  try {
    // Find the task by employee email
    const task = await Task.findOne({ "employees.empemail": empEmail });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Find the specific employee in the task
    const employee = task.employees.find((emp) => emp.empemail === empEmail);

    if (!employee) {
      return res
        .status(404)
        .json({ message: "Employee not found in the task" });
    }

    // Update the employee's task status and comment
    employee.emptaskStatus = emptaskStatus;
    employee.empTaskComment = empTaskComment;

    // Save the updated task
    await task.save();

    res.json({ message: "Task updated successfully" });
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// get task
app.get("/api/tasks", async (req, res) => {
  try {
    const tasks = await Task.find();
    res.status(200).json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// const attendanceSchema = new mongoose.Schema({
//   year: Number,
//   months: [
//     {
//       month: Number,
//       dates: [
//         {
//           date: Number,
//           day: Number,
//           loginTime: [Date],
//           logoutTime: [Date],
//           breakTime: [Number],
//           TotalBreakTime: Number,
//         },
//       ],
//     },
//   ],
// });

// const Attendance = mongoose.model("Attendance", attendanceSchema);

// Routes
app.get("/api/attendance", async (req, res) => {
  try {
    const attendanceData = await Attendance.find();
    res.json(attendanceData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/attendance", async (req, res) => {
  try {
    const newAttendance = new Attendance(req.body);
    const savedAttendance = await newAttendance.save();
    res.json(savedAttendance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//  create a server
var port = process.env.PORT;
if (port & process.env.IP) {
  app.listen(port, process.env.IP, () => {
    console.log("started");
  });
} else
  app.listen(port, () => console.log(`Example app listening on port ${port}!`));
