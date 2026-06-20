import express from "express"

import { addTournament, deleteTournament, getTournamentById, getTournaments, myTournaments, updateTournamentStatus, tournamentImageUpload, updateTournament} from "../controllers/tournament/tournament.controller";
import { uploadFile } from "../middleware/fileUpload.middleware";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireTournamentOwnership } from "../middleware/requireTournamentOwnership.middleware"
import { requireRole } from "../middleware/requireRole.middleware";



export const tournamentRouter = express.Router();

tournamentRouter.post('/add', authMiddleware, requireRole(["ORGANIZER", "PLAYER"]), addTournament);
tournamentRouter.get('/get-tournaments', getTournaments);
tournamentRouter.get('/get-tournament/:id', getTournamentById);
tournamentRouter.delete('/delete/:id', authMiddleware, requireRole(["ORGANIZER"]), requireTournamentOwnership, deleteTournament);
tournamentRouter.patch('/:id/update-tournament-format', authMiddleware, requireRole(["ORGANIZER"]), requireTournamentOwnership, updateTournamentStatus)
tournamentRouter.put('/:id', authMiddleware, requireRole(["ORGANIZER"]), requireTournamentOwnership, updateTournament);
tournamentRouter.get('/my', authMiddleware, requireRole(["ORGANIZER"]), myTournaments);
tournamentRouter.post('/:id/upload-image', uploadFile.single('image'), authMiddleware, requireRole(["ORGANIZER"]), requireTournamentOwnership, tournamentImageUpload);
// tournamentRouter.get('/my-participated-tournaments', authMiddleware, requireRole(["PLAYER"]), myTournaments);