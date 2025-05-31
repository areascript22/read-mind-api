import dotenv from "dotenv";
import express from "express";
import authRoute from "./routes/auth_routes.js";
import courseRoute from "./routes/course_route.js";
import courseStudent from "./routes/course_student_routes.js";
import courseContent from "./routes/course_content_route.js";

dotenv.config();
const app = express();
app.use(express.json());
//ROUTES
app.use("/api/auth", authRoute);
app.use("/api/courses", courseRoute);
app.use("/api/courseStudent", courseStudent);
app.use("/api/courseContent", courseContent);

export default app;
