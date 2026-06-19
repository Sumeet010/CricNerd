import express from "express";
import { addPlayer, registerPlayer, deletePlayer, getPlayerById, getPlayers, getMyPlayers, getMyPlayerProfile, updateMyPlayerProfile } from "../controllers/player/player.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/requireRole.middleware";
import { requireTournamentOwnership } from "../middleware/requireTournamentOwnership.middleware";


export const playerRoute = express.Router();

playerRoute.post("/add", authMiddleware, addPlayer);
playerRoute.post("/register", authMiddleware, requireRole(["ORGANIZER"]), requireTournamentOwnership, registerPlayer);
playerRoute.get("/me", authMiddleware, getMyPlayerProfile);
playerRoute.patch("/me", authMiddleware, updateMyPlayerProfile);
playerRoute.get("/get-players", getPlayers);
playerRoute.get("/my-players", authMiddleware, getMyPlayers);
playerRoute.get("/get-player/:id", getPlayerById);
playerRoute.delete("/delete/:id", authMiddleware, deletePlayer);
