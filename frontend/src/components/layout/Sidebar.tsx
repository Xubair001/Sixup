"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, Trophy, User, Bell, LogOut, Activity, Zap, Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { useUnreadCount } from "@/hooks/useNotifications";
import { Avatar } from "@/components/ui/Avatar";

const NAV = [
  { href: "/dashboard",                label: "Home",          icon: LayoutDashboard },
  { href: "/dashboard/teams",          label: "My Teams",      icon: Users },
  { href: "/dashboard/matches",        label: "Matches",       icon: Activity },
  { href: "/dashboard/stats",          label: "Stats",         icon: Trophy },
  { href: "/dashboard/profile",        label: "Profile",       icon: User },
  { href: "/dashboard/notifications",  label: "Notifications", icon: Bell, badge: true },
  { href: "/dashboard/settings",       label: "Settings",      icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { data: unreadData } = useUnreadCount();
  const unread = unreadData?.count ?? 0;

  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 bg-white border-r border-slate-200 dark:bg-[#0d1223] dark:border-white/[0.06]">
      {/* Logo */}
      <div className="p-5 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Zap size={14} className="text-white" />
          </div>
          <span className="text-base font-bold gradient-text">Cricket Pocket</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon, badge }) => {
          const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          const showBadge = badge && unread > 0;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-indigo-50 text-indigo-700 dark:bg-gradient-to-r dark:from-indigo-500/20 dark:to-violet-500/10 dark:text-white dark:border dark:border-indigo-500/20"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-500 dark:hover:text-slate-200 dark:hover:bg-white/[0.04]"
              )}
            >
              <div className="relative">
                <Icon size={15} />
                {showBadge && (
                  <span className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 rounded-full bg-indigo-500 text-[8px] font-bold text-white flex items-center justify-center">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </div>
              <span className="flex-1">{label}</span>
              {showBadge && (
                <span className="text-xs text-indigo-600 bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-500/15 px-1.5 py-0.5 rounded-full">
                  {unread}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {user && (
        <div className="p-3 border-t border-slate-200 dark:border-white/[0.06]">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 dark:bg-white/[0.03] dark:border-white/[0.06]">
            <Avatar src={null} name={user.username} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">@{user.username}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-600 font-mono truncate">#{user.public_id}</p>
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 dark:hover:bg-red-500/10 dark:text-slate-600 dark:hover:text-red-400 transition-all"
              title="Sign out"
            >
              <LogOut size={13} />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
