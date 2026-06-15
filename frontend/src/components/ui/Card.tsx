import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  gradient?: boolean;
}

export function Card({ className, gradient, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-5 transition-colors",
        "bg-white border-slate-200 dark:bg-white/[0.04] dark:border-white/10",
        "dark:backdrop-blur-sm",
        gradient && "bg-gradient-to-br from-indigo-50 via-violet-50/50 to-blue-50 dark:from-indigo-500/10 dark:via-purple-500/5 dark:to-blue-500/10",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mb-4 flex items-center justify-between", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-base font-semibold text-slate-900 dark:text-slate-100", className)} {...props}>
      {children}
    </h3>
  );
}
