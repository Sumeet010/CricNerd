import { useState } from "react";
import { Trophy, Calendar, Check, Loader2, RotateCcw } from "lucide-react";

export function FakeTournamentSetup() {
  const [name, setName] = useState("Championship 2026");
  const [format, setFormat] = useState("20 Overs");
  const [startDate, setStartDate] = useState("2026-07-01");
  const [endDate, setEndDate] = useState("2026-07-10");
  const [oversPerBowler, setOversPerBowler] = useState(4);
  const [powerplay, setPowerplay] = useState(6);

  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setCreated(true);
    }, 1000);
  };

  const handleReset = () => {
    setCreated(false);
    setName("Championship 2026");
    setFormat("20 Overs");
    setStartDate("2026-07-01");
    setEndDate("2026-07-10");
    setOversPerBowler(4);
    setPowerplay(6);
  };

  if (created) {
    return (
      <div className="w-full max-w-md mx-auto bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full bg-[#d2fc00]/10 flex items-center justify-center text-[#d2fc00] mb-4 animate-bounce">
          <Check className="w-6 h-6" />
        </div>
        <h3 className="text-white text-lg font-bold mb-2">Tournament Created!</h3>
        <p className="text-zinc-400 text-xs mb-6">
          Your tournament is initialized and ready for team registration.
        </p>

        {/* Mock Tournament Card */}
        <div className="w-full bg-[#07090f] border border-zinc-850 rounded-xl overflow-hidden p-4 mb-6 text-left">
          <div className="bg-[#0b36aa] h-28 rounded-lg relative flex items-center justify-center p-4 mb-4">
            <div className="text-white text-center">
              <div className="font-bold text-lg leading-tight">{name}</div>
              <div className="text-blue-200 text-[10px] mt-1 font-medium uppercase tracking-wider">{format}</div>
            </div>
            <div className="absolute -bottom-3 right-4 bg-green-600 text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full border border-[#07090f]">
              UPCOMING
            </div>
          </div>
          <div className="px-1 py-1">
            <h4 className="text-white font-bold text-sm">{name}</h4>
            <div className="flex gap-2 text-zinc-500 text-xs mt-1.5 items-center">
              <Calendar className="w-3.5 h-3.5" />
              <span>{startDate} to {endDate}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 hover:text-white rounded-xl text-xs font-bold transition-all active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Create Another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleCreate} className="w-full max-w-md mx-auto bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl flex flex-col gap-4 text-left">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-1">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-[#d2fc00]" />
          <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Tournament Configuration</span>
        </div>
        <span className="text-[10px] bg-zinc-800 text-zinc-400 font-bold px-2 py-0.5 rounded-full">Step 01</span>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold text-zinc-400">Tournament Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-[#07090f] border border-zinc-850 focus:border-zinc-700 text-white text-xs rounded-xl px-3 py-2.5 outline-none transition-colors"
          placeholder="e.g. Cricnerd League 2026"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-zinc-400">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full bg-[#07090f] border border-zinc-850 focus:border-zinc-700 text-white text-xs rounded-xl px-3 py-2 outline-none transition-colors"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-zinc-400">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full bg-[#07090f] border border-zinc-850 focus:border-zinc-700 text-white text-xs rounded-xl px-3 py-2 outline-none transition-colors"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold text-zinc-400">Format</label>
        <div className="flex gap-2">
          {["5 Overs", "6 Overs", "20 Overs"].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFormat(f)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                format === f
                  ? "bg-[#d2fc00] text-zinc-950 border-[#d2fc00]"
                  : "bg-[#07090f] text-zinc-400 border-zinc-850 hover:text-white hover:border-zinc-800"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-zinc-800/60 pt-3 mt-1 grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-bold text-zinc-400">Overs per Bowler</label>
          <input
            type="number"
            value={oversPerBowler}
            onChange={(e) => setOversPerBowler(Number(e.target.value))}
            className="w-full bg-[#07090f] border border-zinc-850 focus:border-zinc-700 text-white text-xs rounded-xl px-3 py-1.5 outline-none transition-colors"
            min="1"
            max="10"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-bold text-zinc-400">Powerplay Overs</label>
          <input
            type="number"
            value={powerplay}
            onChange={(e) => setPowerplay(Number(e.target.value))}
            className="w-full bg-[#07090f] border border-zinc-850 focus:border-zinc-700 text-white text-xs rounded-xl px-3 py-1.5 outline-none transition-colors"
            min="0"
            max="10"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-[#d2fc00] hover:bg-[#b8dd00] text-zinc-950 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-70 active:scale-98"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Creating Tournament...
          </>
        ) : (
          "Create Tournament"
        )}
      </button>
    </form>
  );
}
