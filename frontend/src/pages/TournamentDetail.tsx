import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Trophy,
  Users,
  Swords,
  UserRound,
  Calendar,
  Clock,
  Info,
  Plus,
  Zap,
  ArrowRight,
  Pencil,
  Loader2,
  AlertCircle,
  ChevronLeft,
  Trash2,
  Radio,
  ShieldCheck,
  X,
  Play,
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { tournamentService, teamService, matchService, playerService, squadService, inviteService } from "@/services";
import type { Tournament, Team, Match, CreateMatchRequest, Player, PlayingRole } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { socket } from "@/lib/socket";

/* ─── helpers ─── */
function fmtDate(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function diffDays(start: string, end: string) {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  return Math.max(1, Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1);
}

/* exact same statusColor as Tournaments.tsx */
function statusColor(status: string) {
  if (status === "ONGOING") return "bg-blue-600";
  if (status === "COMPLETED") return "bg-zinc-600";
  return "bg-green-600";
}

function overs(format: string) {
  return format?.split(" ")[0] ?? "?";
}

function getAcronym(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return parts.map(p => p[0]).join("").toUpperCase().slice(0, 4);
}

/* ─── tab list ─── */
const TABS = ["Overview", "Teams", "Matches", "Players"] as const;
type Tab = (typeof TABS)[number];

/* ─── Skeleton (same as Tournaments.tsx) ─── */
function SkeletonCard() {
  return (
    <div className="bg-[#1c1c1c] border border-zinc-800 rounded-xl overflow-hidden p-4 animate-pulse">
      <div className="bg-zinc-800 h-40 rounded-lg mb-6" />
      <div className="h-4 bg-zinc-800 rounded w-3/4 mb-2" />
      <div className="h-3 bg-zinc-800 rounded w-1/2 mb-6" />
      <div className="flex gap-3">
        <div className="flex-1 h-8 bg-zinc-800 rounded-lg" />
        <div className="flex-1 h-8 bg-zinc-800 rounded-lg" />
      </div>
    </div>
  );
}

/* ─── Stat mini-card — same outer shell, blue icon box ─── */
function StatCard({
  icon,
  label,
  value,
  sub,
  headerColor = "bg-[#0b36aa]",
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  sub?: string;
  headerColor?: string;
}) {
  return (
    <div className="bg-[#1c1c1c] border border-zinc-800 rounded-xl overflow-hidden p-4">
      <div
        className={`${headerColor} h-14 rounded-lg flex items-center justify-center mb-4`}
      >
        {icon}
      </div>

      <p className="text-zinc-500 text-xs font-medium">{label}</p>
      <p className="text-white font-bold text-2xl mt-0.5 leading-none">
        {value}
      </p>

      {sub && <p className="text-zinc-500 text-xs mt-1">{sub}</p>}
    </div>
  );
}

/* ─── Info row ─── */
function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-zinc-800/60 last:border-0">
      <span className="text-sm text-zinc-500">{label}</span>
      <span className="text-sm text-white font-medium text-right">{value}</span>
    </div>
  );
}

