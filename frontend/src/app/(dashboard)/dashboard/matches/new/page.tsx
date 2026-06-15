"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, MapPin, Eye, Timer } from "lucide-react";
import { useMyTeams } from "@/hooks/useTeams";
import { matchesApi } from "@/lib/api/matches";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";

const selectCls = "theme-select w-full rounded-2xl";

export default function NewMatchPage() {
  const router = useRouter();
  const { data: teams, isLoading } = useMyTeams();
  const [homeId, setHomeId]     = useState("");
  const [awayId, setAwayId]     = useState("");
  const [date, setDate]         = useState("");
  const [venue, setVenue]       = useState("");
  const [visibility, setVis]    = useState("team_only");
  const [overs, setOvers]       = useState("16");
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");

  if (isLoading) return <div className="flex justify-center py-20"><Spinner /></div>;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!homeId || !awayId) { setError("Select both teams"); return; }
    if (homeId === awayId) { setError("Home and away teams must be different"); return; }
    const oversNum = parseInt(overs, 10);
    if (isNaN(oversNum) || oversNum < 4 || oversNum > 50) { setError("Overs must be between 4 and 50"); return; }
    setSaving(true);
    setError("");
    try {
      const match = await matchesApi.createMatch({
        team_home_id: Number(homeId),
        team_away_id: Number(awayId),
        date: date || undefined,
        venue: venue || undefined,
        visibility,
        overs_per_innings: oversNum,
      });
      router.push(`/dashboard/matches/${match.id}`);
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Failed to schedule match");
      setSaving(false);
    }
  }

  const myTeams = teams ?? [];

  return (
    <div className="max-w-lg mx-auto pb-8 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Schedule a Match</h1>
        <p className="text-sm text-slate-500 mt-0.5">Set up a new match between two teams</p>
      </div>

      <div className="rounded-3xl bg-white shadow-sm border border-slate-200 dark:bg-white/[0.04] dark:shadow-none dark:border-white/10 p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Teams */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 mb-1.5 block font-medium">Home Team</label>
              <select value={homeId} onChange={(e) => setHomeId(e.target.value)} className={selectCls} required>
                <option value="">Select</option>
                {myTeams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1.5 block font-medium">Away Team</label>
              <select value={awayId} onChange={(e) => setAwayId(e.target.value)} className={selectCls} required>
                <option value="">Select</option>
                {myTeams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>

          {/* Overs */}
          <div>
            <label className="text-xs text-slate-500 mb-1.5 flex items-center gap-1 font-medium">
              <Timer size={12} /> Overs per Innings
            </label>
            <div className="flex gap-2 flex-wrap">
              {[8, 12, 16, 20, 24].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setOvers(String(n))}
                  className={`px-4 py-2 rounded-2xl text-sm font-semibold border transition-all ${
                    overs === String(n)
                      ? "bg-indigo-500 border-indigo-500 text-white"
                      : "bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200 dark:bg-white/5 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/10"
                  }`}
                >
                  {n}
                </button>
              ))}
              <input
                type="number"
                value={overs}
                onChange={(e) => setOvers(e.target.value)}
                min={4} max={50}
                className="w-16 bg-slate-100 border border-slate-200 rounded-2xl px-3 py-2 text-sm text-slate-800 text-center focus:outline-none focus:border-indigo-500/60 dark:bg-white/5 dark:border-white/10 dark:text-slate-200"
                placeholder="—"
              />
            </div>
            <p className="text-xs text-slate-600 mt-1">4 pairs × {Math.floor(parseInt(overs) / 4) || "—"} overs each</p>
          </div>

          {/* Date */}
          <div>
            <label className="text-xs text-slate-500 mb-1.5 flex items-center gap-1 font-medium">
              <CalendarDays size={12} /> Date & Time
            </label>
            <input
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={selectCls}
            />
          </div>

          {/* Venue */}
          <div>
            <label className="text-xs text-slate-500 mb-1.5 flex items-center gap-1 font-medium">
              <MapPin size={12} /> Venue
            </label>
            <Input
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="e.g. Indoor Sports Centre, Court 1"
              className="rounded-2xl"
            />
          </div>

          {/* Visibility */}
          <div>
            <label className="text-xs text-slate-500 mb-1.5 flex items-center gap-1 font-medium">
              <Eye size={12} /> Visibility
            </label>
            <div className="flex gap-2">
              {[
                { value: "team_only", label: "Teams only" },
                { value: "private",   label: "Private" },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setVis(value)}
                  className={`flex-1 py-2 rounded-2xl text-xs font-semibold border transition-all ${
                    visibility === value
                      ? "bg-indigo-500 border-indigo-500 text-white"
                      : "bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200 dark:bg-white/5 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/10"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="rounded-2xl bg-red-500/10 border border-red-500/25 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => router.back()} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="flex-1">
              {saving ? <Spinner className="w-4 h-4" /> : "Schedule Match"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
