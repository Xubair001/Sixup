import Image from "next/image";
import { cn } from "@/lib/utils";

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizes = {
  xs: { container: "h-6 w-6", text: "text-xs" },
  sm: { container: "h-8 w-8", text: "text-xs" },
  md: { container: "h-10 w-10", text: "text-sm" },
  lg: { container: "h-14 w-14", text: "text-lg" },
  xl: { container: "h-20 w-20", text: "text-2xl" },
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function getColor(name: string): string {
  const colors = [
    "from-indigo-500 to-purple-500",
    "from-purple-500 to-blue-500",
    "from-blue-500 to-cyan-500",
    "from-cyan-500 to-indigo-500",
    "from-pink-500 to-purple-500",
  ];
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
}

export function Avatar({ src, name, size = "md", className }: AvatarProps) {
  const { container, text } = sizes[size];
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
  const fullSrc = src ? (src.startsWith("http") ? src : `${baseUrl}${src}`) : null;

  return (
    <div className={cn("relative rounded-full overflow-hidden flex-shrink-0", container, className)}>
      {fullSrc ? (
        <Image src={fullSrc} alt={name} fill className="object-cover" sizes="80px" />
      ) : (
        <div className={cn("h-full w-full flex items-center justify-center bg-gradient-to-br font-semibold text-white", getColor(name), text)}>
          {getInitials(name)}
        </div>
      )}
    </div>
  );
}
