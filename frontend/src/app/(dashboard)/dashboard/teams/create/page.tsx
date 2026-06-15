"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { teamsApi } from "@/lib/api/teams";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { mutate } from "swr";

const COLORS = ["#6366f1", "#8b5cf6", "#3b82f6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#ec4899"];

const schema = z.object({
  name: z.string().min(2, "At least 2 characters").max(100),
  color: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function CreateTeamPage() {
  const router = useRouter();
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting }, setError } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { color: "#6366f1" },
  });
  const selectedColor = watch("color");

  const onSubmit = async (data: FormData) => {
    try {
      const team = await teamsApi.create(data);
      await mutate("/teams/mine");
      router.push(`/dashboard/teams/${team.id}`);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } };
      setError("root", { message: err?.response?.data?.detail ?? "Failed to create team" });
    }
  };

  return (
    <div className="max-w-md mx-auto animate-fade-in">
      <h1 className="text-xl font-bold text-slate-100 mb-5">Create Team</h1>
      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input label="Team name" placeholder="Thunder XI" error={errors.name?.message} {...register("name")} />

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Team color</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setValue("color", c)}
                  className="h-8 w-8 rounded-full transition-transform hover:scale-110"
                  style={{
                    background: c,
                    outline: selectedColor === c ? `2px solid ${c}` : "none",
                    outlineOffset: "2px",
                  }}
                />
              ))}
            </div>
          </div>

          {errors.root && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {errors.root.message}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <Button type="button" variant="ghost" onClick={() => router.back()} className="flex-1">Cancel</Button>
            <Button type="submit" isLoading={isSubmitting} className="flex-1">Create team</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
