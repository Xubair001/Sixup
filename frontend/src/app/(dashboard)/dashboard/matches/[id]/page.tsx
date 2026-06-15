"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, CheckCircle, Circle, HelpCircle, Zap, Star,
  Target, Shield, Trophy, Users, AlertCircle, Lock, Undo2,
  Award, TrendingUp
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Avatar } from "@/components/ui/Avatar";
import { useMatch, useMatchStats } from "@/hooks/useMatches";
import { useMatchLive } from "@/hooks/useMatchLive";
import { matchesApi } from "@/lib/api/matches";
import { availabilityApi, type PollWithResponses } from "@/lib/api/availability";
import { client } from "@/lib/api/client";
import { useMyTeams, useTeamMembers } from "@/hooks/useTeams";
import { useAuthStore } from "@/stores/authStore";
import { AwardMeritModal } from "@/components/teams/AwardMeritModal";
import type { Ball } from "@/types";
import useSWR from "swr";

// ─── Celebration Overlay ──────────────────────────────────────────────────────

type CelebType = "six" | "four" | "wicket" | "noball" | "victory" | null;

function CelebrationOverlay({ type, onDone }: { type: CelebType; onDone: () => void }) {
  useEffect(() => {
    if (!type) return;
    const t = setTimeout(onDone, 1800);
    return () => clearTimeout(t);
  }, [type, onDone]);

  if (!type) return null;

  const config = {
    six:     { emoji: "🎉", text: "SIX!",       sub: "Big hit!",    bg: "from-yellow-500/30 to-orange-500/20", border: "border-yellow-400/40" },
    four:    { emoji: "💥", text: "FOUR!",      sub: "Nice shot!",  bg: "from-purple-500/30 to-indigo-500/20", border: "border-purple-400/40" },
    wicket:  { emoji: "🎯", text: "OUT!",       sub: "Wicket!",     bg: "from-red-500/30 to-rose-500/20",      border: "border-red-400/40" },
    noball:  { emoji: "⚡", text: "NO BALL!",   sub: "+1 run",      bg: "from-orange-500/30 to-amber-500/20",  border: "border-orange-400/40" },
    victory: { emoji: "🏆", text: "Match Over!", sub: "Great game!", bg: "from-emerald-500/30 to-cyan-500/20", border: "border-emerald-400/40" },
  }[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className={`animate-scale-in bg-gradient-to-br ${config.bg} border ${config.border} backdrop-blur-md rounded-3xl px-10 py-8 text-center shadow-2xl`}>
        <div className="text-6xl mb-2 animate-bounce">{config.emoji}</div>
        <p className="text-4xl font-black text-white tracking-wide">{config.text}</p>
        <p className="text-sm text-slate-300 mt-1">{config.sub}</p>
      </div>
    </div>
  );
}

// ─── Availability Section ─────────────────────────────────────────────────────

