import express from "express";
import dotenv from "dotenv";
import cors from "cors"
import authRoutes from "./modules/auth/auth.routes";
import { errorHandler } from "./middleware/errorHandler";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
const allowedOrigins = [process.env.FRONTEND_URL as string];


if (process.env.NODE_ENV !== "production") {
  allowedOrigins.push("http://localhost:5173");
}

app.use(express.json());
app.use(cookieParser())

app.use(cors({
  origin: allowedOrigins,
  credentials: true, // allows the browser to send/receive cookies
}));

app.get("/", (req, res) => {
  res.status(200).send("Welcome to Aspira backend");
});
app.get("/test", (req, res) => {
  res.status(200).send("TEST ROUTE WORKS");
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/auth", authRoutes);
app.use(errorHandler);

export default app;