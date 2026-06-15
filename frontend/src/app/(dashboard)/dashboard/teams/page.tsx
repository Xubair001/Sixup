"use client";

import Link from "next/link";
import { Plus, ChevronRight, Users } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Avatar } from "@/components/ui/Avatar";
import { useMyTeams } from "@/hooks/useTeams";

export default function TeamsPage() {
  const { data: teams, isLoading } = useMyTeams();

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">My Teams</h1>
        <Link href="/dashboard/teams/create">
          <Button size="sm"><Plus size={14} /> New team</Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : teams && teams.length > 0 ? (
        <div className="space-y-3">
          {teams.map((team) => (
            <Link key={team.id} href={`/dashboard/teams/${team.id}`}>
              <Card className="flex items-center gap-4 hover:border-indigo-500/30 hover:bg-slate-50 dark:hover:bg-white/[0.07] transition-all cursor-pointer">
                <Avatar src={team.logo_url} name={team.name} size="md" className="rounded-xl" />
                <div className="flex-1">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{team.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">/{team.slug}</p>
                </div>
                <ChevronRight size={16} className="text-slate-600" />
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="text-center py-16 space-y-4">
          <Users size={40} className="mx-auto text-slate-600" />
          <div>
            <p className="text-slate-700 dark:text-slate-300 font-medium">No teams yet</p>
            <p className="text-sm text-slate-500 mt-1">Create a team and invite your squad</p>
          </div>
          <Link href="/dashboard/teams/create">
            <Button><Plus size={14} /> Create team</Button>
          </Link>
        </Card>
      )}
    </div>
  );
}
