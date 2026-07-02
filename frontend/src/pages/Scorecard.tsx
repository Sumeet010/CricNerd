import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Loader2,
  ChevronLeft,
  AlertCircle,
  Undo2,
  RefreshCw,
  Play,
  CheckCircle,
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { matchService, squadService, ballService, tournamentService } from "@/services";
import type { Match, Team, Player, Tournament } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { socket } from "@/lib/socket";

type Tab = "Live Score" | "Scorecard" | "Over Log";

export default function Scorecard() {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Core state
  const [match, setMatch] = useState<Match | null>(null);
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [teamA, setTeamA] = useState<Team | null>(null);
  const [teamB, setTeamB] = useState<Team | null>(null);
  const [squadA, setSquadA] = useState<Player[]>([]); // Team A roster
  const [squadB, setSquadB] = useState<Player[]>([]); // Team B roster
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Scorecard / Statistics from backend
  const [scorecardData, setScorecardData] = useState<{
    batters: { playerId?: string; playerName: string; runs: number; balls: number }[];
    bowlers: { playerId?: string; playerName: string; wickets: number; runsConceded: number; overs: string }[];
    ballsCommentary: (string | number)[];
    dismissedPlayerIds: string[];
    allBalls: any[];
  } | null>(null);

  // Scoring controls state
  const [activeTab, setActiveTab] = useState<Tab>(
    window.location.pathname.includes("/live-scoring") ? "Live Score" : "Scorecard"
  );
  const [battingTeamId, setBattingTeamId] = useState<string>("");
  const [strikerId, setStrikerId] = useState<string>("");
  const [bowlerId, setBowlerId] = useState<string>("");

  // Ball inputs state
  const [runsOffBat, setRunsOffBat] = useState<number>(0);
  const [extraType, setExtraType] = useState<"NONE" | "WIDE" | "NO_BALL">("NONE");
  const [isWicket, setIsWicket] = useState<boolean>(false);
  const [wicketType, setWicketType] = useState<"BOWLED" | "CAUGHT" | "STUMPED" | "HIT_WICKET">("BOWLED");

  // UX states
  const [recording, setRecording] = useState(false);
  const [scoringError, setScoringError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("Just now");

  const isOwner = !!(user && tournament && user._id === tournament.organizerId);

  useEffect(() => {
    if (tournament) {
      const isOwnerNow = !!(user && user._id === tournament.organizerId);
      if (!isOwnerNow && activeTab === "Live Score") {
        setActiveTab("Scorecard");
      }
    }
  }, [tournament, user, activeTab]);
  const battingSquad = battingTeamId === match?.teamAId ? squadA : squadB;
  const bowlingSquad = battingTeamId === match?.teamAId ? squadB : squadA;

  // Calculate current over and ball numbers based on recorded deliveries
  const battingBalls = battingTeamId === match?.teamAId ? (match?.teamABalls ?? 0) : (match?.teamBBalls ?? 0);
  const nextOverNumber = Math.floor(battingBalls / 6) + 1;
  const nextBallNumber = (battingBalls % 6) + 1;

  // Target and chase calculations
  const isTeamABatting = battingTeamId === match?.teamAId;
  const isSecondInnings = isTeamABatting
    ? (match ? match.teamBBalls > 0 : false)
    : (match ? match.teamABalls > 0 : false);
  const firstInningsScore = isTeamABatting ? (match?.teamBScore ?? 0) : (match?.teamAScore ?? 0);
  const currentBattingScore = isTeamABatting ? (match?.teamAScore ?? 0) : (match?.teamBScore ?? 0);
  const targetVal = isSecondInnings ? firstInningsScore + 1 : null;
  const runsNeeded = targetVal !== null ? targetVal - currentBattingScore : null;

  // Innings completion checks
  const currentWickets = battingTeamId === match?.teamAId ? (match?.teamAWickets ?? 0) : (match?.teamBWickets ?? 0);
  const maxWickets = battingSquad.length > 0 ? battingSquad.length : 10;
  const isAllOut = currentWickets >= maxWickets;

  let maxOvers = 20;
  if (tournament) {
    if (tournament.playingFormat === "5 Overs") maxOvers = 5;
    else if (tournament.playingFormat === "6 Overs") maxOvers = 6;
    else if (tournament.playingFormat === "20 Overs") maxOvers = 20;
  }
  const isOversCompleted = Math.floor(battingBalls / 6) >= maxOvers;
  const isInningsComplete = isAllOut || isOversCompleted;

  // Load match and related tournament/squad data
  const loadMatchData = async () => {
    if (!matchId) return;
    try {
      const matchRes = await matchService.getById(matchId);
      const m = matchRes.matchExist;
      setMatch(m);

      // Load tournament
      const tourRes = await tournamentService.getById(m.tournamentId);
      const tour = tourRes.singleTournament;
      setTournament(tour);

      const isOwnerNow = !!(user && tour && user._id === tour.organizerId);
      if (isOwnerNow && m.matchStatus !== "COMPLETED") {
        setActiveTab("Live Score");
      } else {
        setActiveTab("Scorecard");
      }

      // Load squads
      const [sqARes, sqBRes] = await Promise.all([
        squadService.getTeamSquad(m.tournamentId, m.teamAId),
        squadService.getTeamSquad(m.tournamentId, m.teamBId),
      ]);

      const playersA = (sqARes.foundSquad ?? []).map((item: any) => item.playerId).filter(Boolean);
      const playersB = (sqBRes.foundSquad ?? []).map((item: any) => item.playerId).filter(Boolean);
      setSquadA(playersA);
      setSquadB(playersB);

      // Fetch team scorecard details
      const scorecardRes = await matchService.getScorecard(matchId);
      setScorecardData(scorecardRes as any);
      
      // We can mock or populate teams based on scorecard response
      setTeamA({ _id: m.teamAId, teamName: scorecardRes.matchScore.teamA.teamName, tournamentId: m.tournamentId, tournamentWins: 0 });
      setTeamB({ _id: m.teamBId, teamName: scorecardRes.matchScore.teamB.teamName, tournamentId: m.tournamentId, tournamentWins: 0 });

      // Default batting team is Team A
      if (!battingTeamId) {
        setBattingTeamId(m.teamAId);
      }

      setLastUpdated("Just now");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load scorecard details");
    } finally {
      setLoading(false);
    }
  };

  // Load only match and scorecard data (lightweight refresh for active scoring)
  const refreshMatchAndScorecard = async () => {
    if (!matchId) return;
    try {
      const [matchRes, scorecardRes] = await Promise.all([
        matchService.getById(matchId),
        matchService.getScorecard(matchId),
      ]);
      setMatch(matchRes.matchExist);
      setScorecardData(scorecardRes as any);
      setLastUpdated("Just now");
    } catch (err: any) {
      console.error("Failed to refresh live match state:", err);
    }
  };

  useEffect(() => {
    loadMatchData();
    const timer = setInterval(() => {
      setLastUpdated("a few seconds ago");
    }, 15000);
    return () => clearInterval(timer);
  }, [matchId]);

  useEffect(() => {
    if (!matchId) return;

    // Join the match socket room
    socket.emit("joinMatch", matchId);

    // Listen for scorecard updates
    const handleScorecardUpdate = (data: any) => {
      console.log("Received scorecard update via socket:", data);
      if (data) {
        setScorecardData(data);
        setMatch((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            teamAScore: data.matchScore.teamA.teamAScore,
            teamAWickets: data.matchScore.teamA.teamAWickets,
            teamABalls: data.matchScore.teamA.teamABalls,
            teamBScore: data.matchScore.teamB.teamBScore,
            teamBWickets: data.matchScore.teamB.teamBWickets,
            teamBBalls: data.matchScore.teamB.teamBBalls,
            matchStatus: data.matchStatus,
            winnerTeamId: data.winnerTeamId,
          };
        });
      }
    };

    socket.on("scorecardUpdate", handleScorecardUpdate);

    return () => {
      socket.emit("leaveMatch", matchId);
      socket.off("scorecardUpdate", handleScorecardUpdate);
    };
  }, [matchId]);

  // Keep battingTeamId in sync for viewers/players when innings switches
  useEffect(() => {
    if (isOwner) return; // Organizer controls this manually via UI

    if (match) {
      // Find the last recorded ball
      const lastBall: any = scorecardData?.allBalls
        ?.slice()
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

      if (lastBall) {
        let currentBatting = lastBall.battingTeamId;

        // Check if that team's innings is already complete (all out or overs done)
        const isTeamA = currentBatting === match.teamAId;
        const balls = isTeamA ? match.teamABalls : match.teamBBalls;
        const wickets = isTeamA ? match.teamAWickets : match.teamBWickets;
        const squad = isTeamA ? squadA : squadB;
        const maxW = squad.length > 0 ? squad.length : 10;
        
        let maxO = 20;
        if (tournament) {
          if (tournament.playingFormat === "5 Overs") maxO = 5;
          else if (tournament.playingFormat === "6 Overs") maxO = 6;
          else if (tournament.playingFormat === "20 Overs") maxO = 20;
        }

        const isComplete = wickets >= maxW || Math.floor(balls / 6) >= maxO;

        if (isComplete) {
          // If the last ball's batting team is complete, switch to the other team
          currentBatting = isTeamA ? match.teamBId : match.teamAId;
        }

        if (battingTeamId !== currentBatting) {
          setBattingTeamId(currentBatting);
        }
      } else {
        // No balls bowled yet -> default to Team A
        if (battingTeamId !== match.teamAId) {
          setBattingTeamId(match.teamAId);
        }
      }
    }
  }, [scorecardData, match, isOwner, squadA, squadB, tournament, battingTeamId]);

  const handleRefresh = async () => {
    setLoading(true);
    await loadMatchData();
  };

  // Switch batting team (innings change)
  const handleToggleInnings = () => {
    if (!match) return;
    const nextBatting = battingTeamId === match.teamAId ? match.teamBId : match.teamAId;
    setBattingTeamId(nextBatting);
    setStrikerId("");
    setBowlerId("");
    setScoringError(null);
  };

  // Record a delivery ball
  const handleRecordBall = async () => {
    if (!match || !matchId) return;
    setScoringError(null);
    setSuccessMsg(null);

    if (isInningsComplete) {
      setScoringError(isAllOut ? "Batting team is all out. Innings is complete." : "Maximum overs reached. Innings is complete.");
      return;
    }

    if (!strikerId) {
      setScoringError("Please select a Striker.");
      return;
    }
    if (!bowlerId) {
      setScoringError("Please select a Bowler.");
      return;
    }

    setRecording(true);

    try {
      // Calculate extra runs: Wide and No Ball automatically count as 1 extra run
      const extraRuns = extraType !== "NONE" ? 1 : 0;

      const payload = {
        matchId,
        battingTeamId,
        bowlingTeamId: battingTeamId === match.teamAId ? match.teamBId : match.teamAId,
        strikerId,
        bowlerId,
        overNumber: nextOverNumber,
        ballNumber: nextBallNumber,
        runsOffBat,
        extraRuns,
        extraType,
        isWicket,
        dismissedPlayerId: isWicket ? strikerId : undefined,
        wicketType: isWicket ? wicketType : undefined,
      };

      await ballService.addBall(payload);
      setSuccessMsg("Delivery recorded successfully!");

      // Reset fast inputs
      setRunsOffBat(0);
      setExtraType("NONE");
      setIsWicket(false);

      // If a wicket fell, we need to reset the striker so organizer chooses the new batter
      if (isWicket) {
        setStrikerId("");
      }

      // Reload match details and stats in the background without blocking the UI thread
      refreshMatchAndScorecard();
    } catch (err: any) {
      console.error(err);
      setScoringError(err.message || "Failed to record delivery. Check team rosters and match details.");
    } finally {
      setRecording(false);
    }
  };

  // Undo the last delivery recorded
  const handleUndoBall = async () => {
    if (!match || !matchId) return;
    if (!window.confirm("Are you sure you want to undo the last delivery?")) return;

    setRecording(true);
    setScoringError(null);
    setSuccessMsg(null);

    try {
      await ballService.undoBall({ matchId });
      setSuccessMsg("Last delivery undone successfully!");
      // Reload in the background without blocking the UI thread
      refreshMatchAndScorecard();
    } catch (err: any) {
      console.error(err);
      setScoringError(err.message || "Failed to undo last ball.");
    } finally {
      setRecording(false);
    }
  };

  // End match / End Innings
  const handleEndMatch = async () => {
    if (!matchId || !window.confirm("Are you sure you want to end this match/innings? This will complete the match and update player statistics.")) return;
    try {
      await matchService.endMatch(matchId);
      alert("Match completed successfully!");
      loadMatchData();
    } catch (err: any) {
      alert(err.message || "Failed to end match.");
    }
  };

  // Start the match (change status from SCHEDULED to LIVE)
  const handleStartMatch = async () => {
    if (!matchId) return;
    try {
      await matchService.updateStatus(matchId, { matchStatus: "LIVE" });
      alert("Match is now LIVE!");
      loadMatchData();
    } catch (err: any) {
      alert(err.message || "Failed to start match.");
    }
  };

  if (loading && !match) {
    return (
      <Layout title="Match Dashboard" subtitle="SCORECARD">
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-white" />
          <span className="text-zinc-500 text-xs uppercase tracking-wider font-bold">Loading match statistics...</span>
        </div>
      </Layout>
    );
  }

  if (error || !match) {
    return (
      <Layout title="Match Dashboard" subtitle="SCORECARD">
        <div className="max-w-md mx-auto my-12 bg-red-950/20 border border-red-900 rounded-xl p-6 text-center">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <h3 className="text-white font-bold text-base mb-1">Failed to load match</h3>
          <p className="text-red-400 text-xs mb-4">{error || "Match not found"}</p>
          <Link to="/tournaments" className="text-white bg-zinc-800 hover:bg-zinc-700 text-xs px-4 py-2 rounded-lg font-semibold inline-block">
            Back to Tournaments
          </Link>
        </div>
      </Layout>
    );
  }

  // Filter roster options based on dismissal status
  const dismissedIds = scorecardData?.dismissedPlayerIds ?? [];
  const availableBatters = battingSquad.filter((p) => !dismissedIds.includes(p._id));

  // Determine current over visual logs
  const currentOverBalls = scorecardData?.allBalls
    ?.filter((b: any) => b.battingTeamId === battingTeamId && b.overNumber === nextOverNumber)
    ?.sort((a: any, b: any) => a.createdAt - b.createdAt) ?? [];

  // Derive current active striker & bowler from the last recorded ball.
  // For the organizer the local picker state (strikerId/bowlerId) takes precedence
  // since they may have already selected the next pair before recording.
  // For players/viewers these will always be "" so we fall back to the last ball.
  const lastBall: any = scorecardData?.allBalls
    ?.slice()
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

  const activeBattingTeamId = battingTeamId || lastBall?.battingTeamId || "";

  // Only use striker/bowler from last ball if it was bowled in the current innings
  const lastBallMatchesCurrentInnings = lastBall && lastBall.battingTeamId === activeBattingTeamId;

  const activeStrikerId  = strikerId  || (lastBallMatchesCurrentInnings ? lastBall?.strikerId : "") || "";
  const activeBowlerId   = bowlerId   || (lastBallMatchesCurrentInnings ? lastBall?.bowlerId : "")  || "";

  const activeBattingSquad = activeBattingTeamId === match?.teamAId ? squadA : squadB;
  const activeBowlingSquad = activeBattingTeamId === match?.teamAId ? squadB : squadA;


  return (
    <Layout title="Live Scorecard" subtitle="MATCH DASHBOARD">
      <div className="space-y-6 pb-12">
        
        {/* ── Back button & Top bar actions ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-zinc-800/80 pb-4">
          <button
            onClick={() => navigate(`/tournaments/${tournament?._id}`)}
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Back to {tournament?.tournamentName || "Tournament"}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="bg-[#18181b] border border-zinc-800 text-zinc-400 hover:text-white p-2 rounded-xl transition-colors"
              title="Refresh Stats"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            {isOwner && match.matchStatus === "LIVE" && (
              <button
                onClick={handleEndMatch}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-lg shadow-red-600/10 flex items-center gap-1.5"
              >
                <CheckCircle className="w-3.5 h-3.5" /> End Innings
              </button>
            )}
          </div>
        </div>

        {/* ── Match Scores Summary Header Card ── */}
        <div className="bg-[#121214] border border-zinc-800/80 rounded-2xl p-6 relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-6">
            
            {/* Team A Details */}
            <div
              onClick={() => {
                if (isOwner && match.matchStatus !== "COMPLETED") {
                  setBattingTeamId(match.teamAId);
                  setStrikerId("");
                  setBowlerId("");
                  setScoringError(null);
                }
              }}
              title={isOwner && match.matchStatus !== "COMPLETED" ? `Switch active batting team to ${teamA?.teamName || "Team A"}` : undefined}
              className={`flex items-center gap-4 transition-all ${
                isOwner && match.matchStatus !== "COMPLETED" ? "cursor-pointer hover:opacity-100" : ""
              } ${battingTeamId === match.teamAId ? "opacity-100" : "opacity-60"}`}
            >
              <div className="w-14 h-14 rounded-2xl bg-zinc-800/80 border border-zinc-700 flex items-center justify-center font-bold text-white text-lg">
                {teamA ? teamA.teamName.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2) : "A"}
              </div>
              <div className="min-w-0">
                <h3 className="text-white font-bold text-base truncate">{teamA?.teamName || "Team A"}</h3>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl font-black text-white">{match.teamAScore}/{match.teamAWickets}</span>
                  <span className="text-zinc-500 text-xs font-semibold">({Math.floor(match.teamABalls / 6)}.{match.teamABalls % 6} ov)</span>
                </div>
              </div>
            </div>

            {/* Toss & Live Status */}
            <div className="flex flex-col items-center text-center px-4 py-2 bg-zinc-900/40 border border-zinc-800/40 rounded-xl">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider ${
                match.matchStatus === "LIVE" ? "bg-red-600/15 text-red-400 border border-red-600/35 animate-pulse" : "bg-zinc-800 text-zinc-400"
              }`}>
                {match.matchStatus}
              </span>
            </div>

            {/* Team B Details */}
            <div
              onClick={() => {
                if (isOwner && match.matchStatus !== "COMPLETED") {
                  setBattingTeamId(match.teamBId);
                  setStrikerId("");
                  setBowlerId("");
                  setScoringError(null);
                }
              }}
              title={isOwner && match.matchStatus !== "COMPLETED" ? `Switch active batting team to ${teamB?.teamName || "Team B"}` : undefined}
              className={`flex items-center gap-4 justify-start md:justify-end transition-all ${
                isOwner && match.matchStatus !== "COMPLETED" ? "cursor-pointer hover:opacity-100" : ""
              } ${battingTeamId === match.teamBId ? "opacity-100" : "opacity-60"}`}
            >
              <div className="min-w-0 text-left md:text-right order-2 md:order-1">
                <h3 className="text-white font-bold text-base truncate">{teamB?.teamName || "Team B"}</h3>
                <div className="flex items-baseline gap-2 mt-0.5 justify-start md:justify-end">
                  <span className="text-2xl font-black text-white">
                    {match.teamBBalls > 0 ? `${match.teamBScore}/${match.teamBWickets}` : "Yet to bat"}
                  </span>
                  {match.teamBBalls > 0 && (
                    <span className="text-zinc-500 text-xs font-semibold">({Math.floor(match.teamBBalls / 6)}.{match.teamBBalls % 6} ov)</span>
                  )}
                </div>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-zinc-800/80 border border-zinc-700 flex items-center justify-center font-bold text-white text-lg order-1 md:order-2">
                {teamB ? teamB.teamName.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2) : "B"}
              </div>
            </div>

          </div>
        </div>

        {/* ── Navigation Tabs Bar ── */}
        <div className="flex gap-1.5 border-b border-zinc-800/80 pb-0.5">
          {(["Live Score", "Scorecard", "Over Log"] as const).map((tab) => {
            if (tab === "Live Score" && (!isOwner || match.matchStatus === "COMPLETED")) return null;
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-4 py-2.5 text-xs font-bold tracking-wider transition-colors border-b-2 ${
                  isActive ? "text-white border-white" : "text-zinc-500 border-transparent hover:text-zinc-300"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* ── Main 2-Column Dashboard Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* LEFT/CENTER Column - Principal controls or scorecard */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* TAB: Live Score / Interactive Scorer */}
            {activeTab === "Live Score" && isOwner && match.matchStatus !== "COMPLETED" && (
              <div className="bg-[#161618] border border-zinc-800/80 rounded-2xl p-6 space-y-6">
                
                {match.matchStatus === "SCHEDULED" ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center space-y-5">
                    <div className="w-16 h-16 rounded-2xl bg-zinc-900/50 flex items-center justify-center border border-zinc-800">
                      <Play className="w-6 h-6 text-zinc-400 fill-zinc-400 ml-1" />
                    </div>
                    <div className="space-y-1.5 max-w-sm">
                      <h3 className="text-white font-bold text-base">Match is Scheduled</h3>
                      <p className="text-zinc-500 text-xs leading-relaxed">
                        This match has not started yet. Once the toss is complete and the teams are ready, click the button below to start the match.
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
                      <button
                        onClick={handleStartMatch}
                        className="w-full sm:w-auto bg-white hover:bg-zinc-200 text-black font-extrabold text-xs px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-white/5 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Play className="w-4 h-4 fill-black" /> Start Match
                      </button>
                      <button
                        onClick={handleToggleInnings}
                        className="w-full sm:w-auto bg-[#1c1c1f] hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-extrabold text-xs px-6 py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <RefreshCw className="w-4 h-4" /> Change Batting Team
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Headers & Innings Toggle */}
                    <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
                      <div>
                        <h3 className="text-white font-bold text-sm">Live Scorer</h3>
                        <p className="text-zinc-500 text-[11px] mt-0.5">Record individual deliveries below to update scores </p>
                      </div>
                      <button
                        onClick={handleToggleInnings}
                        className="bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition-colors"
                      >
                        Switch Innings
                      </button>
                    </div>

                    {/* Match Errors / Success Banner */}
                    {scoringError && (
                      <div className="bg-red-950/30 border border-red-800/50 text-red-400 text-xs p-3.5 rounded-xl flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{scoringError}</span>
                      </div>
                    )}
                    {successMsg && (
                      <div className="bg-green-950/20 border border-green-800/40 text-green-400 text-xs p-3.5 rounded-xl flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 shrink-0" />
                        <span>{successMsg}</span>
                      </div>
                    )}

                    {/* 1. Selection Fields (Striker, Non-Striker, Bowler) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      {/* Striker Select */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider">Striker (Batting)</label>
                        {isInningsComplete ? (
                          <div className="w-full bg-[#1c1c1f]/40 border border-dashed border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-500 font-semibold italic">
                            {isAllOut ? "All Out / Innings Complete" : "Overs Completed"}
                          </div>
                        ) : (
                          <select
                            value={strikerId}
                            onChange={(e) => setStrikerId(e.target.value)}
                            className="w-full bg-[#1c1c1f] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-semibold focus:outline-none focus:border-zinc-700"
                          >
                            <option value="">-- Select Striker --</option>
                            {availableBatters.map((p) => (
                              <option key={p._id} value={p._id}>
                                {p.fullName}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>

                      {/* Bowler Select */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider">Bowler (Bowling)</label>
                        <select
                          value={bowlerId}
                          onChange={(e) => setBowlerId(e.target.value)}
                          className="w-full bg-[#1c1c1f] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-semibold focus:outline-none focus:border-zinc-700"
                        >
                          <option value="">-- Select Bowler --</option>
                          {bowlingSquad.map((p) => (
                            <option key={p._id} value={p._id}>
                              {p.fullName} ({p.playingRole})
                            </option>
                          ))}
                        </select>
                      </div>

                    </div>

                    {/* 2. Interactive Scoring Control Panels */}
                    <div className="bg-[#121214] border border-zinc-800/60 rounded-xl p-5 space-y-5">
                      <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider block">Quick Scoring Options</span>
                      
                      {/* Runs Grid */}
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                        {([0, 1, 2, 3, 4, 6] as const).map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => {
                              setRunsOffBat(r);
                              setExtraType("NONE");
                            }}
                            className={`py-3.5 rounded-xl font-black text-sm transition-all border ${
                              runsOffBat === r && extraType === "NONE" && !isWicket
                                ? "bg-white text-black border-white shadow-md shadow-white/5 scale-[1.03]"
                                : "bg-[#18181b] text-zinc-400 border-zinc-800/80 hover:text-white hover:border-zinc-700"
                            }`}
                          >
                            {r === 0 ? "0 (Dot)" : r}
                          </button>
                        ))}
                      </div>

                      {/* Extras and Wicket Controls */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                        
                        {/* Extra delivery select */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider">Extra Delivery Type</label>
                          <div className="flex gap-2">
                            {(["NONE", "WIDE", "NO_BALL"] as const).map((ext) => (
                              <button
                                key={ext}
                                type="button"
                                onClick={() => {
                                  setExtraType(ext);
                                  if (ext === "WIDE") setRunsOffBat(0); // backend constraint validation
                                }}
                                className={`flex-1 py-2 rounded-lg text-[10px] font-bold tracking-wider transition-all border ${
                                  extraType === ext
                                    ? "bg-purple-600/10 text-purple-400 border-purple-600/40"
                                    : "bg-[#18181b] text-zinc-500 border-zinc-800/80 hover:text-zinc-300"
                                }`}
                              >
                                {ext === "NONE" ? "Legal" : ext === "WIDE" ? "Wide" : "No Ball"}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Is Wicket Toggle */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider">Wicket Fallen?</label>
                          <button
                            type="button"
                            onClick={() => setIsWicket(!isWicket)}
                            className={`w-full py-2 rounded-lg text-[10px] font-extrabold tracking-wider transition-all border flex items-center justify-center gap-1 ${
                              isWicket
                                ? "bg-red-600 text-white border-red-600 shadow-lg shadow-red-600/10"
                                : "bg-[#18181b] text-zinc-500 border-zinc-800/80 hover:text-zinc-300"
                            }`}
                          >
                            {isWicket ? "🔥 WICKET ON THIS BALL" : "No Wicket"}
                          </button>
                        </div>

                        {/* Wicket Dismissal Type */}
                        {isWicket && (
                          <div className="space-y-1.5 animate-fade-in">
                            <label className="text-[10px] text-red-400 font-extrabold uppercase tracking-wider">Dismissal Type</label>
                            <select
                              value={wicketType}
                              onChange={(e: any) => setWicketType(e.target.value)}
                              className="w-full bg-[#1c1c1f] border border-red-900/50 rounded-lg px-2.5 py-1.5 text-xs text-red-300 font-semibold focus:outline-none"
                            >
                              <option value="BOWLED">Bowled</option>
                              <option value="CAUGHT">Caught</option>
                              <option value="STUMPED">Stumped</option>
                              <option value="HIT_WICKET">Hit Wicket</option>
                            </select>
                          </div>
                        )}

                      </div>
                    </div>

                    {/* Submit & Undo buttons */}
                    <div className="grid grid-cols-4 gap-2">
                      <button
                        type="button"
                        onClick={handleRecordBall}
                        disabled={recording || isInningsComplete}
                        className="col-span-3 bg-white hover:bg-zinc-200 text-black font-extrabold text-xs py-3.5 rounded-xl transition-all shadow-lg shadow-white/5 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {recording ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Recording Ball...
                          </>
                        ) : isInningsComplete ? (
                          <>
                            Innings Complete
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-black" />
                            Record Delivery (Ball {Math.floor(battingBalls / 6)}.{nextBallNumber})
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={handleUndoBall}
                        disabled={recording}
                        title="Undo Last Ball"
                        className="bg-zinc-800 hover:bg-zinc-700 text-white font-extrabold text-xs py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Undo2 className="w-4.5 h-4.5" />
                        Undo
                      </button>
                    </div>
                  </>
                )}

              </div>
            )}

            {/* TAB: Scorecard Tables */}
            {activeTab === "Scorecard" && (() => {
              const isTeamAPlayer = (playerId?: string, playerName?: string) => {
                return squadA.some(p => p._id === playerId || p.fullName === playerName);
              };

              const isTeamBPlayer = (playerId?: string, playerName?: string) => {
                return squadB.some(p => p._id === playerId || p.fullName === playerName);
              };

              const teamABatters = scorecardData?.batters?.filter(b => isTeamAPlayer(b.playerId, b.playerName)) ?? [];
              const teamBBatters = scorecardData?.batters?.filter(b => isTeamBPlayer(b.playerId, b.playerName)) ?? [];

              const teamABowlers = scorecardData?.bowlers?.filter(b => isTeamAPlayer(b.playerId, b.playerName)) ?? [];
              const teamBBowlers = scorecardData?.bowlers?.filter(b => isTeamBPlayer(b.playerId, b.playerName)) ?? [];

              return (
                <div className="space-y-8">
                  
                  {/* Innings 1 / Team A scorecard */}
                  <div className="bg-[#161618] border border-zinc-800/80 rounded-2xl overflow-hidden p-6 space-y-6">
                    <div className="border-b border-zinc-800/80 pb-3 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h3 className="text-white font-bold text-sm">{teamA?.teamName} Innings</h3>
                        <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">1st Innings Scorecard</span>
                      </div>
                      <span className="text-zinc-400 text-xs font-black bg-zinc-900 border border-zinc-800/60 px-3 py-1.5 rounded-lg">
                        {match.teamAScore}/{match.teamAWickets} ({Math.floor(match.teamABalls / 6)}.{match.teamABalls % 6} ov)
                      </span>
                    </div>

                    {/* Batters stats table */}
                    <div className="space-y-3">
                      <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider block">Batting</span>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="text-zinc-500 font-extrabold uppercase border-b border-zinc-800 pb-2">
                              <th className="py-2">Batter</th>
                              <th className="py-2 text-right">Runs</th>
                              <th className="py-2 text-right">Balls</th>
                              <th className="py-2 text-right">SR</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-900/60">
                            {teamABatters.length > 0 ? (
                              teamABatters.map((b, idx) => (
                                <tr key={idx} className="text-zinc-300 font-semibold hover:bg-zinc-800/10">
                                  <td className="py-3 text-white">{b.playerName}</td>
                                  <td className="py-3 text-right text-white font-bold">{b.runs}</td>
                                  <td className="py-3 text-right text-zinc-400">{b.balls}</td>
                                  <td className="py-3 text-right text-zinc-400 font-bold">
                                    {b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(1) : "0.0"}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={4} className="py-6 text-center text-zinc-650 font-medium">No batting statistics recorded for this innings</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Bowlers stats table */}
                    <div className="space-y-3 pt-2">
                      <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider block">Bowling</span>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="text-zinc-500 font-extrabold uppercase border-b border-zinc-800 pb-2">
                              <th className="py-2">Bowler</th>
                              <th className="py-2 text-right">Overs</th>
                              <th className="py-2 text-right">Runs</th>
                              <th className="py-2 text-right">Wickets</th>
                              <th className="py-2 text-right">Econ</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-900/60">
                            {teamBBowlers.length > 0 ? (
                              teamBBowlers.map((b, idx) => (
                                <tr key={idx} className="text-zinc-300 font-semibold hover:bg-zinc-800/10">
                                  <td className="py-3 text-white">{b.playerName}</td>
                                  <td className="py-3 text-right text-zinc-400">{b.overs}</td>
                                  <td className="py-3 text-right text-white font-bold">{b.runsConceded}</td>
                                  <td className="py-3 text-right text-white font-bold">{b.wickets}</td>
                                  <td className="py-3 text-right text-zinc-400 font-bold">
                                    {parseFloat(b.overs) > 0 ? (b.runsConceded / parseFloat(b.overs)).toFixed(2) : "0.00"}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={5} className="py-6 text-center text-zinc-650 font-medium">No bowling statistics recorded for this innings</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Innings 2 / Team B scorecard */}
                  <div className="bg-[#161618] border border-zinc-800/80 rounded-2xl overflow-hidden p-6 space-y-6">
                    <div className="border-b border-zinc-800/80 pb-3 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h3 className="text-white font-bold text-sm">{teamB?.teamName} Innings</h3>
                        <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">2nd Innings Scorecard</span>
                      </div>
                      <span className="text-zinc-400 text-xs font-black bg-zinc-900 border border-zinc-800/60 px-3 py-1.5 rounded-lg">
                        {(match.teamBBalls > 0 || match.teamBWickets > 0 || match.teamBScore > 0) ? `${match.teamBScore}/${match.teamBWickets} (${Math.floor(match.teamBBalls / 6)}.${match.teamBBalls % 6} ov)` : "Yet to bat"}
                      </span>
                    </div>

                    {/* Batters stats table */}
                    <div className="space-y-3">
                      <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider block">Batting</span>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="text-zinc-500 font-extrabold uppercase border-b border-zinc-800 pb-2">
                              <th className="py-2">Batter</th>
                              <th className="py-2 text-right">Runs</th>
                              <th className="py-2 text-right">Balls</th>
                              <th className="py-2 text-right">SR</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-900/60">
                            {teamBBatters.length > 0 ? (
                              teamBBatters.map((b, idx) => (
                                <tr key={idx} className="text-zinc-300 font-semibold hover:bg-zinc-800/10">
                                  <td className="py-3 text-white">{b.playerName}</td>
                                  <td className="py-3 text-right text-white font-bold">{b.runs}</td>
                                  <td className="py-3 text-right text-zinc-400">{b.balls}</td>
                                  <td className="py-3 text-right text-zinc-400 font-bold">
                                    {b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(1) : "0.0"}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={4} className="py-6 text-center text-zinc-650 font-medium">No batting statistics recorded for this innings</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Bowlers stats table */}
                    <div className="space-y-3 pt-2">
                      <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider block">Bowling</span>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="text-zinc-500 font-extrabold uppercase border-b border-zinc-800 pb-2">
                              <th className="py-2">Bowler</th>
                              <th className="py-2 text-right">Overs</th>
                              <th className="py-2 text-right">Runs</th>
                              <th className="py-2 text-right">Wickets</th>
                              <th className="py-2 text-right">Econ</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-900/60">
                            {teamABowlers.length > 0 ? (
                              teamABowlers.map((b, idx) => (
                                <tr key={idx} className="text-zinc-300 font-semibold hover:bg-zinc-800/10">
                                  <td className="py-3 text-white">{b.playerName}</td>
                                  <td className="py-3 text-right text-zinc-400">{b.overs}</td>
                                  <td className="py-3 text-right text-white font-bold">{b.runsConceded}</td>
                                  <td className="py-3 text-right text-white font-bold">{b.wickets}</td>
                                  <td className="py-3 text-right text-zinc-400 font-bold">
                                    {parseFloat(b.overs) > 0 ? (b.runsConceded / parseFloat(b.overs)).toFixed(2) : "0.00"}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={5} className="py-6 text-center text-zinc-650 font-medium">No bowling statistics recorded for this innings</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                </div>
              );
            })()}

            {/* TAB: Over Log */}
            {activeTab === "Over Log" && (
              <div className="bg-[#161618] border border-zinc-800/80 rounded-2xl p-6 space-y-4">
                <div className="border-b border-zinc-800/80 pb-3">
                  <h3 className="text-white font-bold text-sm">Match Deliveries Log</h3>
                </div>
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {scorecardData?.allBalls && scorecardData.allBalls.length > 0 ? (
                    [...scorecardData.allBalls].reverse().map((ball: any, idx) => {
                      const batterName = battingSquad.find(p => p._id === ball.strikerId)?.fullName || "Striker";
                      const bowlerName = bowlingSquad.find(p => p._id === ball.bowlerId)?.fullName || "Bowler";
                      return (
                        <div key={idx} className="bg-[#121214] border border-zinc-800/60 rounded-xl p-3.5 flex items-center justify-between text-xs font-semibold text-zinc-400">
                          <div>
                            <span className="text-white font-extrabold mr-2">{(ball.overNumber - 1)}.{ball.ballNumber}</span>
                            <span>{bowlerName} to {batterName}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            {ball.extraType !== "NONE" && (
                              <span className="text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">{ball.extraType}</span>
                            )}
                            {ball.isWicket ? (
                              <span className="text-red-400 bg-red-500/10 px-2 py-0.5 rounded font-black border border-red-500/20">W</span>
                            ) : (
                              <span className="text-white font-bold text-sm bg-zinc-800/80 px-2 py-0.5 rounded">{ball.runsOffBat} runs</span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-12 text-zinc-600 font-medium">No deliveries logged in this match yet</div>
                  )}
                </div>
              </div>
            )}

          </div>

          {/* RIGHT Sidebar Panel - Stats, active players, and current over */}
          <div className="space-y-6">
            
            {/* Over Summary Circles Panel */}
            <div className="bg-[#161618] border border-zinc-800/80 rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider">Over Summary</span>
                <span className="text-zinc-400 text-xs font-bold">Over {nextOverNumber}</span>
              </div>
              <div className="flex flex-wrap gap-2 py-1">
                {currentOverBalls.length > 0 ? (
                  currentOverBalls.map((b: any, index: number) => {
                    let circleColor = "bg-zinc-800 text-zinc-400";
                    let label = b.runsOffBat.toString();

                    if (b.isWicket) {
                      circleColor = "bg-red-600 text-white font-black";
                      label = "W";
                    } else if (b.extraType === "WIDE") {
                      circleColor = "bg-purple-600/20 text-purple-400 font-bold border border-purple-500/25";
                      label = "WD";
                    } else if (b.extraType === "NO_BALL") {
                      circleColor = "bg-orange-600/20 text-orange-400 font-bold border border-orange-500/25";
                      label = "NB";
                    } else if (b.runsOffBat === 4) {
                      circleColor = "bg-blue-600 text-white font-black";
                    } else if (b.runsOffBat === 6) {
                      circleColor = "bg-yellow-600 text-black font-black";
                    } else if (b.runsOffBat > 0) {
                      circleColor = "bg-green-600 text-white font-black";
                    }

                    return (
                      <div
                        key={index}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-semibold select-none ${circleColor}`}
                      >
                        {label}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-zinc-500 text-[11px] font-semibold py-1">No balls bowled in this over yet</div>
                )}
              </div>
            </div>

            {/* Active Batter Details */}
            <div className="bg-[#161618] border border-zinc-800/80 rounded-2xl p-5 space-y-4">
              <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider block">Batter</span>
              <div className="space-y-3.5">
                {activeStrikerId ? (
                  <div className="flex justify-between items-center bg-[#121214]/50 border border-zinc-850 p-3 rounded-xl">
                    <div className="min-w-0">
                      <h4 className="text-white font-extrabold text-xs truncate flex items-center gap-1">
                        🏏 {activeBattingSquad.find(p => p._id === activeStrikerId)?.fullName}
                      </h4>
                      <span className="text-zinc-500 text-[10px] font-semibold">Striker · Not Out</span>
                    </div>
                    <div className="text-right">
                      <span className="text-white font-black text-sm">
                        {scorecardData?.batters?.find(b => b.playerName === activeBattingSquad.find(p => p._id === activeStrikerId)?.fullName)?.runs ?? 0}
                      </span>
                      <span className="text-zinc-500 text-xs ml-0.5">
                        ({scorecardData?.batters?.find(b => b.playerName === activeBattingSquad.find(p => p._id === activeStrikerId)?.fullName)?.balls ?? 0})
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-zinc-900/30 border border-dashed border-zinc-800 text-zinc-650 text-center py-4 rounded-xl text-xs font-semibold">
                    No active striker selected
                  </div>
                )}
              </div>
            </div>

            {/* Active Bowler Details */}
            <div className="bg-[#161618] border border-zinc-800/80 rounded-2xl p-5 space-y-4">
              <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider block">Bowlers</span>
              {activeBowlerId ? (
                <div className="flex justify-between items-center bg-[#121214]/50 border border-zinc-850 p-3 rounded-xl">
                  <div className="min-w-0">
                    <h4 className="text-white font-extrabold text-xs truncate">
                      ⚡ {activeBowlingSquad.find(p => p._id === activeBowlerId)?.fullName}
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="text-white font-black text-sm block">
                      {scorecardData?.bowlers?.find(b => b.playerName === activeBowlingSquad.find(p => p._id === activeBowlerId)?.fullName)?.wickets ?? 0}W - {scorecardData?.bowlers?.find(b => b.playerName === activeBowlingSquad.find(p => p._id === activeBowlerId)?.fullName)?.runsConceded ?? 0}R
                    </span>
                    <span className="text-zinc-550 text-[10px] font-semibold block mt-0.5">
                      {scorecardData?.bowlers?.find(b => b.playerName === activeBowlingSquad.find(p => p._id === activeBowlerId)?.fullName)?.overs ?? "0.0"} ov
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-zinc-900/30 border border-dashed border-zinc-800 text-zinc-650 text-center py-4 rounded-xl text-xs font-semibold">
                  No active bowler selected
                </div>
              )}
            </div>

            {/* Run Rate Card */}
            <div className="bg-[#161618] border border-zinc-800/80 rounded-2xl p-5 space-y-4">
              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div className="bg-[#121214] border border-zinc-800/50 rounded-xl p-3">
                  <span className="text-[9px] text-zinc-500 font-bold block uppercase tracking-wider">Run Rate</span>
                  <span className="text-base font-black text-white block mt-1">
                    {match && battingBalls > 0 ? ((currentBattingScore / battingBalls) * 6).toFixed(2) : "0.00"}
                  </span>
                  <span className="text-[9px] text-zinc-500 font-semibold block uppercase">CRR</span>
                </div>
                <div className="bg-[#121214] border border-zinc-800/50 rounded-xl p-3">
                  <span className="text-[9px] text-zinc-500 font-bold block uppercase tracking-wider">Target</span>
                  <span className="text-base font-black text-white block mt-1">
                    {targetVal !== null ? targetVal : "—"}
                  </span>
                  <span className="text-[9px] text-zinc-500 font-semibold block uppercase truncate">
                    {isSecondInnings ? (runsNeeded !== null && runsNeeded > 0 ? `Need ${runsNeeded} runs` : "Target met") : "Setting target"}
                  </span>
                </div>
                <div className="bg-[#121214] border border-zinc-800/50 rounded-xl p-3 flex flex-col justify-between items-center">
                  <span className="text-[9px] text-zinc-500 font-bold block uppercase tracking-wider">Updated</span>
                  <span className="text-[10px] font-bold text-white block mt-1">{lastUpdated}</span>
                  <button onClick={loadMatchData} className="text-[#a8a29e] hover:text-white transition-colors mt-1">
                    <RefreshCw className="w-3 h-3 animate-[spin_4s_linear_infinite]" />
                  </button>
                </div>
              </div>
            </div>

          </div>


          </div>

        </div>


    </Layout>
  );
}
