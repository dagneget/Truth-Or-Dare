import { supabase } from "./client";

export async function signInAsGuest() {
  // Supabase doesn't have "Anonymous Auth" out of the box like Firebase, 
  // but we can use a "Guest" account or just sign in with a throwaway email.
  // For now, we'll use Supabase's `signInAnonymously` if enabled, or just sign in with a random email.
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) console.error("Guest sign in error:", error);
  return { data, error };
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin + "/room",
    },
  });
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}
