import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function getRoleColor(role: string): string {
  const map: Record<string, string> = {
    owner: "text-yellow-400 bg-yellow-400/10",
    captain: "text-indigo-400 bg-indigo-400/10",
    vice_captain: "text-purple-400 bg-purple-400/10",
    scorer: "text-cyan-400 bg-cyan-400/10",
    player: "text-slate-400 bg-slate-400/10",
  };
  return map[role] ?? "text-slate-400 bg-slate-400/10";
}

export function getRatingLabel(rating: number): { label: string; color: string } {
  if (rating >= 800) return { label: "Elite", color: "text-yellow-400" };
  if (rating >= 700) return { label: "Advanced", color: "text-indigo-400" };
  if (rating >= 600) return { label: "Intermediate", color: "text-blue-400" };
  if (rating >= 500) return { label: "Developing", color: "text-cyan-400" };
  return { label: "Beginner", color: "text-slate-400" };
}
