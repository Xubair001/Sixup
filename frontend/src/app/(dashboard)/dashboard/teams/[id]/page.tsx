"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { UserPlus, LogOut, Shield, Star, Trash2, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Spinner } from "@/components/ui/Spinner";
import { InvitePlayerModal } from "@/components/teams/InvitePlayerModal";
import { AwardMeritModal } from "@/components/teams/AwardMeritModal";
import { useTeam, useTeamMembers } from "@/hooks/useTeams";
import { useAuthStore } from "@/stores/authStore";
import { useTeamInvitations } from "@/hooks/useInvitations";
import { teamsApi } from "@/lib/api/teams";
import { client } from "@/lib/api/client";
import { mutate } from "swr";
import type { MemberStatus, TeamRole } from "@/types";

type Status = MemberStatus;

const STATUS_LABELS: Record<Status, { label: string; cls: string }> = {
  playing:   { label: "Playing", cls: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30" },
  bench:     { label: "Bench",   cls: "text-yellow-400  bg-yellow-500/15  border-yellow-500/30"  },
  available: { label: "Avail.",  cls: "text-slate-400   bg-slate-500/15   border-slate-500/30"   },
};

const ROLE_LABELS: Record<string, { label: string; cls: string }> = {
  owner:        { label: "Owner",   cls: "text-yellow-300 bg-yellow-500/15" },
  captain:      { label: "Captain", cls: "text-indigo-300 bg-indigo-500/15" },
  vice_captain: { label: "V.Cap",   cls: "text-blue-300   bg-blue-500/15"   },
  scorer:       { label: "Scorer",  cls: "text-purple-300 bg-purple-500/15" },
  player:       { label: "Player",  cls: "text-slate-300  bg-slate-500/15"  },
};

export default function TeamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const teamId = Number(id);
  const { user } = useAuthStore();
  const { data: team, isLoading } = useTeam(teamId);
  const { data: members, mutate: mutateMembers } = useTeamMembers(teamId);
  const { data: invitations, mutate: mutateInvitations } = useTeamInvitations(teamId);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [meritOpen, setMeritOpen] = useState(false);
  const [updatingMember, setUpdatingMember] = useState<number | null>(null);

  const myMembership = members?.find((m) => m.user_id === user?.id);
  const isOwner   = myMembership?.role === "owner";
  const canManage = isOwner || myMembership?.role === "captain";

  async function setStatus(userId: number, status: Status) {
    setUpdatingMember(userId);
    try {
      await client.patch(`/teams/${teamId}/members/${userId}/status`, { status });
      mutateMembers();
    } finally {
      setUpdatingMember(null);
    }
  }

  async function setRole(userId: number, role: TeamRole) {
    setUpdatingMember(userId);
    try {
      await client.patch(`/teams/${teamId}/members/${userId}/role`, { role });
      mutateMembers();
    } finally {
      setUpdatingMember(null);
    }
  }

  async function removeMember(userId: number, displayName: string) {
    if (!confirm(`Remove ${displayName} from the team?`)) return;
    setUpdatingMember(userId);
    try {
      await teamsApi.removeMember(teamId, userId);
      mutateMembers();
    } finally {
      setUpdatingMember(null);
    }
  }

  const handleLeave = async () => {
    if (!confirm("Leave this team?")) return;
    await teamsApi.leaveTeam(teamId);
    await mutate("/teams/mine");
    window.location.href = "/dashboard/teams";
  };

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!team) return <div className="text-slate-400 text-center py-20">Team not found</div>;

  const playing = members?.filter((m) => m.status === "playing") ?? [];
  const bench   = members?.filter((m) => m.status === "bench")   ?? [];
  const rest    = members?.filter((m) => !["playing","bench"].includes(m.status)) ?? [];

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Avatar src={team.logo_url} name={team.name} size="lg" className="rounded-2xl shrink-0" />
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{team.name}</h1>
          <p className="text-sm text-slate-500">/{team.slug}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {playing.length > 0 && <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">{playing.length} playing</span>}
            {bench.length > 0 && <span className="text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded-full">{bench.length} bench</span>}
            <span className="text-xs text-slate-500">{members?.length ?? 0} total</span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 flex-wrap">
        {canManage && (
          <Button size="sm" onClick={() => setInviteOpen(true)}>
            <UserPlus size={14} /> Invite
          </Button>
        )}
        {canManage && (
          <Button size="sm" variant="ghost" onClick={() => setMeritOpen(true)}>
            <Star size={14} /> Points
          </Button>
        )}
        {myMembership?.role !== "owner" && (
          <Button size="sm" variant="danger" onClick={handleLeave}>
            <LogOut size={14} /> Leave
          </Button>
        )}
      </div>

      {/* Members */}
      <div className="rounded-3xl bg-white shadow-sm border border-slate-200 dark:bg-white/[0.04] dark:shadow-none dark:border-white/10 overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-white/8">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">Members</h3>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-white/5">
          {members?.map((member, idx) => {
            const roleConf = ROLE_LABELS[member.role] ?? ROLE_LABELS.player;
            const statusConf = STATUS_LABELS[(member.status as Status) ?? "available"];
            const isMe = member.user_id === user?.id;
            const canEdit = canManage && !isMe && member.role !== "owner";
            const canChangeRole = isOwner && !isMe && member.role !== "owner";

            return (
              <div
                key={member.id}
                className={`flex items-center gap-3 px-5 py-3.5 transition-colors ${idx === 0 ? "" : ""} hover:bg-slate-50 dark:hover:bg-white/[0.02]`}
              >
                <Avatar src={member.avatar_url} name={member.display_name || member.username} size="md" />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {member.display_name}
                      {isMe && <span className="text-xs text-slate-500 ml-1">(you)</span>}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleConf.cls}`}>
                      {roleConf.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">@{member.username}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Status badge / picker */}
                  {canEdit ? (
                    <div className="relative group">
                      <button
                        disabled={updatingMember === member.user_id}
                        className={`flex items-center gap-1 text-xs px-2 py-1 rounded-xl border font-medium transition-all hover:opacity-80 ${statusConf.cls}`}
                      >
                        {updatingMember === member.user_id ? <Spinner className="w-3 h-3" /> : (
                          <>
                            {statusConf.label}
                            <ChevronDown size={10} />
                          </>
                        )}
                      </button>
                      <div className="absolute right-0 top-full mt-1 z-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 rounded-xl shadow-xl overflow-hidden hidden group-hover:block w-28">
                        {(["playing", "bench", "available"] as Status[]).map((s) => (
                          <button
                            key={s}
                            onClick={() => setStatus(member.user_id, s)}
                            className={`w-full text-left text-xs px-3 py-2 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors ${member.status === s ? "text-indigo-400" : "text-slate-700 dark:text-slate-300"}`}
                          >
                            {STATUS_LABELS[s].label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusConf.cls}`}>
                      {statusConf.label}
                    </span>
                  )}

                  {/* Role picker (owner only) */}
                  {canChangeRole && (
                    <div className="relative group">
                      <button
                        disabled={updatingMember === member.user_id}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all"
                        title="Change role"
                      >
                        <Shield size={13} />
                      </button>
                      <div className="absolute right-0 top-full mt-1 z-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 rounded-xl shadow-xl overflow-hidden hidden group-hover:block w-32">
                        {(["captain", "vice_captain", "scorer", "player"] as TeamRole[]).map((r) => (
                          <button
                            key={r}
                            onClick={() => setRole(member.user_id, r)}
                            className={`w-full text-left text-xs px-3 py-2 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors ${member.role === r ? "text-indigo-400" : "text-slate-700 dark:text-slate-300"}`}
                          >
                            {ROLE_LABELS[r].label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Remove */}
                  {canEdit && (
                    <button
                      onClick={() => removeMember(member.user_id, member.display_name)}
                      disabled={updatingMember === member.user_id}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-40"
                      title="Remove from team"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pending invitations */}
      {canManage && invitations && invitations.length > 0 && (
        <div className="rounded-3xl bg-white shadow-sm border border-slate-200 dark:bg-white/[0.04] dark:shadow-none dark:border-white/10 overflow-hidden">
          <div className="p-5 border-b border-slate-200 dark:border-white/8">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Pending Invitations ({invitations.length})</h3>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {invitations.map((inv) => (
              <div key={inv.id} className="flex items-center gap-3 px-5 py-3.5">
                <div className="h-10 w-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <Shield size={14} className="text-slate-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">{inv.invitee_display_name}</p>
                  <p className="text-xs text-slate-500">@{inv.invitee_username}</p>
                </div>
                <Badge variant="warning">pending</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      <InvitePlayerModal
        teamId={teamId}
        isOpen={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onInvited={() => { mutateInvitations(); mutateMembers(); }}
      />
      {members && (
        <AwardMeritModal
          open={meritOpen}
          onClose={() => setMeritOpen(false)}
          teamId={teamId}
          members={members}
        />
      )}
    </div>
  );
}
