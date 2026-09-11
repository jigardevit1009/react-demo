import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import employeeRoutes from "../modules/employees/employee.routes";
import taskRoutes from "../modules/tasks/task.routes";
import reportRoutes from "../modules/reports/report.routes";

const apiRouter = Router();

apiRouter.use("/auth", authRoutes);
apiRouter.use("/employees", employeeRoutes);
apiRouter.use("/tasks", taskRoutes);
apiRouter.use("/reports", reportRoutes);


export default apiRouter;
