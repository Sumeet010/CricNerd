import { Request, Response } from "express";
import { paramsSchema } from "../schemas/params.schema";
import { Invite } from "../models/invite.model";
import { Tournament } from "../models/tournament.model";
import { Team } from "../models/team.model";

export async function getInviteByToken(req: Request, res: Response) {
  try {
    // Add Zod validation for token
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        message: "Invalid Invite URL",
      });
    }

    const invite = await Invite.findOne({
      token,
    });

    if (!invite) {
      return res.status(404).json({
        message: "Invite not found",
      });
    }

    if (invite.isUsed) {
      return res.status(409).json({
        message: "Invite has expired",
      });
    }

    if (invite.expiresAt.getTime() < Date.now()) {
      return res.status(409).json({
        message: "Invite has expired",
      });
    }

    const tournament = await Tournament.findById(invite.tournamentId).lean();

    if (!tournament) {
      return res.status(404).json({
        message: "Tournament not found",
      });
    }
    if (tournament.endDate.getTime() < Date.now()) {
      return res.status(404).json({
        message: "Tournament has ended",
      });
    }

    const team = await Team.findById(invite.teamId).lean();

    if (!team) {
      return res.status(404).json({
        message: "Team not found",
      });
    }

    // const resp = {
    //   tournamentName: tournament.tournamentName,
    //   teamName: team.teamName,
    // };

    return res.status(200).json({
        tournamentName: tournament.tournamentName,
        teamName: team.teamName,
        expiresAt: invite.expiresAt
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}
