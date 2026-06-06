import { Request, Response, NextFunction } from "express";
import { Tournament } from "../models/tournament.model";


export async function requireTournamentOwnership(req: Request, res: Response, next: NextFunction){

    try {
        const tournamentId= req.params.id || req.body.tournamentId;

        const tournament = await Tournament.findById(tournamentId);
        if(!tournament){
            return res.status(404).json({
                message: "Tournament not found"
            })
        }
        // console.log((req as any).userId)
        if(tournament.organizerId.toString()!== (req as any).userId){
            return res.status(403).json({
                message: "Forbidden"
            })
        }
        next();
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error",
        })
}
}