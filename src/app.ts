import express from "express";
import routes from "./routes";
import config from "./config";

const app = express();
const port = config.PORT as string;

// Middleware to parse JSON
app.use(express.json());

// Routes
app.use("/api", routes);


export default app;
