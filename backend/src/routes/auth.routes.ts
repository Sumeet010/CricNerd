import express from "express";
import {
  registerHandler,
  loginHandler,
  logoutHandler,
  getMeHandler,
} from "../controllers/auth/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";

export const authRouter = express.Router();

authRouter.post("/register", registerHandler);
authRouter.post("/login", loginHandler);
authRouter.post("/logout", authMiddleware, logoutHandler);
authRouter.get("/me", authMiddleware, getMeHandler);
