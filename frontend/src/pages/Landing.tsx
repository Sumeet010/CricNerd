import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import { FakeTournamentSetup } from "@/components/fake/FakeTournamentSetup";
import {
  Trophy,
  Swords,
  Users,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Star,
  Zap,
  Shield,
  ArrowUpRight,
} from "lucide-react";

/* ─────────────────────────────────────────────
   NAVBAR
───────────────────────────────────────────── */
function Navbar() {
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const current = window.scrollY;

      if (current > lastScrollY.current && current > 60) {
        setVisible(false);
      } else {
        setVisible(true);
      }
      lastScrollY.current = current;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navItems = [
    { id: "features", label: "Features" },
    { id: "how-it-works", label: "How it works" },
    { id: "info", label: "Info" },
  ]

  return (
    <header
      className="fixed z-50 bg-white border border-zinc-200 rounded-full px-4 py-2.5
                 flex items-center shadow-md transition-transform duration-300 ease-in-out"
      style={{
        top: "16px",
        left: "50%",
        width: "min(920px, calc(100% - 48px))",
        transform: `translateX(-50%) translateY(${visible ? "0" : "-160%"})`,
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 shrink-0">
        <img src={logo} alt="Cricnerd Logo" className="h-6 w-auto" />
        <span
          style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.95rem", fontWeight: 800, letterSpacing: "-0.08em" }}
          className="text-zinc-900"
        >
          Cricnerd
        </span>
      </div>

      {/* Nav links */}
      <nav className="hidden sm:flex items-center gap-7 ml-auto">
        {navItems.map(({ id, label }) => (
          <a
            key={id}
            href={`#${id}`}
            className="text-[0.82rem] font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            {label}
          </a>
        ))}
      </nav>

      {/* CTA */}
      <div className="flex items-center gap-2 ml-6 shrink-0">
        <Link
          to="/login"
          className="text-[0.82rem] font-medium text-zinc-500 hover:text-zinc-900 px-3 py-1.5
                     rounded-full hover:bg-zinc-100 transition-colors"
        >
          Sign in
        </Link>
        <Link
          to="/register"
          className="text-[0.82rem] font-semibold text-white bg-zinc-900 hover:bg-zinc-700
                     px-4 py-1.5 rounded-full transition-colors"
        >
          Get started
        </Link>
      </div>
    </header>
  );
}


/* ─────────────────────────────────────────────
   HERO
───────────────────────────────────────────── */
function Hero() {
  return (
    <section className="bg-[#fefdf7] min-h-[92vh] flex items-center justify-center px-[6vw] pt-28 pb-20">
      <div className="max-w-5xl w-full flex flex-col items-center text-center">

        {/* Badge
        <span className="inline-flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-widest
                         text-zinc-500 bg-[#f5f2de] border border-[#e2dcb8] px-3 py-1 rounded-full mb-8">
          <Star className="w-3 h-3" /> Cricket Management Platform
        </span> */}

        {/* Headline — line 1 normal, line 2 italic + accent, forced to 2 lines */}
        <h1 className="text-[clamp(3.2rem,6.5vw,5.6rem)] font-extrabold leading-[1.06] tracking-tight text-zinc-900 mb-6">
          Manage every match.<br />
          <span className="italic text-[#A8C72E]">Track every ball.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-[1.1rem] text-zinc-500 leading-relaxed max-w-xl mb-10">
          Cricnerd lets you manage teams, create match schedules, handle ball-by-ball scoring and track live scores
          — all in one powerful and easy-to-use platform.
        </p>

        {/* Buttons — unchanged */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/register"
            className="inline-flex items-center gap-1.5 bg-zinc-900 text-[#fefdf7] text-[0.9rem]
                       font-semibold px-6 py-3 rounded-full hover:bg-zinc-700 transition-all
                       hover:-translate-y-0.5"
          >
            Get started free <ChevronRight className="w-4 h-4" />
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 bg-[#f5f2de] text-zinc-700 text-[0.9rem]
                       font-semibold px-6 py-3 rounded-full hover:bg-[#ede9cc] transition-all
                       hover:-translate-y-0.5"
          >
            Manage Tournaments
          </Link>
        </div>

      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   FEATURES
───────────────────────────────────────────── */
function Features() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const totalHeight = rect.height - viewportHeight;
      if (totalHeight <= 0) return;

      const scrolled = -rect.top;
      const progress = Math.min(Math.max(scrolled / totalHeight, 0), 1);
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Text parallax/scale calculations (first 30% of scroll)
  const textProgress = Math.min(scrollProgress / 0.3, 1);
  const textScale = 1.3 - textProgress * 0.3; // Scales down from 1.3 to 1.0
  const textTranslateX = isMobile ? 0 : (1 - textProgress) * 24; // Translates left

  // Active word states based on scroll position
  const isOrgActive = scrollProgress < 0.35;
  const isPlayActive = scrollProgress >= 0.35 && scrollProgress < 0.68;
  const isFansActive = scrollProgress >= 0.68;

  // Organizer Image Scroll calculations
  // Centered at progress = 0.2
  const orgTranslateY = (0.2 - scrollProgress) * 800;
  const orgOpacity = Math.min(Math.max((scrollProgress - 0.02) / 0.12, 0), 1) *
    Math.min(Math.max((0.38 - scrollProgress) / 0.12, 0), 1);

  // Player Image Scroll calculations
  // Centered at progress = 0.52
  const playTranslateY = (0.52 - scrollProgress) * 800;
  const playOpacity = Math.min(Math.max((scrollProgress - 0.36) / 0.12, 0), 1) *
    Math.min(Math.max((0.7 - scrollProgress) / 0.12, 0), 1);

  // Fans Image Scroll calculations
  // Centered at progress = 0.85
  const fansTranslateY = (0.85 - scrollProgress) * 800;
  const fansOpacity = Math.min(Math.max((scrollProgress - 0.68) / 0.12, 0), 1) *
    Math.min(Math.max((0.98 - scrollProgress) / 0.1, 0), 1);

  return (
    <section ref={containerRef} className="relative h-[320vh] w-full" id="features">
      {/* Sticky viewport wrapper */}
      <div className="sticky top-0 h-screen w-full flex items-center overflow-hidden px-6 sm:px-12 md:px-16 lg:px-24">
        <div className="w-full max-w-7xl mx-auto flex flex-col md:grid md:grid-cols-12 gap-8 md:gap-12 items-center justify-center">

          {/* Left Column: Heading */}
          <div
            className="col-span-12 md:col-span-5 flex items-center md:items-start justify-center md:justify-start text-center md:text-left z-10 transition-transform duration-75 ease-out"
            style={{
              transform: `translateX(${textTranslateX}vw) scale(${textScale})`,
              transformOrigin: isMobile ? "center" : "left center",
            }}
          >
            <h2
              className="text-[#d2fc00] text-[clamp(2.2rem,4.5vw,3.6rem)] font-extrabold leading-[1.08] tracking-tight flex flex-col gap-1 md:gap-2"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              <span>For the</span>
              <span className={`transition-all duration-300 ${isOrgActive ? "font-extrabold not-italic text-[#d2fc00]" : "font-normal italic text-[#d2fc00]/45"}`}>
                organizers
              </span>
              <span className={`transition-all duration-300 ${isPlayActive ? "font-extrabold not-italic text-[#d2fc00]" : "font-normal italic text-[#d2fc00]/45"}`}>
                players
              </span>
              <span className="flex items-center gap-2 justify-center md:justify-start">
                <span className="text-[#d2fc00]/45 font-normal">and</span>
                <span className={`transition-all duration-300 ${isFansActive ? "font-extrabold not-italic text-[#d2fc00]" : "font-normal italic text-[#d2fc00]/45"}`}>
                  fans
                </span>
              </span>
            </h2>
          </div>

          {/* Right Column: Images */}
          <div className="col-span-12 md:col-span-7 flex items-center justify-center relative w-full h-[280px] sm:h-[340px] md:h-[480px]">
            {/* Organizer Image */}
            <div
              className="absolute inset-0 flex items-center justify-center transition-all duration-75"
              style={{
                opacity: orgOpacity,
                transform: `translateY(${orgTranslateY}px)`,
                pointerEvents: isOrgActive ? "auto" : "none",
              }}
            >
              <div className="w-[220px] sm:w-[270px] md:w-[360px] aspect-[4/5] rounded-[2.2rem] md:rounded-[2.8rem] overflow-hidden bg-zinc-900 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                <img
                  src="/organzier.jpg"
                  alt="Organizer"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Player Image */}
            <div
              className="absolute inset-0 flex items-center justify-center transition-all duration-75"
              style={{
                opacity: playOpacity,
                transform: `translateY(${playTranslateY}px)`,
                pointerEvents: isPlayActive ? "auto" : "none",
              }}
            >
              <div className="w-[220px] sm:w-[270px] md:w-[360px] aspect-[4/5] rounded-[2.2rem] md:rounded-[2.8rem] overflow-hidden bg-zinc-900 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                <img
                  src="/player.jpg"
                  alt="Player"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Fans Image */}
            <div
              className="absolute inset-0 flex items-center justify-center transition-all duration-75"
              style={{
                opacity: fansOpacity,
                transform: `translateY(${fansTranslateY}px)`,
                pointerEvents: isFansActive ? "auto" : "none",
              }}
            >
              <div className="w-[220px] sm:w-[270px] md:w-[360px] aspect-[4/5] rounded-[2.2rem] md:rounded-[2.8rem] overflow-hidden bg-zinc-900 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                <img
                  src="/fans.jpg"
                  alt="Fans"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   HOW IT WORKS (INTERACTIVE STEPS)
───────────────────────────────────────────── */


const scoreApiStr = `{
  "matchId": "m_9281",
  "status": "LIVE",
  "score": {
    "runs": 142,
    "wickets": 3,
    "overs": 18.4,
    "runRate": 7.61
  },
  "batsmen": [
    { "name": "A. Finch", "runs": 54, "balls": 32 },
    { "name": "S. Smith", "runs": 12, "balls": 8 }
  ]
}`;

function HowItWorks() {
  const [step2Tab, setStep2Tab] = useState("Invite Link");
  const [step3Tab, setStep3Tab] = useState("Interactive Scorer");

  // Step 3 Interactive Scorer State
  const [score, setScore] = useState({
    runs: 142,
    wickets: 3,
    overs: 18,
    balls: 4,
    batsmen: [
      { name: "A. Finch", runs: 54, balls: 32 },
      { name: "S. Smith", runs: 12, balls: 8 }
    ],
    bowler: { name: "M. Starc", overs: 3, balls: 4, maidens: 0, runs: 28, wickets: 1 }
  });

  const handleScoreEvent = (event: "dot" | "1" | "4" | "6" | "wicket") => {
    setScore(prev => {
      let nextRuns = prev.runs;
      let nextWickets = prev.wickets;
      let nextBalls = prev.balls + 1;
      let nextOvers = prev.overs;

      // Handle runs & wickets
      if (event === "1") nextRuns += 1;
      else if (event === "4") nextRuns += 4;
      else if (event === "6") nextRuns += 6;
      else if (event === "wicket") {
        nextWickets = Math.min(prev.wickets + 1, 10);
      }

      // Handle overs progression
      if (nextBalls >= 6) {
        nextOvers += 1;
        nextBalls = 0;
      }

      // Update current batsman's stats (Finch is on strike)
      const nextBatsmen = [...prev.batsmen];
      if (event !== "wicket" || nextWickets < 10) {
        let runsScored = 0;
        if (event === "1") runsScored = 1;
        else if (event === "4") runsScored = 4;
        else if (event === "6") runsScored = 6;

        nextBatsmen[0] = {
          ...nextBatsmen[0],
          runs: nextBatsmen[0].runs + runsScored,
          balls: nextBatsmen[0].balls + 1
        };
      }

      // Update bowler's stats
      const nextBowler = {
        ...prev.bowler,
        balls: nextBalls,
        overs: nextOvers,
        runs: prev.bowler.runs + (event === "1" ? 1 : event === "4" ? 4 : event === "6" ? 6 : 0),
        wickets: event === "wicket" ? prev.bowler.wickets + 1 : prev.bowler.wickets
      };

      return {
        ...prev,
        runs: nextRuns,
        wickets: nextWickets,
        overs: nextOvers,
        balls: nextBalls,
        batsmen: nextBatsmen,
        bowler: nextBowler
      };
    });
  };

  const [copiedText, setCopiedText] = useState("");
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(""), 2000);
  };

  return (
    <section id="how-it-works" className="py-24 px-6 sm:px-[8vw] bg-[#07090f]">
      <div className="max-w-6xl mx-auto flex flex-col gap-10">
        
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-[clamp(2rem,4vw,3rem)] font-black tracking-tight text-[#d2fc00] mb-3 leading-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
            Up and running in minutes
          </h2>
          <p className="text-[#8892a4] leading-relaxed max-w-xl mx-auto text-sm sm:text-base font-medium">
            Discover how easy it is to manage, schedule, and live-score your tournaments.
          </p>
        </div>

        {/* Step 1 Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 rounded-[2rem] border border-zinc-800 bg-[#0b0e17] overflow-hidden min-h-[480px] transition-all duration-300 hover:border-zinc-700">
          {/* Left Column (Lime Green) */}
          <div className="col-span-12 lg:col-span-5 bg-[#d2fc00] p-8 sm:p-10 flex flex-col justify-between text-zinc-950">
            <div>
            
              <h2 className="text-2xl sm:text-3xl font-black mt-4 leading-tight">
                Complete Tournament Management
              </h2>
              <p className="text-xs sm:text-sm font-medium mt-1 text-zinc-700">
                Zero to Live-Scoring in 60 seconds 🚀
              </p>
            </div>
            
            <div className="mt-12 lg:mt-0">
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-600 block mb-1">Step 01</span>
              <h3 className="text-xl sm:text-2xl font-black mb-2">Create & Configure</h3>
              <p className="text-xs sm:text-sm font-medium leading-relaxed text-zinc-800">
                Create leagues, choose match formats (5, 6, 20 overs), set dates Our platform accommodates any custom rules you require.
              </p>
            </div>
          </div>

          {/* Right Column (Tournament Setup Preview) */}
          <div className="col-span-12 lg:col-span-7 flex items-center justify-center bg-[#07090f] p-6 sm:p-10">
            <FakeTournamentSetup />
          </div>
        </div>

        {/* Step 2 Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 rounded-[2rem] border border-zinc-800 bg-[#0b0e17] overflow-hidden min-h-[480px] transition-all duration-300 hover:border-zinc-700">
          {/* Left Column (Lime Green) */}
          <div className="col-span-12 lg:col-span-5 bg-[#d2fc00] p-8 sm:p-10 flex flex-col justify-between text-zinc-950">
            {/* Spacer top to align with Card 1 */}
            <div className="hidden lg:block"></div>
            
            <div className="mt-12 lg:mt-0">
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-600 block mb-1">Step 02</span>
              <h3 className="text-xl sm:text-2xl font-black mb-2">Invite Teams & Players</h3>
              <p className="text-xs sm:text-sm font-medium leading-relaxed text-zinc-800">
                Generate secure joining tokens. Captains use these tokens to register and manage their own team rosters directly, taking the administrative burden off your shoulders.
              </p>
            </div>
          </div>

          {/* Right Column (Dark UI Console) */}
          <div className="col-span-12 lg:col-span-7 flex flex-col bg-[#07090f]">
            {/* Header Tabs */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-zinc-950/20">
              <div className="flex gap-2">
                {["Invite Link", "Captains List"].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setStep2Tab(tab)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                      step2Tab === tab ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <button
                onClick={() => handleCopy(step2Tab === "Invite Link" ? "https://cricnerd.com/join/cpl-2026?token=s8f2n9x2" : "Titans CC: John Doe, Knights XI: Sarah Smith")}
                className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-white transition-colors px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-850"
              >
                <span>{copiedText !== "" ? "Copied!" : "Copy Link"}</span>
              </button>
            </div>

            {/* Display Roster Mockup */}
            <div className="p-6 sm:p-8 flex-1 flex flex-col justify-center bg-zinc-950/40">
              {step2Tab === "Invite Link" ? (
                <div className="flex flex-col gap-5 max-w-md mx-auto w-full">
                  <div className="bg-zinc-900 border border-zinc-850 p-4 rounded-xl flex items-center justify-between">
                    <span className="text-zinc-300 font-mono text-xs overflow-hidden text-ellipsis whitespace-nowrap mr-2">
                      https://cricnerd.com/join/cpl-2026?token=s8f2n9x2
                    </span>
                    <button 
                      onClick={() => handleCopy("https://cricnerd.com/join/cpl-2026?token=s8f2n9x2")}
                      className="px-3 py-1.5 text-[10px] bg-[#d2fc00] text-zinc-950 rounded-lg font-bold hover:bg-[#b8dd00] transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">TEAM REGISTRATION STATUS</span>
                    {[
                      { name: "Titans CC", status: "Joined", players: "15 Players", color: "text-[#d2fc00]" },
                      { name: "Knights XI", status: "Joined", players: "14 Players", color: "text-[#d2fc00]" },
                      { name: "Warriors SC", status: "Pending Action", players: "0 Players", color: "text-zinc-500" }
                    ].map((team, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs py-2 border-b border-zinc-850">
                        <span className="text-white font-bold">{team.name}</span>
                        <div className="flex gap-3">
                          <span className="text-zinc-400 font-medium">{team.players}</span>
                          <span className={`font-semibold ${team.color}`}>{team.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3.5 max-w-md mx-auto w-full">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">REGISTERED CAPTAINS</span>
                  {[
                    { captain: "John Doe", team: "Titans CC", email: "john@titanscc.com" },
                    { captain: "Sarah Smith", team: "Knights XI", email: "sarah@knightsxi.com" },
                    { captain: "Dave Miller", team: "Warriors SC", email: "dave@warriors.com" }
                  ].map((cap, idx) => (
                    <div key={idx} className="bg-zinc-900/60 border border-zinc-850 p-3 rounded-xl flex justify-between items-center">
                      <div>
                        <div className="text-white font-bold text-sm">{cap.captain}</div>
                        <div className="text-zinc-500 text-xs">{cap.email}</div>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#d2fc00] border border-[#d2fc00]/25 px-2.5 py-0.5 rounded-full bg-[#d2fc00]/5">
                        {cap.team}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Step 3 Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 rounded-[2rem] border border-zinc-800 bg-[#0b0e17] overflow-hidden min-h-[480px] transition-all duration-300 hover:border-zinc-700">
          {/* Left Column (Lime Green) */}
          <div className="col-span-12 lg:col-span-5 bg-[#d2fc00] p-8 sm:p-10 flex flex-col justify-between text-zinc-950">
            {/* Spacer top to align with Card 1 */}
            <div className="hidden lg:block"></div>
            
            <div className="mt-12 lg:mt-0">
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-600 block mb-1">Step 03</span>
              <h3 className="text-xl sm:text-2xl font-black mb-2">Score & Stream Live</h3>
              <p className="text-xs sm:text-sm font-medium leading-relaxed text-zinc-800">
                Score matches ball-by-ball. The system updates the public tournament board, player stats, and active scoreboards in real-time, keeping fans connected.
              </p>
            </div>
          </div>

          {/* Right Column (Dark UI Console) */}
          <div className="col-span-12 lg:col-span-7 flex flex-col bg-[#07090f]">
            {/* Header Tabs */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-zinc-950/20">
              <div className="flex gap-2">
                {["Interactive Scorer", "Live Scorecard API"].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setStep3Tab(tab)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                      step3Tab === tab ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <button
                onClick={() => handleCopy(step3Tab === "Interactive Scorer" ? `${score.runs}/${score.wickets} in ${score.overs}.${score.balls}` : scoreApiStr)}
                className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-white transition-colors px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-850"
              >
                <span>{copiedText !== "" ? "Copied!" : "Copy Data"}</span>
              </button>
            </div>

            {/* Display Scorer Mockup */}
            <div className="p-6 sm:p-8 flex-1 flex flex-col justify-center bg-zinc-950/40">
              {step3Tab === "Interactive Scorer" ? (
                <div className="flex flex-col gap-5 max-w-md mx-auto w-full">
                  {/* Digital Board */}
                  <div className="bg-zinc-900 border border-zinc-850 p-4.5 rounded-xl flex items-center justify-between shadow-lg">
                    <div>
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">LIVE SCOREBOARD</span>
                      <div className="text-white text-3xl font-black tracking-tight mt-0.5">
                        {score.runs} <span className="text-zinc-500 font-normal">/</span> {score.wickets}
                      </div>
                      <span className="text-xs text-[#d2fc00] font-bold mt-1 block">
                        Overs: {score.overs}.{score.balls}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">BATSMEN</span>
                      {score.batsmen.map((b, idx) => (
                        <div key={idx} className="text-xs text-zinc-300 font-semibold mt-0.5">
                          {b.name}: <span className="text-white font-black">{b.runs}</span> <span className="text-zinc-500">({b.balls})</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Scorer Buttons */}
                  <div className="flex flex-wrap gap-2 justify-center">
                    <button
                      onClick={() => handleScoreEvent("dot")}
                      className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-bold transition-all hover:scale-105 active:scale-95"
                    >
                      Dot Ball
                    </button>
                    <button
                      onClick={() => handleScoreEvent("1")}
                      className="px-3.5 py-2 bg-zinc-800 hover:bg-[#d2fc00] hover:text-zinc-950 text-white rounded-lg text-xs font-bold transition-all hover:scale-105 active:scale-95"
                    >
                      +1 Run
                    </button>
                    <button
                      onClick={() => handleScoreEvent("4")}
                      className="px-3.5 py-2 bg-zinc-800 hover:bg-[#d2fc00] hover:text-zinc-950 text-white rounded-lg text-xs font-bold transition-all hover:scale-105 active:scale-95"
                    >
                      +4 Runs
                    </button>
                    <button
                      onClick={() => handleScoreEvent("6")}
                      className="px-3.5 py-2 bg-zinc-800 hover:bg-[#d2fc00] hover:text-zinc-950 text-white rounded-lg text-xs font-bold transition-all hover:scale-105 active:scale-95"
                    >
                      +6 Runs
                    </button>
                    <button
                      onClick={() => handleScoreEvent("wicket")}
                      className="px-3.5 py-2 bg-red-950 hover:bg-red-900 border border-red-800/80 text-red-200 rounded-lg text-xs font-bold transition-all hover:scale-105 active:scale-95"
                    >
                      Wicket!
                    </button>
                  </div>
                </div>
              ) : (
                <pre className="text-xs font-mono text-zinc-300 leading-relaxed overflow-x-auto max-h-[300px]">
                  <code>{scoreApiStr}</code>
                </pre>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   BENTO GRID (FEATURES)
───────────────────────────────────────────── */
function Bento() {
  const cards = [
    {
      title: "Team & player management",
      desc: "Centralize all team and player information in one secure, collaborative workspace. Easily manage rosters, statistics, and profiles.",
      img: "/dashboard_bento.png",
      span: "col-span-12 md:col-span-6",
      aspect: "aspect-[1.35]",
    },
    {
      title: "Ball-by-ball tracking",
      desc: "Record every run, wicket, and extra with an intuitive real-time scorer page, instantly updating the public scorecards.",
      img: "/ball by ball tracking.png",
      span: "col-span-12 md:col-span-6",
      aspect: "aspect-[1.35]",
    },
    {
      title: "Tournament setup",
      desc: "Create and configure tournaments of different match formats (5, 6, or 20 overs), set dates, and invite teams automatically.",
      img: "/Tournament_img_bento.png",
      span: "col-span-12 md:col-span-4",
      aspect: "aspect-[1.1]",
    },
    {
      title: "Track active matches",
      desc: "Monitor ongoing match statuses, live streams, and results at a glance in a responsive scorecard list.",
      img: "/Track_active_match_bento.png",
      span: "col-span-12 md:col-span-4",
      aspect: "aspect-[1.1]",
    },
    {
      title: "Invitation system",
      desc: "Onboard new teams and players using shareable secure invitation tokens to join tournaments, eliminating manual entry.",
      img: "/invitation_system_bento.png",
      span: "col-span-12 md:col-span-4",
      aspect: "aspect-[1.1]",
    },
  ];

  return (
    <section id="bento-features" className="py-24 px-6 sm:px-[8vw]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-[clamp(1.8rem,3vw,2.5rem)] font-extrabold tracking-tight text-[#d2fc00] mb-4 leading-tight">
            Designed for cricket enthusiasts
          </h2>
          <p className="text-[#8892a4] leading-relaxed max-w-xl mx-auto text-sm sm:text-base">
            Everything you need to orchestrate tournaments, manage player profiles, and track live scores in one clean, unified platform.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-12 gap-6 md:gap-8">
          {cards.map((c, i) => (
            <div
              key={i}
              className={`${c.span} group bg-[#0b0e17] border border-white/5 rounded-[2rem] p-6 sm:p-8 flex flex-col justify-between overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.4)]`}
            >
              {/* Graphic/Image Container */}
              <div className={`relative w-full ${c.aspect} rounded-2xl overflow-hidden bg-black/10 flex items-center justify-center p-2 mb-6 sm:mb-8`}>
                <img
                  src={c.img}
                  alt={c.title}
                  className="w-full h-full object-contain transition-transform duration-300 ease-out group-hover:rotate-[2deg]"
                />
              </div>

              {/* Text Content */}
              <div className="flex flex-col gap-2 mt-auto">
                <h3 className="text-[#d2fc00] text-lg sm:text-xl font-bold tracking-tight">
                  {c.title}
                </h3>
                <p className="text-[#8892a4] text-xs sm:text-sm leading-relaxed">
                  {c.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   FOOTER
───────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="bg-[#fefdf7] border-t border-[#e2dcb8] py-8 px-[8vw]">
      <div className="max-w-5xl mx-auto flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Cricnerd Logo" className="h-8 w-auto" />
          <span
            style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.05rem", fontWeight: 700, letterSpacing: "-0.04em" }}
            className="text-zinc-900"
          >
            Cricnerd
          </span>
        </div>
        <p className="text-[0.8rem] text-zinc-400 ml-auto">
          © {new Date().getFullYear()} Cricnerd. All rights reserved.
        </p>
        <div className="flex gap-5">
          {[{ label: "Sign in", to: "/login" }, { label: "Get started", to: "/register" }].map((l) => (
            <Link key={l.to} to={l.to} className="text-[0.8rem] font-medium text-zinc-500 hover:text-zinc-900 transition-colors">
              {l.label}.
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}

/* ─────────────────────────────────────────────
   PAGE
───────────────────────────────────────────── */
export default function Landing() {
  return (
    <div
      className="bg-[#fefdf7] text-zinc-900 min-h-screen"
      style={{ fontFamily: "'Syne', sans-serif" }}
    >
      <Navbar />
      <Hero />

      {/* Dark feature block  */}
      <div
        style={{
          background: "#07090f",
          borderTopLeftRadius: "5rem",
          borderTopRightRadius: "5rem",
        }}
      >
        <Features />

        <HowItWorks />

        <Bento />
      </div>

      <Footer />
    </div>
  );
}
