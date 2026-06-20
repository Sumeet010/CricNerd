import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/requireRole.middleware";
import { acceptInvite, getInviteByToken, invite, getAcceptedInvites } from "../controllers/invite/invite.controller";

export const inviteRouter = Router();

inviteRouter.post("/", authMiddleware, requireRole(["ORGANIZER"]), invite);

// Specific routes MUST come before wildcard /:token
// Otherwise Express matches /accepted as token="accepted" → "Invite not found"
inviteRouter.get("/accepted", authMiddleware, requireRole(["PLAYER"]), getAcceptedInvites);

inviteRouter.get("/:token", getInviteByToken);
inviteRouter.post("/:token/accept", authMiddleware, requireRole(["PLAYER"]), acceptInvite);