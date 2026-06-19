import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/requireRole.middleware";
import { acceptInvite, getInviteByToken, invite, getPendingInvites, getAcceptedInvites } from "../controllers/invite/invite.controller";

export const inviteRouter = Router();

inviteRouter.post("/", authMiddleware, requireRole(["ORGANIZER"]), invite);

inviteRouter.get("/pending", authMiddleware, requireRole(["PLAYER"]), getPendingInvites);
inviteRouter.get("/accepted", authMiddleware, requireRole(["PLAYER"]), getAcceptedInvites);

inviteRouter.get("/:token", getInviteByToken);
inviteRouter.post("/:token/accept",authMiddleware,requireRole(["PLAYER"]),acceptInvite);
