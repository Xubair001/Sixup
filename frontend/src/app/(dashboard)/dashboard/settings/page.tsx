"use client";

import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "@/stores/themeStore";

export default function SettingsPage() {
  const { theme, setTheme } = useThemeStore();

  return (
    <div className="max-w-lg mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">Customize your Cricket Pocket experience</p>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 dark:bg-white/[0.04] dark:border-white/10 overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-white/5">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">Appearance</h3>
          <p className="text-xs text-slate-500 mt-0.5">Choose your preferred theme</p>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: "light", icon: Sun, label: "Light" },
              { value: "dark", icon: Moon, label: "Dark" },
            ].map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => setTheme(value as "light" | "dark")}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border text-sm font-medium transition-all ${
                  theme === value
                    ? "bg-indigo-50 border-indigo-300 text-indigo-700 dark:bg-indigo-500/15 dark:border-indigo-500/40 dark:text-indigo-300"
                    : "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300 dark:bg-white/5 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/10"
                }`}
              >
                <Icon size={20} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
