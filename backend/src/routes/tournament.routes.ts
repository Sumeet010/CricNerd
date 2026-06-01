import express from "express"

import { addTournament, deleteTournament, getTournamentById, getTournaments, updateTournamentStatus } from "../controllers/tournament/tournament.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireTournamentOwnership } from "../middleware/requireTournamentOwnership.middleware"
import { requireRole } from "../middleware/requireRole.middleware";



export const tournamentRouter = express.Router();

tournamentRouter.post('/add', authMiddleware, requireRole(["ORGANIZER", "PLAYER"]), addTournament);
tournamentRouter.get('/get-tournaments', getTournaments);
tournamentRouter.get('/get-tournament/:id', getTournamentById);
tournamentRouter.delete('/delete/:id', authMiddleware, requireRole(["ORGANIZER"]), requireTournamentOwnership, deleteTournament);
tournamentRouter.patch('/:id/update-tournament-format', authMiddleware, requireRole(["ORGANIZER"]), requireTournamentOwnership, updateTournamentStatus)