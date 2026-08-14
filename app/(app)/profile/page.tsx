"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import ProfileReview, { type Profile } from "@/components/onboarding/ProfileReview";
import { profileSaveResult } from "@/lib/utils/profileSaveResult";
import { Loader2 } from "lucide-react";

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;
  const router = useRouter();

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("structured_profile")
        .eq("id", user.id)
        .single();

      setProfile(data?.structured_profile || null);
      setLoading(false);
    }
    fetchProfile();
  }, [supabase]);

  async function handleSave(editedProfile: Profile) {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    const result = user
      ? await supabase.from("profiles").update({
          structured_profile: editedProfile,
          display_name: (editedProfile.display_name as string) || "Friend",
          updated_at: new Date().toISOString(),
        }).eq("id", user.id)
      : { error: { message: "Your session expired. Please sign in again." } };
    setSaving(false);
    // Only claim success if the write actually succeeded — never tell the user
    // their edits were saved when they silently were not.
    alert(profileSaveResult(result).message);
  }

  async function handleRedo() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").update({
        structured_profile: null,
        raw_conversation: null,
      }).eq("id", user.id);

      // Clear the profile cookie
      document.cookie = "x-has-profile=; path=/; max-age=0";
    }
    router.push("/onboarding");
  }

  if (loading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent-purple" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center px-4">
        <p className="text-muted mb-4">No profile yet.</p>
        <button
          onClick={() => router.push("/onboarding")}
          className="rounded-xl gradient-bg px-6 py-3 font-semibold text-white"
        >
          Start Interview
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold mb-6 text-center">
        Your Profile
      </h1>
      <ProfileReview
        profile={profile}
        onConfirm={handleSave}
        onRedo={handleRedo}
        confirmLabel={saving ? "Saving..." : "Save Changes"}
        showRedo={true}
      />
    </div>
  );
}
