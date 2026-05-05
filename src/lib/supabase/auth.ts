import { supabase } from "./client";

export async function signInAsGuest() {
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) console.error("Guest sign in error:", error);
  return { data, error };
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}
