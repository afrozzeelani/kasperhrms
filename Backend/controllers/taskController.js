


// find all task 
const FindAllTask = async(req, res) => {
    try {
        const tasks = await Task.find();
        res.status(200).json(tasks);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
      }
}

// create a new task 
const CreateTask = async(req, res) => {
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
          comment: "Task Assigned",
          employee: [{ type: mongoose.Schema.Types.ObjectId, ref: "Employee" }]
        });
    
        await newTask.save();
    
        res.status(201).json(newTask);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
      }
}

const CreateTaskEmployee = async(req, res) => {
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
            emptaskStatus,
            employee: [{ type: mongoose.Schema.Types.ObjectId, ref: "Employee" }]
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
}

 // Add Comment between Admin & Manager 
const UpdateTaskAdminManager = async(req, res) => {
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
}

// Add Comment between Manager & Employee
const UpdateTaskAdminEmployee = async(req, res) => {
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
}

// remove the task
// const DeleteTask = async(req, res) => {

// }

module.exports = {
    FindAllTask,
    CreateTask,
    CreateTaskEmployee,
    UpdateTaskAdminManager,
    UpdateTaskAdminEmployee,
    // DeleteTask,
}