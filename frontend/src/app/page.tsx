import Link from "next/link";
import {
  Zap,
  Activity,
  Users,
  Trophy,
  CalendarCheck,
  ChevronRight,
  Check,
  ArrowRight,
  Play,
} from "lucide-react";
import { StatCounter } from "@/components/landing/StatCounter";

/* ─────────────────────────────────────────────
   Sixup Landing Page — server component
   Client pieces: <StatCounter />
───────────────────────────────────────────── */

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased overflow-x-hidden">

      {/* ===== STICKY NAV ===== */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" className="w-8 h-8">
              <defs>
                <linearGradient id="nav-g1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
              </defs>
              <circle cx="32" cy="30" r="26" fill="url(#nav-g1)" />
              <path d="M14 22 Q32 16 50 22" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.5" />
              <path d="M14 38 Q32 44 50 38" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.5" />
              <line x1="32" y1="4" x2="32" y2="56" stroke="white" strokeWidth="0.8" opacity="0.3" />
              <text x="32" y="36" textAnchor="middle" fontFamily="Arial Black, sans-serif" fontWeight="900" fontSize="24" fill="white" letterSpacing="-1">6</text>
            </svg>
            <span className="text-base font-black bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-600 bg-clip-text text-transparent">
              Sixup
            </span>
          </div>
          {/* Nav links */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors px-3 py-1.5"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600 text-white px-4 py-2 rounded-xl hover:opacity-90 hover:shadow-lg hover:shadow-indigo-500/25 transition-all hover:-translate-y-0.5 active:scale-95"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section id="hero" className="pt-32 pb-24 px-4 sm:px-6 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-gradient-to-br from-indigo-100/60 via-violet-100/40 to-blue-100/30 rounded-full blur-3xl" />
          <div className="absolute -top-10 right-0 w-96 h-96 bg-gradient-to-bl from-purple-100/50 to-transparent rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-blue-100/40 to-transparent rounded-full blur-2xl" />
          {/* Floating cricket elements — CSS only */}
          <div className="absolute top-32 left-10 w-8 h-8 rounded-full border-2 border-indigo-200 opacity-40 animate-float" style={{ animationDelay: "0s" }} />
          <div className="absolute top-48 right-16 w-5 h-5 rounded-full bg-violet-200 opacity-30 animate-float" style={{ animationDelay: "1s" }} />
          <div className="absolute bottom-32 right-24 w-10 h-10 rounded-full border-2 border-violet-300 opacity-30 animate-float" style={{ animationDelay: "0.5s" }} />
          <div className="absolute bottom-48 left-20 w-4 h-4 rounded-full bg-indigo-200 opacity-40 animate-float" style={{ animationDelay: "1.5s" }} />
          <div className="absolute top-64 left-1/4 w-6 h-6 rounded-full border border-blue-200 opacity-25 animate-float" style={{ animationDelay: "2s" }} />
        </div>

        <div className="max-w-4xl mx-auto text-center relative">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 animate-fade-in-down">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            Score it. Track it. Own it.
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] mb-6 animate-fade-in">
            Score it.{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-600 bg-clip-text text-transparent">
              Track it.
            </span>{" "}
            Own it.
          </h1>

          {/* Sub-text */}
          <p className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in stagger-1">
            The all-in-one indoor cricket platform for teams that mean business.
            Live scoring, team management, leaderboards, and availability polls —
            all from your pocket.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-in stagger-2">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600 text-white font-semibold px-7 py-3.5 rounded-2xl hover:opacity-90 hover:shadow-xl hover:shadow-indigo-500/30 transition-all hover:-translate-y-0.5 active:scale-95 text-base"
            >
              Start for free
              <ArrowRight size={16} />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 bg-slate-100 border border-slate-200 text-slate-700 font-semibold px-7 py-3.5 rounded-2xl hover:bg-slate-200 hover:text-slate-900 transition-all active:scale-95 text-base"
            >
              <Play size={14} className="fill-slate-500 text-slate-500" />
              See how it works
            </a>
          </div>

          {/* Hero mock scorer UI */}
          <div className="mt-16 relative animate-slide-up stagger-3">
            <div className="bg-gradient-to-br from-slate-50 to-indigo-50 border border-slate-200 rounded-3xl p-6 shadow-2xl shadow-indigo-500/10 max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">Live</span>
                </div>
                <span className="text-xs text-slate-400 font-mono">Over 3.2</span>
              </div>
              <div className="flex items-end justify-between mb-5">
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Team Alpha</p>
                  <p className="text-5xl font-black text-slate-900 tabular-nums">84</p>
                  <p className="text-sm text-slate-400 mt-0.5">−2 wkts</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 mb-0.5">vs Team Beta</p>
                  <p className="text-3xl font-bold text-slate-400 tabular-nums">67</p>
                  <p className="text-xs text-slate-400 mt-0.5">completed</p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {["0", "1", "2", "4"].map((run) => (
                  <div
                    key={run}
                    className="h-14 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xl font-bold text-slate-700 shadow-sm"
                  >
                    {run}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="h-11 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-sm font-semibold text-indigo-700">
                  Wide +1
                </div>
                <div className="h-11 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-sm font-semibold text-orange-700">
                  No Ball
                </div>
                <div className="h-11 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-sm font-semibold text-red-600">
                  Wicket Out
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== STATS BAR ===== */}
      <section className="py-16 px-4 sm:px-6 bg-slate-50 border-y border-slate-100">
        <div className="max-w-4xl mx-auto">
          <StatCounter />
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="py-24 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-3">
              Everything your team needs
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              From the first invite to the final scorecard — all in one place.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {[
              {
                emoji: "⚡",
                iconBg: "bg-indigo-50 border-indigo-200",
                title: "Live Scoring",
                desc: "One-tap ball-by-ball scoring designed for the scorer's phone. No friction.",
                highlights: ["Net zone bonus runs", "Wide & no-ball tracking", "Real-time sync"],
                gradient: "from-indigo-500/5 to-violet-500/5",
                border: "border-indigo-100",
              },
              {
                emoji: "👥",
                iconBg: "bg-violet-50 border-violet-200",
                title: "Team Management",
                desc: "Invite players by ID, set roles, manage playing/bench status before every match.",
                highlights: ["Role-based access", "Invitation system", "Multiple teams"],
                gradient: "from-violet-500/5 to-purple-500/5",
                border: "border-violet-100",
              },
              {
                emoji: "📊",
                iconBg: "bg-blue-50 border-blue-200",
                title: "Stats & Leaderboards",
                desc: "Automatic batting & bowling stats. Leaderboards update in real time.",
                highlights: ["Batting & bowling stats", "Season leaderboards", "Match history"],
                gradient: "from-blue-500/5 to-indigo-500/5",
                border: "border-blue-100",
              },
              {
                emoji: "🔔",
                iconBg: "bg-emerald-50 border-emerald-200",
                title: "Availability Polls",
                desc: "Know who's playing before match day. Send polls, get instant responses.",
                highlights: ["Pre-match polls", "Instant responses", "Deadline reminders"],
                gradient: "from-emerald-500/5 to-teal-500/5",
                border: "border-emerald-100",
              },
            ].map(({ emoji, iconBg, title, desc, highlights, gradient, border }) => (
              <div
                key={title}
                className={`bg-gradient-to-br ${gradient} border ${border} rounded-2xl p-7 hover:shadow-lg hover:-translate-y-1 transition-all duration-200`}
              >
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-5 text-2xl ${iconBg}`}>
                  {emoji}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-4">{desc}</p>
                <ul className="space-y-1.5">
                  {highlights.map((h) => (
                    <li key={h} className="flex items-center gap-2 text-xs text-slate-600">
                      <Check size={12} className="text-emerald-500 shrink-0" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CRICKET LEGENDS MARQUEE STRIP ===== */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 overflow-hidden">
        <div className="text-center mb-8">
          <p className="text-sm font-semibold text-white/60 uppercase tracking-widest">
            Play it your way
          </p>
        </div>
        <div className="relative">
          {/* Gradient fade masks on edges */}
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-indigo-600 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-purple-600 to-transparent z-10 pointer-events-none" />
          {/* Marquee track */}
          <div
            className="flex gap-4"
            style={{ animation: "marquee 28s linear infinite", width: "max-content" }}
          >
            {[
              { name: "Babar Azam", country: "Pakistan", from: "from-indigo-500", to: "to-blue-600" },
              { name: "Virat Kohli", country: "India", from: "from-orange-500", to: "to-red-600" },
              { name: "Rohit Sharma", country: "India", from: "from-blue-500", to: "to-cyan-600" },
              { name: "Kane Williamson", country: "New Zealand", from: "from-slate-500", to: "to-slate-700" },
              { name: "Steve Smith", country: "Australia", from: "from-yellow-500", to: "to-amber-600" },
              /* duplicate for seamless loop */
              { name: "Babar Azam", country: "Pakistan", from: "from-indigo-500", to: "to-blue-600" },
              { name: "Virat Kohli", country: "India", from: "from-orange-500", to: "to-red-600" },
              { name: "Rohit Sharma", country: "India", from: "from-blue-500", to: "to-cyan-600" },
              { name: "Kane Williamson", country: "New Zealand", from: "from-slate-500", to: "to-slate-700" },
              { name: "Steve Smith", country: "Australia", from: "from-yellow-500", to: "to-amber-600" },
            ].map((player, i) => (
              <div
                key={`${player.name}-${i}`}
                className={`flex-shrink-0 w-52 rounded-2xl bg-gradient-to-br ${player.from} ${player.to} p-5 shadow-xl`}
              >
                <div className="text-3xl mb-2">🏏</div>
                <p className="font-bold text-white text-base leading-tight">{player.name}</p>
                <p className="text-white/60 text-xs mt-0.5">{player.country}</p>
                <p className="text-white/40 text-[10px] mt-2 font-medium uppercase tracking-wider">
                  Play it your way
                </p>
              </div>
            ))}
          </div>
        </div>
        {/* Marquee keyframe — injected as inline style tag */}
        <style>{`
          @keyframes marquee {
            from { transform: translateX(0); }
            to   { transform: translateX(-50%); }
          }
        `}</style>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-3">
              Up and running in minutes
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              No setup headaches. Just create, invite, and play.
            </p>
          </div>

          <div className="relative">
            {/* Connector line */}
            <div className="hidden sm:block absolute top-10 left-[16.67%] right-[16.67%] h-px bg-gradient-to-r from-indigo-200 via-violet-200 to-blue-200" />

            <div className="grid sm:grid-cols-3 gap-8 relative">
              {[
                {
                  step: "01",
                  icon: Users,
                  color: "from-indigo-500 to-violet-500",
                  title: "Create your team",
                  desc: "Sign up, create a team, and invite your players by @username or public ID. No dummy accounts — every player owns their login.",
                },
                {
                  step: "02",
                  icon: CalendarCheck,
                  color: "from-violet-500 to-purple-500",
                  title: "Schedule a match",
                  desc: "Add a match, set the venue and date, and send an availability poll. The captain assigns the scorer before game day.",
                },
                {
                  step: "03",
                  icon: Activity,
                  color: "from-purple-500 to-blue-500",
                  title: "Score & celebrate",
                  desc: "Open Sixup on your phone, tap to score each ball, and watch the scoreboard update live for everyone watching.",
                },
              ].map(({ step, icon: Icon, color, title, desc }) => (
                <div key={step} className="flex flex-col items-center text-center">
                  <div
                    className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-5 shadow-lg shadow-indigo-500/20 relative`}
                  >
                    <Icon size={28} className="text-white" />
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white border-2 border-slate-100 text-xs font-bold text-slate-700 flex items-center justify-center shadow-sm">
                      {step}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== SCORING RULES CARD ===== */}
      <section className="py-20 px-4 sm:px-6 bg-gradient-to-br from-indigo-50 via-violet-50/60 to-blue-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-3">
              Indoor cricket rules, built in
            </h2>
            <p className="text-slate-500 max-w-lg mx-auto">
              Net zone bonuses, wicket rules, pair rotations — Sixup knows the rules so you
              never have to track them manually.
            </p>
          </div>

          {/* Net zone bonuses */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            {[
              { label: "Side front net", value: "+2", color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
              { label: "Side back net", value: "+3", color: "text-indigo-600", bg: "bg-indigo-50 border-indigo-200" },
              { label: "Back net (ground)", value: "+4", color: "text-violet-600", bg: "bg-violet-50 border-violet-200" },
              { label: "Back net (full)", value: "+6", color: "text-purple-600", bg: "bg-purple-50 border-purple-200" },
            ].map(({ label, value, color, bg }) => (
              <div key={label} className={`rounded-2xl border p-4 text-center ${bg}`}>
                <p className={`text-3xl font-black mb-1 ${color}`}>{value}</p>
                <p className="text-xs text-slate-500 font-medium">{label}</p>
              </div>
            ))}
          </div>

          {/* Other rules */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Wicket", value: "OUT", color: "text-red-600", bg: "bg-red-50 border-red-200", sub: "batter continues" },
              { label: "No ball", value: "+1", color: "text-orange-600", bg: "bg-orange-50 border-orange-200", sub: "ball re-bowled" },
              { label: "Wide", value: "+1", color: "text-amber-600", bg: "bg-amber-50 border-amber-200", sub: "ball re-bowled" },
              { label: "Pairs per innings", value: "4×", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200", sub: "N overs each" },
            ].map(({ label, value, color, bg, sub }) => (
              <div key={label} className={`rounded-2xl border p-4 text-center ${bg}`}>
                <p className={`text-3xl font-black mb-0.5 ${color}`}>{value}</p>
                <p className="text-xs font-semibold text-slate-600">{label}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA BANNER ===== */}
      <section className="py-24 px-4 sm:px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 rounded-3xl p-10 sm:p-14 shadow-2xl shadow-indigo-500/20 relative overflow-hidden">
            {/* Decoration blobs */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
            </div>
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-6">
                <Zap size={28} className="text-white" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
                Ready to step up your game?
              </h2>
              <p className="text-indigo-200 text-lg mb-8 max-w-md mx-auto">
                Join teams already using Sixup to manage their games, track stats, and score smarter.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 bg-white text-indigo-700 font-bold px-7 py-3.5 rounded-2xl hover:bg-indigo-50 hover:shadow-xl transition-all hover:-translate-y-0.5 active:scale-95 text-base"
                >
                  Create free account
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white font-semibold px-7 py-3.5 rounded-2xl hover:bg-white/20 transition-all active:scale-95 text-base"
                >
                  Log in
                  <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-slate-100 py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" className="w-6 h-6">
              <defs>
                <linearGradient id="footer-g1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
              </defs>
              <circle cx="32" cy="30" r="26" fill="url(#footer-g1)" />
              <path d="M14 22 Q32 16 50 22" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.5" />
              <path d="M14 38 Q32 44 50 38" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.5" />
              <line x1="32" y1="4" x2="32" y2="56" stroke="white" strokeWidth="0.8" opacity="0.3" />
              <text x="32" y="36" textAnchor="middle" fontFamily="Arial Black, sans-serif" fontWeight="900" fontSize="24" fill="white" letterSpacing="-1">6</text>
            </svg>
            <span className="text-sm font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Sixup
            </span>
          </div>
          {/* Copyright */}
          <p className="text-sm text-slate-400">
            &copy; 2025 Sixup. Built for indoor cricket.
          </p>
          {/* Links */}
          <div className="flex items-center gap-5">
            <Link href="/login" className="text-sm text-slate-400 hover:text-slate-700 transition-colors">
              Log in
            </Link>
            <Link href="/register" className="text-sm text-slate-400 hover:text-slate-700 transition-colors">
              Sign up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
