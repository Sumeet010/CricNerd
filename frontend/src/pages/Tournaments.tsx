import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Trash2, ArrowRight, Loader2, Trophy, AlertCircle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { CreateTournamentForm } from "@/components/features/CreateTournamentForm";
import { tournamentService } from "@/services";

import type { Tournament } from "@/types";

/* ─── helpers ─── */
function formatDate(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function statusColor(status: string) {
  if (status === "ONGOING") return "bg-blue-600";
  if (status === "COMPLETED") return "bg-zinc-600";
  return "bg-green-600"; // UPCOMING
}

function overs(format: string) {
  // "5 Overs" → "5"
  return format?.split(" ")[0] ?? "?";
}

/* ─── skeleton card ─── */
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

export default function Tournaments() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* Per-card action loading states */
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [startingId, setStartingId] = useState<string | null>(null);

  /* ── fetch MY tournaments (organiser-specific route) ── */
  const fetchTournaments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await tournamentService.getMyTournaments();
      setTournaments(res.findMyTournaments ?? []);
    } catch (err: any) {
      setError(err.message || "Failed to load tournaments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTournaments();
  }, [fetchTournaments]);

  /* ── delete tournament ── */
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this tournament? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await tournamentService.delete(id);
      setTournaments((prev) => prev.filter((t) => t._id !== id));
    } catch (err: any) {
      alert(err.message || "Failed to delete tournament");
    } finally {
      setDeletingId(null);
    }
  };

  /* ── start tournament (UPCOMING → ONGOING) ── */
  const handleStart = async (id: string) => {
    setStartingId(id);
    try {
      await tournamentService.updateStatus(id, { playingStatus: "ONGOING" });
      setTournaments((prev) =>
        prev.map((t) =>
          t._id === id ? { ...t, playingStatus: "ONGOING" } : t
        )
      );
    } catch (err: any) {
      alert(err.message || "Failed to start tournament");
    } finally {
      setStartingId(null);
    }
  };

  /* ── after create modal closes with success ── */
  const handleCreateSuccess = () => {
    setIsModalOpen(false);
    fetchTournaments();
  };

  return (
    <Layout
      title="Tournaments"
      subtitle="LATEST"
      action={
        <Modal
          title="Create Tournament"
          description="Fill in the details to schedule a new tournament."
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          trigger={
            <button className="bg-[#fcf8e3] text-black font-semibold px-4 py-2 rounded-lg text-sm hover:bg-[#f5eea5] transition-colors">
              + Create Tournament
            </button>
          }
        >
          <CreateTournamentForm onSuccess={handleCreateSuccess} />
        </Modal>
      }
    >
      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 bg-red-900/30 border border-red-700/50 text-red-400 text-sm px-4 py-3 rounded-lg mb-6">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
          <button
            onClick={fetchTournaments}
            className="ml-auto underline hover:no-underline text-xs"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && tournaments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-zinc-500">
          <Trophy className="w-12 h-12 opacity-30" />
          <p className="text-sm font-medium">No tournaments yet</p>
          <p className="text-xs">Create your first tournament to get started.</p>
        </div>
      )}

      {/* Tournament cards */}
      {!loading && tournaments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tournaments.map((t) => {
            // All results from /tournaments/my belong to the logged-in user
            const isDeleting = deletingId === t._id;
            const isStarting = startingId === t._id;

            return (
              <div
                key={t._id}
                className="bg-[#1c1c1c] border border-zinc-800 rounded-xl overflow-hidden p-4"
              >
                {/* Card Header */}
                <div className="bg-[#0b36aa] h-40 rounded-lg relative flex items-center justify-center p-4">
                  {/* Delete button */}
                  <button
                    onClick={() => handleDelete(t._id)}
                    disabled={isDeleting}
                    className="absolute top-2 right-2 bg-red-600/20 text-red-500 hover:bg-red-600 hover:text-white p-1.5 rounded-full transition-colors disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>

                  {/* Tournament name display */}
                  <div className="text-white text-center px-6">
                    <div className="font-bold text-xl leading-tight break-words">
                      {t.tournamentName}
                    </div>
                    <div className="text-blue-200 text-xs mt-1 font-medium">
                      {t.playingFormat}
                    </div>
                  </div>

                  {/* Status badge */}
                  <div
                    className={`absolute -bottom-3 right-4 ${statusColor(t.playingStatus)} text-white text-[10px] font-bold px-3 py-1 rounded-full border-2 border-[#1c1c1c]`}
                  >
                    {t.playingStatus}
                  </div>
                </div>

                {/* Card Body */}
                <div className="mt-6 mb-6">
                  <h3 className="text-white font-bold text-lg flex items-baseline gap-2">
                    {t.tournamentName}{" "}
                    <span className="text-xs font-normal text-zinc-500">
                      ({overs(t.playingFormat)} Overs)
                    </span>
                  </h3>
                  <p className="text-zinc-500 text-xs mt-1">
                    {formatDate(t.startDate)} → {formatDate(t.endDate)}
                  </p>
                </div>

                {/* Card Footer */}
                <div className="flex gap-3">
                  {/* Start button — visible when UPCOMING */}
                  {t.playingStatus === "UPCOMING" && (
                    <button
                      onClick={() => handleStart(t._id)}
                      disabled={isStarting}
                      className="flex-1 bg-white text-black font-semibold text-xs py-2 rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-60 flex items-center justify-center gap-1"
                    >
                      {isStarting ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        "Start Tournament"
                      )}
                    </button>
                  )}

                  {/* Ongoing / completed label */}
                  {t.playingStatus !== "UPCOMING" && (
                    <div className="flex-1 text-center text-xs py-2 font-medium text-zinc-500">
                      {t.playingStatus === "ONGOING" ? "🟢 In Progress" : "✅ Completed"}
                    </div>
                  )}

                  <button
                    onClick={() => navigate(`/tournaments/${t._id}`)}
                    className="flex-1 bg-[#fcf8e3] text-black font-semibold text-xs py-2 rounded-lg flex items-center justify-center gap-1.5 hover:bg-[#f5eea5] transition-colors"
                  >
                    View more <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
