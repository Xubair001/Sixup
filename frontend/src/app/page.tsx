import Link from "next/link";
import {
  Zap,
  Activity,
  Users,
  Trophy,
  CalendarCheck,
  ChevronRight,
  Check,
  Star,
  ArrowRight,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased">
      {/* ===== NAV ===== */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/30">
              <Zap size={15} className="text-white" />
            </div>
            <span className="text-base font-bold bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-600 bg-clip-text text-transparent">
              Cricket Pocket
            </span>
          </div>
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
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="pt-32 pb-24 px-4 sm:px-6 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-br from-indigo-100/60 via-violet-100/40 to-blue-100/30 rounded-full blur-3xl" />
          <div className="absolute -top-10 right-0 w-96 h-96 bg-gradient-to-bl from-purple-100/50 to-transparent rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-100/40 to-transparent rounded-full blur-2xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 animate-fade-in-down">
            <Star size={12} className="fill-indigo-500 text-indigo-500" />
            Score it. Track it. Own it.
            <Star size={12} className="fill-indigo-500 text-indigo-500" />
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] mb-6 animate-fade-in">
            Your team.{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-600 bg-clip-text text-transparent">
              Every match.
            </span>
            <br />
            In your pocket.
          </h1>

          {/* Sub-text */}
          <p className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in stagger-1">
            Sixup is the all-in-one platform for indoor cricket teams — live scoring
            with one thumb, team management, stats that actually matter, and availability polls
            before game day.
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
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-slate-100 border border-slate-200 text-slate-700 font-semibold px-7 py-3.5 rounded-2xl hover:bg-slate-200 hover:text-slate-900 transition-all active:scale-95 text-base"
            >
              Already have an account
              <ChevronRight size={16} />
            </Link>
          </div>

          {/* Hero visual */}
          <div className="mt-16 relative animate-slide-up stagger-3">
            <div className="bg-gradient-to-br from-slate-50 to-indigo-50 border border-slate-200 rounded-3xl p-6 shadow-2xl shadow-indigo-500/10 max-w-2xl mx-auto">
              {/* Mock scorer UI */}
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
              {/* Scoring buttons */}
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
                  Wicket −5
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="py-24 px-4 sm:px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-3">
              Everything your team needs
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              From the first invite to the final scorecard — all in one place.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: Activity,
                color: "indigo",
                iconBg: "bg-indigo-50 border-indigo-200",
                iconColor: "text-indigo-600",
                title: "Live Scoring",
                desc: "Score every ball in real-time right from your phone. One-thumb UI designed for mid-match use — wides, no-balls, net zones, and wicket penalties all covered.",
                highlights: ["Net zone bonus runs", "Wicket −5 penalty", "Real-time sync"],
              },
              {
                icon: Users,
                color: "violet",
                iconBg: "bg-violet-50 border-violet-200",
                iconColor: "text-violet-600",
                title: "Team Management",
                desc: "Invite players by @username or public ID. Assign roles — captain, vice-captain, scorer — and manage your roster without the hassle.",
                highlights: ["Role-based access", "Invitation system", "Multiple teams"],
              },
              {
                icon: Trophy,
                color: "amber",
                iconBg: "bg-amber-50 border-amber-200",
                iconColor: "text-amber-600",
                title: "Stats & Leaderboards",
                desc: "Track batting averages, bowling figures, and skins won. See how you stack up against teammates and across the season.",
                highlights: ["Batting & bowling stats", "Season leaderboards", "Match history"],
              },
              {
                icon: CalendarCheck,
                color: "emerald",
                iconBg: "bg-emerald-50 border-emerald-200",
                iconColor: "text-emerald-600",
                title: "Availability Polls",
                desc: "Send availability checks before each match. Get a clear picture of who's in before you finalize the squad.",
                highlights: ["Pre-match polls", "Instant responses", "Deadline reminders"],
              },
            ].map(({ icon: Icon, iconBg, iconColor, title, desc, highlights }) => (
              <div
                key={title}
                className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg hover:shadow-slate-200/80 hover:-translate-y-1 transition-all duration-200"
              >
                <div className={`w-11 h-11 rounded-xl border flex items-center justify-center mb-4 ${iconBg}`}>
                  <Icon size={20} className={iconColor} />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{title}</h3>
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

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-24 px-4 sm:px-6 bg-white">
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
                  desc: "Sign up, create a team, and invite your players by searching their @username or scanning a QR code. No dummy accounts — every player uses their own login.",
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
                  title: "Score live",
                  desc: "Open Cricket Pocket on your phone, tap to score each ball, and watch the scoreboard update in real-time for everyone watching.",
                },
              ].map(({ step, icon: Icon, color, title, desc }) => (
                <div key={step} className="flex flex-col items-center text-center">
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-5 shadow-lg shadow-indigo-500/20 relative`}>
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

      {/* ===== SCORING RULES CALLOUT ===== */}
      <section className="py-20 px-4 sm:px-6 bg-gradient-to-br from-indigo-50 via-violet-50/60 to-blue-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-3">
              Indoor cricket rules, built in
            </h2>
            <p className="text-slate-500 max-w-lg mx-auto">
              Net zone bonuses, wicket penalties, pair rotations — Cricket Pocket knows the rules so you don't have to track them manually.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
          <div className="grid grid-cols-3 gap-4 mt-4">
            {[
              { label: "Wicket penalty", value: "−5", color: "text-red-600", bg: "bg-red-50 border-red-200" },
              { label: "No ball", value: "+2", color: "text-orange-600", bg: "bg-orange-50 border-orange-200" },
              { label: "Wide", value: "+1", color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
            ].map(({ label, value, color, bg }) => (
              <div key={label} className={`rounded-2xl border p-4 text-center ${bg}`}>
                <p className={`text-3xl font-black mb-1 ${color}`}>{value}</p>
                <p className="text-xs text-slate-500 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA BANNER ===== */}
      <section className="py-24 px-4 sm:px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 rounded-3xl p-10 sm:p-14 shadow-2xl shadow-indigo-500/20 relative overflow-hidden">
            {/* Decoration */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
            </div>
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-6">
                <Zap size={28} className="text-white" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
                Ready to score smarter?
              </h2>
              <p className="text-indigo-200 text-lg mb-8 max-w-md mx-auto">
                Join teams already using Sixup to manage their games.
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
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-slate-100 py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Zap size={11} className="text-white" />
            </div>
            <span className="text-sm font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Cricket Pocket
            </span>
          </div>
          <p className="text-sm text-slate-400">
            &copy; {new Date().getFullYear()} Cricket Pocket. All rights reserved.
          </p>
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