/* ─── Quick action card — same card shell ─── */
function ActionCard({
  icon,
  title,
  sub,
  to,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  sub: string;
  to?: string;
  onClick?: () => void;
}) {
  const content = (
    <>
      {/* small blue icon box */}
      <div className="bg-[#0b36aa] w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-white">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-bold">{title}</p>
        <p className="text-zinc-500 text-xs truncate">{sub}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors shrink-0" />
    </>
  );

  if (to) {
    return (
      <Link
        to={to}
        className="bg-[#1c1c1c] border border-zinc-800 rounded-xl overflow-hidden p-4 flex items-center gap-3 hover:bg-zinc-800/60 hover:border-zinc-700 transition-all group cursor-pointer"
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left bg-[#1c1c1c] border border-zinc-800 rounded-xl overflow-hidden p-4 flex items-center gap-3 hover:bg-zinc-800/60 hover:border-zinc-700 transition-all group cursor-pointer"
    >
      {content}
    </button>
  );
}

interface AddTeamModalContentProps {
  tournamentId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

function AddTeamModalContent({
  tournamentId,
  onSuccess,
  onCancel,
}: AddTeamModalContentProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Team name is required");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await teamService.create({ name: name.trim(), tournamentId });
      setName("");
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to add team");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 bg-red-950/60 border border-red-700/60 text-red-400 text-xs px-3 py-2.5 rounded-lg">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}
      <div className="space-y-2">
        <label className="text-zinc-300 text-xs font-semibold">Team Name</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Royal Challengers"
          className="bg-[#1e1e22] border-zinc-800 text-white placeholder-zinc-600 focus-visible:border-zinc-700 focus-visible:ring-zinc-800"
          disabled={loading}
          autoFocus
        />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="border-zinc-700 hover:bg-zinc-800 text-zinc-300 text-xs py-2 px-4 rounded-lg bg-transparent hover:text-white"
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-[#fcf8e3] text-black hover:bg-[#f5eea5] text-xs py-2 px-4 rounded-lg font-semibold flex items-center gap-1.5"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" />
              Add Team
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

/* ─── Add Match Modal ─── */
interface AddMatchModalContentProps {
  tournamentId: string;
  teams: Team[];
  tournament: Tournament;
  onSuccess: () => void;
  onCancel: () => void;
}

function AddMatchModalContent({
  tournamentId,
  teams,
  tournament,
  onSuccess,
  onCancel,
}: AddMatchModalContentProps) {
  const [form, setForm] = useState<CreateMatchRequest>({
    tournamentId,
    teamAId: "",
    teamBId: "",
    matchDate: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const set = (key: keyof CreateMatchRequest, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.teamAId || !form.teamBId || !form.matchDate) {
      setError("All fields are required.");
      return;
    }
    if (form.teamAId === form.teamBId) {
      setError("Team A and Team B must be different.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await matchService.create(form);
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to create match.");
    } finally {
      setLoading(false);
    }
  };

  /* Build min/max from tournament dates */
  const minDate = tournament.startDate?.split("T")[0] ?? undefined;
  const maxDate = tournament.endDate?.split("T")[0] ?? undefined;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 bg-red-950/60 border border-red-700/60 text-red-400 text-xs px-3 py-2.5 rounded-lg">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Team A */}
      <div className="space-y-1.5">
        <label className="text-zinc-300 text-xs font-semibold">Team A</label>
        <select
          value={form.teamAId}
          onChange={(e) => set("teamAId", e.target.value)}
          disabled={teams.length === 0}
          className="w-full bg-[#1e1e22] border border-zinc-800 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-zinc-600 disabled:opacity-50"
        >
          <option value="">Select team…</option>
          {teams.map((t) => (
            <option key={t._id} value={t._id}>{t.teamName}</option>
          ))}
        </select>
        {teams.length === 0 && (
          <p className="text-zinc-600 text-xs">No teams registered yet.</p>
        )}
      </div>

      {/* Team B */}
      <div className="space-y-1.5">
        <label className="text-zinc-300 text-xs font-semibold">Team B</label>
        <select
          value={form.teamBId}
          onChange={(e) => set("teamBId", e.target.value)}
          disabled={teams.length === 0}
          className="w-full bg-[#1e1e22] border border-zinc-800 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-zinc-600 disabled:opacity-50"
        >
          <option value="">Select team…</option>
          {teams
            .filter((t) => t._id !== form.teamAId)
            .map((t) => (
              <option key={t._id} value={t._id}>{t.teamName}</option>
            ))}
        </select>
      </div>

      {/* Match Date */}
      <div className="space-y-1.5">
        <label className="text-zinc-300 text-xs font-semibold">Match Date</label>
        <Input
          type="date"
          value={form.matchDate}
          min={minDate}
          max={maxDate}
          onChange={(e) => set("matchDate", e.target.value)}
          className="bg-[#1e1e22] border-zinc-800 text-white focus-visible:border-zinc-700 focus-visible:ring-zinc-800 [color-scheme:dark]"
          disabled={loading}
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
          className="border-zinc-700 hover:bg-zinc-800 text-zinc-300 text-xs bg-transparent hover:text-white"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="bg-[#fcf8e3] text-black hover:bg-[#f5eea5] text-xs font-semibold flex items-center gap-1.5"
        >
          {loading ? (
            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Creating…</>
          ) : (
            <><Plus className="w-3.5 h-3.5" /> Create Match</>
          )}
        </Button>
      </div>
    </form>
  );
}

/* ─── Role badge ─── */
const ROLE_COLORS: Record<string, string> = {
  Batter: "bg-blue-600/20 text-blue-300 border border-blue-600/30",
  Bowler: "bg-green-600/20 text-green-300 border border-green-600/30",
  Allrounder: "bg-yellow-600/20 text-yellow-300 border border-yellow-600/30",
};

/* ─── Add Player Modal — Register & assign to team ─── */
interface AddPlayerModalProps {
  tournamentId: string;
  teamId: string;
  teams: Team[];
  onSuccess: () => void;
  onCancel: () => void;
}

function AddPlayerModal({ tournamentId, teamId, teams, onSuccess, onCancel }: AddPlayerModalProps) {
  const [selectedTeamId, setSelectedTeamId] = useState(teamId);
  const [form, setForm] = useState({ name: "", age: "", playingRole: "Batter" as PlayingRole });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keep selectedTeamId in sync if parent changes teamId (e.g. switching tabs)
  useEffect(() => { setSelectedTeamId(teamId); }, [teamId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError("Name is required"); return; }
    const ageNum = parseInt(form.age);
    if (isNaN(ageNum) || ageNum < 12) { setError("Age must be ≥ 12"); return; }
    if (ageNum > 70) { setError("Age must be ≤ 70 to play a tournament"); return; }
    if (!selectedTeamId) { setError("Please select a team"); return; }
    setCreating(true);
    setError(null);
    try {
      await playerService.register({
        name: form.name.trim(),
        age: ageNum,
        playingRole: form.playingRole,
        tournamentId,
        teamId: selectedTeamId,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to create player");
    } finally {
      setCreating(false);
    }
  };

  return (
    <form onSubmit={handleCreate} className="space-y-4">
      {/* Info note */}
      <div className="flex items-start gap-2 bg-zinc-800/60 border border-zinc-700/60 text-zinc-400 text-xs px-3 py-2.5 rounded-lg">
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <span>The player will be created and automatically assigned to the selected team.</span>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-950/60 border border-red-700/60 text-red-400 text-xs px-3 py-2.5 rounded-lg">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Full Name */}
      <div className="space-y-1.5">
        <label className="text-zinc-300 text-xs font-semibold">Full Name</label>
        <Input
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="e.g. Virat Kohli"
          className="bg-[#1e1e22] border-zinc-800 text-white placeholder-zinc-600 focus-visible:border-zinc-700 focus-visible:ring-zinc-800"
          disabled={creating}
          autoFocus
        />
      </div>

      {/* Age + Role */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-zinc-300 text-xs font-semibold">Age</label>
          <Input
            type="number"
            min={12}
            max={70}
            value={form.age}
            onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}
            placeholder="e.g. 25"
            className="bg-[#1e1e22] border-zinc-800 text-white placeholder-zinc-600 focus-visible:border-zinc-700 focus-visible:ring-zinc-800"
            disabled={creating}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-zinc-300 text-xs font-semibold">Role</label>
          <select
            value={form.playingRole}
            onChange={(e) => setForm((f) => ({ ...f, playingRole: e.target.value as PlayingRole }))}
            disabled={creating}
            className="w-full bg-[#1e1e22] border border-zinc-800 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-zinc-600"
          >
            <option value="Batter">Batter</option>
            <option value="Bowler">Bowler</option>
            <option value="Allrounder">Allrounder</option>
          </select>
        </div>
      </div>

      {/* Team selector */}
      <div className="space-y-1.5">
        <label className="text-zinc-300 text-xs font-semibold">Assign to Team</label>
        <select
          value={selectedTeamId}
          onChange={(e) => setSelectedTeamId(e.target.value)}
          disabled={creating}
          className="w-full bg-[#1e1e22] border border-zinc-800 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-zinc-600"
        >
          {teams.map((t) => (
            <option key={t._id} value={t._id}>{t.teamName}</option>
          ))}
        </select>
      </div>

      <div className="flex justify-end gap-3 pt-1">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={creating}
          className="border-zinc-700 hover:bg-zinc-800 text-zinc-300 text-xs bg-transparent hover:text-white"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={creating}
          className="bg-[#fcf8e3] text-black hover:bg-[#f5eea5] text-xs font-semibold flex items-center gap-1.5"
        >
          {creating ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Creating…</> : <><Plus className="w-3.5 h-3.5" /> Create Player</>}
        </Button>
      </div>
    </form>
  );
}

/* ─── IPL-style Squad Viewer sub-component ─── */
function SquadViewer({
  tournamentId,
  teams,
  squadMap,
  onOpenAddPlayer,
  onOpenAddTeam,
  onRefreshSquads,
  refreshTrigger,
  squadLoading,
  isOwner,
}: {
  tournamentId: string;
  teams: Team[];
  squadMap: Record<string, any[]>;
  onOpenAddPlayer: (teamId: string) => void;
  onOpenAddTeam: () => void;
  onRefreshSquads: () => Promise<void>;
  refreshTrigger: number;
  squadLoading: boolean;
  isOwner: boolean;
}) {
  const [activeTeamIdx, setActiveTeamIdx] = useState(0);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [loadingAll, setLoadingAll] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [togglingError, setTogglingError] = useState<string | null>(null);

  const activeTeam = teams[activeTeamIdx];
  const currentSquad: any[] = activeTeam ? (squadMap[activeTeam._id] ?? []) : [];
  const currentSquadIds = new Set(currentSquad.map((e: any) => (e.playerId ?? e)._id as string));

  const allTournamentPlayerIds = new Set(
    Object.values(squadMap).flat().map((e: any) => (e.playerId ?? e)._id as string)
  );

  useEffect(() => {
    playerService.getMy()
      .then((r) => setAllPlayers(r.allPlayer ?? []))
      .catch(console.error)
      .finally(() => setLoadingAll(false));
  }, [refreshTrigger]);

  const handleToggle = async (playerId: string) => {
    if (!activeTeam || toggling) return;
    setToggling(playerId);
    setTogglingError(null);
    try {
      if (currentSquadIds.has(playerId)) {
        await squadService.removePlayer(tournamentId, activeTeam._id, playerId);
      } else {
        await squadService.assignPlayer(tournamentId, activeTeam._id, playerId);
      }
      await onRefreshSquads();
    } catch (err: any) {
      setTogglingError(err.message || "Failed to update squad");
    } finally {
      setToggling(null);
    }
  };

  const squadPlayers: Player[] = currentSquad.map((e: any) => e.playerId ?? e);

  // Role-based accent colors
  const roleAccent: Record<string, { border: string; avatar: string; dot: string; badge: string }> = {
    Batter:     { border: "border-l-blue-500",   avatar: "bg-blue-600/30 text-blue-300",    dot: "bg-blue-400",   badge: "bg-blue-500/15 text-blue-300 border-blue-500/30" },
    Bowler:     { border: "border-l-green-500",  avatar: "bg-green-600/30 text-green-300",  dot: "bg-green-400",  badge: "bg-green-500/15 text-green-300 border-green-500/30" },
    Allrounder: { border: "border-l-amber-500",  avatar: "bg-amber-600/30 text-amber-300",  dot: "bg-amber-400",  badge: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
  };
  const getRoleAccent = (role: string) => roleAccent[role] ?? { border: "border-l-zinc-600", avatar: "bg-zinc-700 text-zinc-300", dot: "bg-zinc-500", badge: "bg-zinc-700/40 text-zinc-400 border-zinc-600/40" };

  return (
    <div className="space-y-5">
      {/* ── Team tabs with squad count badges ── */}
      <div className="flex flex-wrap gap-2 justify-center">
        {teams.map((t, i) => {
          const count = (squadMap[t._id] ?? []).length;
          const isActive = i === activeTeamIdx;
          return (
            <button
              key={t._id}
              onClick={() => { setActiveTeamIdx(i); setTogglingError(null); }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold tracking-wider transition-all ${
                isActive
                  ? "bg-white text-black shadow-lg shadow-white/10"
                  : "bg-[#1a1a1a] border border-zinc-700/80 text-zinc-400 hover:text-white hover:border-zinc-500 hover:bg-zinc-800/60"
              }`}
            >
              {getAcronym(t.teamName)}
              {count > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none ${
                  isActive ? "bg-black/20 text-black/70" : "bg-zinc-700 text-zinc-400"
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
        {isOwner && (
          <button
            onClick={onOpenAddTeam}
            title="Add a new team"
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#1a1a1a] border border-dashed border-zinc-700 text-zinc-500 hover:text-white hover:border-zinc-400 hover:bg-zinc-800/60 transition-all flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* ── Error banner ── */}
      {togglingError && (
        <div className="flex items-center gap-2 bg-red-950/60 border border-red-800/60 text-red-400 text-xs px-3 py-2.5 rounded-xl">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span className="flex-1">{togglingError}</span>
          <button onClick={() => setTogglingError(null)} className="hover:text-red-300 transition-colors"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      {/* ── Main 2-col layout ── */}
      <div className="flex gap-5 items-start relative min-h-[300px]">
        {squadLoading && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] rounded-2xl flex items-center justify-center z-10 transition-all">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        )}
        {/* LEFT — numbered player cards */}
        <div className="flex-1 min-w-0">
          {squadPlayers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 border border-dashed border-zinc-800 rounded-2xl">
              <div className="w-12 h-12 rounded-xl bg-zinc-800/60 flex items-center justify-center">
                <UserRound className="w-6 h-6 text-zinc-600" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-zinc-400">No players yet</p>
                <p className="text-xs text-zinc-600 mt-1">Check a player on the right panel to assign them here.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                {squadPlayers.map((player, idx) => {
                  const accent = getRoleAccent(player.playingRole);
                  return (
                    <div
                      key={player._id}
                      className="relative bg-[#161616] border border-zinc-800 rounded-xl px-4 py-3.5 flex items-center gap-3 group hover:bg-[#1c1c1c] hover:border-zinc-700 transition-all"
                    >
                      <span className="text-zinc-600 text-base font-bold w-5 shrink-0 leading-none tabular-nums">{idx + 1}</span>
                      <div className={`w-9 h-9 rounded-lg ${accent.avatar} flex items-center justify-center font-bold text-xs shrink-0`}>
                        {player.fullName.split(" ").map((n: string) => n[0]).join("").toUpperCase().substring(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-semibold truncate leading-tight">{player.fullName}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md border ${accent.badge}`}>{player.playingRole}</span>
                          {player.age && <span className="text-zinc-600 text-[10px]">Age {player.age}</span>}
                        </div>
                      </div>
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${accent.dot}`} />
                      {isOwner && (
                        <button
                          onClick={() => handleToggle(player._id)}
                          disabled={toggling === player._id}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 p-1 rounded-lg transition-all disabled:opacity-40"
                          title="Remove from squad"
                        >
                          {toggling === player._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="mt-4">
                <span className="bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-semibold px-3 py-1.5 rounded-full">
                  {squadPlayers.length} player{squadPlayers.length !== 1 ? "s" : ""} · {activeTeam?.teamName}
                </span>
              </div>
            </>
          )}
        </div>

        {/* RIGHT — global player list with live checkboxes */}
        <div className="w-[300px] shrink-0 bg-[#0e0e0e] border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/80 bg-zinc-900/40">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Players</span>
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Stats</span>
          </div>

          {loadingAll ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-5 h-5 text-zinc-600 animate-spin" />
            </div>
          ) : allPlayers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-zinc-600">
              <UserRound className="w-7 h-7 opacity-30" />
              <p className="text-xs font-medium">No players in system</p>
            </div>
          ) : (
            <div className="max-h-[460px] overflow-y-auto">
              {allPlayers.map((player) => {
                const isInCurrentTeam = currentSquadIds.has(player._id);
                const isInOtherTeam = !isInCurrentTeam && allTournamentPlayerIds.has(player._id);
                const isLoading = toggling === player._id;
                const accent = getRoleAccent(player.playingRole);
                return (
                  <div
                    key={player._id}
                    onClick={() => isOwner && !isInOtherTeam && !isLoading && handleToggle(player._id)}
                    title={isInOtherTeam ? "Already in another team in this tournament" : undefined}
                    className={`flex items-center border-b border-zinc-800/40 last:border-0 transition-all ${
                      isInOtherTeam ? "opacity-20 cursor-not-allowed"
                      : !isOwner ? "cursor-default"
                      : isLoading ? "opacity-50 pointer-events-none"
                      : isInCurrentTeam ? "bg-zinc-800/30 cursor-pointer hover:bg-zinc-800/50"
                      : "cursor-pointer hover:bg-zinc-800/20"
                    }`}
                  >
                    {/* Player info */}
                    <div className="flex items-center gap-2.5 px-3 py-3 flex-1 min-w-0">
                      {isOwner && (
                        <div className="shrink-0 w-4 flex items-center justify-center">
                          {isLoading
                            ? <Loader2 className="w-3.5 h-3.5 text-zinc-400 animate-spin" />
                            : <input type="checkbox" checked={isInCurrentTeam} readOnly className="w-3.5 h-3.5 rounded accent-white cursor-pointer" />
                          }
                        </div>
                      )}
                      <div className={`w-7 h-7 rounded-lg ${accent.avatar} flex items-center justify-center font-bold text-[10px] shrink-0`}>
                        {player.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white text-[12px] font-semibold truncate leading-tight">{player.fullName}</p>
                        <span className={`text-[10px] font-semibold px-1 py-px rounded border ${accent.badge}`}>{player.playingRole}</span>
                      </div>
                    </div>
                    {/* Stats */}
                    <div className="px-3 py-3 flex flex-col gap-1 items-end shrink-0 border-l border-zinc-800/60 w-[110px]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-zinc-500 text-[10px]">Runs</span>
                        <span className="text-white text-[11px] font-bold tabular-nums">{player.totalRuns ?? 0}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-zinc-500 text-[10px]">Wkts</span>
                        <span className="text-white text-[11px] font-bold tabular-nums">{player.totalWickets ?? 0}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Players Tab ─── */
interface PlayersTabProps {
  tournamentId: string;
  teams: Team[];
  squadMap: Record<string, any[]>;
  squadLoading: boolean;
  isAddPlayerModalOpen: boolean;
  addPlayerTargetTeamId: string;
  onOpenAddPlayer: (teamId: string) => void;
  onOpenAddTeam: () => void;
  onCloseAddPlayer: () => void;
  onPlayerAdded: () => void;
  onRefreshSquads: () => Promise<void>;
  isOwner: boolean;
}

function PlayersTab({
  tournamentId,
  teams,
  squadMap,
  squadLoading,
  isAddPlayerModalOpen,
  addPlayerTargetTeamId,
  onOpenAddPlayer,
  onOpenAddTeam,
  onCloseAddPlayer,
  onPlayerAdded,
  onRefreshSquads,
  isOwner,
}: PlayersTabProps) {
  const totalPlayers = Object.values(squadMap).reduce((acc, sq) => acc + sq.length, 0);
  const [playerVersion, setPlayerVersion] = useState(0);

  const handlePlayerAdded = () => {
    setPlayerVersion((v) => v + 1); // triggers SquadViewer to re-fetch allPlayers
    onPlayerAdded();
  };

  return (
    <div className="bg-[#1c1c1c] border border-zinc-800 rounded-xl overflow-hidden p-4 space-y-5">
      {/* Header */}
      <div className="bg-zinc-800 h-12 rounded-lg flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <UserRound className="w-4 h-4 text-white" />
          <span className="text-white text-sm font-bold">Tournament Squad</span>
          <span className="text-zinc-500 text-xs font-normal ml-1">({totalPlayers} players)</span>
        </div>
        {teams.length > 0 && isOwner && (
                  <Modal
            title="Create New Player"
            description="Fill in the details to add a new player to the global roster. Then assign them using the checkboxes."
            open={isAddPlayerModalOpen}
            onOpenChange={(open) => { if (!open) onCloseAddPlayer(); }}
            trigger={
              <button
                onClick={() => onOpenAddPlayer(teams[0]._id)}
                className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> New Player
              </button>
            }
          >
            <AddPlayerModal
              tournamentId={tournamentId}
              teamId={addPlayerTargetTeamId}
              teams={teams}
              onSuccess={handlePlayerAdded}
              onCancel={onCloseAddPlayer}
            />
          </Modal>
        )}
      </div>

      {/* No teams */}
      {teams.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-zinc-500">
          <Users className="w-10 h-10 opacity-30" />
          <p className="text-sm font-medium">No teams in this tournament yet</p>
          <p className="text-xs text-zinc-600 text-center max-w-[240px]">Register teams first, then add players to each team's squad.</p>
        </div>
      )}

      {/* IPL-style viewer */}
      {teams.length > 0 && (
        <SquadViewer
          tournamentId={tournamentId}
          teams={teams}
          squadMap={squadMap}
          onOpenAddPlayer={onOpenAddPlayer}
          onOpenAddTeam={onOpenAddTeam}
          onRefreshSquads={onRefreshSquads}
          refreshTrigger={playerVersion}
          squadLoading={squadLoading}
          isOwner={isOwner}
        />
      )}
    </div>
  );
}

/* ─── Edit Tournament Modal ─── */
interface EditTournamentModalContentProps {
  tournament: Tournament;
  onSuccess: (updated: Tournament) => void;
  onCancel: () => void;
}

function EditTournamentModalContent({
  tournament,
  onSuccess,
  onCancel,
}: EditTournamentModalContentProps) {
  const [name, setName] = useState(tournament.tournamentName);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Tournament name is required.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await tournamentService.update(tournament._id, { tournamentName: name.trim() });
      onSuccess(res.tournament);
    } catch (err: any) {
      setError(err.message || "Failed to update tournament.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 bg-red-950/60 border border-red-700/60 text-red-400 text-xs px-3 py-2.5 rounded-lg">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tournament Name */}
      <div className="space-y-1.5">
        <label className="text-zinc-300 text-xs font-semibold">Tournament Name</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Premier League"
          className="bg-[#1e1e22] border-zinc-800 text-white focus-visible:border-zinc-700 focus-visible:ring-zinc-800"
          disabled={loading}
          autoFocus
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
          className="border-zinc-700 hover:bg-zinc-800 text-zinc-300 text-xs bg-transparent hover:text-white"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="bg-[#fcf8e3] text-black hover:bg-[#f5eea5] text-xs font-semibold flex items-center gap-1.5"
        >
          {loading ? (
            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</>
          ) : (
            <>Save Changes</>
          )}
        </Button>
      </div>
    </form>
  );
}

/* ═══════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════ */
export default function TournamentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
  const [isEditTournamentModalOpen, setIsEditTournamentModalOpen] = useState(false);
  const [matchStatusFilter, setMatchStatusFilter] = useState<"ALL" | "SCHEDULED" | "LIVE" | "COMPLETED">("ALL");

  const isOwner = !!(user && tournament && user._id === tournament.organizerId);

  // Players tab state
  // squadMap: teamId -> array of { ptt record + populated player }
  const [squadMap, setSquadMap] = useState<Record<string, any[]>>({});
  const [squadLoading, setSquadLoading] = useState(false);
  const [isAddPlayerModalOpen, setIsAddPlayerModalOpen] = useState(false);
  const [addPlayerTargetTeamId, setAddPlayerTargetTeamId] = useState<string>("");

  // Invite states
  const [activeInviteLink, setActiveInviteLink] = useState<string | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generatingInvite, setGeneratingInvite] = useState(false);

  const handleGenerateInvite = async (teamId: string) => {
    if (!id) return;
    setGeneratingInvite(true);
    try {
      const res = await inviteService.create({ tournamentId: id, teamId });
      setActiveInviteLink(res.inviteLink);
      setCopied(false);
      setIsInviteModalOpen(true);
    } catch (err: any) {
      alert(err.message || "Failed to generate invite link");
    } finally {
      setGeneratingInvite(false);
    }
  };

  const refreshTeams = async () => {
    if (!id) return;
    try {
      const teamsRes = await teamService.getAll();
      const filteredTeams = (teamsRes.allTeams ?? []).filter((t) => t.tournamentId === id);
      setTeams(filteredTeams);
      return filteredTeams;
    } catch (err) {
      console.error("Failed to refresh teams", err);
    }
  };

  const refreshMatches = async () => {
    if (!id) return;
    try {
      const matchesRes = await matchService.getAll(id);
      setMatches(matchesRes.allMatches ?? []);
    } catch (err) {
      console.error("Failed to refresh matches", err);
    }
  };

  const handleDeleteMatch = async (matchId: string) => {
    if (!confirm("Delete this match? This cannot be undone.")) return;
    try {
      await matchService.delete(matchId);
      setMatches((prev) => prev.filter((m) => m._id !== matchId));
    } catch (err: any) {
      alert(err.message || "Failed to delete match.");
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm("Delete this team? This cannot be undone.")) return;
    try {
      await teamService.delete(teamId);
      refreshTeams();
    } catch (err: any) {
      alert(err.message || "Failed to delete team");
    }
  };

  const refreshSquads = async (teamList: Team[]) => {
    if (!id || teamList.length === 0) return;
    setSquadLoading(true);
    try {
      const results = await Promise.all(
        teamList.map((t) => squadService.getTeamSquad(id, t._id))
      );
      const map: Record<string, any[]> = {};
      teamList.forEach((t, i) => {
        map[t._id] = results[i]?.foundSquad ?? [];
      });
      setSquadMap(map);
    } catch (err) {
      console.error("Failed to load squads", err);
    } finally {
      setSquadLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [tRes, teamsRes, matchesRes] = await Promise.all([
          tournamentService.getById(id),
          teamService.getAll(),
          matchService.getAll(id),
        ]);
        setTournament(tRes.singleTournament);
        const filteredTeams = (teamsRes.allTeams ?? []).filter((t) => t.tournamentId === id);
        setTeams(filteredTeams);
        setMatches(matchesRes.allMatches ?? []);
        await refreshSquads(filteredTeams);
      } catch (err: any) {
        setError(err.message || "Failed to load tournament");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Refresh squads when Players tab becomes active
  useEffect(() => {
    if (activeTab === "Players" && teams.length > 0) {
      refreshSquads(teams);
    }
  }, [activeTab]);

  useEffect(() => {
    const handleScorecardUpdate = (data: any) => {
      if (!data) return;
      setMatches((prev) => {
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
      });
    };

    socket.on("scorecardUpdate", handleScorecardUpdate);

    return () => {
      socket.off("scorecardUpdate", handleScorecardUpdate);
    };
  }, []);

  /* ── Loading ── */
  if (loading) {
    return (
      <Layout title="Tournament" subtitle="DETAIL">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </Layout>
    );
  }

  /* ── Error ── */
  if (error || !tournament) {
    return (
      <Layout title="Tournament" subtitle="DETAIL">
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-zinc-500">
          <AlertCircle className="w-10 h-10 text-red-500/60" />
          <p className="text-sm">{error ?? "Tournament not found"}</p>
          <button
            onClick={() => navigate("/tournaments")}
            className="text-xs underline hover:text-white transition-colors"
          >
            ← Back to Tournaments
          </button>
        </div>
      </Layout>
    );
  }

  const days = diffDays(tournament.startDate, tournament.endDate);

  return (
    <Layout title={tournament.tournamentName} subtitle="TOURNAMENT">
      <div className="space-y-6">

        {/* ── Back ── */}
        <button
          onClick={() => navigate("/tournaments")}
          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Back to Tournaments
        </button>

        {/* ══════════════════════════════════════════
            HEADER CARD — full banner on Overview, compact on other tabs
        ══════════════════════════════════════════ */}
        <div className="bg-[#1c1c1c] border border-zinc-800 rounded-xl overflow-hidden p-4">

          {activeTab === "Overview" ? (
            <>
              {/* Blue banner — full size for Overview */}
              <div className="bg-[#0b36aa] h-40 rounded-lg relative flex items-center justify-center p-4">
                {/* Edit button top-right */}
                {isOwner && (
                  <button
                    onClick={() => setIsEditTournamentModalOpen(true)}
                    className="absolute top-2 right-2 bg-white/10 text-white hover:bg-white/20 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit Tournament
                  </button>
                )}

                {/* Tournament name — same as card */}
                <div className="text-white text-center px-6">
                  <div className="font-bold text-2xl leading-tight break-words">
                    {tournament.tournamentName}
                  </div>
                  <div className="text-blue-200 text-xs mt-1 font-medium">
                    {tournament.playingFormat}
                  </div>
                </div>

                {/* Status badge — exact clone */}
                <div
                  className={`absolute -bottom-3 right-4 ${statusColor(tournament.playingStatus)} text-white text-[10px] font-bold px-3 py-1 rounded-full border-2 border-[#1c1c1c]`}
                >
                  {tournament.playingStatus}
                </div>
              </div>

              {/* Card body — same as tournament card body */}
              <div className="mt-6 mb-4">
                <h3 className="text-white font-bold text-lg flex items-baseline gap-2">
                  {tournament.tournamentName}{" "}
                  <span className="text-xs font-normal text-zinc-500">
                    ({overs(tournament.playingFormat)} Overs)
                  </span>
                </h3>
                <div className="flex items-center gap-4 mt-1 flex-wrap text-zinc-500 text-xs">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {fmtDate(tournament.startDate)} → {fmtDate(tournament.endDate)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {days} day{days !== 1 ? "s" : ""}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {teams.length} teams
                  </span>
                </div>
              </div>
            </>
          ) : (
            /* ── Compact header for Teams / Matches / Players ── */
            <div className="flex items-center justify-between gap-4 mb-0">
              <div className="flex items-center gap-3 min-w-0">
                {/* Small blue accent block */}
                <div className="bg-[#0b36aa] w-10 h-10 rounded-lg flex items-center justify-center shrink-0">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-white font-bold text-sm truncate leading-tight">
                    {tournament.tournamentName}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5 text-zinc-500 text-xs">
                    <span>{overs(tournament.playingFormat)} Overs</span>
                    <span>·</span>
                    <span>{teams.length} teams</span>
                    <span>·</span>
                    <span>{matches.length} matches</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`${statusColor(tournament.playingStatus)} text-white text-[10px] font-bold px-3 py-1 rounded-full`}
                >
                  {tournament.playingStatus}
                </span>
                {isOwner && (
                  <button className="bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors">
                    <Pencil className="w-3 h-3" /> Edit
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Tab bar — always visible */}
          <div className={`flex gap-0 border-t border-zinc-800 -mx-4 px-4 ${activeTab === "Overview" ? "mt-4" : "mt-3"}`}>
            {TABS.filter(tab => tab === "Overview" || tab === "Teams" || tab === "Matches" || tab === "Players" || isOwner).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-sm font-semibold transition-colors border-b-2 -mb-px ${
                  activeTab === tab
                    ? "text-white border-white"
                    : "text-zinc-500 border-transparent hover:text-zinc-300"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════
            OVERVIEW TAB
        ══════════════════════════════════ */}
        {activeTab === "Overview" && (
          <div className="space-y-6">

            {/* Stat cards — same card shell + blue icon area */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={<Users className="w-5 h-5 text-white"/>}
                headerColor="bg-zinc-800"
                label="Teams"
                value={teams.length}
                sub="Registered Teams"
              />
              <StatCard
                icon={<Swords className="w-5 h-5 text-white" />}
                headerColor="bg-zinc-800"
                label="Matches"
                value={matches.length}
                sub="Total Matches"
              />
              <StatCard
                icon={<UserRound className="w-5 h-5 text-white" />}
                headerColor="bg-zinc-800"
                label="Players"
                value={Object.values(squadMap).reduce((acc, sq) => acc + sq.length, 0)}
                sub="Total Players"
              />
              <StatCard
                icon={<Calendar className="w-5 h-5 text-white" />}
                headerColor="bg-zinc-800"
                label="Duration"
                value={`${days} Day${days !== 1 ? "s" : ""}`}
                sub={`${fmtDate(tournament.startDate)} – ${fmtDate(tournament.endDate)}`}
              />
            </div>

            {/* Info + Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Tournament Information card */}
              <div className="bg-[#1c1c1c] border border-zinc-800 rounded-xl overflow-hidden p-4">
                {/* mini blue header strip */}
                <div className="bg-zinc-800 h-12 rounded-lg flex items-center gap-2 px-4 mb-5">
                  <Info className="w-4 h-4 text-white" />
                  <span className="text-white text-sm font-bold">Tournament Information</span>
                </div>
                <InfoRow label="Tournament Name" value={tournament.tournamentName} />
                <InfoRow label="Format" value={tournament.playingFormat} />
                <InfoRow label="Start Date" value={fmtDate(tournament.startDate)} />
                <InfoRow label="End Date" value={fmtDate(tournament.endDate)} />
                <InfoRow
                  label="Status"
                  value={
                    <span
                      className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full text-white ${statusColor(tournament.playingStatus)}`}
                    >
                      {tournament.playingStatus}
                    </span>
                  }
                />
                <InfoRow label="Teams" value={`${teams.length} registered`} />
                <InfoRow
                  label="Created At"
                  value={tournament.createdAt ? fmtDate(tournament.createdAt) : "—"}
                />
              </div>

              {/* Recent Activity card */}
              <div className="bg-[#1c1c1c] border border-zinc-800 rounded-xl overflow-hidden p-4">
                {/* mini blue header strip */}
                <div className="bg-zinc-800 h-12 rounded-lg flex items-center gap-2 px-4 mb-5">
                  <Zap className="w-4 h-4 text-white" />
                  <span className="text-white text-sm font-bold">Recent Activity</span>
                </div>

                {matches.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-3">
                    <Calendar className="w-10 h-10 text-zinc-700" />
                    <p className="text-sm font-medium text-zinc-500">No recent activity</p>
                    <p className="text-xs text-zinc-600 text-center max-w-[220px]">
                      Activity will appear here as your tournament progresses.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {matches.slice(0, 6).map((m) => (
                      <div
                        key={m._id}
                        className="flex items-center gap-3 py-2.5 border-b border-zinc-800/60 last:border-0"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                        <p className="text-xs text-zinc-400 flex-1">
                          Match — {fmtDate(m.matchDate)}
                        </p>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            m.matchStatus === "LIVE"
                              ? "bg-red-600 text-white"
                              : m.matchStatus === "COMPLETED"
                              ? "bg-zinc-600 text-white"
                              : "bg-blue-600 text-white"
                          }`}
                        >
                          {m.matchStatus}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-[#1c1c1c] border border-zinc-800 rounded-xl overflow-hidden p-4">
              <div className="bg-zinc-800 h-12 rounded-lg flex items-center gap-2 px-4 mb-5">
                <Zap className="w-4 h-4 text-white" />
                <span className="text-white text-sm font-bold">Quick Actions</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {isOwner && (
                  <ActionCard
                    icon={<Users className="w-4 h-4" />}
                    title="Add Team"
                    sub="Add new teams to the tournament"
                    onClick={() => {
                      setActiveTab("Teams");
                      setIsTeamModalOpen(true);
                    }}
                  />
                )}
                {isOwner && (
                  <ActionCard
                    icon={<Pencil className="w-4 h-4" />}
                    title="Create Match"
                    sub="Schedule a new match"
                    onClick={() => {
                      setActiveTab("Matches");
                      setIsMatchModalOpen(true);
                    }}
                  />
                )}
                <ActionCard
                  icon={<Swords className="w-4 h-4" />}
                  title="View All Matches"
                  sub="See all tournament matches"
                  onClick={() => setActiveTab("Matches")}
                />
                <ActionCard
                  icon={<UserRound className="w-4 h-4" />}
                  title={isOwner ? "Manage Players" : "View Players"}
                  sub={isOwner ? "View and manage players" : "View registered players"}
                  onClick={() => setActiveTab("Players")}
                />
              </div>
            </div>
          </div>
        )}

        {/* Teams tab */}
        {activeTab === "Teams" && (
          <div className="bg-[#1c1c1c] border border-zinc-800 rounded-xl overflow-hidden p-4">
            <div className="bg-zinc-800 h-12 rounded-lg flex items-center justify-between px-4 mb-5">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-white" />
                <span className="text-white text-sm font-bold ">Registered Teams</span>
              </div>
              {isOwner && (
                <button
                  onClick={() => setIsTeamModalOpen(true)}
                  className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Team
                </button>
              )}
            </div>
            {teams.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-zinc-500">
                <Trophy className="w-10 h-10 opacity-30" />
                <p className="text-sm font-medium">No teams registered yet</p>
                {isOwner && (
                  <button
                    onClick={() => setIsTeamModalOpen(true)}
                    className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors mt-2"
                  >
                    <Plus className="w-3.5 h-3.5" /> Register First Team
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teams.map((t) => (
                  <div
                    key={t._id}
                    className="bg-[#1c1c1c] border border-zinc-800 rounded-xl p-5 flex flex-col justify-between gap-4"
                  >
                    {/* Top Row: Logo, Name, Trash */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-[#0b36aa] flex items-center justify-center shrink-0 text-white font-bold text-base tracking-wider">
                          {getAcronym(t.teamName)}
                        </div>
                        <div>
                          <h4 className="text-white font-bold text-lg leading-tight break-words">
                            {t.teamName}
                          </h4>
                        </div>
                      </div>
                      
                      {isOwner && (
                        <button
                          onClick={() => handleDeleteTeam(t._id)}
                          className="text-red-500 hover:text-red-400 p-1.5 hover:bg-red-500/10 rounded-lg transition-colors shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Mid Row: Details */}
                    <div className="space-y-1">
                      <p className="text-zinc-400 text-xs">
                        Acronym : <span className="text-white font-medium">{getAcronym(t.teamName)}</span>
                      </p>
                      <p className="text-zinc-500 text-xs flex items-center gap-1.5">
                        <span>Matches 0</span>
                        <span>•</span>
                        <span>Win Rate 0%</span>
                      </p>
                    </div>

                    {/* Bottom Row: Actions */}
                    <div className="flex flex-col gap-2 mt-1">
                      <div className="flex items-center gap-3">
                        <Link
                          to={`/teams/${t._id}`}
                          className="flex-1 bg-white text-black hover:bg-zinc-200 text-center font-bold text-xs py-2 rounded-lg flex items-center justify-center gap-1 transition-colors"
                        >
                          View More <ArrowRight className="w-3 h-3" />
                        </Link>
                        
                        {isOwner && (
                          <button
                            onClick={() => handleGenerateInvite(t._id)}
                            disabled={generatingInvite}
                            className="flex-1 bg-[#fcf8e3] text-black hover:bg-[#f5eea5] text-center font-bold text-xs py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                          >
                            Invite Player
                          </button>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-center gap-1.5 bg-[#121212] border border-zinc-800 py-1.5 rounded-lg text-white text-xs font-medium w-full">
                        <span>🏆</span>
                        <span>Tournament Wins : {t.tournamentWins ?? 0}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Matches tab */}
        {activeTab === "Matches" && (() => {
          const teamMap = Object.fromEntries(teams.map((t) => [t._id, t]));
          const filtered = matches.filter((m) =>
            matchStatusFilter === "ALL" ? true : m.matchStatus === matchStatusFilter
          );
          const counts = {
            ALL: matches.length,
            LIVE: matches.filter((m) => m.matchStatus === "LIVE").length,
            SCHEDULED: matches.filter((m) => m.matchStatus === "SCHEDULED").length,
            COMPLETED: matches.filter((m) => m.matchStatus === "COMPLETED").length,
          };

          return (
            <div className="bg-[#1c1c1c] border border-zinc-800 rounded-xl overflow-hidden p-4 space-y-5">
              {/* Header */}
              <div className="bg-zinc-800 h-12 rounded-lg flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                  <Swords className="w-4 h-4 text-white" />
                  <span className="text-white text-sm font-bold">Matches</span>
                </div>
                {isOwner && (
                  <Modal
                    title="Create Match"
                    description="Schedule a new match between two teams in this tournament."
                    open={isMatchModalOpen}
                    onOpenChange={setIsMatchModalOpen}
                    trigger={
                      <button className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors">
                        <Plus className="w-3.5 h-3.5" /> Add Match
                      </button>
                    }
                  >
                    <AddMatchModalContent
                      tournamentId={id!}
                      teams={teams}
                      tournament={tournament!}
                      onSuccess={() => { setIsMatchModalOpen(false); refreshMatches(); }}
                      onCancel={() => setIsMatchModalOpen(false)}
                    />
                  </Modal>
                )}
              </div>

              {/* Status filter tabs */}
              <div className="flex gap-1 bg-[#151515] border border-zinc-800 rounded-lg p-1 w-fit">
                {(["ALL", "LIVE", "SCHEDULED", "COMPLETED"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setMatchStatusFilter(s)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                      matchStatusFilter === s
                        ? "bg-white text-black"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    {s === "ALL" ? `All (${counts.ALL})` : s === "LIVE" ? `Live (${counts.LIVE})` : s === "SCHEDULED" ? `Scheduled (${counts.SCHEDULED})` : `Completed (${counts.COMPLETED})`}
                  </button>
                ))}
              </div>

              {/* Empty */}
              {filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-zinc-500">
                  <Swords className="w-10 h-10 opacity-30" />
                  <p className="text-sm font-medium">
                    {matches.length === 0 ? "No matches scheduled yet" : "No matches for this filter"}
                  </p>
                  {matches.length === 0 && isOwner && (
                    <button
                      onClick={() => setIsMatchModalOpen(true)}
                      className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors mt-2"
                    >
                      <Plus className="w-3.5 h-3.5" /> Schedule First Match
                    </button>
                  )}
                </div>
              )}

              {/* Match cards */}
              {filtered.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filtered.map((m, idx) => {
                    const teamA = teamMap[m.teamAId];
                    const teamB = teamMap[m.teamBId];
                    const canDelete = m.matchStatus === "SCHEDULED";
                    const statusBg =
                      m.matchStatus === "LIVE" ? "bg-red-600" :
                      m.matchStatus === "COMPLETED" ? "bg-zinc-600" : "bg-[#0b36aa]";

                    return (
                      <div
                        key={m._id}
                        className="bg-[#151515] border border-zinc-800 rounded-xl p-4 flex flex-col gap-4"
                      >
                        {/* Card top row: Match N + date */}
                        <div className="flex items-center justify-between">
                          <span className="text-[#fcf8e3] text-sm font-bold">Match {idx + 1}</span>
                          <span className="text-zinc-500 text-xs flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {fmtDate(m.matchDate)}
                          </span>
                        </div>

                        {/* Teams row */}
                        <div className="flex items-center justify-center gap-6 py-2">
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 rounded-full bg-[#0b36aa] flex items-center justify-center text-white font-bold text-sm">
                              {teamA ? getAcronym(teamA.teamName) : "?"}
                            </div>
                            <span className="text-white text-xs font-semibold text-center max-w-[80px] leading-tight">
                              {teamA?.teamName ?? "TBD"}
                            </span>
                          </div>

                          <span className="text-zinc-400 font-bold text-sm">VS</span>

                          <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 rounded-full bg-zinc-700 flex items-center justify-center text-white font-bold text-sm">
                              {teamB ? getAcronym(teamB.teamName) : "?"}
                            </div>
                            <span className="text-white text-xs font-semibold text-center max-w-[80px] leading-tight">
                              {teamB?.teamName ?? "TBD"}
                            </span>
                          </div>
                        </div>

                        {/* Score row (if live/completed) */}
                        {(m.matchStatus === "LIVE" || m.matchStatus === "COMPLETED") && (
                          <div className="flex flex-col gap-2 border-t border-zinc-800 pt-3">
                            <div className="flex items-center justify-center gap-4 text-xs">
                              <span className="text-white font-semibold">
                                {teamA ? getAcronym(teamA.teamName) : "A"}:{" "}
                                <span className="text-blue-300">{m.teamAScore}/{m.teamAWickets}</span>
                                <span className="text-zinc-500 font-normal ml-1">({Math.floor(m.teamABalls / 6)}.{m.teamABalls % 6})</span>
                              </span>
                              <span className="text-zinc-600">•</span>
                              <span className="text-white font-semibold">
                                {teamB ? getAcronym(teamB.teamName) : "B"}:{" "}
                                <span className="text-blue-300">{m.teamBScore}/{m.teamBWickets}</span>
                                <span className="text-zinc-500 font-normal ml-1">({Math.floor(m.teamBBalls / 6)}.{m.teamBBalls % 6})</span>
                              </span>
                            </div>

                            {/* Winner declaration */}
                            {m.matchStatus === "COMPLETED" && (
                              <div className="text-center text-green-400 text-xs font-bold text-[#fcf8e3] bg-zinc-800/40 border border-zinc-700/30 rounded-lg px-2.5 py-1.5 flex items-center justify-center gap-1.5">
                                {m.winnerTeamId ? (
                                  m.winnerTeamId === teamA?._id ? (
                                    <span> Winner: <span className="text-green-400">{teamA?.teamName}</span></span>
                                  ) : m.winnerTeamId === teamB?._id ? (
                                    <span> Winner: <span className="text-green-400">{teamB?.teamName}</span></span>
                                  ) : (
                                    <span> Winner declared!</span>
                                  )
                                ) : (
                                  <span className="text-zinc-400">🤝 Match ended in a Draw</span>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Footer: status + actions */}
                        <div className="flex items-center justify-between border-t border-zinc-800 pt-3">
                          <span
                            className={`${statusBg} text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1`}
                          >
                            {m.matchStatus === "LIVE" && <Radio className="w-2.5 h-2.5 animate-pulse" />}
                            {m.matchStatus}
                          </span>

                          <div className="flex items-center gap-2">
                            {canDelete && isOwner && (
                              <button
                                onClick={() => handleDeleteMatch(m._id)}
                                className="p-1.5 text-red-500 hover:bg-red-600/10 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {m.matchStatus === "SCHEDULED" && isOwner && (
                              <button
                                onClick={() => navigate(`/scorecard/${m._id}`)}
                                className="bg-[#0b36aa] hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                              >
                                <Play className="w-3 h-3 fill-white" /> Start Match
                              </button>
                            )}
                            {m.matchStatus === "LIVE" && isOwner && (
                              <button
                                onClick={() => navigate(`/scorecard/${m._id}`)}
                                className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                              >
                                <Radio className="w-3 h-3 animate-pulse" /> Live Scorer
                              </button>
                            )}
                            <button
                              onClick={() => navigate(`/scorecard/${m._id}`)}
                              className="bg-white text-black hover:bg-zinc-200 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                            >
                              View Match <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}

        {/* Players tab */}
        {activeTab === "Players" && (
          <PlayersTab
            tournamentId={id!}
            teams={teams}
            squadMap={squadMap}
            squadLoading={squadLoading}
            isAddPlayerModalOpen={isAddPlayerModalOpen}
            addPlayerTargetTeamId={addPlayerTargetTeamId}
            onOpenAddPlayer={(teamId) => {
              setAddPlayerTargetTeamId(teamId);
              setIsAddPlayerModalOpen(true);
            }}
            onOpenAddTeam={() => setIsTeamModalOpen(true)}
            onCloseAddPlayer={() => setIsAddPlayerModalOpen(false)}
            onPlayerAdded={() => {
              setIsAddPlayerModalOpen(false);
              refreshSquads(teams);
            }}
            onRefreshSquads={() => refreshSquads(teams)}
            isOwner={isOwner}
          />
        )}

      </div>

      {/* Invite Link Modal */}
      {isInviteModalOpen && activeInviteLink && (
        <Modal
          title="Invite Player"
          description="Copy the link below and send it to the player you want to invite to this team."
          open={isInviteModalOpen}
          onOpenChange={(open) => {
            setIsInviteModalOpen(open);
            if (!open) setCopied(false);
          }}
        >
          <div className="space-y-4 pt-2 w-full min-w-0 overflow-hidden">
            <div className="bg-[#1e1e22] border border-zinc-800 rounded-lg p-3 flex items-center justify-between gap-3 w-full min-w-0 overflow-hidden">
              <div className="text-xs text-white font-mono truncate select-all flex-1 min-w-0">{activeInviteLink}</div>
              <Button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(activeInviteLink);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  } catch (err) {
                    console.error("Failed to copy text", err);
                  }
                }}
                className={`${
                  copied ? "bg-green-600 hover:bg-green-500 text-white" : "bg-[#fcf8e3] text-black hover:bg-[#f5eea5]"
                } text-[10px] font-bold px-3 py-1.5 h-auto shrink-0 transition-colors cursor-pointer`}
              >
                {copied ? "Copied!" : "Copy Link"}
              </Button>
            </div>
            <div className="flex justify-end pt-2">
              <Button
                onClick={() => {
                  setIsInviteModalOpen(false);
                  setCopied(false);
                }}
                className="border-zinc-700 hover:bg-zinc-800 text-zinc-300 text-xs bg-transparent hover:text-white"
              >
                Done
              </Button>
            </div>
          </div>
        </Modal>
      )}
      {/* Add Team Modal */}
      {isTeamModalOpen && (
        <Modal
          title="Add Team"
          description="Enter the team name to register it for this tournament."
          open={isTeamModalOpen}
          onOpenChange={setIsTeamModalOpen}
        >
          <AddTeamModalContent
            tournamentId={id!}
            onSuccess={async () => {
              setIsTeamModalOpen(false);
              const updatedTeams = await refreshTeams();
              if (updatedTeams) {
                await refreshSquads(updatedTeams);
              }
            }}
            onCancel={() => setIsTeamModalOpen(false)}
          />
        </Modal>
      )}
      {/* Edit Tournament Modal */}
      {isEditTournamentModalOpen && tournament && (
        <Modal
          title="Edit Tournament"
          description="Update the details of your tournament below."
          open={isEditTournamentModalOpen}
          onOpenChange={setIsEditTournamentModalOpen}
        >
          <EditTournamentModalContent
            tournament={tournament}
            onSuccess={(updated) => {
              setTournament(updated);
              setIsEditTournamentModalOpen(false);
            }}
            onCancel={() => setIsEditTournamentModalOpen(false)}
          />
        </Modal>
      )}
    </Layout>
  );
}
