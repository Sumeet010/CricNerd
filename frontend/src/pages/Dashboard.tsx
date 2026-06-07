import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Trophy,
  Swords,
  Users,
  UserRound,
  ArrowRight,
  Loader2,
  AlertCircle,
  Calendar,
  Play,
  CheckCircle,
  TrendingUp,
  Award,
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { tournamentService, matchService, teamService, playerService } from "@/services";
import type { Tournament, Match, Team, Player } from "@/types";

export default function Dashboard() {
  const navigate = useNavigate();

  // State lists
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);

  // Maps for ID to Name/Detail resolution
  const [teamMap, setTeamMap] = useState<Record<string, string>>({});
  const [tournamentMap, setTournamentMap] = useState<Record<string, string>>({});

  // Loading / Error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tab for matches view
  const [matchTab, setMatchTab] = useState<"LIVE" | "SCHEDULED" | "COMPLETED">("LIVE");

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      setError(null);
      try {
        const [tourRes, matchRes, teamRes, playerRes] = await Promise.all([
          tournamentService.getMyTournaments(),
          matchService.getAll(),
          teamService.getAll(),
          playerService.getAll(),
        ]);

        const tours = tourRes.findMyTournaments ?? [];
        const mats = matchRes.allMatches ?? [];
        const tms = teamRes.allTeams ?? [];
        const plys = playerRes.allPlayer ?? [];

        setTournaments(tours);
        setMatches(mats);
        setTeams(tms);
        setPlayers(plys);

        // Build maps
        const tmMap: Record<string, string> = {};
        tms.forEach((t) => {
          tmMap[t._id] = t.teamName;
        });
        setTeamMap(tmMap);

        const trMap: Record<string, string> = {};
        tours.forEach((t) => {
          trMap[t._id] = t.tournamentName;
        });
        setTournamentMap(trMap);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to load dashboard statistics.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <Layout title="Dashboard" subtitle="OVERVIEW">
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-white" />
          <span className="text-zinc-500 text-xs uppercase tracking-wider font-bold">Loading dashboard insights...</span>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Dashboard" subtitle="OVERVIEW">
        <div className="max-w-md mx-auto my-12 bg-red-950/20 border border-red-900 rounded-xl p-6 text-center">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <h3 className="text-white font-bold text-base mb-1">Failed to load Dashboard</h3>
          <p className="text-red-400 text-xs mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-white bg-zinc-800 hover:bg-zinc-700 text-xs px-4 py-2 rounded-lg font-semibold inline-block"
          >
            Retry
          </button>
        </div>
      </Layout>
    );
  }

  // Derived statistics
  const liveMatches = matches.filter((m) => m.matchStatus === "LIVE");
  const scheduledMatches = matches.filter((m) => m.matchStatus === "SCHEDULED");
  const completedMatches = matches.filter((m) => m.matchStatus === "COMPLETED");

  const ongoingTournaments = tournaments.filter((t) => t.playingStatus === "ONGOING");
  const upcomingTournaments = tournaments.filter((t) => t.playingStatus === "UPCOMING");

  // Top Batters & Bowlers (only show players with actual recorded stats)
  const topBatters = [...players]
    .filter((p) => (p.totalRuns ?? 0) > 0)
    .sort((a, b) => (b.totalRuns ?? 0) - (a.totalRuns ?? 0))
    .slice(0, 5);
  const topBowlers = [...players]
    .filter((p) => (p.totalWickets ?? 0) > 0)
    .sort((a, b) => (b.totalWickets ?? 0) - (a.totalWickets ?? 0))
    .slice(0, 5);

  const getFilteredMatches = () => {
    if (matchTab === "LIVE") return liveMatches;
    if (matchTab === "SCHEDULED") return scheduledMatches;
    return completedMatches;
  };

  const filteredMatches = getFilteredMatches();

  return (
    <Layout title="Dashboard" subtitle="OVERVIEW">
      <div className="space-y-8 pb-12">
        {/* ── Summary Stats Cards Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card: Tournaments */}
          <div className="rounded-xl border border-zinc-800 bg-[#1c1c1c] text-card-foreground shadow">
            <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="tracking-tight text-sm font-medium text-zinc-400">Total Tournaments</h3>
              <Trophy className="h-4 w-4 text-zinc-500" />
            </div>
            <div className="p-6 pt-0">
              <div className="text-3xl font-extrabold text-white">{tournaments.length}</div>
              <div className="flex gap-2.5 text-[10px] text-zinc-500 font-bold mt-2">
                <span className="text-blue-400">{ongoingTournaments.length} Ongoing</span>
                <span>•</span>
                <span className="text-green-400">{upcomingTournaments.length} Upcoming</span>
              </div>
            </div>
          </div>

          {/* Card: Matches */}
          <div className="rounded-xl border border-zinc-800 bg-[#1c1c1c] text-card-foreground shadow">
            <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="tracking-tight text-sm font-medium text-zinc-400">Matches Played</h3>
              <Swords className="h-4 w-4 text-zinc-500" />
            </div>
            <div className="p-6 pt-0">
              <div className="text-3xl font-extrabold text-white">{matches.length}</div>
              <div className="flex gap-2.5 text-[10px] text-zinc-500 font-bold mt-2">
                <span className="text-red-400 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
                  {liveMatches.length} Live
                </span>
                <span>•</span>
                <span>{scheduledMatches.length} Scheduled</span>
              </div>
            </div>
          </div>

          {/* Card: Registered Teams */}
          <div className="rounded-xl border border-zinc-800 bg-[#1c1c1c] text-card-foreground shadow">
            <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="tracking-tight text-sm font-medium text-zinc-400">Total Teams</h3>
              <Users className="h-4 w-4 text-zinc-500" />
            </div>
            <div className="p-6 pt-0">
              <div className="text-3xl font-extrabold text-white">{teams.length}</div>
              <p className="text-[10px] text-zinc-500 font-bold mt-2">
                Across all configured tournaments
              </p>
            </div>
          </div>

          {/* Card: Registered Players */}
          <div className="rounded-xl border border-zinc-800 bg-[#1c1c1c] text-card-foreground shadow">
            <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="tracking-tight text-sm font-medium text-zinc-400">Players Registered</h3>
              <UserRound className="h-4 w-4 text-zinc-500" />
            </div>
            <div className="p-6 pt-0">
              <div className="text-3xl font-extrabold text-white">{players.length}</div>
              <p className="text-[10px] text-zinc-500 font-bold mt-2">
                Active global talent roster
              </p>
            </div>
          </div>
        </div>

        {/* ── Matches Center and Standings Column Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Matches Center Block */}
          <div className="lg:col-span-2 bg-[#1c1c1c] border border-zinc-800 rounded-xl p-5 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-zinc-800/50 pb-4">
              <div>
                <h3 className="text-white font-bold text-base">Matches Center</h3>
                <p className="text-zinc-500 text-xs">Track real-time scores and setup scheduled games</p>
              </div>
              <div className="flex gap-1 bg-[#121214] border border-zinc-800 rounded-lg p-1">
                {(["LIVE", "SCHEDULED", "COMPLETED"] as const).map((tab) => {
                  const isActive = matchTab === tab;
                  const count =
                    tab === "LIVE"
                      ? liveMatches.length
                      : tab === "SCHEDULED"
                      ? scheduledMatches.length
                      : completedMatches.length;

                  return (
                    <button
                      key={tab}
                      onClick={() => setMatchTab(tab)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                        isActive
                          ? "bg-white text-black"
                          : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      {tab}
                      {count > 0 && (
                        <span
                          className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full font-bold leading-none ${
                            isActive ? "bg-black/10 text-black" : "bg-zinc-800 text-zinc-400"
                          }`}
                        >
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Match Cards List */}
            {filteredMatches.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
                <Swords className="w-8 h-8 opacity-25" />
                <p className="text-xs font-semibold">No matches found in this state</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredMatches.map((m) => {
                  const teamAName = teamMap[m.teamAId] || "Team A";
                  const teamBName = teamMap[m.teamBId] || "Team B";
                  const tourName = tournamentMap[m.tournamentId] || "Tournament";

                  const overA = `${Math.floor(m.teamABalls / 6)}.${m.teamABalls % 6}`;
                  const overB = `${Math.floor(m.teamBBalls / 6)}.${m.teamBBalls % 6}`;

                  return (
                    <div
                      key={m._id}
                      className="bg-[#121214] border border-zinc-800 rounded-xl p-4 flex flex-col justify-between hover:border-zinc-700 transition-all"
                    >
                      <div className="space-y-3.5">
                        {/* Tournament & Date info */}
                        <div className="flex items-center justify-between text-[10px] text-zinc-500 font-bold uppercase tracking-wider pb-2 border-b border-zinc-800/30">
                          <span className="truncate max-w-[150px]">{tourName}</span>
                          <span className="flex items-center gap-1 shrink-0">
                            <Calendar className="w-3 h-3" />
                            {new Date(m.matchDate).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                            })}
                          </span>
                        </div>

                        {/* Scores details */}
                        <div className="space-y-2.5">
                          {/* Team A */}
                          <div className="flex justify-between items-center">
                            <span className="text-zinc-200 text-xs font-bold truncate max-w-[140px]">
                              {teamAName}
                            </span>
                            <span className="text-white text-xs font-extrabold tabular-nums">
                              {m.teamAScore}/{m.teamAWickets}{" "}
                              <span className="text-[10px] text-zinc-500 font-normal">({overA} ov)</span>
                            </span>
                          </div>
                          {/* Team B */}
                          <div className="flex justify-between items-center">
                            <span className="text-zinc-200 text-xs font-bold truncate max-w-[140px]">
                              {teamBName}
                            </span>
                            <span className="text-white text-xs font-extrabold tabular-nums">
                              {m.teamBBalls > 0 ? (
                                <>
                                  {m.teamBScore}/{m.teamBWickets}{" "}
                                  <span className="text-[10px] text-zinc-500 font-normal">({overB} ov)</span>
                                </>
                              ) : (
                                <span className="text-[10px] text-zinc-500 font-semibold italic">Yet to bat</span>
                              )}
                            </span>
                          </div>
                        </div>

                        {/* Winner/Status Alert */}
                        {m.matchStatus === "COMPLETED" && m.winnerTeamId && (
                          <div className="bg-zinc-800/40 border border-zinc-800 px-2.5 py-1.5 rounded-lg text-[10px] text-green-400 font-extrabold tracking-wide text-center">
                            🎉 {teamMap[m.winnerTeamId] || "Winner"} Won the match
                          </div>
                        )}
                      </div>

                      <div className="pt-4 mt-2 border-t border-zinc-800/30 flex justify-end">
                        <Link
                          to={`/scorecard/${m._id}`}
                          className="bg-[#fcf8e3] text-black font-semibold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 hover:bg-[#f5eea5] transition-colors"
                        >
                          {m.matchStatus === "SCHEDULED" ? (
                            <>
                              <Play className="w-3.5 h-3.5 text-black fill-black" /> Start & Score
                            </>
                          ) : m.matchStatus === "LIVE" ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" /> Live Scoring
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-3.5 h-3.5 text-black" /> View Scorecard
                            </>
                          )}
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Standings / Tournaments Block */}
          <div className="bg-[#1c1c1c] border border-zinc-800 rounded-xl p-5 space-y-4">
            <div>
              <h3 className="text-white font-bold text-base">Tournaments Dashboard</h3>
              <p className="text-zinc-500 text-xs">Quick shortcuts to ongoing tournaments</p>
            </div>

            {tournaments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
                <Trophy className="w-8 h-8 opacity-25" />
                <p className="text-xs font-semibold">No tournaments set up yet</p>
                <Link
                  to="/tournaments"
                  className="bg-[#fcf8e3] text-black font-semibold text-xs py-2 px-4 rounded-lg flex items-center justify-center hover:bg-[#f5eea5] transition-colors"
                >
                  Create One
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {tournaments.slice(0, 5).map((t) => (
                  <div
                    key={t._id}
                    onClick={() => navigate(`/tournaments/${t._id}`)}
                    className="bg-[#121214] border border-zinc-800 rounded-xl p-3 flex items-center justify-between hover:border-zinc-700 transition-all cursor-pointer group"
                  >
                    <div>
                      <h4 className="text-white text-xs font-bold group-hover:text-white/95 transition-colors">
                        {t.tournamentName}
                      </h4>
                      <p className="text-[10px] text-zinc-500 font-bold mt-1">
                        Format: <span className="text-zinc-350">{t.playingFormat}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[9px] font-extrabold tracking-wider px-2 py-0.5 rounded-full ${
                          t.playingStatus === "ONGOING"
                            ? "bg-blue-600/10 text-blue-400 border border-blue-600/20"
                            : t.playingStatus === "COMPLETED"
                            ? "bg-zinc-800 text-zinc-400"
                            : "bg-green-655/10 text-green-400 border border-green-600/20"
                        }`}
                      >
                        {t.playingStatus}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-zinc-650 group-hover:text-zinc-400 transition-colors" />
                    </div>
                  </div>
                ))}
                {tournaments.length > 5 && (
                  <Link
                    to="/tournaments"
                    className="block text-center text-xs font-bold text-zinc-400 hover:text-white transition-colors pt-2"
                  >
                    View All {tournaments.length} Tournaments →
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Leaderboard / Global Roster Highlights ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Top Batters */}
          <div className="bg-[#1c1c1c] border border-zinc-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-zinc-800/50 pb-3">
              <TrendingUp className="w-4 h-4 text-zinc-400" />
              <div>
                <h3 className="text-white font-bold text-sm">Top Run Scorers</h3>
                <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">Tournament Batting Leaders</p>
              </div>
            </div>

            {topBatters.length === 0 ? (
              <p className="text-zinc-500 text-xs italic py-4">No batter performance stats recorded yet.</p>
            ) : (
              <div className="divide-y divide-zinc-800/40">
                {topBatters.map((player, idx) => (
                  <div key={player._id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-zinc-500 font-extrabold w-4">{idx + 1}.</span>
                      <div>
                        <p className="text-white text-xs font-semibold">{player.fullName}</p>
                        <p className="text-[9px] text-zinc-500 font-bold uppercase mt-0.5">{player.playingRole}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white text-xs font-black tabular-nums">{player.totalRuns ?? 0}</p>
                      <p className="text-[9px] text-zinc-500 font-bold">Total Runs</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Bowlers */}
          <div className="bg-[#1c1c1c] border border-zinc-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-zinc-800/50 pb-3">
              <Award className="w-4 h-4 text-zinc-400" />
              <div>
                <h3 className="text-white font-bold text-sm">Top Wicket Takers</h3>
                <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">Tournament Bowling Leaders</p>
              </div>
            </div>

            {topBowlers.length === 0 ? (
              <p className="text-zinc-500 text-xs italic py-4">No bowler performance stats recorded yet.</p>
            ) : (
              <div className="divide-y divide-zinc-800/40">
                {topBowlers.map((player, idx) => (
                  <div key={player._id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-zinc-500 font-extrabold w-4">{idx + 1}.</span>
                      <div>
                        <p className="text-white text-xs font-semibold">{player.fullName}</p>
                        <p className="text-[9px] text-zinc-500 font-bold uppercase mt-0.5">{player.playingRole}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white text-xs font-black tabular-nums">{player.totalWickets ?? 0}</p>
                      <p className="text-[9px] text-zinc-500 font-bold">Total Wickets</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
