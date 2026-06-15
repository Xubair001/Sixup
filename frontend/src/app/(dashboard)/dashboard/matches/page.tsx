"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Calendar, MapPin, Clock, Trophy, Plus } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useMyTeams } from "@/hooks/useTeams";
import { useTeamMatches, useMatchStats } from "@/hooks/useMatches";
import type { Match, Team } from "@/types";

function statusBadge(status: string) {
  if (status === "live") return <Badge variant="success" className="animate-pulse">● Live</Badge>;
  if (status === "completed") return <Badge variant="default">Completed</Badge>;
  return <Badge variant="default">Scheduled</Badge>;
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "TBD";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

function formatTime(dateStr: string | null) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function MatchCard({ match, teams }: { match: Match; teams: Team[] }) {
  const homeTeam = teams.find((t) => t.id === match.team_home_id);
  const awayTeam = teams.find((t) => t.id === match.team_away_id);
  const { data: stats } = useMatchStats(match.status === "completed" ? match.id : undefined);

  const homeInnings = stats?.innings.find((i) => i.batting_team_id === match.team_home_id);
  const awayInnings = stats?.innings.find((i) => i.batting_team_id === match.team_away_id);

  return (
    <Link href={`/dashboard/matches/${match.id}`} className="block">
    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 dark:bg-white/5 dark:border-white/10 dark:hover:border-white/20 transition-all cursor-pointer">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Calendar size={12} />
          <span>{formatDate(match.date)}</span>
          {match.date && <span className="text-slate-600">·</span>}
          {match.date && <Clock size={12} />}
          {match.date && <span>{formatTime(match.date)}</span>}
        </div>
        {statusBadge(match.status)}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 text-center">
          <div className="h-10 w-10 rounded-xl mx-auto mb-1 flex items-center justify-center text-white font-bold text-sm"
            style={{ background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.4)" }}>
            {homeTeam?.name.slice(0, 2).toUpperCase() ?? "??"}
          </div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{homeTeam?.name ?? `Team ${match.team_home_id}`}</p>
          {homeInnings && (
            <p className="text-lg font-bold gradient-text">{homeInnings.total_runs}</p>
          )}
          {homeInnings && (
            <p className="text-xs text-slate-500">{homeInnings.total_wickets} wkts</p>
          )}
        </div>

        <div className="text-center px-2">
          <p className="text-slate-600 font-bold text-lg">VS</p>
          {match.status === "completed" && homeInnings && awayInnings && (
            <p className="text-xs text-cyan-400 font-medium mt-1">
              {homeInnings.total_runs > awayInnings.total_runs
                ? homeTeam?.name ?? "Home"
                : awayInnings.total_runs > homeInnings.total_runs
                ? awayTeam?.name ?? "Away"
                : "Draw"} won
            </p>
          )}
          {match.short_code && (
            <p className="text-xs text-slate-600 mt-1">#{match.short_code}</p>
          )}
        </div>

        <div className="flex-1 text-center">
          <div className="h-10 w-10 rounded-xl mx-auto mb-1 flex items-center justify-center text-white font-bold text-sm"
            style={{ background: "rgba(168,85,247,0.2)", border: "1px solid rgba(168,85,247,0.4)" }}>
            {awayTeam?.name.slice(0, 2).toUpperCase() ?? "??"}
          </div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{awayTeam?.name ?? `Team ${match.team_away_id}`}</p>
          {awayInnings && (
            <p className="text-lg font-bold gradient-text">{awayInnings.total_runs}</p>
          )}
          {awayInnings && (
            <p className="text-xs text-slate-500">{awayInnings.total_wickets} wkts</p>
          )}
        </div>
      </div>

      {match.venue && (
        <div className="flex items-center gap-1.5 mt-3 text-xs text-slate-500">
          <MapPin size={11} />
          <span>{match.venue}</span>
        </div>
      )}
    </div>
    </Link>
  );
}

function TeamMatchSection({ team, allTeams }: { team: Team; allTeams: Team[] }) {
  const { data: matches, isLoading } = useTeamMatches(team.id);

  if (isLoading) return <div className="flex justify-center py-6"><Spinner /></div>;
  if (!matches?.length) return (
    <p className="text-slate-500 text-sm text-center py-6">No matches scheduled yet</p>
  );

  const upcoming = matches.filter((m) => m.status === "scheduled");
  const live = matches.filter((m) => m.status === "live");
  const completed = matches.filter((m) => m.status === "completed");

  return (
    <div className="space-y-3">
      {live.map((m) => <MatchCard key={m.id} match={m} teams={allTeams} />)}
      {upcoming.map((m) => <MatchCard key={m.id} match={m} teams={allTeams} />)}
      {completed.map((m) => <MatchCard key={m.id} match={m} teams={allTeams} />)}
    </div>
  );
}

export default function MatchesPage() {
  const router = useRouter();
  const { data: teams, isLoading } = useMyTeams();
  const [activeTeam, setActiveTeam] = useState<number | null>(null);

  const selectedTeam = activeTeam
    ? teams?.find((t) => t.id === activeTeam)
    : teams?.[0];

  if (isLoading) return <div className="flex justify-center py-20"><Spinner /></div>;

  if (!teams?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <Trophy size={40} className="text-slate-600" />
        <p className="text-slate-400">Join or create a team to see matches</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Matches</h1>
        <Button size="sm" onClick={() => router.push("/dashboard/matches/new")}>
          <Plus size={14} className="mr-1" /> Schedule
        </Button>
      </div>

      {teams.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {teams.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTeam(t.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                (activeTeam ?? teams[0].id) === t.id
                  ? "bg-indigo-500 text-white"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10"
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      )}

      {selectedTeam && (
        <Card>
          <CardHeader>
            <CardTitle>{selectedTeam.name} — Schedule</CardTitle>
          </CardHeader>
          <TeamMatchSection team={selectedTeam} allTeams={teams} />
        </Card>
      )}
    </div>
  );
}
