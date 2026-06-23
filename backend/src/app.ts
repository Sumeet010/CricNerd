import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import { playerRoute } from "./routes/player.routes";
import { teamRouter } from "./routes/team.routes";
import { tournamentRouter } from "./routes/tournament.routes";
import { playerTeamTournamentRouter } from "./routes/playerteamtournament.routes";
import { matchRouter } from "./routes/match.routes";
import { ballRouter } from "./routes/ball.routes";
import { authRouter } from "./routes/auth.routes";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import { inviteRouter } from "./routes/invite.routes";


const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173", credentials: true }));


app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/auth", authRouter);
app.use("/players", playerRoute);
app.use("/teams", teamRouter);
app.use("/tournaments", tournamentRouter);
app.use("/tournaments", playerTeamTournamentRouter);
app.use("/matches", matchRouter)
app.use("/balls", ballRouter)
app.use("/invites", inviteRouter)

export default app;