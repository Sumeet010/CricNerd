import express from "express";
import { addPlayer, deletePlayer, getPlayerById, getPlayers } from "../controllers/player/player.controller";
import { authMiddleware } from "../middleware/auth.middleware";


export const playerRoute = express.Router();

playerRoute.post("/add", authMiddleware, addPlayer);
playerRoute.get("/get-players", getPlayers);
playerRoute.get("/get-player/:id", getPlayerById);
playerRoute.delete("/delete/:id", authMiddleware, deletePlayer);
