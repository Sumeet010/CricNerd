import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Swords,
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
  Calendar,
  ArrowRight,
  Filter,
  Radio,
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { matchService, tournamentService, teamService } from "@/services";
import type {
  Match,
  Tournament,
  Team,
  CreateMatchRequest,
} from "@/types";

/* ─── helpers ─── */
function fmtDate(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function matchStatusColor(status: string) {
  if (status === "LIVE") return "bg-red-600";
  if (status === "COMPLETED") return "bg-zinc-600";
  return "bg-blue-600"; // SCHEDULED
}

function matchStatusIcon(status: string) {
  if (status === "LIVE") return <Radio className="w-3 h-3 animate-pulse" />;
  if (status === "COMPLETED") return <span>✅</span>;
  return <Calendar className="w-3 h-3" />;
}

function getAcronym(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return parts.map((p) => p[0]).join("").toUpperCase().slice(0, 4);
}

/* ─── Skeleton ─── */
function SkeletonRow() {
  return (
    <div className="bg-[#1c1c1c] border border-zinc-800 rounded-xl p-4 animate-pulse flex items-center gap-4">
      <div className="w-10 h-10 bg-zinc-800 rounded-lg shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-zinc-800 rounded w-1/2" />
        <div className="h-3 bg-zinc-800 rounded w-1/3" />
      </div>
      <div className="w-20 h-6 bg-zinc-800 rounded-full" />
    </div>
  );
}

/* ─── Create Match Form ─── */
interface CreateMatchFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

function CreateMatchForm({ onSuccess, onCancel }: CreateMatchFormProps) {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loadingTournaments, setLoadingTournaments] = useState(true);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<CreateMatchRequest>({
    tournamentId: "",
    teamAId: "",
    teamBId: "",
    matchDate: "",
  });

  /* Load tournaments on mount */
  useEffect(() => {
    tournamentService.getMyTournaments().then((res) => {
      setTournaments(res.findMyTournaments ?? []);
      setLoadingTournaments(false);
    });
  }, []);

  /* Load teams when tournament changes */
  useEffect(() => {
    if (!form.tournamentId) {
      setTeams([]);
      return;
    }
    setLoadingTeams(true);
    teamService.getAll().then((res) => {
      setTeams(
        (res.allTeams ?? []).filter(
          (t) => t.tournamentId === form.tournamentId
        )
      );
      setLoadingTeams(false);
    });
  }, [form.tournamentId]);

  const set = (key: keyof CreateMatchRequest, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.tournamentId || !form.teamAId || !form.teamBId || !form.matchDate) {
      setError("All fields are required.");
      return;
    }
    if (form.teamAId === form.teamBId) {
      setError("Team A and Team B must be different.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await matchService.create(form);
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to create match.");
    } finally {
      setSubmitting(false);
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

      {/* Tournament */}
      <div className="space-y-1.5">
        <label className="text-zinc-300 text-xs font-semibold">Tournament</label>
        {loadingTournaments ? (
          <div className="h-9 bg-zinc-800 rounded-lg animate-pulse" />
        ) : (
          <select
            value={form.tournamentId}
            onChange={(e) => {
              set("tournamentId", e.target.value);
              set("teamAId", "");
              set("teamBId", "");
            }}
            className="w-full bg-[#1e1e22] border border-zinc-800 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-zinc-600"
          >
            <option value="">Select tournament…</option>
            {tournaments.map((t) => (
              <option key={t._id} value={t._id}>
                {t.tournamentName}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Team A */}
      <div className="space-y-1.5">
        <label className="text-zinc-300 text-xs font-semibold">Team A</label>
        {loadingTeams ? (
          <div className="h-9 bg-zinc-800 rounded-lg animate-pulse" />
        ) : (
          <select
            value={form.teamAId}
            onChange={(e) => set("teamAId", e.target.value)}
            disabled={!form.tournamentId || teams.length === 0}
            className="w-full bg-[#1e1e22] border border-zinc-800 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-zinc-600 disabled:opacity-50"
          >
            <option value="">Select team…</option>
            {teams.map((t) => (
              <option key={t._id} value={t._id}>
                {t.teamName}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Team B */}
      <div className="space-y-1.5">
        <label className="text-zinc-300 text-xs font-semibold">Team B</label>
        <select
          value={form.teamBId}
          onChange={(e) => set("teamBId", e.target.value)}
          disabled={!form.tournamentId || teams.length === 0}
          className="w-full bg-[#1e1e22] border border-zinc-800 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-zinc-600 disabled:opacity-50"
        >
          <option value="">Select team…</option>
          {teams
            .filter((t) => t._id !== form.teamAId)
            .map((t) => (
              <option key={t._id} value={t._id}>
                {t.teamName}
              </option>
            ))}
        </select>
      </div>

      {/* Match Date */}
      <div className="space-y-1.5">
        <label className="text-zinc-300 text-xs font-semibold">Match Date</label>
        <Input
          type="date"
          value={form.matchDate}
          onChange={(e) => set("matchDate", e.target.value)}
          className="bg-[#1e1e22] border-zinc-800 text-white focus-visible:border-zinc-700 focus-visible:ring-zinc-800 [color-scheme:dark]"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={submitting}
          className="border-zinc-700 hover:bg-zinc-800 text-zinc-300 text-xs bg-transparent hover:text-white"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={submitting}
          className="bg-[#fcf8e3] text-black hover:bg-[#f5eea5] text-xs font-semibold flex items-center gap-1.5"
        >
          {submitting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Creating…
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" /> Create Match
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

/* ─── Match Card ─── */
interface MatchCardProps {
  match: Match;
  teamA?: Team;
  teamB?: Team;
  tournament?: Tournament;
  onDelete: (id: string) => void;
  deletingId: string | null;
}

function MatchCard({
  match,
  teamA,
  teamB,
  tournament,
  onDelete,
  deletingId,
}: MatchCardProps) {
  const navigate = useNavigate();
  const isDeleting = deletingId === match._id;
  const canDelete = match.matchStatus === "SCHEDULED";

  return (
    <div className="bg-[#1c1c1c] border border-zinc-800 rounded-xl overflow-hidden p-4 flex flex-col gap-4">
      {/* Blue header */}
      <div className="bg-[#0b36aa] h-16 rounded-lg relative flex items-center justify-center px-4">
        {/* Teams row */}
        <div className="flex items-center gap-3 text-white">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-md bg-white/20 flex items-center justify-center text-xs font-bold">
              {teamA ? getAcronym(teamA.teamName) : "?"}
            </div>
            <span className="text-[10px] mt-1 font-semibold truncate max-w-[64px] text-center">
              {teamA?.teamName ?? "TBD"}
            </span>
          </div>
          <Swords className="w-4 h-4 text-blue-200 shrink-0" />
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-md bg-white/20 flex items-center justify-center text-xs font-bold">
              {teamB ? getAcronym(teamB.teamName) : "?"}
            </div>
            <span className="text-[10px] mt-1 font-semibold truncate max-w-[64px] text-center">
              {teamB?.teamName ?? "TBD"}
            </span>
          </div>
        </div>

        {/* Status badge */}
        <div
          className={`absolute -bottom-3 right-4 ${matchStatusColor(match.matchStatus)} text-white text-[10px] font-bold px-3 py-1 rounded-full border-2 border-[#1c1c1c] flex items-center gap-1`}
        >
          {matchStatusIcon(match.matchStatus)}
          {match.matchStatus}
        </div>
      </div>

      {/* Body */}
      <div className="mt-2">
        <p className="text-white font-bold text-sm">
          {teamA?.teamName ?? "Team A"}{" "}
          <span className="text-zinc-500 font-normal">vs</span>{" "}
          {teamB?.teamName ?? "Team B"}
        </p>
        <p className="text-zinc-500 text-xs mt-1 flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {fmtDate(match.matchDate)}
          {tournament && (
            <span className="ml-2 text-zinc-600">· {tournament.tournamentName}</span>
          )}
        </p>

        {/* Score (if played) */}
        {(match.matchStatus === "LIVE" || match.matchStatus === "COMPLETED") && (
          <div className="mt-3 flex items-center gap-3 text-xs">
            <div className="bg-zinc-800 rounded-lg px-3 py-1.5 text-white font-semibold">
              {teamA ? getAcronym(teamA.teamName) : "A"}:{" "}
              <span className="text-blue-300">{match.teamAScore}/{match.teamAWickets}</span>
              <span className="text-zinc-500 font-normal ml-1">
                ({Math.floor(match.teamABalls / 6)}.{match.teamABalls % 6} ov)
              </span>
            </div>
            <div className="bg-zinc-800 rounded-lg px-3 py-1.5 text-white font-semibold">
              {teamB ? getAcronym(teamB.teamName) : "B"}:{" "}
              <span className="text-blue-300">{match.teamBScore}/{match.teamBWickets}</span>
              <span className="text-zinc-500 font-normal ml-1">
                ({Math.floor(match.teamBBalls / 6)}.{match.teamBBalls % 6} ov)
              </span>
            </div>
          </div>
        )}

        {/* Winner declaration */}
        {match.matchStatus === "COMPLETED" && (
          <div className="mt-2.5 text-xs font-bold text-[#fcf8e3] bg-zinc-800/40 border border-zinc-700/30 rounded-lg px-3 py-2 flex items-center gap-1.5">
            {match.winnerTeamId ? (
              match.winnerTeamId === teamA?._id ? (
                <span> Winner: <span className="text-white">{teamA?.teamName}</span></span>
              ) : match.winnerTeamId === teamB?._id ? (
                <span> Winner: <span className="text-white">{teamB?.teamName}</span></span>
              ) : (
                <span> Winner declared!</span>
              )
            ) : (
              <span className="text-zinc-400">🤝 Match ended in a Draw</span>
            )}
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="flex gap-2 mt-auto">
        {canDelete && (
          <button
            onClick={() => onDelete(match._id)}
            disabled={isDeleting}
            className="p-2 bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        )}

        {match.matchStatus === "LIVE" && (
          <button
            onClick={() => navigate(`/live-scoring/${match._id}`)}
            className="flex-1 bg-red-600 text-white font-semibold text-xs py-2 rounded-lg flex items-center justify-center gap-1.5 hover:bg-red-700 transition-colors"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse" /> Live Score
          </button>
        )}

        <button
          onClick={() => navigate(`/scorecard/${match._id}`)}
          className="flex-1 bg-[#fcf8e3] text-black font-semibold text-xs py-2 rounded-lg flex items-center justify-center gap-1.5 hover:bg-[#f5eea5] transition-colors"
        >
          Scorecard <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════ */
type StatusFilter = "ALL" | "SCHEDULED" | "LIVE" | "COMPLETED";

export default function Matches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  /* Filters */
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [tournamentFilter, setTournamentFilter] = useState<string>("ALL");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [matchRes, teamRes, tournRes] = await Promise.all([
        matchService.getAll(),
        teamService.getAll(),
        tournamentService.getMyTournaments(),
      ]);
      setMatches(matchRes.allMatches ?? []);
      setTeams(teamRes.allTeams ?? []);
      setTournaments(tournRes.findMyTournaments ?? []);
    } catch (err: any) {
      setError(err.message || "Failed to load matches.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this match? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await matchService.delete(id);
      setMatches((prev) => prev.filter((m) => m._id !== id));
    } catch (err: any) {
      alert(err.message || "Failed to delete match.");
    } finally {
      setDeletingId(null);
    }
  };

  /* helpers to resolve ids */
  const teamMap = Object.fromEntries(teams.map((t) => [t._id, t]));
  const tournMap = Object.fromEntries(tournaments.map((t) => [t._id, t]));

  /* filtered list */
  const filtered = matches.filter((m) => {
    if (statusFilter !== "ALL" && m.matchStatus !== statusFilter) return false;
    if (tournamentFilter !== "ALL" && m.tournamentId !== tournamentFilter) return false;
    return true;
  });

  /* counts */
  const live = matches.filter((m) => m.matchStatus === "LIVE").length;
  const scheduled = matches.filter((m) => m.matchStatus === "SCHEDULED").length;
  const completed = matches.filter((m) => m.matchStatus === "COMPLETED").length;

  const STATUS_TABS: { label: string; value: StatusFilter }[] = [
    { label: `All (${matches.length})`, value: "ALL" },
    { label: `Live (${live})`, value: "LIVE" },
    { label: `Scheduled (${scheduled})`, value: "SCHEDULED" },
    { label: `Completed (${completed})`, value: "COMPLETED" },
  ];

  return (
    <Layout
      title="Matches"
      subtitle="SCHEDULE"
      action={
        <Modal
          title="Create Match"
          description="Schedule a new match between two teams."
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          trigger={
            <button className="bg-[#fcf8e3] text-black font-semibold px-4 py-2 rounded-lg text-sm hover:bg-[#f5eea5] transition-colors flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> Create Match
            </button>
          }
        >
          <CreateMatchForm
            onSuccess={() => {
              setIsModalOpen(false);
              fetchData();
            }}
            onCancel={() => setIsModalOpen(false)}
          />
        </Modal>
      }
    >
      <div className="space-y-6">
        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 bg-red-900/30 border border-red-700/50 text-red-400 text-sm px-4 py-3 rounded-lg">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
            <button
              onClick={fetchData}
              className="ml-auto underline hover:no-underline text-xs"
            >
              Retry
            </button>
          </div>
        )}

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {/* Status tabs */}
          <div className="flex gap-1 bg-[#1c1c1c] border border-zinc-800 rounded-lg p-1">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  statusFilter === tab.value
                    ? "bg-white text-black"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tournament filter */}
          <div className="flex items-center gap-2 ml-auto">
            <Filter className="w-3.5 h-3.5 text-zinc-500" />
            <select
              value={tournamentFilter}
              onChange={(e) => setTournamentFilter(e.target.value)}
              className="bg-[#1c1c1c] border border-zinc-800 text-zinc-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-zinc-600"
            >
              <option value="ALL">All Tournaments</option>
              {tournaments.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.tournamentName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-zinc-500">
            <Swords className="w-12 h-12 opacity-30" />
            <p className="text-sm font-medium">
              {matches.length === 0 ? "No matches scheduled yet" : "No matches match the filter"}
            </p>
            {matches.length === 0 && (
              <p className="text-xs">Create your first match to get started.</p>
            )}
          </div>
        )}

        {/* Match cards */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((m) => (
              <MatchCard
                key={m._id}
                match={m}
                teamA={teamMap[m.teamAId]}
                teamB={teamMap[m.teamBId]}
                tournament={tournMap[m.tournamentId]}
                onDelete={handleDelete}
                deletingId={deletingId}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
