import { invite } from "../controllers/invite/invite.controller";
import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";

export const inviteRouter = Router();

// UPDATE LATER for ownership checks
inviteRouter.post("/", authMiddleware, invite);
// Extract invite and get team, tournament , organizer info

