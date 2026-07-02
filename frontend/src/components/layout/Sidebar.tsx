import { NavLink, useSearchParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { 
  LayoutDashboard, 
  Trophy, 
  Swords, 
  LogOut,
  UserRound,
  Users,
  TrendingUp
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { matchService, teamService } from "../../services";
import type { Match, Team } from "@/types";
import { socket } from "@/lib/socket";

export function Sidebar() {
  const { user, logout } = useAuth();
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [teamMap, setTeamMap] = useState<Record<string, Team>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchLiveMatches() {
      try {
        const [matchRes, teamRes] = await Promise.all([
          matchService.getAll(),
          teamService.getAll(),
        ]);
        if (!isMounted) return;

        const allMatches = matchRes?.allMatches ?? [];
        const live = allMatches.filter((m) => m && m.matchStatus === "LIVE");
        setLiveMatches(live);

        const teams = teamRes?.allTeams ?? [];
        const map: Record<string, Team> = {};
        teams.forEach((t) => {
          if (t && t._id) {
            map[t._id] = t;
          }
        });
        setTeamMap(map);
      } catch (err) {
        console.error("Failed to load active matches in sidebar:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchLiveMatches();

    const handleScorecardUpdate = (data: any) => {
      if (!isMounted || !data) return;
      setLiveMatches((prev) => {
        const exists = prev.some((m) => m._id === data.matchId);
        if (data.matchStatus === "LIVE") {
          if (exists) {
            return prev.map((m) => {
              if (m._id === data.matchId) {
                return {
                  ...m,
                  teamAScore: data.matchScore.teamA.teamAScore,
                  teamAWickets: data.matchScore.teamA.teamAWickets,
                  teamABalls: data.matchScore.teamA.teamABalls,
                  teamBScore: data.matchScore.teamB.teamBScore,
                  teamBWickets: data.matchScore.teamB.teamBWickets,
                  teamBBalls: data.matchScore.teamB.teamBBalls,
                  matchStatus: data.matchStatus,
                  winnerTeamId: data.winnerTeamId,
                };
              }
              return m;
            });
          } else {
            // New live match started, fetch updated listings
            fetchLiveMatches();
            return prev;
          }
        } else {
          // Match is no longer live, filter it out
          if (exists) {
            return prev.filter((m) => m._id !== data.matchId);
          }
          return prev;
        }
      });
    };

    socket.on("scorecardUpdate", handleScorecardUpdate);

    const interval = setInterval(fetchLiveMatches, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
      socket.off("scorecardUpdate", handleScorecardUpdate);
    };
  }, []);
  
  const [searchParams] = useSearchParams();
  const currentTab = searchParams.get("tab") || "dashboard";

  const isOrganizer = user?.role.includes("ORGANIZER");

  const organizerItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Tournaments", path: "/tournaments", icon: Trophy }
  ];

  const playerItems = [
    { name: "Dashboard", tab: "dashboard", icon: LayoutDashboard },
    { name: "My Profile", tab: "profile", icon: UserRound },
    { name: "My Tournaments", tab: "tournaments", icon: Trophy },
    { name: "My Teams", tab: "teams", icon: Users },
    { name: "Invitations", tab: "invitations", icon: Swords },
    { name: "Statistics", tab: "statistics", icon: TrendingUp }
  ];

  // Derive dynamic user details
  const name = user?.name || user?.email || "User";
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
  const roleDisplay = user?.role 
    ? (Array.isArray(user.role) ? user.role.join(", ") : user.role) 
    : "";

  return (
    <aside className="w-64 border-r border-zinc-800 bg-[#121212] flex flex-col h-screen text-zinc-300">
      {/* Logo Area */}
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white tracking-tight">Cricnerd</h1>
        <p className="text-xs text-zinc-500">Manage Matches Easily.</p>
      </div>

      {/* Search Bar */}
      {/* <div className="px-6 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Search matches" 
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-700"
          />
        </div>
      </div> */}

      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        {isOrganizer ? (
          organizerItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? "bg-[#fcf8e3] text-black" // Pale yellow active state
                    : "hover:bg-zinc-800/50 hover:text-white"
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </NavLink>
          ))
        ) : (
          playerItems.map((item) => {
            const isActive = currentTab === item.tab;
            return (
              <Link
                key={item.name}
                to={`/?tab=${item.tab}`}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? "bg-[#fcf8e3] text-black" // Pale yellow active state
                    : "hover:bg-zinc-800/50 hover:text-white"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })
        )}

        {/* Active Matches Card */}
        <div className="mt-8 mb-4 border border-zinc-800 rounded-xl p-4 bg-zinc-900/30 flex flex-col min-h-[120px] max-h-[320px]">
          <h3 className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            Active matches
          </h3>
          
          {loading && liveMatches.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-zinc-650 text-xs italic">
              Loading...
            </div>
          ) : liveMatches.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-zinc-600 text-xs italic">
              No active matches
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto pr-1">
              {liveMatches.filter(Boolean).map((m) => {
                const teamA = teamMap[m.teamAId];
                const teamB = teamMap[m.teamBId];
                const teamAName = teamA?.teamName || "Team A";
                const teamBName = teamB?.teamName || "Team B";

                return (
                  <NavLink
                    key={m._id}
                    to={`/scorecard/${m._id}`}
                    className="block bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700/80 rounded-lg p-2.5 transition-all group"
                  >
                    <div className="flex items-center justify-between text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1.5">
                      <span className="text-red-400 font-extrabold flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
                        Live
                      </span>
                      <span>
                        {Math.floor(m.teamABalls / 6)}.{m.teamABalls % 6} ov
                      </span>
                    </div>
                    
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-200 font-semibold truncate max-w-[110px] group-hover:text-white transition-colors">
                          {teamAName}
                        </span>
                        <span className="text-white font-extrabold tabular-nums">
                          {m.teamAScore}/{m.teamAWickets}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-200 font-semibold truncate max-w-[110px] group-hover:text-white transition-colors">
                          {teamBName}
                        </span>
                        <span className="text-white font-extrabold tabular-nums">
                          {m.teamBBalls > 0 ? (
                            `${m.teamBScore}/${m.teamBWickets}`
                          ) : (
                            <span className="text-[9px] text-zinc-500 font-semibold italic">Yet to bat</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </NavLink>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-zinc-800">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-black font-bold text-sm shrink-0">
            {initials}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-white truncate">{name}</p>
            <p className="text-xs text-zinc-500 truncate capitalize">{roleDisplay.toLowerCase()}</p>
          </div>
          <button 
            onClick={logout}
            className="text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
