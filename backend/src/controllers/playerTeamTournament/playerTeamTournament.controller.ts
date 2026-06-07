import {Request, Response } from "express";

import { assignPlayerToTeamSchema } from "./playerTeamTournamentParams.schema";
import { PlayerTeamTournament } from "../../models/playerTeamTournament.model";
import { Player } from "../../models/player.model";
import { Team } from "../../models/team.model";
import { Tournament } from "../../models/tournament.model";


export async function assignPlayerToTeam(req: Request, res: Response){
    try {
        const result = assignPlayerToTeamSchema.safeParse(req.params);
        // console.log(req.params)
        if(!result.success){
            return res.status(400).json({
                error: result.error
            })
        }


        const {playerId, teamId, tournamentId} = result.data;

        const player = await Player.findById(playerId);
        const team = await Team.findById(teamId);
        const tournament = await Tournament.findById(tournamentId);


        if(!player || !team || !tournament){
            return res.status(404).json({
                message:"Error finding player,team or tournament data"
            })
        }


        const alreadyAssigned = await PlayerTeamTournament.findOne({
            playerId,
            tournamentId
        });

        if (alreadyAssigned) {
        return res.status(400).json({
            message: "Player already assigned to a team in this tournament"
        });
        }

        const assignPlayer = await PlayerTeamTournament.create({
            playerId,
            teamId,
            tournamentId
        })

        
        return res.status(201).json({
            assignPlayer,
            message: "Player assigned to team and tournament Successfully"
        })
        

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error"
        })
    }
}

export async function getTeamSquad(req: Request, res: Response){
    try {
        const result = assignPlayerToTeamSchema.safeParse(req.params);
        if(!result.success){
            return res.status(400).json({
                error:result.error
            })
        }

        const { tournamentId, teamId} = result.data;

        const foundSquad = await PlayerTeamTournament.find({
            teamId,
            tournamentId
        }).populate("playerId").lean()
    
        return res.status(200).json({
            foundSquad,
            count: foundSquad.length,
            message: "Team squad fetched successfully"
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error"
        })
    }
}

export async function removePlayerFromTeam(req: Request, res: Response){
    try {
        const result = assignPlayerToTeamSchema.safeParse(req.params);     
        if(!result.success){
            return res.status(400).json({
                error: result.error
            })
         }

        const {tournamentId, teamId, playerId} = result.data;
        
        const deleted = await PlayerTeamTournament.deleteOne({
            playerId,
            teamId,
            tournamentId
            });
        

        if(deleted.deletedCount == 0){
            return res.status(404).json({
                message: "Player not assigned to this team in this tournament"
            })
        }


        return res.status(200).json({
            deleted,
            message: "Player removed from team for this tournament"

        })

        } catch (error) {
            return res.status(500).json({
                message: "Internal server error"
            });
    }
}

export async function getPlayerTournamentTeam(req: Request, res: Response){
    try {

         const result = assignPlayerToTeamSchema.safeParse(req.params);

        if(!result.success){
            return res.status(400).json({
                error: result.error
            })
        }

        const { tournamentId, playerId } = result.data;


        const foundPlayer = await PlayerTeamTournament.findOne({
                tournamentId,
                playerId
            }).populate("teamId").lean()

        if(!foundPlayer){
            return res.status(404).json({
                message: "Player not assigned to any team in this tournament"

            })
        }


        return res.status(200).json({
            foundPlayer,
            message: "Player tournament team fetched successfully"
        })
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error"
        })
    }

   
}