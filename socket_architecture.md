# Socket.IO Architecture — Cricnerd

This document explains how Socket.IO is used end-to-end in the Cricnerd application — from initial setup, through backend emission, to every frontend listener.

---

## Overview

The app uses **Socket.IO** for one purpose: **real-time live score broadcasting**. Whenever the state of a live cricket match changes (a ball is bowled, undone, or the match status is updated), the backend emits a `scorecardUpdate` event that all connected frontends receive and use to update their UI instantly — no polling required.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          BACKEND (Node.js)                          │
│                                                                     │
│  HTTP Server (Express)                                              │
│       │                                                             │
│       ├── initSocket(server)  ──────────────────────────────────┐   │
│       │       Socket.IO Server attached to same HTTP port       │   │
│       │                                                         │   │
│       │   Listens for:                                          │   │
│       │     • "joinMatch"  → socket.join(matchId)              │   │
│       │     • "leaveMatch" → socket.leave(matchId)             │   │
│       │     • "disconnect"                                      │   │
│       │                                                         │   │
│       │   Exposes: getIO() → Server instance                    │   │
│       │                                ↑                        │   │
│       │                          used by controllers            │   │
│       │                                                         │   │
│  Controllers that EMIT:                                         │   │
│    • ball.controller.ts → addBall()      → io.emit("scorecardUpdate") │
│    • ball.controller.ts → undoLastBall() → io.emit("scorecardUpdate") │
│    • match.controller.ts → updateMatchStatus() → io.emit(...)   │   │
│    • match.controller.ts → endMatch()    → io.emit(...)         │   │
│                                                                     │
│  Payload built by: getScorecardData(matchId)                        │
│  (scorecard.service.ts)                                             │
└─────────────────────────────────────────────────────────────────────┘
                               │
                   WebSocket connection
                               │
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                            │
│                                                                     │
│  lib/socket.ts → single socket instance (io("localhost:3000"))      │
│                                                                     │
│  Listeners on "scorecardUpdate":                                    │
│    • Scorecard.tsx       → updates match scores + scorecard tables  │
│    • Dashboard.tsx       → updates match score cards (organizer)    │
│    • TournamentDetail.tsx → updates match list inside tournament    │
│    • Sidebar.tsx         → updates the "Active Matches" live ticker │
│                                                                     │
│  Room Events emitted by frontend:                                   │
│    • "joinMatch"   (emitted on Scorecard mount)                     │
│    • "leaveMatch"  (emitted on Scorecard unmount)                   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Backend: Setup (`socket.service.ts`)

```ts
// backend/src/services/socket.service.ts

let io: Server | null = null;

export const initSocket = (server: HttpServer): Server => {
  io = new Server(server, {
    cors: { origin: "http://localhost:5173", methods: ["GET", "POST"], credentials: true }
  });

  io.on("connection", (socket: Socket) => {
    // Client joins a room specific to a match
    socket.on("joinMatch", (matchId: string) => socket.join(matchId));
    socket.on("leaveMatch", (matchId: string) => socket.leave(matchId));
    socket.on("disconnect", () => { /* cleanup */ });
  });

  return io;
};

// Used by controllers to get the io instance
export const getIO = (): Server => {
  if (!io) throw new Error("Socket.io has not been initialized!");
  return io;
};
```

- `initSocket` is called once at app startup in `index.ts`, passing the HTTP server.
- `getIO()` is the singleton accessor used by controllers to emit events.

> [!NOTE]
> The server currently uses **`io.emit()`** (global broadcast) rather than **`io.to(matchId).emit()`** (room-scoped). This means every connected client receives every `scorecardUpdate`, regardless of which match they are viewing. Rooms are set up on the backend, but not yet leveraged for targeted delivery.

---

## Backend: The Payload (`scorecard.service.ts`)

Every emit uses `getScorecardData(matchId)` to build a consistent payload:

```ts
// backend/src/services/scorecard.service.ts
{
  matchId: string,
  matchStatus: "LIVE" | "SCHEDULED" | "COMPLETED",
  winnerTeamId: string | null,
  matchScore: {
    teamA: { teamName, teamAScore, teamAWickets, teamABalls },
    teamB: { teamName, teamBScore, teamBWickets, teamBBalls }
  },
  batters:  [{ playerName, runs, balls }],
  bowlers:  [{ playerName, wickets, runsConceded, overs }],
  ballsCommentary: (string | number)[],   // last 6 balls: run values, "W", "WIDE", etc.
  allBalls: Ball[],
  dismissedPlayerIds: string[]
}
```

---

## Backend: Who Emits

All four emit call-sites follow the same pattern — wrapped in `try/catch` so a socket failure never breaks the HTTP response:

```ts
try {
  const io = getIO();
  const scorecardData = await getScorecardData(matchId);
  if (scorecardData) {
    io.emit("scorecardUpdate", scorecardData);  // ⚠️ global, not room-scoped
  }
} catch (socketErr) {
  console.error("Socket emit error:", socketErr);
}
```

