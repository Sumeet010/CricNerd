import { Request, Response } from "express";

import {
  tournamentSchema,
  updateTournamentSchema,
  updateTournamentStatusSchema,
} from "./tournament.schema";
import { Tournament } from "../../models/tournament.model";
import { User } from "../../models/user.model";
import { validateTournamentDate } from "../../services/validateTournamentDate";

import { paramsSchema } from "../../schemas/params.schema";
import { generateToken, setTokenCookie } from "../auth/auth.controller";

export async function addTournament(req: Request, res: Response) {
  try {
    const result = tournamentSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: result.error,
      });
    }

    const { name, startDate, endDate, playingFormat, playingStatus } = result.data;

    const tournamentExist = await Tournament.findOne({ tournamentName: name });

    if (tournamentExist) {
      return res.status(409).json({
        message: "Tournament with this name already exist",
      });
    }

    validateTournamentDate(startDate, endDate, req, res);
    const userId = (req as any).userId;
    // Need to check this logic now!
    // Upgrade user to ORGANIZER role if not already present
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $addToSet: {
          role: "ORGANIZER",
        },
      },
      { new: true },
    );

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Generating fresh JWT with updated roles
    const token = generateToken(updatedUser._id.toString(), updatedUser.role);

    setTokenCookie(res, token);

    const tournament = await Tournament.create({
      organizerId: updatedUser.id,
      tournamentName: name,
      startDate,
      endDate,
      playingFormat,
      playingStatus, // Optional
    });

    return res.status(201).json({
      tournament,
      message: "Tournament created succesfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function getTournaments(req: Request, res: Response) {
  try {
    const allTournaments = await Tournament.find().lean();

    return res.status(200).json({
      allTournaments,
      message: "Tournament fetched successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}

export async function getTournamentById(req: Request, res: Response) {
  try {
    const result = paramsSchema.safeParse(req.params);

    if (!result.success) {
      return res.status(400).json({
        error: result.error,
      });
    }
    const { id } = result.data;

    const singleTournament = await Tournament.findById(id);

    if (!singleTournament) {
      return res.status(404).json({
        message: "Tournament not found",
      });
    }

    return res.status(200).json({
      singleTournament,
      message: "Tournament fetched successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function deleteTournament(req: Request, res: Response) {
  try {
    const result = paramsSchema.safeParse(req.params);
    if (!result.success) {
      return res.status(400).json({
        error: result.error,
      });
    }

    const { id } = result.data;

    const deletedTournament = await Tournament.findByIdAndDelete(id);
    return res.status(200).json({
      deletedTournament,
      message: "Tournament deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function updateTournamentStatus(req: Request, res: Response) {
  try {
    const bodyResult = updateTournamentStatusSchema.safeParse(req.body);
    const paramsResult = paramsSchema.safeParse(req.params);

    if (!bodyResult.success) {
      return res.status(400).json({
        error: bodyResult.error,
      });
    }

    if (!paramsResult.success) {
      return res.status(400).json({
        error: paramsResult.error,
      });
    }

    const { playingStatus } = bodyResult.data;
    const { id } = paramsResult.data;

    const tournament = await Tournament.findById(id);

    if (!tournament) {
      return res.status(404).json({
        message: "Tournament not found",
      });
    }

    // COMPLETED → no transitions allowed
    if (tournament.playingStatus === "COMPLETED") {
      return res.status(409).json({
        message: "Tournament is already completed",
      });
    }

    // SCHEDULED → only ONGOING
    if (
      tournament.playingStatus === "UPCOMING" &&
      playingStatus !== "ONGOING"
    ) {
      return res.status(400).json({
        message: "Tournament must be ONGOING before it can be completed",
      });
    }

    // ONGOING → only COMPLETED
    if (
      tournament.playingStatus === "ONGOING" &&
      playingStatus !== "COMPLETED"
    ) {
      return res.status(400).json({
        message: "Invalid tournament status transition",
      });
    }

    await Tournament.updateOne({ _id: id }, { playingStatus });

    return res.status(200).json({
      message: `Tournament status updated to ${playingStatus}`,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function myTournaments(req: Request, res: Response){
  try{
    const findMyTournaments = await Tournament.find({
      organizerId: (req as any).userId,
    }).lean();

    if (!findMyTournaments){
      return res.status(404).json({
        message: "No tournaments found",
      });
    }

    return res.status(200).json({
      findMyTournaments,
      message: "Tournaments fetched successfully",
    });
  } catch(error){
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function tournamentImageUpload(req: Request, res: Response){
  try{
    const file = req.file;
    if(!file){
      return res.status(400).json({
        message: "No file uploaded",
      });
    }
    
    const tournament = await Tournament.findById(req.params.id);
    if(!tournament){
      return res.status(404).json({
        message: "Tournament not found",
      });
    }

    return res.status(201).json({
      message: "Tournament image uploaded successfully",
      imageName: file.filename,
    })

  } catch(error){
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function updateTournament(req: Request, res: Response){
  try {
    const result = updateTournamentSchema.safeParse(req.body);
    const paramsResult = paramsSchema.safeParse(req.params);

    if(!result.success){
      return res.status(400).json({
        message: "Invalid request body",
      });
    }

    if(!paramsResult.success){
      return res.status(400).json({
        message: "Invalid request parameters",
      });
    }

    const { tournamentName } = result.data;
    const { id } = paramsResult.data;

    const tournament = await Tournament.findByIdAndUpdate(id, {
      tournamentName
    }, {new: true, runValidators: true});

    if(!tournament){
      return res.status(404).json({
        message: "Tournament not found",
      });
    }

    return res.status(200).json({
      tournament,
      message: "Tournament updated successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}