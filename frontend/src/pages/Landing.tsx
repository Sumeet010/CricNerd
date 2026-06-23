import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import  logo from "../assets/logo.png"
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

        {/* Badge
        <span className="inline-flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-widest
                         text-zinc-500 bg-[#f5f2de] border border-[#e2dcb8] px-3 py-1 rounded-full mb-8">
          <Star className="w-3 h-3" /> Cricket Management Platform
        </span> */}

        {/* Headline — line 1 normal, line 2 italic + accent, forced to 2 lines */}
        <h1 className="text-[clamp(3.2rem,6.5vw,5.6rem)] font-extrabold leading-[1.06] tracking-tight text-zinc-900 mb-6">
          Organise tournaments<br />
          <span className="italic text-[#d2fc00]">they'll never forget.</span>
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
          <img src={logo} alt="Cricnerd Logo" className="h-6 w-auto" />
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

      {/* Dark feature block — full screen width, no margins, rounded top corners */}
      <div
        style={{
          background: "#07090f",
          borderTopLeftRadius: "5rem",
          borderTopRightRadius: "5rem",
        }}
      >
        <Features />

        <Bento />
      </div>

      <Footer />
    </div>
  );
}
