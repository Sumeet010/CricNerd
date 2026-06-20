// Shared API contract types aligned with the backend database models and controllers

// --- Enums / Constants ---
export type UserRole = "PLAYER" | "ORGANIZER";
export type PlayingRole = "Batter" | "Bowler" | "Allrounder";
export type PlayingFormat = "5 Overs" | "6 Overs" | "20 Overs";
export type PlayingStatus = "UPCOMING" | "ONGOING" | "COMPLETED";
export type MatchStatus = "SCHEDULED" | "LIVE" | "COMPLETED";
export type ExtraType = "NONE" | "DEAD" | "WIDE" | "NO_BALL";
export type WicketType = "BOWLED" | "CAUGHT" | "STUMPED" | "HIT_WICKET";

// --- Database Models ---

export interface User {
  _id: string;
  email: string;
  name?: string;
  isEmailVerified: boolean;
  role: UserRole[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Player {
  _id: string;
  userId?: string;
  fullName: string;
  age?: number;
  playingRole: PlayingRole;
  tournamentWins: number;
  totalRuns: number;
  totalWickets: number;
  highestRunsInMatch: number;
  highestWicketsInMatch: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Team {
  _id: string;
  teamName: string;
  tournamentId: string;
  tournamentWins: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Tournament {
  _id: string;
  organizerId: string;
  tournamentName: string;
  startDate: string;
  endDate: string;
  playingFormat: PlayingFormat;
  playingStatus: PlayingStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface Match {
  _id: string;
  tournamentId: string;
  teamAId: string;
  teamBId: string;
  matchDate: string;
  matchStatus: MatchStatus;
  teamAScore: number;
  teamAWickets: number;
  teamABalls: number;
  teamBScore: number;
  teamBWickets: number;
  teamBBalls: number;
  winnerTeamId: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Ball {
  _id: string;
  matchId: string;
  battingTeamId: string;
  bowlingTeamId: string;
  strikerId: string;
  bowlerId: string;
  overNumber: number;
  ballNumber: number;
  runsOffBat: number;
  extraRuns: number;
  extraType: ExtraType;
  isLegalDelivery: boolean;
  isWicket: boolean;
  dismissedPlayerId?: string;
  wicketType?: WicketType;
  createdAt?: string;
  updatedAt?: string;
}

export interface PlayerTeamTournament {
  _id: string;
  playerId: string;
  teamId: string;
  tournamentId: string;
  createdAt?: string;
  updatedAt?: string;
}

// --- API Request Payloads ---

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  role?: UserRole[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreatePlayerRequest {
  name: string;
  age: number;
  playingRole: PlayingRole;
}

export interface CreateTeamRequest {
  name: string;
  tournamentId: string;
}

export interface CreateTournamentRequest {
  name: string;
  startDate: string;
  endDate: string;
  playingFormat: PlayingFormat;
  playingStatus?: PlayingStatus;
}

export interface UpdateTournamentStatusRequest {
  playingStatus: PlayingStatus;
}

export interface UpdateTournamentRequest {
  tournamentName: string;
}

export interface CreateMatchRequest {
  tournamentId: string;
  teamAId: string;
  teamBId: string;
  matchDate: string;
  matchStatus?: MatchStatus;
}

export interface UpdateMatchStatusRequest {
  matchStatus: MatchStatus;
}

export interface AddBallRequest {
  matchId: string;
  battingTeamId: string;
  bowlingTeamId: string;
  strikerId: string;
  bowlerId: string;
  overNumber: number;
  ballNumber: number;
  runsOffBat?: number;
  extraRuns?: number;
  extraType?: ExtraType;
  isWicket?: boolean;
  dismissedPlayerId?: string;
  wicketType?: WicketType;
}

// --- API Responses ---

export interface ApiResponse<T = any> {
  message: string;
  data?: T;
  [key: string]: any;
}

export interface AuthResponse {
  user: {
    _id: string;
    email: string;
    name?: string;
    isEmailVerified: boolean;
    role: UserRole[];
  };
  token: string;
  message: string;
}

export interface MeResponse {
  user: User;
  message: string;
}

export interface GetPlayersResponse {
  allPlayer: Player[];
  message: string;
}

export interface GetPlayerResponse {
  getSinglePlayer: Player;
  message: string;
}

export interface AddPlayerResponse {
  player: Player;
  message: string;
}

export interface GetTeamsResponse {
  allTeams: Team[];
  message: string;
}

export interface GetTeamResponse {
  singleTeam: Team;
  message: string;
}

export interface AddTeamResponse {
  createTeam: Team;
  message: string;
}

export interface GetTournamentsResponse {
  allTournaments: Tournament[];
  message: string;
}

export interface MyTournamentsResponse {
  findMyTournaments: Tournament[];
  message: string;
}

export interface GetTournamentResponse {
  singleTournament: Tournament;
  message: string;
}

export interface AddTournamentResponse {
  tournament: Tournament;
  message: string;
}

export interface GetMatchesResponse {
  allMatches: Match[];
  message: string;
}

export interface GetMatchResponse {
  matchExist: Match;
  message: string;
}

export interface AddMatchResponse {
  createdMatch: Match;
  message: string;
}
