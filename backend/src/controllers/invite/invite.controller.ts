import { Request, Response } from "express";
import crypto from "crypto";
import { Invite } from "../../models/invite.model";
import { Tournament } from "../../models/tournament.model";
import { Team } from "../../models/team.model";
import { Player } from "../../models/player.model";
import { inviteSchema } from "./invite.schema";
import { PlayerTeamTournament } from "../../models/playerTeamTournament.model";

export async function invite(req: Request, res: Response) {
  try {
    const result = inviteSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: result.error,
      });
    }

    const { tournamentId, teamId } = result.data;

    const tournament = await Tournament.findById(tournamentId);

    if (!tournament) {
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
      createdBy: (req as any).userId,
    });

    return res.status(201).json({
      inviteLink: `http://localhost:5173/invite/${token}`,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}


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


export async function acceptInvite(req: Request, res: Response) {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        message: "Invalid invite",
      });
    }

    const invite = await Invite.findOne({
      token,
    }).lean();

    if (!invite) {
      return res.status(404).json({
        message: "Invitation not found",
      });
    }
    if (invite.expiresAt.getTime() < Date.now()) {
      return res.status(409).json({
        message: "Invitation expired",
      });
    }
    if (invite.isUsed) {
      return res.status(409).json({
        message: "Invitation already used",
      });
    }

    const player = await Player.findOne({
      userId: (req as any).userId,
    });

    console.log(player)

    if (!player) {
      return res.status(404).json({
        message: "Player not found",
      });
    }

    const existingPlayer = await PlayerTeamTournament.findOne({
      tournamentId: invite.tournamentId,
      playerId: player._id,
    });

    if (existingPlayer) {
      return res.status(409).json({
        message: "Player already in a team",
      });
    }

    await PlayerTeamTournament.create({
      tournamentId: invite.tournamentId,
      teamId: invite.teamId,
      playerId: player._id,
    });

    await Invite.findByIdAndUpdate(invite._id, {
      isUsed: true,
    });

    return res.status(200).json({
      message: "Invitation accepted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function getPendingInvites(req: Request, res: Response) {
  try {
    const invites = await Invite.find({
      isUsed: false,
      expiresAt: { $gt: new Date() }
    })
    .populate("tournamentId", "tournamentName")
    .populate("teamId", "teamName")
    .lean();

    return res.status(200).json({
      invites,
      message: "Pending invitations fetched successfully"
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
}

export async function getAcceptedInvites(req: Request, res: Response) {
  try {
    const player = await Player.findOne({ userId: (req as any).userId });
    if (!player) {
      return res.status(200).json({
        accepted: [],
        message: "Player profile not found"
      });
    }

    const accepted = await PlayerTeamTournament.find({ playerId: player._id })
      .populate("tournamentId", "tournamentName")
      .populate("teamId", "teamName")
      .lean();

    return res.status(200).json({
      accepted,
      message: "Accepted invitations fetched successfully"
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
}
