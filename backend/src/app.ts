import express from "express";

import { playerRoute } from "./routes/player.routes";
import { teamRouter } from "./routes/team.routes";
import { tournamentRouter } from "./routes/tournament.routes";
import { playerTeamTournamentRouter } from "./routes/playerteamtournament.routes";
import { matchRouter } from "./routes/match.routes";
import { ballRouter } from "./routes/ball.routes";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";


const app = express();

app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/players",playerRoute);
app.use("/teams",teamRouter);
app.use("/tournaments",tournamentRouter);
app.use("/tournaments",playerTeamTournamentRouter);
app.use("/matches", matchRouter)
app.use("/balls", ballRouter)

export default app;