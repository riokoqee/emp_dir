const express = require("express");
const cors = require("cors");

const employeesRoute = require("./routes/employees");
const departmentsRoute = require("./routes/departments");
const adminDepartmentsRoute = require("./routes/adminDepartments");
const authRouter = require("./routes/auth");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/employees", employeesRoute);
app.use("/api/departments", departmentsRoute);
app.use("/api/admin/departments", adminDepartmentsRoute);
app.use("/api/admin/employees", require("./routes/adminEmployees"));
app.use("/api/employees", require("./routes/employees"));
app.use("/api/auth", authRouter);

const PORT = 8080;
app.listen(PORT, () => console.log("Server running on port " + PORT));