| Controller | Function | When emitted |
|---|---|---|
| `ball.controller.ts` | `addBall` | After every legal/illegal delivery is recorded |
| `ball.controller.ts` | `undoLastBall` | After the last ball is deleted and stats reverted |
| `match.controller.ts` | `updateMatchStatus` | When a match transitions SCHEDULED → LIVE or LIVE → COMPLETED |
| `match.controller.ts` | `endMatch` | When the organizer manually ends a match and a winner is determined |

---

## Frontend: Socket Singleton (`lib/socket.ts`)

```ts
// frontend/src/lib/socket.ts
import { io } from "socket.io-client";
export const socket = io("http://localhost:3000");
```

A **single shared socket instance** is created at module load time and imported wherever needed. It auto-connects on page load.

---

## Frontend: Listeners

### 1. `Scorecard.tsx` — The Live Scoring Page

**Most complete integration.** This component both joins a room AND listens.

```ts
useEffect(() => {
  if (!matchId) return;

  socket.emit("joinMatch", matchId);   // join the match-specific room

  const handleScorecardUpdate = (data: any) => {
    setScorecardData(data);            // full scorecard (batters, bowlers, balls)
    setMatch(prev => ({               // update match scores & status in-place
      ...prev,
      teamAScore: data.matchScore.teamA.teamAScore,
      teamAWickets: data.matchScore.teamA.teamAWickets,
      teamABalls: data.matchScore.teamA.teamABalls,
      teamBScore: data.matchScore.teamB.teamBScore,
      teamBWickets: data.matchScore.teamB.teamBWickets,
      teamBBalls: data.matchScore.teamB.teamBBalls,
      matchStatus: data.matchStatus,
      winnerTeamId: data.winnerTeamId,
    }));
  };

  socket.on("scorecardUpdate", handleScorecardUpdate);

  return () => {
    socket.emit("leaveMatch", matchId);  // leave room on unmount
    socket.off("scorecardUpdate", handleScorecardUpdate);
  };
}, [matchId]);
```

**What updates:** The entire scoring dashboard — scores header, batting/bowling stats tables, ball commentary — all without a page refresh.

---

### 2. `Dashboard.tsx` — Organizer Dashboard

Only active if the user is an organizer (`isOrganizer` check).

```ts
useEffect(() => {
  if (!isOrganizer) return;

  const handleScorecardUpdate = (data: any) => {
    setMatches(prev => prev.map(m => {
      if (m._id === data.matchId) {
        return { ...m, teamAScore: ..., matchStatus: ..., winnerTeamId: ... };
      }
      return m;
    }));
  };

  socket.on("scorecardUpdate", handleScorecardUpdate);
  return () => socket.off("scorecardUpdate", handleScorecardUpdate);
}, [isOrganizer]);
```

**What updates:** The match score cards in the "Matches Center" section update live without any interaction.

---

### 3. `TournamentDetail.tsx` — Tournament Detail Page

```ts
useEffect(() => {
  const handleScorecardUpdate = (data: any) => {
    setMatches(prev => prev.map(m => {
      if (m._id === data.matchId) {
        return { ...m, teamAScore: ..., matchStatus: ..., winnerTeamId: ... };
      }
      return m;
    }));
  };

  socket.on("scorecardUpdate", handleScorecardUpdate);
  return () => socket.off("scorecardUpdate", handleScorecardUpdate);
}, []);
```

**What updates:** The match list in the Matches tab inside a tournament page. When a ball is scored elsewhere, match cards here update their scores in real time.

---

### 4. `Sidebar.tsx` — The "Active Matches" Ticker

Has the most complex logic — it also polls every 30 seconds as a fallback, and handles matches going live or ending.

```ts
socket.on("scorecardUpdate", (data: any) => {
  setLiveMatches(prev => {
    const exists = prev.some(m => m._id === data.matchId);

    if (data.matchStatus === "LIVE") {
      if (exists) {
        // Update scores for an already-tracked live match
        return prev.map(m => m._id === data.matchId ? { ...m, ...scores } : m);
      } else {
        // A new match just went live — re-fetch the full list
        fetchLiveMatches();
        return prev;
      }
    } else {
      // Match ended — remove it from the live ticker
      return exists ? prev.filter(m => m._id !== data.matchId) : prev;
    }
  });
});
```

**What updates:** The red pulsing "Active matches" card in the sidebar, showing live team names and scores for any ongoing match across the platform.

---

## Known Limitation: Global Broadcast vs. Room-Based Emit

The backend sets up match rooms correctly (`socket.join(matchId)`), but all four emit sites use:

```ts
io.emit("scorecardUpdate", scorecardData)  // sends to ALL connected clients
```

Instead of:

```ts
io.to(matchId).emit("scorecardUpdate", scorecardData)  // sends only to clients watching that match
```

**Impact:** Every client receives every score update for every match. For a small-scale platform this works fine, but as concurrent matches increase, clients will receive and process data for matches they're not viewing. The Sidebar listener partially handles this by filtering on `data.matchId`.

To fix this, all four `io.emit(...)` calls in the backend would need to be changed to `io.to(scorecardData.matchId).emit(...)`. The only component that currently joins/leaves a room (`Scorecard.tsx`) would then receive targeted events; the others (`Dashboard`, `TournamentDetail`, `Sidebar`) would also need to `joinMatch` on their relevant match IDs to continue receiving updates.
