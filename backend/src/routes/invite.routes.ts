import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/requireRole.middleware";
import { acceptInvite, getInviteByToken, invite } from "../controllers/invite/invite.controller";

export const inviteRouter = Router();

inviteRouter.post("/", authMiddleware, requireRole(["ORGANIZER"]), invite);

inviteRouter.get("/:token", getInviteByToken);
inviteRouter.post("/:token/accept",authMiddleware,requireRole(["PLAYER"]),acceptInvite);
