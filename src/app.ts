import express from "express";
import { StatsRoutes } from "./routes";
import config from "./config";

const app = express();
const port = config.PORT as string;

// Middleware to parse JSON
app.use(express.json());

// Routes
app.use("/api/v1", StatsRoutes);

export default app;
