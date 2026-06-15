"use client";

import Link from "next/link";
import { Users, Activity, Trophy, Bell, Plus, ChevronRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Avatar } from "@/components/ui/Avatar";
import { useAuthStore } from "@/stores/authStore";
import { useMyTeams } from "@/hooks/useTeams";
import { useMyInvitations } from "@/hooks/useInvitations";
import { useUnreadCount } from "@/hooks/useNotifications";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data: teams, isLoading: teamsLoading } = useMyTeams();
  const { data: invitations } = useMyInvitations();
  const { data: unreadData } = useUnreadCount();

  const pendingInvites = invitations?.filter((i) => i.status === "pending") ?? [];

  const stats = [
    { label: "Teams",         value: teams?.length ?? 0,   icon: Users,    color: "text-indigo-400",  bg: "bg-indigo-500/10  border-indigo-500/20",  href: "/dashboard/teams" },
    { label: "Notifications", value: unreadData?.count ?? 0, icon: Bell,   color: "text-violet-400",  bg: "bg-violet-500/10  border-violet-500/20",  href: "/dashboard/notifications" },
    { label: "Invites",       value: pendingInvites.length, icon: Activity, color: "text-cyan-400",    bg: "bg-cyan-500/10    border-cyan-500/20",    href: "/dashboard/notifications" },
    { label: "Matches",       value: "→",                   icon: Trophy,   color: "text-yellow-400",  bg: "bg-yellow-500/10  border-yellow-500/20",  href: "/dashboard/matches" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8">
      {/* Welcome */}
      <div className="animate-fade-in">
        <p className="text-slate-500 text-sm">Good to see you,</p>
        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-0.5">
          <span className="gradient-text">{user?.username}</span>
        </h1>
        <p className="text-xs text-slate-600 font-mono mt-0.5">#{user?.public_id}</p>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map(({ label, value, icon: Icon, color, bg, href }, idx) => (
          <Link key={label} href={href}>
            <div className={`rounded-3xl border p-4 ${bg} hover:scale-[1.02] transition-transform active:scale-[0.98] cursor-pointer animate-fade-in stagger-${idx + 1}`}>
              <Icon size={18} className={color} />
              <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-2">{value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Pending invitations banner */}
      {pendingInvites.length > 0 && (
        <div className="rounded-3xl bg-gradient-to-r from-indigo-500/10 via-violet-500/8 to-purple-500/10 border border-indigo-500/20 p-5 animate-slide-up">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                <Activity size={14} className="text-indigo-400" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Pending Invitations</h3>
              <span className="text-xs text-indigo-400 bg-indigo-500/20 px-2 py-0.5 rounded-full">{pendingInvites.length}</span>
            </div>
            <Link href="/dashboard/notifications">
              <Button variant="ghost" size="sm">View all</Button>
            </Link>
          </div>
          <div className="space-y-2">
            {pendingInvites.slice(0, 3).map((inv) => (
              <div key={inv.id} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200 dark:bg-white/5 dark:border-white/10">
                <div className="h-9 w-9 rounded-xl bg-indigo-500/15 flex items-center justify-center">
                  <Users size={14} className="text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{inv.team_name}</p>
                  <p className="text-xs text-slate-500">from @{inv.inviter_username}</p>
                </div>
                <Link href="/dashboard/notifications">
                  <Button size="sm">Respond</Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Teams */}
      <div className="rounded-3xl bg-white shadow-sm border border-slate-200 dark:bg-white/[0.04] dark:shadow-none dark:border-white/10 overflow-hidden animate-fade-in stagger-2">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-white/8">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">My Teams</h3>
          <Link href="/dashboard/teams/create">
            <Button size="sm">
              <Plus size={14} /> New team
            </Button>
          </Link>
        </div>
        {teamsLoading ? (
          <div className="flex justify-center py-10"><Spinner /></div>
        ) : teams && teams.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {teams.map((team, idx) => (
              <Link
                key={team.id}
                href={`/dashboard/teams/${team.id}`}
                className={`flex items-center gap-3 p-4 hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors group animate-fade-in stagger-${Math.min(idx + 3, 6)}`}
              >
                <Avatar src={team.logo_url} name={team.name} size="md" className="rounded-xl" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{team.name}</p>
                  <p className="text-xs text-slate-500">/{team.slug}</p>
                </div>
                <ChevronRight size={14} className="text-slate-600 group-hover:text-slate-400 transition-colors group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center py-12 gap-4 text-center">
            <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center animate-float">
              <Zap size={24} className="text-indigo-400" />
            </div>
            <div>
              <p className="text-slate-700 dark:text-slate-300 font-semibold">No teams yet</p>
              <p className="text-slate-500 text-sm">Create or join a team to get started</p>
            </div>
            <Link href="/dashboard/teams/create">
              <Button>Create your first team</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
