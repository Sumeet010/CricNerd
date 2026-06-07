import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
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
      // Scrolling DOWN → hide | Scrolling UP → show
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
        <span className="text-xl">🏏</span>
        <span
          style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.95rem", fontWeight: 800, letterSpacing: "-0.03em" }}
          className="text-zinc-900"
        >
          Cricnerd
        </span>
      </div>

      {/* Nav links */}
      <nav className="hidden sm:flex items-center gap-7 ml-auto">
        {[
          { id: "features", label: "Features" },
          { id: "how-it-works", label: "How it works" },
          { id: "info", label: "Info" },
        ].map(({ id, label }) => (
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

        {/* Badge */}
        <span className="inline-flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-widest
                         text-zinc-500 bg-[#f5f2de] border border-[#e2dcb8] px-3 py-1 rounded-full mb-8">
          <Star className="w-3 h-3" /> Cricket Management Platform
        </span>

        {/* Headline — line 1 normal, line 2 italic + accent, forced to 2 lines */}
        <h1 className="text-[clamp(3.2rem,6.5vw,5.6rem)] font-extrabold leading-[1.06] tracking-tight text-zinc-900 mb-6">
          Organise tournaments<br />
          <span className="italic text-[#3a6b35]">they'll never forget.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-[1.1rem] text-zinc-500 leading-relaxed max-w-xl mb-10">
          Cricnerd lets you manage teams, create match schedules, track live scores,
          and share results — all in one powerful and easy-to-use platform.
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
            Explore events
          </Link>
        </div>

      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   FEATURES
───────────────────────────────────────────── */
const features = [
  { icon: <Trophy className="w-5 h-5" />, title: "Tournament Management", desc: "Create and manage full cricket tournaments with custom formats, brackets, and schedules." },
  { icon: <Swords className="w-5 h-5" />, title: "Live Scoring", desc: "Ball-by-ball live scoring with real-time updates for every match in your tournament." },
  { icon: <Users className="w-5 h-5" />, title: "Team & Squad Builder", desc: "Build squads, assign players to teams and tournaments, and manage your playing XI." },
  { icon: <BarChart3 className="w-5 h-5" />, title: "Stats & Scorecards", desc: "Detailed scorecards, batting and bowling stats after every match — automatically." },
  { icon: <Zap className="w-5 h-5" />, title: "Instant Results", desc: "Share match results instantly. Spectators get the full picture in seconds." },
  { icon: <Shield className="w-5 h-5" />, title: "Role-Based Access", desc: "Organisers manage everything; players track their own stats. Secure by design." },
];

function Features() {
  return (
    <section id="features" className="py-24 px-[8vw]">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block text-[0.7rem] font-semibold uppercase tracking-widest text-[#a0a8b8]
                           bg-white/10 border border-white/15 px-3 py-1 rounded-full mb-4">
            Features
          </span>
          <h2 className="text-[clamp(1.8rem,3vw,2.6rem)] font-extrabold tracking-tight text-white mb-3">
            Everything you need to run cricket
          </h2>
          <p className="text-[#8892a4] leading-relaxed max-w-md mx-auto">
            From player registration to the final scorecard — Cricnerd handles it all.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <div
              key={i}
              className="bg-white/5 border border-white/10 rounded-2xl p-7
                         hover:-translate-y-1 hover:bg-white/8 hover:border-white/20 transition-all duration-200"
            >
              <div className="w-11 h-11 bg-white/10 rounded-xl flex items-center justify-center text-white mb-4">
                {f.icon}
              </div>
              <h3 className="text-[0.95rem] font-bold text-white mb-2">{f.title}</h3>
              <p className="text-[0.87rem] text-[#8892a4] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   HOW IT WORKS
───────────────────────────────────────────── */
const steps = [
  { step: "01", title: "Create an account", desc: "Sign up as an organiser in under a minute. No credit card required." },
  { step: "02", title: "Set up your tournament", desc: "Name it, pick a format (5, 6 or 20 overs), set dates and invite teams." },
  { step: "03", title: "Add teams & players", desc: "Build squads and assign players to their respective teams and tournaments." },
  { step: "04", title: "Schedule & score matches", desc: "Create fixtures and use the live scoring tool to record every ball as it happens." },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-[8vw]">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block text-[0.7rem] font-semibold uppercase tracking-widest text-[#a0a8b8]
                           bg-white/10 border border-white/15 px-3 py-1 rounded-full mb-4">
            How it works
          </span>
          <h2 className="text-[clamp(1.8rem,3vw,2.6rem)] font-extrabold tracking-tight text-white mb-3">
            Up and running in minutes
          </h2>
          <p className="text-[#8892a4] leading-relaxed max-w-md mx-auto">
            Four simple steps from sign-up to your first live match.
          </p>
        </div>

        {/* Steps */}
        <div className="relative flex flex-col max-w-xl mx-auto">
          {/* Vertical connector line */}
          <div className="absolute left-7 top-10 bottom-10 w-0.5 bg-white/15" />

          {steps.map((s, i) => (
            <div key={i} className="relative flex items-start gap-6 py-7">
              <div className="shrink-0 w-14 h-14 rounded-full bg-white/10 border border-white/20 text-white
                               flex items-center justify-center text-[0.75rem] font-bold tracking-wider z-10">
                {s.step}
              </div>
              <div className="pt-1">
                <h3 className="text-[1rem] font-bold text-white mb-1">{s.title}</h3>
                <p className="text-[0.88rem] text-[#8892a4] leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   INFO
───────────────────────────────────────────── */
const infoPoints = [
  "Free to use — no hidden charges",
  "Works for gully cricket to inter-club leagues",
  "Role-based accounts for organisers & players",
  "Clean scorecards shareable after every match",
  "Ball-by-ball live scoring built in",
  "Supports 5-over, 6-over & 20-over formats",
];

function Info() {
  return (
    <section id="info" className="py-24 px-[8vw]">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        {/* Left text */}
        <div>
          <span className="inline-block text-[0.7rem] font-semibold uppercase tracking-widest text-[#a0a8b8]
                           bg-white/10 border border-white/15 px-3 py-1 rounded-full mb-4">
            Why Cricnerd
          </span>
          <h2 className="text-[clamp(1.8rem,3vw,2.4rem)] font-extrabold tracking-tight text-white leading-tight mb-4">
            Built for cricket lovers,<br />by cricket lovers
          </h2>
          <p className="text-[#8892a4] leading-relaxed mb-7">
            We know how hard it is to manage a cricket tournament with WhatsApp groups
            and paper scorecards. Cricnerd was built to solve exactly that.
          </p>

          <ul className="flex flex-col gap-2.5 mb-8">
            {infoPoints.map((pt, i) => (
              <li key={i} className="flex items-center gap-2.5 text-[0.88rem] text-[#a0a8b8]">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                {pt}
              </li>
            ))}
          </ul>

          <Link
            to="/register"
            className="inline-flex items-center gap-1.5 bg-white text-zinc-900 text-[0.9rem]
                       font-semibold px-6 py-3 rounded-full hover:bg-zinc-100 transition-all
                       hover:-translate-y-0.5"
          >
            Start for free <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Right stats card */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-10">
          <div className="grid grid-cols-2 gap-8">
            {[
              { val: "100%", label: "Free to use" },
              { val: "3", label: "Match formats" },
              { val: "∞", label: "Tournaments" },
              { val: "Live", label: "Score updates" },
            ].map((s, i) => (
              <div key={i} className="flex flex-col gap-1">
                <span className="text-[2.4rem] font-extrabold tracking-tighter text-white leading-none">
                  {s.val}
                </span>
                <span className="text-[0.8rem] text-[#8892a4] font-medium">{s.label}</span>
              </div>
            ))}
          </div>
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
          <span className="text-xl">🏏</span>
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
              {l.label}
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

      {/* Dark feature block — rounded top at start, rounded bottom before footer */}
      <div
        className="mx-4 sm:mx-6 lg:mx-10"
        style={{
          background: "#07090f",
          borderRadius: "2.5rem",
        }}
      >
        <Features />
        <HowItWorks />
        <Info />
      </div>

      <Footer />
    </div>
  );
}
