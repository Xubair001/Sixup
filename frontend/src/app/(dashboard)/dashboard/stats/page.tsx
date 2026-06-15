"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { BarChart2, TrendingUp, Target, Users, Star } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { useLeaderboard, usePlayerStats } from "@/hooks/useMatches";
import { useMyTeams, useTeamMembers } from "@/hooks/useTeams";
import { usePlayerMerit } from "@/hooks/useMerit";
import type { TeamMember } from "@/types";

const CHART_COLORS = {
  runs: "#6366f1",
  wickets: "#a855f7",
  accent: "#22d3ee",
};

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-xl p-4 bg-slate-50 border border-slate-200 dark:bg-white/5 dark:border-white/10 text-center">
      <p className="text-2xl font-bold gradient-text">{value}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{label}</p>
      {sub && <p className="text-xs text-slate-600 mt-0.5">{sub}</p>}
    </div>
  );
}

function PlayerStatPanel({ member }: { member: TeamMember }) {
  const { data: stats, isLoading } = usePlayerStats(member.user_id);
  const { data: merit } = usePlayerMerit(member.user_id);

  if (isLoading) return <div className="py-4 flex justify-center"><Spinner /></div>;
  if (!stats) return <p className="text-slate-500 text-sm text-center py-4">No stats yet</p>;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <StatCard label="Total Runs" value={stats.batting.total_runs} />
        <StatCard label="Wickets" value={stats.bowling.wickets} />
        <StatCard label="Balls Faced" value={stats.batting.balls_faced} />
        <StatCard label="Overs Bowled" value={stats.bowling.overs_bowled} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <StatCard
          label="Physical Runs"
          value={stats.batting.physical_runs}
          sub={`+${stats.batting.bonus_runs} bonus`}
        />
        <StatCard
          label="Economy"
          value={stats.bowling.economy ?? "—"}
          sub={`${stats.bowling.runs_conceded} conceded`}
        />
      </div>
      {merit && (
        <div className="rounded-xl p-3 bg-slate-50 border border-slate-200 dark:bg-white/5 dark:border-white/10">
          <p className="text-xs text-slate-500 mb-2 flex items-center gap-1"><Star size={11} /> Merit Points</p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-emerald-400 font-bold">{merit.total_merit}</p>
              <p className="text-xs text-slate-600">Merit</p>
            </div>
            <div>
              <p className="text-red-400 font-bold">{merit.total_demerit}</p>
              <p className="text-xs text-slate-600">Demerit</p>
            </div>
            <div>
              <p className={`font-bold ${merit.net >= 0 ? "text-emerald-400" : "text-red-400"}`}>{merit.net >= 0 ? "+" : ""}{merit.net}</p>
              <p className="text-xs text-slate-600">Net</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LeaderboardSection() {
  const { data: lb, isLoading } = useLeaderboard();
  const { data: teams } = useMyTeams();
  const [allMembers, setAllMembers] = useState<Record<number, string>>({});

  const { data: members1 } = useTeamMembers(teams?.[0]?.id ?? null);
  const { data: members2 } = useTeamMembers(teams?.[1]?.id ?? null);

  const memberMap: Record<number, string> = {};
  [...(members1 ?? []), ...(members2 ?? [])].forEach((m) => {
    memberMap[m.user_id] = m.display_name;
  });

  const getName = (userId: number) => memberMap[userId] ?? `Player #${userId}`;

  if (isLoading) return <div className="flex justify-center py-8"><Spinner /></div>;
  if (!lb) return <p className="text-slate-500 text-sm text-center py-8">No data yet</p>;

  const battersData = lb.top_batters.slice(0, 8).map((e) => ({
    name: getName(e.user_id),
    runs: e.runs ?? 0,
  }));

  const bowlersData = lb.top_bowlers.slice(0, 8).map((e) => ({
    name: getName(e.user_id),
    wickets: e.wickets ?? 0,
  }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp size={16} className="text-indigo-400" />
            Top Batters
          </CardTitle>
        </CardHeader>
        {battersData.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-6">No batting data yet</p>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={battersData} margin={{ top: 4, right: 12, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
                  labelStyle={{ color: "#e2e8f0" }}
                  itemStyle={{ color: CHART_COLORS.runs }}
                />
                <Bar dataKey="runs" fill={CHART_COLORS.runs} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-3 space-y-1">
              {lb.top_batters.slice(0, 5).map((e, i) => (
                <div key={e.user_id} className="flex items-center justify-between px-1 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5">
                  <div className="flex items-center gap-2.5">
                    <span className={`text-xs font-bold w-5 text-center ${i === 0 ? "text-yellow-400" : i === 1 ? "text-slate-500 dark:text-slate-300" : i === 2 ? "text-amber-600" : "text-slate-500"}`}>
                      {i + 1}
                    </span>
                    <span className="text-sm text-slate-800 dark:text-slate-200">{getName(e.user_id)}</span>
                  </div>
                  <Badge variant="default">{e.runs ?? 0} runs</Badge>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target size={16} className="text-purple-400" />
            Top Bowlers
          </CardTitle>
        </CardHeader>
        {bowlersData.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-6">No bowling data yet</p>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={bowlersData} margin={{ top: 4, right: 12, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
                  labelStyle={{ color: "#e2e8f0" }}
                  itemStyle={{ color: CHART_COLORS.wickets }}
                />
                <Bar dataKey="wickets" fill={CHART_COLORS.wickets} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-3 space-y-1">
              {lb.top_bowlers.slice(0, 5).map((e, i) => (
                <div key={e.user_id} className="flex items-center justify-between px-1 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5">
                  <div className="flex items-center gap-2.5">
                    <span className={`text-xs font-bold w-5 text-center ${i === 0 ? "text-yellow-400" : i === 1 ? "text-slate-500 dark:text-slate-300" : i === 2 ? "text-amber-600" : "text-slate-500"}`}>
                      {i + 1}
                    </span>
                    <span className="text-sm text-slate-800 dark:text-slate-200">{getName(e.user_id)}</span>
                  </div>
                  <Badge variant="default">{e.wickets ?? 0} wkts</Badge>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

function PlayerCompareSection() {
  const { data: teams } = useMyTeams();
  const { data: members1 } = useTeamMembers(teams?.[0]?.id ?? null);
  const { data: members2 } = useTeamMembers(teams?.[1]?.id ?? null);

  const allMembers = [...(members1 ?? []), ...(members2 ?? [])];
  const [playerA, setPlayerA] = useState<number | null>(null);
  const [playerB, setPlayerB] = useState<number | null>(null);

  const { data: statsA } = usePlayerStats(playerA ?? undefined);
  const { data: statsB } = usePlayerStats(playerB ?? undefined);

  if (!allMembers.length) return null;

  const compareData = statsA && statsB
    ? [
        { label: "Runs", a: statsA.batting.total_runs, b: statsB.batting.total_runs },
        { label: "Wickets", a: statsA.bowling.wickets, b: statsB.bowling.wickets },
        { label: "Balls Faced", a: statsA.batting.balls_faced, b: statsB.batting.balls_faced },
        { label: "Runs Conceded", a: statsA.bowling.runs_conceded, b: statsB.bowling.runs_conceded },
      ]
    : [];

  const nameA = allMembers.find((m) => m.user_id === playerA)?.display_name ?? "Player A";
  const nameB = allMembers.find((m) => m.user_id === playerB)?.display_name ?? "Player B";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users size={16} className="text-cyan-400" />
          Player Comparison
        </CardTitle>
      </CardHeader>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Player A</label>
          <select
            value={playerA ?? ""}
            onChange={(e) => setPlayerA(e.target.value ? Number(e.target.value) : null)}
            className="theme-select w-full rounded-lg"
          >
            <option value="">Select player</option>
            {allMembers.map((m) => (
              <option key={m.user_id} value={m.user_id}>{m.display_name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Player B</label>
          <select
            value={playerB ?? ""}
            onChange={(e) => setPlayerB(e.target.value ? Number(e.target.value) : null)}
            className="theme-select w-full rounded-lg"
          >
            <option value="">Select player</option>
            {allMembers.map((m) => (
              <option key={m.user_id} value={m.user_id}>{m.display_name}</option>
            ))}
          </select>
        </div>
      </div>

      {playerA && playerB && compareData.length > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-500 px-1 mb-2">
            <span className="text-indigo-400 font-medium">{nameA}</span>
            <span className="text-purple-400 font-medium">{nameB}</span>
          </div>
          {compareData.map((row) => {
            const total = row.a + row.b;
            const pctA = total > 0 ? (row.a / total) * 100 : 50;
            return (
              <div key={row.label}>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>{row.a}</span>
                  <span className="text-slate-500">{row.label}</span>
                  <span>{row.b}</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden flex bg-slate-100 dark:bg-white/5">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pctA}%`, background: "linear-gradient(90deg, #6366f1, #818cf8)" }}
                  />
                  <div
                    className="h-full flex-1 rounded-full"
                    style={{ background: "linear-gradient(90deg, #a855f7, #c084fc)" }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
      {(!playerA || !playerB) && (
        <p className="text-slate-600 text-sm text-center py-4">Select two players to compare</p>
      )}
    </Card>
  );
}

function PlayerStatsSection() {
  const { data: teams } = useMyTeams();
  const { data: members1 } = useTeamMembers(teams?.[0]?.id ?? null);
  const { data: members2 } = useTeamMembers(teams?.[1]?.id ?? null);

  const allMembers = [...(members1 ?? []), ...(members2 ?? [])];
  const [selected, setSelected] = useState<number | null>(null);

  const activeMember = selected
    ? allMembers.find((m) => m.user_id === selected)
    : allMembers[0];

  if (!allMembers.length) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart2 size={16} className="text-indigo-400" />
          Player Stats
        </CardTitle>
      </CardHeader>
      <div className="flex gap-2 flex-wrap mb-4">
        {allMembers.map((m) => (
          <button
            key={m.user_id}
            onClick={() => setSelected(m.user_id)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              (selected ?? allMembers[0].user_id) === m.user_id
                ? "bg-indigo-500 text-white"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10"
            }`}
          >
            {m.display_name}
          </button>
        ))}
      </div>
      {activeMember && <PlayerStatPanel member={activeMember} />}
    </Card>
  );
}

export default function StatsPage() {
  const [tab, setTab] = useState<"leaderboard" | "players" | "compare">("leaderboard");

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Stats</h1>

      <div className="flex gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-xl">
        {(["leaderboard", "players", "compare"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg capitalize transition-all ${
              tab === t
                ? "bg-indigo-500 text-white shadow"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            {t === "leaderboard" ? "Leaderboard" : t === "players" ? "Per Player" : "Compare"}
          </button>
        ))}
      </div>

      {tab === "leaderboard" && <LeaderboardSection />}
      {tab === "players" && <PlayerStatsSection />}
      {tab === "compare" && <PlayerCompareSection />}
    </div>
  );
}
