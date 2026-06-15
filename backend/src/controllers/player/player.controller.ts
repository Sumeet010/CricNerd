import { Request, Response } from "express";

import { Player } from "../../models/player.model";
import { Tournament } from "../../models/tournament.model";
import { PlayerTeamTournament } from "../../models/playerTeamTournament.model";
import { playerSchema } from "./player.schema";
import { paramsSchema } from "../../schemas/params.schema";


export async function addPlayer(req: Request, res: Response){
    try {
        const result = playerSchema.safeParse(req.body);

        if(!result.success){
            return res.status(400).json({
                error: result.error
            })
        }
        const {name, age, playingRole} = result.data;
    
        const playerExist = await Player.findOne({
            userId: (req as any).userId,
        });
    // const playerExist = Player.findOne({fullName}) 
        if(playerExist){
            return res.status(409).json({
                message:"Player already exist"
            })
        }

        const player = await Player.create({
            userId: (req as any).userId,
            fullName:name,
            age,
            playingRole
        })

        return res.status(201).json({
            player,
            message:"Player created successfully."
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message:"Internal server error"
        })
    }
    
}  

export async function getPlayers(req: Request, res: Response){
    try {
        const allPlayer = await Player.find().lean();
    
        return res.status(200).json({
            allPlayer,
            message:"Players fetched successfully"
        })

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message:"Internal server error"
        })
    }
}

export async function getMyPlayers(req: Request, res: Response) {
    try {
        const userId = (req as any).userId;

        const myTournaments = await Tournament.find({ organizerId: userId }).select("_id").lean();
        const tournamentIds = myTournaments.map((t) => t._id);

        const squads = await PlayerTeamTournament.find({ tournamentId: { $in: tournamentIds } })
            .select("playerId")
            .lean();
        // Give unique players across all the tournaments
        const playerIds = [...new Set(squads.map((s) => s.playerId.toString()))];

        const allPlayer = await Player.find({ _id: { $in: playerIds } }).lean();

        return res.status(200).json({
            allPlayer,
            message: "Players fetched successfully",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
}

export async function getPlayerById(req: Request, res: Response){
    try {
        const result = paramsSchema.safeParse(req.params);
        if(!result.success){
            return res.status(400).json({
                error: result.error
            })
        }
        const { id } = result.data;
        const getSinglePlayer = await Player.findById(id)

        if(!getSinglePlayer){
            return res.status(400).json({
                message:"Player doesn't exist"
            })
        }
        
        return res.status(200).json({
            getSinglePlayer,
            message:"Player fetched successfully"
        })

    } catch (error) {
        console.log(error);
            return res.status(500).json({
            message:"Internal server error"
        })
    }
}

export async function deletePlayer(req: Request, res: Response){
    try {
        const result = paramsSchema.safeParse(req.params);

        if(!result.success){
            return res.status(400).json({
                error: result.error
            });
        }

        const { id } = result.data; 
        const deletedPlayer = await Player.findByIdAndDelete(id).lean();
        
        if(!deletedPlayer){
            return res.status(404).json({
                message:"Player not found"
            })
        }

        return res.status(200).json({
            deletedPlayer,
            message:"Player deleted successfully"
        })
    } catch (error) {
        console.error(error)
            return res.status(500).json({
            message:"Internal server error"
        })
    }
} 

export async function getMyPlayerProfile(req: Request, res: Response){
    try {
        const player = await Player.findOne({
            userId: (req as any).userId,
        }).lean();

        return res.status(200).json({
            player,
            message: player ? "Player profile fetched successfully" : "Player profile not found"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

export async function updateMyPlayerProfile(req: Request, res: Response) {
    try {
        const result = playerSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                error: result.error
            });
        }
        const { name, age, playingRole } = result.data;

        const player = await Player.findOneAndUpdate(
            { userId: (req as any).userId },
            { fullName: name, age, playingRole },
            { new: true, upsert: true }
        );

        return res.status(200).json({
            player,
            message: "Player profile updated successfully."
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}