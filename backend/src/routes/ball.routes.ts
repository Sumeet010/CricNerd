import express from "express"
import { addBall, undoLastBall } from "../controllers/ball/ball.controller"
import { authMiddleware } from "../middleware/auth.middleware"

export const ballRouter = express.Router()

/**
 * @swagger
 * /addBall:
 *   post:
 *     summary: Add a ball event
 *     tags: [Ball]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               matchId:
 *                 type: string
 *               strikerId:
 *                 type: string
 *               runsOffBat:
 *                 type: number
 *               isWicket:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Ball recorded successfully
 */
ballRouter.post("/", authMiddleware, addBall);

/**
 * @swagger
 * /addBall/undo:
 *   post:
 *     summary: Undo the last recorded ball of a live match
 *     tags: [Ball]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - matchId
 *             properties:
 *               matchId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Last delivery undone successfully
 *       400:
 *         description: Match not live
 *       404:
 *         description: Match or deliveries not found
 */
ballRouter.post("/undo", authMiddleware, undoLastBall);