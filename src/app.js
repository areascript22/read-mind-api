import dotenv from "dotenv";
import express from "express";
import authRoute from "./routes/auth_routes.js";
import courseRoute from './routes/course_route.js';

dotenv.config();
const app = express();
app.use(express.json());
//
app.use("/api/auth", authRoute);
app.use("/api/courses",courseRoute);

export default app;
