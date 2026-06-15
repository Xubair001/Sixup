"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password required"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { setTokens } = useAuthStore();
  const {
    register, handleSubmit, formState: { errors, isSubmitting }, setError,
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const tokens = await authApi.login(data);
      setTokens(tokens.access_token, tokens.refresh_token);
      router.push("/dashboard");
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } };
      setError("root", { message: err?.response?.data?.detail ?? "Login failed" });
    }
  };

  return (
    <div className="glass-card p-8 space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold gradient-text">Welcome back</h1>
        <p className="text-sm text-slate-400">Sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register("password")}
        />
        {errors.root && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            {errors.root.message}
          </p>
        )}
        <Button type="submit" isLoading={isSubmitting} className="w-full mt-2">
          Sign in
        </Button>
      </form>

      <p className="text-center text-sm text-slate-500">
        No account?{" "}
        <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-medium">
          Create one
        </Link>
      </p>
    </div>
  );
}
