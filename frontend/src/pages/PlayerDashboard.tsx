import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Trophy,
  Swords,
  Users,
  UserRound,
  TrendingUp,
  Loader2,
  AlertCircle,
  Check,
  Calendar,
  Award,
  Edit2
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { playerService, inviteService, tournamentService, matchService, teamService } from "@/services";
import type { Player, Match } from "@/types";

export default function PlayerDashboard() {
  const [searchParams] = useSearchParams();
  const currentTab = searchParams.get("tab") || "dashboard";

  // Player state
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Profile Form state
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    age: 18,
    playingRole: "Allrounder"
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // General App Data for Player views
  const [acceptedInvites, setAcceptedInvites] = useState<any[]>([]);
  const [myTournaments, setMyTournaments] = useState<any[]>([]);
  const [myTeams, setMyTeams] = useState<any[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [teamMap, setTeamMap] = useState<Record<string, string>>({});
  const [tournamentMap, setTournamentMap] = useState<Record<string, string>>({});

  const loadPlayerData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch Player profile
      const playerRes = await playerService.getMe();
      const currentPlayer = playerRes.player;
      setPlayer(currentPlayer);

      if (currentPlayer) {
        setFormData({
          name: currentPlayer.fullName,
          age: currentPlayer.age || 18,
          playingRole: currentPlayer.playingRole
        });

        // 2. Fetch invitations
        const [acceptedRes, matchRes, teamRes, tournamentRes] = await Promise.all([
          inviteService.getAccepted(),
          matchService.getAll(),
          teamService.getAll(),
          tournamentService.getAll() // Resolve names using public getAll endpoint
        ]);

        const accepted = acceptedRes.accepted ?? [];
        const allMatches = matchRes.allMatches ?? [];
        const allTeams = teamRes.allTeams ?? [];
        setAcceptedInvites(accepted);

        // Resolve teams and tournaments list
        const playerTeamIds = accepted.map((a: any) => a.teamId?._id?.toString()).filter(Boolean);
        const playerTournamentIds = accepted.map((a: any) => a.tournamentId?._id?.toString()).filter(Boolean);

        // Filter tournaments that player is in
        const tourList = (tournamentRes.allTournaments ?? []).filter((t: any) => 
          playerTournamentIds.includes(t._id.toString())
        );
        setMyTournaments(tourList);

        // Filter teams that player is in
        const teamList = allTeams.filter((t: any) => playerTeamIds.includes(t._id.toString()));
        setMyTeams(teamList);

        // Resolve names mapping
        const tMap: Record<string, string> = {};
        allTeams.forEach((t: any) => { tMap[t._id] = t.teamName; });
        setTeamMap(tMap);

        const tourMap: Record<string, string> = {};
        (tournamentRes.allTournaments ?? []).forEach((t: any) => { tourMap[t._id] = t.tournamentName; });
        setTournamentMap(tourMap);

        // Filter upcoming matches for player's teams
        const upMatches = allMatches.filter((m: Match) => 
          m.matchStatus === "SCHEDULED" && 
          (playerTeamIds.includes(m.teamAId.toString()) || playerTeamIds.includes(m.teamBId.toString()))
        );
        setUpcomingMatches(upMatches);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load player dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlayerData();
  }, []);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError(null);

    try {
      if (!formData.name.trim()) {
        throw new Error("Name is required");
      }
      if (formData.age < 12) {
        throw new Error("Age must be at least 12 years old");
      }
      if (formData.age > 70) {
        throw new Error("Age must be less than 70 to play a tournament");
      }

      await playerService.updateMe({
        name: formData.name,
        age: formData.age,
        playingRole: formData.playingRole as any
      });

      setShowProfileForm(false);
      await loadPlayerData();
    } catch (err: any) {
      console.error(err);
      setFormError(err.zodErrors ? Object.values(err.zodErrors).join(", ") : err.message || "Failed to save profile");
    } finally {
      setFormSubmitting(false);
    }
  };



  if (loading) {
    return (
      <Layout title="Player Dashboard" subtitle="OVERVIEW">
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-white" />
          <span className="text-zinc-500 text-xs uppercase tracking-wider font-bold">Loading your player space...</span>
        </div>
      </Layout>
    );
  }

  // --- Render 1: Profile Creation Flow ---
  if (!player) {
    return (
      <Layout title="Profile Setup" subtitle="REGISTRATION">
        <div className="max-w-md mx-auto my-12 bg-[#1c1c1c] border border-zinc-800/20 rounded-2xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <UserRound className="w-12 h-12 text-[#fcf8e3] mx-auto" />
            <h3 className="text-white text-xl font-bold">Create Player Profile</h3>
            <p className="text-zinc-500 text-xs">Register your playing details to get invited by teams and participate in tournaments.</p>
          </div>

          {formError && (
            <div className="bg-red-950/20 border border-red-900 rounded-xl p-3 flex gap-2 text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-zinc-400 text-xs font-semibold">Full Name</label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-[#1e1e22] border-zinc-800 text-white placeholder-zinc-600 focus-visible:border-zinc-700 focus-visible:ring-zinc-800"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-zinc-400 text-xs font-semibold">Age</label>
              <Input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                className="bg-[#1e1e22] border-zinc-800 text-white placeholder-zinc-600 focus-visible:border-zinc-700 focus-visible:ring-zinc-800"
                min={12}
                max={70}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-zinc-400 text-xs font-semibold">Playing Role</label>
              <select
                value={formData.playingRole}
                onChange={(e) => setFormData({ ...formData, playingRole: e.target.value })}
                className="w-full bg-[#1e1e22] border border-zinc-800 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-zinc-600"
              >
                <option value="Batter">Batter</option>
                <option value="Bowler">Bowler</option>
                <option value="Allrounder">All Rounder</option>
              </select>
            </div>

            <Button
              type="submit"
              disabled={formSubmitting}
              className="w-full bg-[#fcf8e3] text-black font-semibold h-10 hover:bg-[#f5eea5] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {formSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Profile"}
            </Button>
          </form>
        </div>
      </Layout>
    );
  }

  // --- Render 2: Player space tabs ---
  const renderTabContent = () => {
    switch (currentTab) {
      case "dashboard":
        return (
          <div className="space-y-8">
            {/* Overview cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Card: Active Teams */}
              <div className="rounded-xl border border-zinc-800 bg-[#1c1c1c] text-card-foreground shadow">
                <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="tracking-tight text-sm font-medium text-zinc-400">Active Teams</h3>
                  <Users className="h-4 w-4 text-zinc-500" />
                </div>
                <div className="p-6 pt-0">
                  <div className="text-3xl font-extrabold text-white">{myTeams.length}</div>
                  <div className="text-[10px] text-zinc-500 font-bold mt-2">
                    Teams you represent
                  </div>
                </div>
              </div>

              {/* Card: Tournaments */}
              <div className="rounded-xl border border-zinc-800 bg-[#1c1c1c] text-card-foreground shadow">
                <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="tracking-tight text-sm font-medium text-zinc-400">Tournaments</h3>
                  <Trophy className="h-4 w-4 text-zinc-500" />
                </div>
                <div className="p-6 pt-0">
                  <div className="text-3xl font-extrabold text-white">{myTournaments.length}</div>
                  <div className="text-[10px] text-zinc-500 font-bold mt-2">
                    Joined competitions
                  </div>
                </div>
              </div>

              {/* Card: Career Runs */}
              <div className="rounded-xl border border-zinc-800 bg-[#1c1c1c] text-card-foreground shadow">
                <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="tracking-tight text-sm font-medium text-zinc-400">Career Runs</h3>
                  <Award className="h-4 w-4 text-[#fcf8e3]" />
                </div>
                <div className="p-6 pt-0">
                  <div className="text-3xl font-extrabold text-[#fcf8e3]">{player.totalRuns ?? 0}</div>
                  <div className="text-[10px] text-zinc-500 font-bold mt-2">
                    Accumulated runs
                  </div>
                </div>
              </div>

              {/* Card: Career Wickets */}
              <div className="rounded-xl border border-zinc-800 bg-[#1c1c1c] text-card-foreground shadow">
                <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="tracking-tight text-sm font-medium text-zinc-400">Career Wickets</h3>
                  <Swords className="h-4 w-4 text-[#fcf8e3]" />
                </div>
                <div className="p-6 pt-0">
                  <div className="text-3xl font-extrabold text-[#fcf8e3]">{player.totalWickets ?? 0}</div>
                  <div className="text-[10px] text-zinc-500 font-bold mt-2">
                    Total dismissals
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Upcoming matches */}
              <div className="lg:col-span-2 bg-[#1c1c1c] border border-zinc-800 rounded-xl p-5 space-y-4">
                <div>
                  <h3 className="text-white font-bold text-sm">Upcoming Matches</h3>
                  <p className="text-zinc-500 text-xs">Scheduled games for your teams</p>
                </div>

                {upcomingMatches.length === 0 ? (
                  <div className="border border-dashed border-zinc-800 rounded-xl py-10 text-center text-zinc-500 text-xs">
                    No upcoming matches scheduled.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingMatches.map((m) => {
                      const teamAName = teamMap[m.teamAId] || "Team A";
                      const teamBName = teamMap[m.teamBId] || "Team B";
                      const tourName = tournamentMap[m.tournamentId] || "Tournament";

                      return (
                        <div key={m._id} className="bg-[#121214] border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
                          <div className="space-y-1">
                            <span className="text-[9px] text-[#fcf8e3] font-bold uppercase tracking-wider bg-[#fcf8e3]/10 px-2 py-0.5 rounded-full">
                              {tourName}
                            </span>
                            <div className="text-white text-xs font-bold pt-1">
                              {teamAName} vs {teamBName}
                            </div>
                          </div>
                          <div className="text-right text-[10px] text-zinc-500 font-semibold flex items-center gap-1.5 bg-zinc-800/20 py-1.5 px-3 rounded-lg border border-zinc-800">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(m.matchDate).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short"
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Quick Info & Recent performance */}
              <div className="bg-[#1c1c1c] border border-zinc-800 rounded-xl p-5 space-y-4">
                <div>
                  <h3 className="text-white font-bold text-sm">Recent Performance</h3>
                  <p className="text-zinc-500 text-xs">High scores from your matches</p>
                </div>
                <div className="space-y-3">
                  <div className="bg-[#121214] border border-zinc-800 rounded-xl p-3 flex justify-between items-center">
                    <span className="text-zinc-400 text-xs">Highest Match Score</span>
                    <span className="text-white text-sm font-extrabold">{player.highestRunsInMatch ?? 0} runs</span>
                  </div>
                  <div className="bg-[#121214] border border-zinc-800 rounded-xl p-3 flex justify-between items-center">
                    <span className="text-zinc-400 text-xs">Best Wickets in Match</span>
                    <span className="text-white text-sm font-extrabold">{player.highestWicketsInMatch ?? 0} wkts</span>
                  </div>
                  <div className="bg-[#121214] border border-zinc-800 rounded-xl p-3 flex justify-between items-center">
                    <span className="text-zinc-400 text-xs">Tournament Wins</span>
                    <span className="text-white text-sm font-extrabold">{player.tournamentWins ?? 0} trophy</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "profile":
        return (
          <div className="max-w-2xl bg-[#1c1c1c] border border-zinc-800 rounded-xl p-6 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-white font-bold text-base">My Playing Profile</h3>
                <p className="text-zinc-500 text-xs">Your personal information and role details</p>
              </div>
              {!showProfileForm && (
                <button
                  onClick={() => setShowProfileForm(true)}
                  className="bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs py-2 px-3.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit Profile
                </button>
              )}
            </div>

            {showProfileForm ? (
              <form onSubmit={handleProfileSubmit} className="space-y-4 border-t border-zinc-800/50 pt-5">
                {formError && (
                  <div className="bg-red-950/20 border border-red-900 rounded-xl p-3 text-red-400 text-xs">
                    {formError}
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-zinc-400 text-xs font-semibold">Full Name</label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-[#1e1e22] border-zinc-800 text-white placeholder-zinc-600 focus-visible:border-zinc-700 focus-visible:ring-zinc-800"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-zinc-400 text-xs font-semibold">Age</label>
                    <Input
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                      className="bg-[#1e1e22] border-zinc-800 text-white placeholder-zinc-600 focus-visible:border-zinc-700 focus-visible:ring-zinc-800"
                      min={12}
                      max={70}
                      required
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-zinc-400 text-xs font-semibold">Playing Role</label>
                    <select
                      value={formData.playingRole}
                      onChange={(e) => setFormData({ ...formData, playingRole: e.target.value })}
                      className="w-full bg-[#1e1e22] border border-zinc-800 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-zinc-600"
                    >
                      <option value="Batter">Batter</option>
                      <option value="Bowler">Bowler</option>
                      <option value="Allrounder">All Rounder</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 justify-end pt-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowProfileForm(false)}
                    className="border-zinc-700 hover:bg-zinc-800 text-zinc-300 text-xs bg-transparent hover:text-white"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={formSubmitting}
                    className="bg-[#fcf8e3] text-black hover:bg-[#f5eea5] text-xs font-semibold"
                  >
                    {formSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
                <div className="bg-[#121214] border border-zinc-800 rounded-xl p-4">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Full Name</span>
                  <div className="text-white text-base font-extrabold mt-1">{player.fullName}</div>
                </div>
                <div className="bg-[#121214] border border-zinc-800 rounded-xl p-4">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Age</span>
                  <div className="text-white text-base font-extrabold mt-1">{player.age || "N/A"}</div>
                </div>
                <div className="bg-[#121214] border border-zinc-800 rounded-xl p-4">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Playing Role</span>
                  <div className="text-white text-base font-extrabold mt-1 uppercase tracking-wide">{player.playingRole.replace("_", " ")}</div>
                </div>
              </div>
            )}
          </div>
        );

      case "tournaments":
        return (
          <div className="space-y-5">
            <div>
              <h3 className="text-white font-bold text-base">My Tournaments</h3>
              <p className="text-zinc-500 text-xs">Tournaments you participate in via team squads</p>
            </div>

            {myTournaments.length === 0 ? (
              <div className="border border-dashed border-zinc-800 rounded-xl py-16 text-center text-zinc-500 text-xs max-w-2xl">
                You haven't joined any tournaments yet. Accept an invitation from an organizer to get started!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl">
                {myTournaments.map((t) => (
                  <div key={t._id} className="bg-[#1c1c1c] border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-all">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-white text-sm font-extrabold">{t.tournamentName}</h4>
                        <p className="text-[10px] text-zinc-500 font-semibold mt-1">Format: {t.playingFormat}</p>
                      </div>
                      <span className={`text-[9px] font-extrabold tracking-wider px-2 py-0.5 rounded-full ${
                        t.playingStatus === "ONGOING"
                          ? "bg-blue-600/10 text-blue-400 border border-blue-600/20"
                          : t.playingStatus === "COMPLETED"
                          ? "bg-zinc-800 text-zinc-400"
                          : "bg-green-600/10 text-green-400 border border-green-600/20"
                      }`}>
                        {t.playingStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "teams":
        return (
          <div className="space-y-5">
            <div>
              <h3 className="text-white font-bold text-base">My Teams</h3>
              <p className="text-zinc-500 text-xs">Teams you are registered with</p>
            </div>

            {myTeams.length === 0 ? (
              <div className="border border-dashed border-zinc-800 rounded-xl py-16 text-center text-zinc-500 text-xs max-w-2xl">
                You are not registered in any team squad yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {myTeams.map((t) => (
                  <div key={t._id} className="bg-[#1c1c1c] border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <h4 className="text-white text-sm font-extrabold">{t.teamName}</h4>
                      <p className="text-[9px] text-zinc-500 font-medium mt-1">Wins: {t.tournamentWins ?? 0}</p>
                    </div>
                    <Users className="w-5 h-5 text-zinc-650" />
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "invitations":
        return (
          <div className="space-y-4">

            {/* Accepted */}
            <div className="space-y-4 bg-[#1c1c1c] border border-zinc-800 rounded-xl p-5">
              <div>
                <h3 className="text-white font-bold text-sm">Invitations Accepted</h3>
                <p className="text-zinc-500 text-xs">Teams you have successfully joined</p>
              </div>

              {acceptedInvites.length === 0 ? (
                <div className="border border-dashed border-zinc-800 rounded-xl py-12 text-center text-zinc-500 text-xs">
                  You haven't accepted any invitations yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {acceptedInvites.map((item) => (
                    <div key={item._id} className="bg-[#121214] border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
                      <div className="space-y-1">
                        <h4 className="text-white text-xs font-bold">{item.teamId?.teamName || "Team"}</h4>
                        <p className="text-[10px] text-zinc-500 font-semibold">{item.tournamentId?.tournamentName || "Tournament"}</p>
                      </div>
                      <span className="text-[10px] text-zinc-500 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-green-500" /> Accepted
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case "statistics":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-white font-bold text-base">My Stats</h3>
              <p className="text-zinc-500 text-xs">Your cumulative career cricket records</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="rounded-xl border border-zinc-800 bg-[#1c1c1c] p-6 text-card-foreground shadow">
                <div className="flex flex-row items-center justify-between pb-2">
                  <h3 className="text-sm font-medium text-zinc-400">Total Runs</h3>
                  <Award className="h-4 w-4 text-[#fcf8e3]" />
                </div>
                <div className="text-3xl font-extrabold text-white">{player.totalRuns ?? 0}</div>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-[#1c1c1c] p-6 text-card-foreground shadow">
                <div className="flex flex-row items-center justify-between pb-2">
                  <h3 className="text-sm font-medium text-zinc-400">Total Wickets</h3>
                  <Award className="h-4 w-4 text-[#fcf8e3]" />
                </div>
                <div className="text-3xl font-extrabold text-white">{player.totalWickets ?? 0}</div>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-[#1c1c1c] p-6 text-card-foreground shadow">
                <div className="flex flex-row items-center justify-between pb-2">
                  <h3 className="text-sm font-medium text-zinc-400">Highest Score</h3>
                  <TrendingUp className="h-4 w-4 text-green-400" />
                </div>
                <div className="text-3xl font-extrabold text-white">{player.highestRunsInMatch ?? 0}</div>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-[#1c1c1c] p-6 text-card-foreground shadow">
                <div className="flex flex-row items-center justify-between pb-2">
                  <h3 className="text-sm font-medium text-zinc-400">Best Bowling</h3>
                  <TrendingUp className="h-4 w-4 text-green-400" />
                </div>
                <div className="text-3xl font-extrabold text-white">{player.highestWicketsInMatch ?? 0} <span className="text-xs text-zinc-500 font-normal">Wkts</span></div>
              </div>
            </div>
          </div>
        );

      default:
        return <div>Invalid tab state</div>;
    }
  };

  return (
    <Layout title="Player Dashboard" subtitle="OVERVIEW">
      {error && (
        <div className="max-w-md mx-auto my-6 bg-red-950/20 border border-red-900 rounded-xl p-4 text-red-400 text-xs flex gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {renderTabContent()}
    </Layout>
  );
}
