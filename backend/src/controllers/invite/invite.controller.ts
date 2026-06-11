import { Request, Response } from "express";
import crypto from "crypto";
import { Invite } from "../../models/invite.model";
import { Tournament } from "../../models/tournament.model";
import { Team } from "../../models/team.model";
import { inviteSchema } from "./invite.schema";

export async function invite(req: Request, res: Response) {

    try {

    const result = inviteSchema.safeParse(req.body);
    if(!result.success){
        return res.status(400).json({
            error: result.error,
        })
    }
    
   const { tournamentId, teamId } = result.data;
    
   const tournament = await Tournament.findById(tournamentId);

    if(!tournament){
        return res.status(404).json({
            message: "Tournament not found",
        });
    }

   const team = await Team.findById(teamId);

    if (!team) {
        return res.status(404).json({
            message: "team not found",
        });
    }

  const token = crypto.randomBytes(32).toString("hex");

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await Invite.create({
    tournamentId,
    teamId,
    token,
    expiresAt,
    createdBy: (req as any).userId
  });

  return res.status(201).json({
    inviteLink: `https://locahost:5173/invite/${token}`,
  })
} catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Inter server error"
        })        
    }
}
