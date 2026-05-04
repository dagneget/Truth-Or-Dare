"use client";

import { create } from "zustand";
import type { User } from "@supabase/supabase-js";

export type AuthUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous: boolean;
};

type AuthState = {
  ready: boolean;
  user: AuthUser | null;
  setAuthState: (ready: boolean, user: User | null) => void;
};

function mapUser(u: User | null): AuthUser | null {
  if (!u) return null;
  return {
    uid: u.id,
    email: u.email || null,
    displayName: u.user_metadata?.full_name || u.user_metadata?.display_name || null,
    photoURL: u.user_metadata?.avatar_url || null,
    isAnonymous: u.aud === "anonymous" || !u.email, // Rough heuristic for Supabase
  };
}

export const useAuthStore = create<AuthState>((set) => ({
  ready: false,
  user: null,
  setAuthState: (ready, user) =>
    set({
      ready,
      user: mapUser(user),
    }),
}));
