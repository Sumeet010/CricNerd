import { api } from "./api";
import type {
  RegisterRequest,
  LoginRequest,
  CreatePlayerRequest,
  CreateTeamRequest,
  CreateTournamentRequest,
  UpdateTournamentStatusRequest,
  UpdateTournamentRequest,
  CreateMatchRequest,
  UpdateMatchStatusRequest,
  AddBallRequest,
  AuthResponse,
  MeResponse,
  GetPlayersResponse,
  GetPlayerResponse,
  AddPlayerResponse,
  GetTeamsResponse,
  GetTeamResponse,
  AddTeamResponse,
  GetTournamentsResponse,
  MyTournamentsResponse,
  GetTournamentResponse,
  AddTournamentResponse,
  GetMatchesResponse,
  GetMatchResponse,
  AddMatchResponse,
  ApiResponse,
  Ball,
  Player,
} from "../types";

// --- Auth ---
export const authService = {
  register: (data: RegisterRequest) =>
    api.post<AuthResponse>("/auth/register", data),

  login: (data: LoginRequest) =>
    api.post<AuthResponse>("/auth/login", data),

  logout: () => 
    api.post<{ message: string }>("/auth/logout", {}),

  getMe: () => 
    api.get<MeResponse>("/auth/me"),
};

// --- Players ---
export const playerService = {
  getAll: () => 
    api.get<GetPlayersResponse>("/players/get-players"),

  getMy: () =>
    api.get<GetPlayersResponse>("/players/my-players"),
  
  getById: (id: string) => 
    api.get<GetPlayerResponse>(`/players/get-player/${id}`),

  getMe: () =>
    api.get<{ player: Player | null; message: string }>("/players/me"),

  updateMe: (data: CreatePlayerRequest) =>
    api.patch<AddPlayerResponse>("/players/me", data),
  
  create: (data: CreatePlayerRequest) =>
    api.post<AddPlayerResponse>("/players/add", data),

  register: (data: CreatePlayerRequest & { tournamentId: string; teamId: string }) =>
    api.post<AddPlayerResponse>("/players/register", data),
  
  delete: (id: string) => 
    api.delete<{ deletedPlayer: any; message: string }>(`/players/delete/${id}`),
};

// --- Teams ---
export const teamService = {
  getAll: () => 
    api.get<GetTeamsResponse>("/teams/get-teams"),

  getMy: () =>
    api.get<GetTeamsResponse>("/teams/my-teams"),
  
  getById: (id: string) => 
    api.get<GetTeamResponse>(`/teams/get-team/${id}`),
  
  create: (data: CreateTeamRequest) => 
    api.post<AddTeamResponse>("/teams/add", data),
  
  update: (id: string, data: { name: string }) =>
    api.patch<AddTeamResponse>(`/teams/update/${id}`, data),
  
  delete: (id: string) => 
    api.delete<{ deletedTeam: any; message: string }>(`/teams/delete/${id}`),
};

// --- Tournaments ---
export const tournamentService = {
  getAll: () => 
    api.get<GetTournamentsResponse>("/tournaments/get-tournaments"),

  // Returns only the tournaments created by the currently logged-in organiser
  getMyTournaments: () =>
    api.get<MyTournamentsResponse>("/tournaments/my"),
  
  getById: (id: string) => 
    api.get<GetTournamentResponse>(`/tournaments/get-tournament/${id}`),
  
  create: (data: CreateTournamentRequest) => 
    api.post<AddTournamentResponse>("/tournaments/add", data),
  
  delete: (id: string) => 
    api.delete<{ deletedTournament: any; message: string }>(`/tournaments/delete/${id}`),
  
  updateStatus: (id: string, data: UpdateTournamentStatusRequest) =>
    api.patch<ApiResponse<any>>(`/tournaments/${id}/update-tournament-format`, data),

  update: (id: string, data: UpdateTournamentRequest) =>
    api.put<{ tournament: any; message: string }>(`/tournaments/${id}`, data),
};

// --- Squad (Player-Team-Tournament) ---
export const squadService = {
  assignPlayer: (tournamentId: string, teamId: string, playerId: string) =>
    api.post<ApiResponse<any>>(
      `/tournaments/${tournamentId}/teams/${teamId}/players/${playerId}`,
      {}
    ),
  
  getTeamSquad: (tournamentId: string, teamId: string) =>
    api.get<ApiResponse<any>>(`/tournaments/${tournamentId}/teams/${teamId}/squad`),
  
  removePlayer: (tournamentId: string, teamId: string, playerId: string) =>
    api.delete<ApiResponse<any>>(
      `/tournaments/${tournamentId}/teams/${teamId}/players/${playerId}`
    ),
  
  getPlayerTeam: (tournamentId: string, playerId: string) =>
    api.get<ApiResponse<any>>(`/tournaments/${tournamentId}/players/${playerId}`),
};

// --- Matches ---
export const matchService = {
  getAll: (tournamentId?: string) =>
    api.get<GetMatchesResponse>(
      `/matches/get-matches${tournamentId ? `?tournamentId=${tournamentId}` : ""}`
    ),
  
  getById: (id: string) => 
    api.get<GetMatchResponse>(`/matches/get-match/${id}`),
  
  create: (data: CreateMatchRequest) => 
    api.post<AddMatchResponse>("/matches/add", data),
  
  delete: (id: string) => 
    api.delete<{ deletedMatch: any; message: string }>(`/matches/delete-match/${id}`),
  
  updateStatus: (id: string, data: UpdateMatchStatusRequest) =>
    api.patch<ApiResponse<any>>(`/matches/${id}/update-match-status`, data),
  
  getScorecard: (id: string) => 
    api.get<ApiResponse<any>>(`/matches/${id}/get-scorecard`),
  
  endMatch: (id: string) => 
    api.patch<ApiResponse<any>>(`/matches/${id}/end-match`, {}),
};

// --- Balls ---
export const ballService = {
  addBall: (data: AddBallRequest) => 
    api.post<{ ball: Ball; message: string }>("/balls/", data),
  undoBall: (data: { matchId: string }) => 
    api.post<{ message: string; undoneBall: Ball }>("/balls/undo", data),
};

// --- Invites ---
export const inviteService = {
  create: (data: { tournamentId: string; teamId: string }) =>
    api.post<{ inviteLink: string }>("/invites", data),

  getByToken: (token: string) =>
    api.get<{ tournamentName: string; teamName: string; expiresAt: string }>(`/invites/${token}`),
  
  accept: (token: string) =>
    api.post<{ message: string }>(`/invites/${token}/accept`, {}),

  getAccepted: () =>
    api.get<{ accepted: any[]; message: string }>("/invites/accepted"),
};
