import express from "express";
import { 
    addTeam, 
    getTeamById, 
    getTeams, 
    deleteTeam, 
    updateTeam 
} from "../controllers/team/team.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/requireRole.middleware";
import { requireTeamOwnership } from "../middleware/requireTeamOwnership.middleware";

export const teamRouter = express.Router();

teamRouter.post("/add", authMiddleware, requireRole(["ORGANIZER"]), addTeam);
teamRouter.get("/get-teams", getTeams);
teamRouter.get("/get-team/:id", getTeamById);
teamRouter.delete("/delete/:id", authMiddleware,requireRole(["ORGANIZER"]), requireTeamOwnership, deleteTeam);
teamRouter.patch("/update/:id", authMiddleware,requireRole(["ORGANIZER"]), requireTeamOwnership, updateTeam);