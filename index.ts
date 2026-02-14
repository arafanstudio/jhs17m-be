import express, { Request, Response, NextFunction } from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { initializeDatabase } from "./db";
import cors from "cors";
import articleRouter from "./routes/article";

dotenv.config({ path: "./.env" });

async function startServer() {
  const app = express();
  app.use(express.json());
  await initializeDatabase();
  app.use(cors({
    origin: process.env.FRONTEND_URL || "https://school-frontend-opal.vercel.app",
    credentials: true,
  }));

  // Admin Authentication Middleware
  const adminAuth = (req: Request, res: Response, next: NextFunction) => {
    const { username, password } = req.body;
    if (
      username === process.env.ADMIN_USERNAME &&
      password === process.env.ADMIN_PASSWORD
    ) {
      next();
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  };

  // API Routes
  app.use("/api/articles", articleRouter);

  // Admin Login Route (POST)
  app.post("/api/admin/login", adminAuth, (req, res) => {
    // If adminAuth passes, the user is authenticated
    // In a real app, a JWT would be issued here. For simplicity, we'll just send a success message.
    res.json({ message: "Login successful" });
  });

  // Root route for health check or simple message
  app.get("/", (req, res) => {
    res.status(200).send("Backend API is running!");
  });

  // Export the app for Vercel serverless function
  return app;
}

// Vercel serverless function entry point
let app: express.Application | undefined;
export default async (req: Request, res: Response) => {
  if (!app) {
    app = await startServer();
  }
  app(req, res);
};
