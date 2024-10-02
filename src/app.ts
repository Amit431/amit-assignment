import express, { Request, Response } from "express";
import { StatsRoutes, BallByBallRoutes } from "./routes";
import config from "./config";
import cors from "cors";

const app = express();
const port = config.PORT as string;

// Middleware to parse JSON
app.use(cors());
app.use(express.json());

// Routes
app.get("/", (req: Request, res: Response) => {
    res.json({ message: "ok" });
});
app.use("/api/v1", StatsRoutes);
app.use("/api/v1", BallByBallRoutes);

export default app;
