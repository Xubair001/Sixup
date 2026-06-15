"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Menu, X, LayoutDashboard, Users, Activity, Trophy, User } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { useUnreadCount } from "@/hooks/useNotifications";

const NAV = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/dashboard/teams", label: "Teams", icon: Users },
  { href: "/dashboard/matches", label: "Matches", icon: Activity },
  { href: "/dashboard/stats", label: "Stats", icon: Trophy },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

export function MobileHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { data } = useUnreadCount();
  const unread = data?.count ?? 0;

  return (
    <>
      <header className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-slate-900/90 backdrop-blur border-b border-white/[0.06]">
        <span className="text-base font-bold gradient-text">Sixup</span>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/notifications" className="relative p-2">
            <Bell size={18} className="text-slate-400" />
            {unread > 0 && <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-indigo-500" />}
          </Link>
          <button onClick={() => setOpen(!open)} className="p-2 text-slate-400">
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {open && (
        <div className="md:hidden fixed inset-0 z-30 pt-14">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <nav className="relative bg-slate-900 border-r border-white/10 h-full w-64 p-4 space-y-1 overflow-y-auto">
            {NAV.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all",
                  pathname === href || (href !== "/dashboard" && pathname.startsWith(href))
                    ? "bg-indigo-500/20 text-white"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon size={18} />
                {label}
              </Link>
            ))}
            {user && (
              <button
                onClick={() => { logout(); setOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-red-400 hover:bg-red-500/10 mt-4"
              >
                Sign out
              </button>
            )}
          </nav>
        </div>
      )}
    </>
  );
}
