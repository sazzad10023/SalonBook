
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Loader2, Save, UserRound, Camera } from "lucide-react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";

export default function MyProfilePage() {
  const { data: session, isPending } = authClient.useSession();

  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const user = session?.user;

    if (!user) return;

    let active = true;

    Promise.resolve().then(() => {
      if (!active) return;

      setName(user.name || "");
      setImage(user.image || "");
    });

    return () => {
      active = false;
    };
  }, [session]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Name is required.");
      return;
    }

    if (!session?.user) {
      toast.error("Please login first.");
      return;
    }

    try {
      setSaving(true);

      const { error } = await authClient.updateUser({
        name: name.trim(),
        image: image.trim() || null,
      });

      if (error) {
        toast.error(error.message || "Failed to update profile.");
        return;
      }

      toast.success("Profile updated successfully.");
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  if (isPending) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Please login to view your profile.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          My Profile
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update your personal profile information.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-lg border bg-card p-5">
          <h2 className="mb-5 text-base font-semibold">
            Profile Information
          </h2>

          <div className="mb-6 flex items-center gap-4">
            <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-muted">
              {image ? (
                <Image
                  src={image}
                  alt="Profile"
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="64px"
                />
              ) : (
                <UserRound className="size-7 text-muted-foreground" />
              )}
            </div>

            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-sm font-medium">Profile Photo</p>
              <p className="text-xs text-muted-foreground">
                Add your profile image URL.
              </p>
              <div className="relative mt-2">
                <Camera className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="h-10 w-full rounded-md border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                maxLength={100}
                required
                className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Email Address
              </label>
              <input
                type="email"
                value={session.user.email}
                disabled
                className="h-10 w-full rounded-md border bg-muted px-3 text-sm text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground">
                Email address cannot be changed here.
              </p>
            </div>

          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
