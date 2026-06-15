import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full rounded-lg px-4 py-2.5 text-sm transition-colors duration-150",
            "bg-white border text-slate-900 placeholder:text-slate-400",
            "dark:bg-white/5 dark:text-slate-100 dark:placeholder:text-slate-500",
            "focus:outline-none focus:ring-1",
            error
              ? "border-red-400 focus:border-red-500 focus:ring-red-400/30 dark:border-red-500/50 dark:focus:border-red-500/60 dark:focus:ring-red-500/30"
              : "border-slate-200 focus:border-indigo-400 focus:ring-indigo-400/30 dark:border-white/10 dark:focus:border-indigo-500/60 dark:focus:ring-indigo-500/30",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}
        {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
