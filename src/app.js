import dotenv from "dotenv";
import express from "express";
import authRoute from "./routes/auth_routes.js";
import courseRoute from "./routes/course_route.js";
import courseStudent from "./routes/course_student_routes.js";
import courseContent from "./routes/course_content_route.js";
import courseActivity from "./routes/course_activities_router.js";
import fileManagement from "./routes/files_magane_route.js";
import roleRequests from "./routes/role_request_route.js";
import aiRoute from "./routes/ai_route.js";
import userRoute from "./routes/user_route.js";
import translationRoute from "./routes/translation_route.js";
import progress from "./routes/activity_progress_route.js";
import attempts from "./routes/activity_attempts.js";
import globalConfigs from "./routes/global_configs_route.js";
import notifications from "./routes/notifications_routes.js";
import preferences from "./routes/user_preferences.js";

const currentEnv = "dev"; //prod | dev
const envFilePath = currentEnv === "prod" ? ".env.prod" : ".env";
dotenv.config({ path: envFilePath });

const app = express();
app.use(express.json());

app.use("/api/auth", authRoute); //
app.use("/api/courses", courseRoute); //
app.use("/api/courseStudent", courseStudent); //
app.use("/api/courseContent", courseContent);
app.use("/api/courseActivity", courseActivity);
app.use("/api/file", fileManagement);
app.use("/api/roleRequests", roleRequests);
app.use("/api/ai", aiRoute);
app.use("/api/user", userRoute);
app.use("/api/translate", translationRoute);
app.use("/api/progress", progress);
app.use("/api/attempts", attempts);
app.use("/api/app", globalConfigs);
app.use("/api/notify", notifications);
app.use("/api/preferences", preferences);

export default app;
