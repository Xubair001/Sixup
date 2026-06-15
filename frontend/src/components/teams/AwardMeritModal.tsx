"use client";

import { useState } from "react";
import { Star, AlertTriangle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { meritApi } from "@/lib/api/merit";
import type { TeamMember } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  teamId: number;
  members: TeamMember[];
  matchId?: number;
}

export function AwardMeritModal({ open, onClose, teamId, members, matchId }: Props) {
  const [userId, setUserId] = useState<number | "">("");
  const [type, setType] = useState<"merit" | "demerit">("merit");
  const [points, setPoints] = useState(1);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) { setError("Select a player"); return; }
    if (points < 1) { setError("Points must be at least 1"); return; }
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await meritApi.award(teamId, {
        user_id: Number(userId),
        points,
        type,
        reason: reason || undefined,
        match_id: matchId,
      });
      setSuccess(`${type === "merit" ? "Merit" : "Demerit"} points awarded!`);
      setUserId("");
      setReason("");
      setPoints(1);
      setTimeout(onClose, 1200);
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Failed to award points");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal isOpen={open} onClose={onClose} title="Award Merit / Demerit Points">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type toggle */}
        <div className="flex gap-2 bg-white/5 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setType("merit")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
              type === "merit" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <Star size={14} /> Merit
          </button>
          <button
            type="button"
            onClick={() => setType("demerit")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
              type === "demerit" ? "bg-red-500/20 text-red-300 border border-red-500/30" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <AlertTriangle size={14} /> Demerit
          </button>
        </div>

        {/* Player select */}
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Player</label>
          <select
            value={userId}
            onChange={(e) => setUserId(e.target.value ? Number(e.target.value) : "")}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            required
          >
            <option value="">Select player…</option>
            {members.map((m) => (
              <option key={m.user_id} value={m.user_id}>
                {m.display_name} (@{m.username})
              </option>
            ))}
          </select>
        </div>

        {/* Points */}
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Points</label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 5, 10].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setPoints(n)}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                  points === n
                    ? type === "merit"
                      ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300"
                      : "bg-red-500/20 border border-red-500/40 text-red-300"
                    : "bg-white/5 text-slate-400 hover:bg-white/10"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Reason */}
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Reason (optional)</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            placeholder={type === "merit" ? "e.g. Outstanding catch" : "e.g. Late arrival"}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none"
          />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}
        {success && <p className="text-emerald-400 text-sm">{success}</p>}

        <div className="flex gap-3 pt-1">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
          <Button
            type="submit"
            disabled={saving}
            className={`flex-1 ${type === "demerit" ? "bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30" : ""}`}
          >
            {saving ? <Spinner className="w-4 h-4" /> : `Award ${points} ${type === "merit" ? "merit" : "demerit"} pt${points !== 1 ? "s" : ""}`}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
