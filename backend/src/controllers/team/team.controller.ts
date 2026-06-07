import { Request, Response } from "express";

import { Team } from "../../models/team.model";
import { teamSchema } from "./team.schema";
import { paramsSchema } from "../../schemas/params.schema";

export async function addTeam(req: Request, res: Response) {
  try {
    const result = teamSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: result.error,
      });
    }

    const { name, tournamentId } = result.data;

    const teamExist = await Team.findOne({ teamName: name });

    if (teamExist) {
      return res.status(409).json({
        message: "Team with this name already exist",
      });
    }

    const createTeam = await Team.create({
      teamName: name,
      tournamentId
    });

    return res.status(201).json({
      createTeam,
      message: "Team added succesfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function getTeams(req: Request, res: Response) {
  try {
    const allTeams = await Team.find().lean();

    return res.status(200).json({
      allTeams,
      message: "Teams fetched succesfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal serve error",
    });
  }
}

export async function getTeamById(req: Request, res: Response) {
  try {
    const result = paramsSchema.safeParse(req.params);

    if (!result.success) {
      return res.status(400).json({
        error: result.error,
      });
    }

    const { id } = result.data;

    const singleTeam = await Team.findById(id).lean();

    if (!singleTeam) {
      return res.status(404).json({
        message: "Team not found",
      });
    }

    return res.status(200).json({
      singleTeam,
      message: "Team fetched successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal serve error",
    });
  }
}

export async function deleteTeam(req: Request, res: Response) {
  try {
    const result = paramsSchema.safeParse(req.params);

    if (!result.success) {
      return res.status(400).json({
        error: result.error,
      });
    }

    const { id } = result.data;

    const deletedTeam = await Team.findByIdAndDelete(id);

    if (!deletedTeam) {
      return res.status(404).json({
        message: "Team doesn't exist",
      });
    }

    return res.status(200).json({
      deletedTeam,
      message: "Team deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function updateTeam(req: Request, res: Response) {
  try {
    const result = paramsSchema.safeParse(req.params);
    if (!result.success) {
      return res.status(400).json({
        error: result.error,
      });
    }

    const bodyResult = teamSchema.safeParse(req.body);
    if (!bodyResult.success) {
      return res.status(400).json({
        error: bodyResult.error,
      });
    }

    const { name } = bodyResult.data;
    const { id } = result.data;

    const updatedTeam = await Team.findByIdAndUpdate(id, {
      teamName: name,
    },{ new: true });
    if (!updatedTeam) {
      return res.status(404).json({
        message: "Team not found",
      });
    }

    return res.status(200).json({
      updatedTeam,
      message: "Team updated successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}
