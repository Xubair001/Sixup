"use client";

import { Bell, CheckCheck, Users, Trophy, Activity } from "lucide-react";
import { mutate } from "swr";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { useNotifications } from "@/hooks/useNotifications";
import { useMyInvitations } from "@/hooks/useInvitations";
import { notificationsApi } from "@/lib/api/notifications";
import { invitationsApi } from "@/lib/api/invitations";
import { formatTimeAgo } from "@/lib/utils";

const TYPE_ICON: Record<string, React.ReactNode> = {
  team_invite: <Users size={14} className="text-indigo-400" />,
  invite_accepted: <Users size={14} className="text-emerald-400" />,
  invite_declined: <Users size={14} className="text-red-400" />,
  achievement: <Trophy size={14} className="text-yellow-400" />,
  match_result: <Activity size={14} className="text-cyan-400" />,
};

export default function NotificationsPage() {
  const { data: notifications, isLoading, mutate: mutateNotifs } = useNotifications();
  const { data: invitations, mutate: mutateInvites } = useMyInvitations();

  const pendingInvites = invitations?.filter((i) => i.status === "pending") ?? [];

  const markAllRead = async () => {
    await notificationsApi.markAllRead();
    mutateNotifs();
    mutate("/notifications/unread-count");
  };

  const handleInviteResponse = async (id: number, accept: boolean) => {
    if (accept) await invitationsApi.accept(id);
    else await invitationsApi.decline(id);
    mutateInvites();
    mutate("/teams/mine");
  };

  return (
    <div className="max-w-xl mx-auto space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Notifications</h1>
        {notifications && notifications.some((n) => !n.is_read) && (
          <Button size="sm" variant="ghost" onClick={markAllRead}>
            <CheckCheck size={14} /> Mark all read
          </Button>
        )}
      </div>

      {pendingInvites.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Team Invitations</h2>
          {pendingInvites.map((inv) => (
            <Card key={inv.id} gradient className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0">
                  <Users size={16} className="text-indigo-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    Invited to <span className="text-indigo-300">{inv.team_name}</span>
                  </p>
                  <p className="text-xs text-slate-500">from @{inv.inviter_username}</p>
                  {inv.message && <p className="text-xs text-slate-400 mt-1 italic">"{inv.message}"</p>}
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" className="flex-1" onClick={() => handleInviteResponse(inv.id, false)}>
                  Decline
                </Button>
                <Button size="sm" className="flex-1" onClick={() => handleInviteResponse(inv.id, true)}>
                  Accept
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Recent</h2>
        {isLoading ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : notifications && notifications.length > 0 ? (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`flex items-start gap-3 p-4 rounded-xl border transition-colors ${
                n.is_read ? "bg-slate-50 border-slate-100 dark:bg-white/[0.03] dark:border-white/5" : "bg-indigo-500/5 border-indigo-500/20"
              }`}
            >
              <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                {TYPE_ICON[n.type] ?? <Bell size={14} className="text-slate-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{n.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{n.body}</p>
                <p className="text-xs text-slate-600 mt-1">{formatTimeAgo(n.created_at)}</p>
              </div>
              {!n.is_read && <div className="h-2 w-2 rounded-full bg-indigo-500 shrink-0 mt-1.5" />}
            </div>
          ))
        ) : (
          <Card className="text-center py-10">
            <Bell size={32} className="mx-auto text-slate-600 mb-3" />
            <p className="text-slate-400">No notifications yet</p>
          </Card>
        )}
      </div>
    </div>
  );
}
