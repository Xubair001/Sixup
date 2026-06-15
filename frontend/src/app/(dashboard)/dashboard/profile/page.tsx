"use client";

import { useRef, useState } from "react";
import { Camera, Save } from "lucide-react";
import useSWR, { mutate } from "swr";
import { useForm } from "react-hook-form";
import { playersApi } from "@/lib/api/players";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";
import { Spinner } from "@/components/ui/Spinner";
import { useAuthStore } from "@/stores/authStore";
import { getRatingLabel } from "@/lib/utils";

export default function ProfilePage() {
  const { user } = useAuthStore();
  const { data: profile, isLoading } = useSWR("/players/me", () => playersApi.getMyProfile());
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, formState: { isDirty } } = useForm({
    values: {
      display_name: profile?.display_name ?? "",
      bio: profile?.bio ?? "",
      jersey_number: profile?.jersey_number ?? "",
      batting_style: profile?.batting_style ?? "",
      bowling_style: profile?.bowling_style ?? "",
      location: profile?.location ?? "",
    },
  });

  const onSubmit = async (data: Record<string, unknown>) => {
    setSaving(true);
    try {
      await playersApi.updateMyProfile(data);
      await mutate("/players/me");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await playersApi.uploadAvatar(file);
      await mutate("/players/me");
    } finally {
      setUploading(false);
    }
  };

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  const { label: ratingLabel, color: ratingColor } = getRatingLabel(profile?.rating ?? 600);

  return (
    <div className="max-w-lg mx-auto space-y-5 animate-fade-in">
      <h1 className="text-xl font-bold text-slate-100">My Profile</h1>

      <Card>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar
              src={profile?.avatar_url}
              name={user?.username ?? ""}
              size="xl"
            />
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-indigo-500 flex items-center justify-center hover:bg-indigo-400 transition-colors"
            >
              {uploading ? <Spinner size="sm" className="h-3 w-3" /> : <Camera size={12} className="text-white" />}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
          <div>
            <p className="text-lg font-bold text-slate-100">@{user?.username}</p>
            <p className="text-sm text-slate-500">#{user?.public_id}</p>
            <p className={`text-sm font-semibold mt-1 ${ratingColor}`}>
              {ratingLabel} · {profile?.rating ?? 600} pts
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader><CardTitle>Edit Profile</CardTitle></CardHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Display name" {...register("display_name")} />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">Bio</label>
            <textarea
              {...register("bio")}
              rows={2}
              maxLength={160}
              className="input-field resize-none"
              placeholder="Short bio..."
            />
          </div>
          <Input label="Jersey number" type="number" min={0} max={99} {...register("jersey_number")} />
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Batting style</label>
              <select {...register("batting_style")} className="input-field">
                <option value="">Select</option>
                <option value="right">Right-handed</option>
                <option value="left">Left-handed</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Bowling style</label>
              <select {...register("bowling_style")} className="input-field">
                <option value="">Select</option>
                <option value="right-arm-fast">Right-arm fast</option>
                <option value="right-arm-medium">Right-arm medium</option>
                <option value="left-arm-fast">Left-arm fast</option>
                <option value="left-arm-medium">Left-arm medium</option>
                <option value="off-spin">Off spin</option>
                <option value="leg-spin">Leg spin</option>
              </select>
            </div>
          </div>
          <Input label="Location (city)" placeholder="Sydney" {...register("location")} />
          <Button type="submit" isLoading={saving} disabled={!isDirty} className="w-full">
            <Save size={14} /> Save changes
          </Button>
        </form>
      </Card>
    </div>
  );
}