function AvailabilitySection({ matchId }: { matchId: number }) {
  const { data: poll, error, isLoading, mutate: mutatePoll } = useSWR<PollWithResponses>(
    `/availability/polls/${matchId}`,
    () => availabilityApi.getPoll(matchId),
    { shouldRetryOnError: false }
  );
  const [creating, setCreating] = useState(false);
  const [responding, setResponding] = useState<string | null>(null);

  async function createPoll() {
    setCreating(true);
    try { await availabilityApi.createPoll(matchId); mutatePoll(); }
    finally { setCreating(false); }
  }

  async function respond(status: string) {
    setResponding(status);
    try { await availabilityApi.respond(matchId, status); mutatePoll(); }
    finally { setResponding(null); }
  }

  if (isLoading) return <div className="flex justify-center py-4"><Spinner /></div>;

  if (error || !poll) {
    return (
      <div className="text-center py-5 space-y-3">
        <p className="text-slate-400 text-sm">No availability poll yet</p>
        <Button size="sm" onClick={createPoll} disabled={creating}>
          {creating ? <Spinner className="w-4 h-4" /> : "Create Poll"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          { label: "In",    count: poll.available,   color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
          { label: "Maybe", count: poll.maybe,        color: "text-yellow-400",  bg: "bg-yellow-500/10  border-yellow-500/20" },
          { label: "Out",   count: poll.unavailable,  color: "text-red-400",     bg: "bg-red-500/10     border-red-500/20" },
        ].map(({ label, count, color, bg }) => (
          <div key={label} className={`rounded-2xl p-3 border ${bg}`}>
            <p className={`text-2xl font-black ${color}`}>{count}</p>
            <p className="text-xs text-slate-500">{label}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[
          { status: "available", icon: CheckCircle, label: "I'm in", active: "border-emerald-500/50 bg-emerald-500/15 text-emerald-300", inactive: "border-white/10 bg-white/5 text-slate-400" },
          { status: "maybe",     icon: HelpCircle,  label: "Maybe",  active: "border-yellow-500/50  bg-yellow-500/15  text-yellow-300",  inactive: "border-white/10 bg-white/5 text-slate-400" },
          { status: "unavailable", icon: Circle,    label: "Can't",  active: "border-red-500/50     bg-red-500/15     text-red-300",     inactive: "border-white/10 bg-white/5 text-slate-400" },
        ].map(({ status, icon: Icon, label, active, inactive }) => (
          <button
            key={status}
            onClick={() => respond(status)}
            disabled={!!responding}
            className={`flex flex-col items-center gap-1 py-3 rounded-2xl border text-xs font-semibold transition-all active:scale-95 ${inactive} hover:bg-white/10`}
          >
            {responding === status ? <Spinner className="w-4 h-4" /> : <Icon size={16} />}
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Scorer Panel ─────────────────────────────────────────────────────────────

function ScorerPanel({ matchId, isScorer }: { matchId: number; isScorer: boolean }) {
  const { data: match, mutate: mutateMatch } = useMatch(matchId);
  const { data: stats, mutate: mutateStats } = useMatchStats(matchId);

  const storageKey = `scorer_${matchId}`;
  const [selectedInnings, setSelectedInnings] = useState<number | null>(null);
  const [physical, setPhysical] = useState(0);
  const [isWide, setIsWide] = useState(false);
  const [isNoBall, setIsNoBall] = useState(false);
  const [isWicket, setIsWicket] = useState(false);
  const [batsmanId, setBatsmanId] = useState<number | null>(() => {
    if (typeof window === "undefined") return null;
    try { return JSON.parse(localStorage.getItem(storageKey) ?? "{}").batsmanId ?? null; } catch { return null; }
  });
  const [bowlerId, setBowlerId] = useState<number | null>(() => {
    if (typeof window === "undefined") return null;
    try { return JSON.parse(localStorage.getItem(storageKey) ?? "{}").bowlerId ?? null; } catch { return null; }
  });
  const [saving, setSaving] = useState(false);
  const [recentBalls, setRecentBalls] = useState<Ball[]>([]);
  const [undoing, setUndoing] = useState<number | null>(null);
  const [celeb, setCeleb] = useState<CelebType>(null);

  // Persist batsman/bowler to localStorage on change
  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify({ batsmanId, bowlerId })); } catch { /* ignore */ }
  }, [batsmanId, bowlerId, storageKey]);

  const homeTeamId = match?.team_home_id;
  const awayTeamId = match?.team_away_id;
  const { data: homeMembers } = useTeamMembers(homeTeamId ?? null);
  const { data: awayMembers } = useTeamMembers(awayTeamId ?? null);

  const innings = stats?.innings ?? [];
  const activeInnings = innings.find((i) => i.innings_id === selectedInnings) ?? innings[0];
  const inningsTeam = activeInnings?.batting_team_id;
  const rawBattingMembers = inningsTeam === homeTeamId ? homeMembers : awayMembers;
  const battingMembers = rawBattingMembers?.filter((m) => m.status !== "bench");
  const bowlingMembers = inningsTeam === homeTeamId ? awayMembers : homeMembers;

  // Auto-track over/ball from stats
  const currentOver = activeInnings?.current_over ?? 1;
  const currentBall = activeInnings?.current_ball ?? 1;

  const fetchRecentBalls = useCallback(async (inningsId: number) => {
    try {
      const balls = await matchesApi.getRecentBalls(inningsId);
      setRecentBalls(balls);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (activeInnings?.innings_id && isScorer) {
      fetchRecentBalls(activeInnings.innings_id);
    }
  }, [activeInnings?.innings_id, stats, isScorer, fetchRecentBalls]);

  async function startMatch() {
    await matchesApi.startMatch(matchId);
    mutateMatch();
  }

  async function createInnings(teamId: number) {
    const inns = await client.post("/matches/innings", { match_id: matchId, batting_team_id: teamId }).then((r) => r.data);
    mutateStats();
    setSelectedInnings(inns.id);
  }

  function figureBonus() {
    if (isWide) return { total: 1 };
    if (isNoBall) return { total: physical + 1 };
    return { total: physical };
  }

  async function recordBall() {
    if (!activeInnings || !batsmanId || !bowlerId) return;
    setSaving(true);
    try {
      const body = {
        innings_id: activeInnings.innings_id,
        over_number: currentOver,
        ball_number: currentBall,
        batsman_user_id: batsmanId,
        bowler_user_id: bowlerId,
        physical_runs: isWide ? 0 : physical,
        net_zone: "none",
        is_wide: isWide,
        is_no_ball: isNoBall,
        is_wicket: isWicket,
        dismissed_user_id: isWicket ? batsmanId : null,
      };
      const ballResult = await client.post("/matches/balls", body).then((r) => r.data);

      // Trigger celebration
      if (isWicket) setCeleb("wicket");
      else if (isNoBall) setCeleb("noball");
      else if (ballResult.total_runs >= 6) setCeleb("six");
      else if (ballResult.total_runs >= 4) setCeleb("four");

      setPhysical(0);
      setIsWide(false);
      setIsNoBall(false);
      setIsWicket(false);
      // batsman/bowler intentionally kept (persisted selection)
      await mutateStats();
      if (activeInnings?.innings_id) fetchRecentBalls(activeInnings.innings_id);
    } finally {
      setSaving(false);
    }
  }

  async function undoBall(ballId: number) {
    setUndoing(ballId);
    try {
      await matchesApi.undoBall(ballId);
      await mutateStats();
      if (activeInnings?.innings_id) fetchRecentBalls(activeInnings.innings_id);
    } finally {
      setUndoing(null);
    }
  }

  // ─ Not started ─
  if (match?.status === "scheduled") {
    if (!isScorer) return (
      <div className="flex flex-col items-center gap-2 py-6 text-center">
        <Lock size={20} className="text-slate-600" />
        <p className="text-slate-500 text-sm">Waiting for match to start</p>
      </div>
    );
    return (
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center animate-float">
          <Zap size={28} className="text-indigo-400" />
        </div>
        <div>
          <p className="text-slate-200 font-semibold">You created this match</p>
          <p className="text-slate-500 text-xs mt-0.5">Tap below when teams are ready</p>
        </div>
        <Button onClick={startMatch} className="px-10 h-12 text-base">
          Start Match
        </Button>
      </div>
    );
  }

  if (match?.status === "completed") return (
    <div className="flex flex-col items-center gap-2 py-6 text-center">
      <Trophy size={28} className="text-yellow-400" />
      <p className="text-slate-400 text-sm">Match completed</p>
    </div>
  );

  // ─ Non-scorer view (live only) ─
  if (!isScorer) return (
    <div className="space-y-3">
      {activeInnings && (
        <div className="rounded-2xl p-5 text-center bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
          <p className="text-xs text-slate-500 mb-1">Over {currentOver}.{currentBall}</p>
          <p className="text-5xl font-black gradient-text">{activeInnings.total_runs}</p>
          <p className="text-sm text-slate-400 mt-1">{activeInnings.total_wickets} wkts</p>
        </div>
      )}
      <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/5 border border-white/10">
        <Lock size={13} className="text-slate-500 shrink-0" />
        <p className="text-xs text-slate-500">Scoring managed by the match creator</p>
      </div>
    </div>
  );

  // ─ Scorer live UI ─
  const { total: previewTotal } = figureBonus();

  return (
    <>
      <CelebrationOverlay type={celeb} onDone={() => setCeleb(null)} />

      <div className="space-y-4">
        {/* Innings tabs */}
        {innings.length === 0 ? (
          <div className="space-y-2">
            <p className="text-xs text-center text-slate-500">Create innings to start</p>
            <div className="grid grid-cols-2 gap-2">
              <Button size="sm" onClick={() => createInnings(homeTeamId!)}>Home Batting</Button>
              <Button size="sm" variant="ghost" onClick={() => createInnings(awayTeamId!)}>Away Batting</Button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2 items-center">
            {innings.map((i) => (
              <button
                key={i.innings_id}
                onClick={() => setSelectedInnings(i.innings_id)}
                className={`flex-1 py-2 text-xs rounded-xl font-medium transition-all ${
                  activeInnings?.innings_id === i.innings_id
                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25"
                    : "bg-white/5 text-slate-400 hover:bg-white/10"
                }`}
              >
                {i.batting_team_id === homeTeamId ? "Home" : "Away"}: {i.total_runs}/{i.total_wickets}
              </button>
            ))}
            {innings.length < 2 && (
              <button
                onClick={() => createInnings(innings[0].batting_team_id === homeTeamId ? awayTeamId! : homeTeamId!)}
                className="px-3 py-2 text-xs rounded-xl bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10"
              >
                + 2nd
              </button>
            )}
          </div>
        )}

        {/* Score display */}
        {activeInnings && (
          <div className="rounded-3xl p-5 text-center bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-blue-500/10 border border-indigo-500/20 animate-scale-in">
            <p className="text-xs text-slate-500 font-mono">Over {currentOver}.{currentBall}</p>
            <p className="text-6xl font-black gradient-text mt-1">{activeInnings.total_runs}</p>
            <p className="text-slate-400 mt-1 text-sm">{activeInnings.total_wickets} wkts · {match?.overs_per_innings ?? 16} ov</p>
          </div>
        )}

        {/* Batsman / Bowler selects */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-xs text-slate-500 mb-1.5 font-medium">Batsman</p>
            <select value={batsmanId ?? ""} onChange={(e) => setBatsmanId(Number(e.target.value))}
              className="theme-select w-full">
              <option value="">Select</option>
              {battingMembers?.map((m) => <option key={m.user_id} value={m.user_id}>{m.display_name}</option>)}
            </select>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1.5 font-medium">Bowler</p>
            <select value={bowlerId ?? ""} onChange={(e) => setBowlerId(Number(e.target.value))}
              className="theme-select w-full">
              <option value="">Select</option>
              {bowlingMembers?.map((m) => <option key={m.user_id} value={m.user_id}>{m.display_name}</option>)}
            </select>
          </div>
        </div>

        {/* Runs 0–6 */}
        <div>
          <p className="text-xs text-slate-500 mb-1.5 font-medium">Runs Scored</p>
          <div className="grid grid-cols-7 gap-1.5">
            {[0, 1, 2, 3, 4, 5, 6].map((n) => (
              <button
                key={n}
                onClick={() => { setPhysical(n); setIsWide(false); setIsNoBall(false); }}
                className={`py-3.5 rounded-2xl text-base font-black transition-all active:scale-90 ${
                  physical === n && !isWide
                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 scale-105"
                    : "bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Extras row */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { key: "wide",   label: "Wide",    sub: "+1",  active: isWide,   toggle: () => { setIsWide(!isWide); setIsNoBall(false); setIsWicket(false); setPhysical(0); }, activeCls: "text-yellow-300 bg-yellow-500/15 border-yellow-500/40" },
            { key: "noball", label: "No Ball", sub: "+1",  active: isNoBall, toggle: () => { setIsNoBall(!isNoBall); setIsWide(false); }, activeCls: "text-orange-300 bg-orange-500/15 border-orange-500/40" },
            { key: "wicket", label: "Wicket",  sub: "out", active: isWicket, toggle: () => { setIsWicket(!isWicket); setIsWide(false); }, activeCls: "text-red-300 bg-red-500/15 border-red-500/40" },
          ].map(({ key, label, sub, active, toggle, activeCls }) => (
            <button
              key={key}
              onClick={toggle}
              className={`py-3.5 rounded-2xl border text-center transition-all active:scale-95 ${
                active ? activeCls : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
              }`}
            >
              <p className="text-sm font-bold">{label}</p>
              <p className="text-xs opacity-70">{sub}</p>
            </button>
          ))}
        </div>

        {/* Preview */}
        <div className="flex items-center justify-between px-4 py-2 rounded-2xl bg-white/[0.03] border border-white/8">
          <p className="text-xs text-slate-500">This ball will score</p>
          <p className={`text-sm font-black ${previewTotal < 0 ? "text-red-400" : previewTotal === 0 ? "text-slate-400" : "text-indigo-300"}`}>
            {previewTotal >= 0 ? "+" : ""}{previewTotal} runs
          </p>
        </div>

        {/* Record button */}
        <button
          onClick={recordBall}
          disabled={saving || !batsmanId || !bowlerId}
          className="w-full h-14 rounded-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600 text-white font-black text-lg transition-all
            hover:opacity-95 hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5
            active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
        >
          {saving ? <Spinner className="w-5 h-5 mx-auto" /> : "Record Ball"}
        </button>

        {/* Recent balls / undo */}
        {recentBalls.length > 0 && (
          <div>
            <p className="text-xs text-slate-500 mb-2 font-medium">Last {recentBalls.length} balls — tap to undo</p>
            <div className="space-y-1.5">
              {[...recentBalls].reverse().map((b) => {
                const desc = b.is_wide ? "Wide" : b.is_no_ball ? "No Ball" : b.is_wicket ? "Wicket" : `${b.physical_runs} runs`;
                const zone = b.net_zone !== "none" ? ` + ${b.net_zone.replace("_", " ")}` : "";
                return (
                  <div key={b.id} className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/[0.03] border border-white/8">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-500">{b.over_number}.{b.ball_number}</span>
                      <span className="text-xs text-slate-400">{desc}{zone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${b.total_runs < 0 ? "text-red-400" : "text-slate-200"}`}>
                        {b.total_runs >= 0 ? "+" : ""}{b.total_runs}
                      </span>
                      <button
                        onClick={() => undoBall(b.id)}
                        disabled={!!undoing}
                        className="p-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-40"
                      >
                        {undoing === b.id ? <Spinner className="w-3.5 h-3.5" /> : <Undo2 size={13} />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Complete match */}
        <button
          onClick={async () => {
            if (!confirm("Complete this match? This can't be undone.")) return;
            await matchesApi.completeMatch(matchId);
            setCeleb("victory");
            setTimeout(() => { mutateMatch(); mutateStats(); }, 1000);
          }}
          className="w-full py-3 rounded-2xl border border-red-500/30 bg-red-500/8 text-red-400 text-sm font-semibold hover:bg-red-500/15 transition-all"
        >
          Complete Match
        </button>
      </div>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MatchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const matchId = Number(id);
  const { data: match, isLoading } = useMatch(matchId);
  const { data: teams } = useMyTeams();
  const { data: stats } = useMatchStats(matchId);
  useMatchLive(match?.status === "live" ? matchId : undefined);
  const { user } = useAuthStore();
  const [meritOpen, setMeritOpen] = useState(false);

  const { data: homeMembers } = useTeamMembers(match?.team_home_id ?? null);
  const { data: awayMembers } = useTeamMembers(match?.team_away_id ?? null);
  const allMatchMembers = [...(homeMembers ?? []), ...(awayMembers ?? [])];

  const myHomeRole = homeMembers?.find((m) => m.user_id === user?.id)?.role;
  const myAwayRole = awayMembers?.find((m) => m.user_id === user?.id)?.role;
  const isCaptain = ["owner", "captain", "vice_captain"].includes(myHomeRole ?? myAwayRole ?? "");
  const myTeamId = myHomeRole ? match?.team_home_id : match?.team_away_id;

  // Scorer = either designated scorer (after start) OR the match creator before start
  const isScorer = !!(user?.id && (
    match?.scorer_user_id === user.id ||
    (match?.status === "scheduled" /* creator check happens on start_match call */)
  ));

  const homeTeam = teams?.find((t) => t.id === match?.team_home_id);
  const awayTeam = teams?.find((t) => t.id === match?.team_away_id);

  if (isLoading) return (
    <div className="flex flex-col items-center gap-3 py-20">
      <Spinner size="lg" />
      <p className="text-slate-500 text-sm animate-pulse">Loading match…</p>
    </div>
  );
  if (!match) return (
    <div className="flex flex-col items-center gap-4 py-20 text-center">
      <AlertCircle size={40} className="text-slate-600" />
      <p className="text-slate-400">Match not found or access denied</p>
      <Button variant="ghost" size="sm" onClick={() => router.back()}>Go back</Button>
    </div>
  );

  const homeInnings = stats?.innings.find((i) => i.batting_team_id === match.team_home_id);
  const awayInnings = stats?.innings.find((i) => i.batting_team_id === match.team_away_id);
  const isLive = match.status === "live";
  const isCompleted = match.status === "completed";

  const getBestName = (userId: number | undefined) => {
    if (!userId) return null;
    return allMatchMembers.find((m) => m.user_id === userId)?.display_name ?? `#${userId}`;
  };

  return (
    <div className="max-w-lg mx-auto space-y-4 pb-10 animate-fade-in">
      {/* Back */}
      <button onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm transition-colors group">
        <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
        Back
      </button>

      {/* Hero card */}
      <div className={`rounded-3xl border p-5 relative overflow-hidden animate-fade-in ${
        isLive ? "bg-gradient-to-br from-emerald-500/10 via-indigo-500/8 to-purple-500/10 border-emerald-500/30"
        : isCompleted ? "bg-gradient-to-br from-indigo-500/8 to-purple-500/8 border-indigo-500/20"
        : "bg-white shadow-sm border-slate-200 dark:bg-white/[0.04] dark:shadow-none dark:border-white/10"
      }`}>
        <div className="flex items-center justify-between mb-4">
          {isLive ? (
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/15 px-3 py-1 rounded-full border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> LIVE
            </span>
          ) : <Badge variant={isCompleted ? "default" : "info"}>{match.status}</Badge>}
          <div className="flex items-center gap-2 text-xs text-slate-600">
            {match.short_code && <span className="font-mono">#{match.short_code}</span>}
            <span>{match.overs_per_innings}ov</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 text-center">
            <Avatar src={homeTeam?.logo_url} name={homeTeam?.name ?? ""} size="lg" className="rounded-2xl mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{homeTeam?.name ?? `Team ${match.team_home_id}`}</p>
            {homeInnings ? (
              <>
                <p className="text-3xl font-black gradient-text mt-1">{homeInnings.total_runs}</p>
                <p className="text-xs text-slate-500">{homeInnings.total_wickets} wkts</p>
              </>
            ) : (isLive || isCompleted) ? <p className="text-3xl font-black text-slate-700 mt-1">—</p> : null}
          </div>

          <div className="text-center shrink-0">
            <p className="text-slate-600 font-black text-xl">VS</p>
            {isCompleted && homeInnings && awayInnings && (
              <div className="mt-2">
                <Trophy size={16} className="text-yellow-400 mx-auto mb-0.5" />
                <p className="text-xs text-yellow-400 font-bold">
                  {homeInnings.total_runs > awayInnings.total_runs ? homeTeam?.name
                   : awayInnings.total_runs > homeInnings.total_runs ? awayTeam?.name
                   : "Draw"}
                </p>
              </div>
            )}
          </div>

          <div className="flex-1 text-center">
            <Avatar src={awayTeam?.logo_url} name={awayTeam?.name ?? ""} size="lg" className="rounded-2xl mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{awayTeam?.name ?? `Team ${match.team_away_id}`}</p>
            {awayInnings ? (
              <>
                <p className="text-3xl font-black gradient-text mt-1">{awayInnings.total_runs}</p>
                <p className="text-xs text-slate-500">{awayInnings.total_wickets} wkts</p>
              </>
            ) : (isLive || isCompleted) ? <p className="text-3xl font-black text-slate-700 mt-1">—</p> : null}
          </div>
        </div>

        {match.venue && <p className="text-center text-xs text-slate-600 mt-3">📍 {match.venue}</p>}
      </div>

      {/* Scoring panel */}
      {(match.status === "live" || match.status === "scheduled") && (
        <div className="rounded-3xl bg-white shadow-sm border border-slate-200 dark:bg-white/[0.04] dark:shadow-none dark:border-white/10 p-5 animate-fade-in stagger-1">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/15 flex items-center justify-center">
                <Target size={14} className="text-indigo-400" />
              </div>
              <h3 className="font-semibold text-slate-100">Scoring</h3>
            </div>
            {isScorer && match.status === "live" && (
              <span className="text-xs text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full font-medium">
                You&apos;re scoring
              </span>
            )}
          </div>
          <ScorerPanel matchId={matchId} isScorer={isScorer} />
        </div>
      )}

      {/* Availability */}
      <div className="rounded-3xl bg-white shadow-sm border border-slate-200 dark:bg-white/[0.04] dark:shadow-none dark:border-white/10 p-5 animate-fade-in stagger-2">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/15 flex items-center justify-center">
            <Users size={14} className="text-cyan-400" />
          </div>
          <h3 className="font-semibold text-slate-100">Availability</h3>
        </div>
        <AvailabilitySection matchId={matchId} />
      </div>

      {/* Best player summary (completed matches) */}
      {isCompleted && (stats?.best_batsman || stats?.best_bowler) && (
        <div className="rounded-3xl bg-white shadow-sm border border-slate-200 dark:bg-white/[0.04] dark:shadow-none dark:border-white/10 p-5 animate-fade-in stagger-3">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center">
              <Award size={14} className="text-amber-400" />
            </div>
            <h3 className="font-semibold text-slate-100">Match Awards</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {stats.best_batsman && (
              <div className="rounded-2xl p-3 bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border border-indigo-500/20">
                <p className="text-xs text-slate-500 mb-1">🏏 Best Batsman</p>
                <p className="text-sm font-bold text-slate-200">{getBestName(stats.best_batsman.user_id)}</p>
                <p className="text-lg font-black gradient-text">{stats.best_batsman.runs} <span className="text-xs font-normal text-slate-500">runs</span></p>
              </div>
            )}
            {stats.best_bowler && (
              <div className="rounded-2xl p-3 bg-gradient-to-br from-purple-500/10 to-violet-500/10 border border-purple-500/20">
                <p className="text-xs text-slate-500 mb-1">⚡ Best Bowler</p>
                <p className="text-sm font-bold text-slate-200">{getBestName(stats.best_bowler.user_id)}</p>
                <p className="text-lg font-black gradient-text">{stats.best_bowler.wickets} <span className="text-xs font-normal text-slate-500">wkts</span></p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Merit Points */}
      {isCaptain && (
        <div className="rounded-3xl bg-white shadow-sm border border-slate-200 dark:bg-white/[0.04] dark:shadow-none dark:border-white/10 p-5 animate-fade-in stagger-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-yellow-500/15 flex items-center justify-center">
                <Star size={14} className="text-yellow-400" />
              </div>
              <h3 className="font-semibold text-slate-100">Merit Points</h3>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setMeritOpen(true)}>Award</Button>
          </div>
        </div>
      )}

      {/* Scorecard */}
      {stats?.innings && stats.innings.length > 0 && (
        <div className="rounded-3xl bg-white shadow-sm border border-slate-200 dark:bg-white/[0.04] dark:shadow-none dark:border-white/10 p-5 animate-fade-in stagger-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 flex items-center justify-center">
              <TrendingUp size={14} className="text-purple-400" />
            </div>
            <h3 className="font-semibold text-slate-100">Scorecard</h3>
          </div>
          <div className="space-y-5">
            {stats.innings.map((inning) => {
              const members = inning.batting_team_id === match.team_home_id ? homeMembers : awayMembers;
              const getName = (uid: number) => members?.find((m) => m.user_id === uid)?.display_name ?? `#${uid}`;
              const teamName = inning.batting_team_id === match.team_home_id ? homeTeam?.name : awayTeam?.name;
              return (
                <div key={inning.innings_id}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{teamName}</p>
                    <p className="text-sm font-black gradient-text">{inning.total_runs}/{inning.total_wickets}</p>
                  </div>
                  <div className="space-y-1">
                    {inning.batting.map((b, idx) => (
                      <div key={b.user_id} className={`flex justify-between px-2 py-1.5 rounded-xl text-xs ${idx % 2 === 0 ? "bg-white/[0.02]" : ""}`}>
                        <span className="text-slate-400">{getName(b.user_id)}</span>
                        <span className="text-slate-200 font-bold">{b.runs} <span className="text-slate-500 font-normal">({b.balls}b)</span></span>
                      </div>
                    ))}
                  </div>
                  {inning.bowling.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-white/5">
                      <p className="text-xs text-slate-600 mb-1">Bowling</p>
                      {inning.bowling.map((b) => {
                        const bowlTeamMembers = inning.batting_team_id === match.team_home_id ? awayMembers : homeMembers;
                        const bowlerName = bowlTeamMembers?.find((m) => m.user_id === b.user_id)?.display_name ?? `#${b.user_id}`;
                        return (
                          <div key={b.user_id} className="flex justify-between px-2 py-1 text-xs">
                            <span className="text-slate-500">{bowlerName}</span>
                            <span className="text-slate-400">{b.wickets}w / {b.runs_conceded}r</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Merit modal */}
      {isCaptain && myTeamId && allMatchMembers.length > 0 && (
        <AwardMeritModal
          open={meritOpen}
          onClose={() => setMeritOpen(false)}
          teamId={myTeamId}
          members={allMatchMembers}
          matchId={matchId}
        />
      )}
    </div>
  );
}
