import express from "express"
import { createMatch, deleteMatch, endMatch, getMatchById, getMatches, getScorecard, updateMatchStatus } from "../controllers/match/match.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/requireRole.middleware";
import { requireTournamentOwnership } from "../middleware/requireTournamentOwnership.middleware";
import { requireMatchOwnership } from "../middleware/requireMatchOwnership.middleware";
import { attachAccessibleTournaments } from "../middleware/attachAccessibleTournaments.middleware";

export const matchRouter =  express.Router();


/**
 * @swagger
 * /add:
 *   post:
 *     summary: Create a new match
 *     tags: [Match]
 *     requestBody:
 *       required: true
 *       content: 
 *         application/json:    
 *           schema: 
 *             type: object
 *             properties:
 *               tournamentId: 
 *                 type: string
 *               teamAId:
 *                 type: string
 *               teamBId:
 *                 type: string             
 *               matchDate:
 *                 type: string
 *                 format: date
 *               matchStatus:
 *                 type: string
 *                 enum: [SCHEDULED, LIVE, COMPLETED]
 *     responses:
 *       201:
 *         description: Match created successfully
 *       400:
 *         description: Bad request (Validation error, Match already LIVE between these teams)
 *       404:
 *         description: Resource not found (Tournament doesn't exist, can't create a match, One or both teams do not exist)
 *       409:
 *         description: Conflict error (Same Team's cannot play against each other)
 *       500:
 *         description: Internal server error
 */
matchRouter.post('/add', authMiddleware, requireRole(["ORGANIZER"]), requireTournamentOwnership, createMatch)

/**
 * @swagger
 * /matches:
 *   get:
 *     summary: Get all matches (optionally filter by tournament)
 *     tags: [Match]
 *     parameters:
 *       - in: query
 *         name: tournamentId
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter matches by tournament ID
 *     responses:
 *       200:
 *         description: Matches fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 allMatches:
 *                   type: array
 *                   items:
 *                     type: object
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid query parameters
 *       500:
 *         description: Internal server error
 */
matchRouter.get('/get-matches', authMiddleware, attachAccessibleTournaments, getMatches)

/**
 * @swagger
 * /match/{id}:
 *   get:
 *     summary: Get match by ID
 *     tags: [Match]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Match fetched
 */
matchRouter.get('/get-match/:id', authMiddleware, attachAccessibleTournaments, getMatchById)

/**
 * @swagger
 * /delete-match/{id}:
 *   get:
 *     summary: Delete match by ID
 *     tags: [Match]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Match deleted successfully
 *       400:
 *         description: Bad request (Only scheduled matches can be deleted)
 */
matchRouter.delete('/delete-match/:id', authMiddleware, requireRole(["ORGANIZER"]), requireMatchOwnership, deleteMatch)

/**
 * @swagger
 * /match/{id}/status:
 *   patch:
 *     summary: Update match status (SCHEDULED → LIVE → COMPLETED)
 *     tags: [Match]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Match ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - matchStatus
 *             properties:
 *               matchStatus:
 *                 type: string
 *                 enum: [SCHEDULED, LIVE, COMPLETED]
 *                 example: LIVE
 *     responses:
 *       200:
 *         description: Match status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid input or invalid status transition
 *         content:
 *           application/json:
 *             examples:
 *               notFound:
 *                 summary: Match not found
 *                 value:
 *                   message: "Match not found"
 *               alreadyCompleted:
 *                 summary: Already completed
 *                 value:
 *                   message: "Match is already completed"
 *               invalidTransition:
 *                 summary: Invalid transition
 *                 value:
 *                   message: "Invalid status transition"
 *       500:
 *         description: Internal server error
 */
matchRouter.patch('/:id/update-match-status', authMiddleware,requireRole(["ORGANIZER"]), requireMatchOwnership, updateMatchStatus)

/**
 * @swagger
 * /match/{id}/scorecard:
 *   get:
 *     summary: Get full scorecard of a match
 *     description: Returns match score, batting stats, bowling stats, and recent ball commentary
 *     tags: [Match]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Match ID
 *     responses:
 *       200:
 *         description: Scorecard fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 matchScore:
 *                   type: object
 *                   properties:
 *                     teamA:
 *                       type: object
 *                       properties:
 *                         teamName:
 *                           type: string
 *                         teamAScore:
 *                           type: number
 *                         teamAWickets:
 *                           type: number
 *                         teamABalls:
 *                           type: number
 *                     teamB:
 *                       type: object
 *                       properties:
 *                         teamName:
 *                           type: string
 *                         teamBScore:
 *                           type: number
 *                         teamBWickets:
 *                           type: number
 *                         teamBBalls:
 *                           type: number
 *                 batters:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       playerName:
 *                         type: string
 *                       runs:
 *                         type: number
 *                       balls:
 *                         type: number
 *                 bowlers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       playerName:
 *                         type: string
 *                       wickets:
 *                         type: number
 *                       runsConceded:
 *                         type: number
 *                       overs:
 *                         type: string
 *                 ballsCommentary:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["1", "4", "W", "NB", "2", "0"]
 *       400:
 *         description: Invalid match ID
 *       404:
 *         description: Match not found
 *       500:
 *         description: Internal server error
 */
matchRouter.get('/:id/get-scorecard', authMiddleware, attachAccessibleTournaments, getScorecard)

/**
 * @swagger
 * /match/{id}/end:
 *   patch:
 *     summary: End a match and calculate winner
 *     description: |
 *       Ends a LIVE match, determines the winner based on scores,
 *       updates match status to COMPLETED, increments winning team's stats,
 *       and updates player career statistics.
 *     tags: [Match]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Match ID
 *     responses:
 *       200:
 *         description: Match completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 winnerTeamId:
 *                   type: string
 *                   nullable: true
 *                   description: Winning team ID (null if draw)
 *                 message:
 *                   type: string
 *                   example: Match Completed Successfully
 *       400:
 *         description: Invalid request or match state
 *         content:
 *           application/json:
 *             examples:
 *               alreadyCompleted:
 *                 summary: Match already completed
 *                 value:
 *                   message: "Match already completed"
 *               notLive:
 *                 summary: Match not LIVE
 *                 value:
 *                   message: "Match must be LIVE to end"
 *       404:
 *         description: Match not found
 *       500:
 *         description: Internal server error
 */
matchRouter.patch('/:id/end-match', authMiddleware,requireRole(["ORGANIZER"]),requireMatchOwnership, endMatch);