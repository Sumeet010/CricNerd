import express from "express";
import { assignPlayerToTeam, getPlayerTournamentTeam, getTeamSquad, removePlayerFromTeam } from "../controllers/playerTeamTournament/playerTeamTournament.controller";
import { authMiddleware } from "../middleware/auth.middleware";

export const playerTeamTournamentRouter = express.Router()

playerTeamTournamentRouter.post("/:tournamentId/teams/:teamId/players/:playerId", authMiddleware, assignPlayerToTeam);
playerTeamTournamentRouter.get("/:tournamentId/teams/:teamId/squad", getTeamSquad)
playerTeamTournamentRouter.delete("/:tournamentId/teams/:teamId/players/:playerId", authMiddleware, removePlayerFromTeam);
playerTeamTournamentRouter.get("/:tournamentId/players/:playerId", getPlayerTournamentTeam);