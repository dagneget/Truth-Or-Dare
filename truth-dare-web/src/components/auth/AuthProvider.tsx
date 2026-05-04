"use client";

"use client";

import { useEffect, type ReactNode } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/useAuthStore";
import { useGameStore } from "@/store/useGameStore";

export function AuthProvider({ children }: { children: ReactNode }) {
  const setAuthState = useAuthStore((s) => s.setAuthState);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setAuthState(true, null);
      return;
    }

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user ?? null;
      setAuthState(true, user);
      if (user) {
        useGameStore.getState().setSelfId(user.id);
        const name = user.user_metadata?.full_name || user.user_metadata?.display_name;
        if (name) {
          const current = useGameStore.getState().displayName;
          if (current === "Player" || !current.trim()) {
            useGameStore.getState().setDisplayName(name);
          }
        }
      } else {
        useGameStore.getState().setSelfId();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      setAuthState(true, user);
      if (user) {
        useGameStore.getState().setSelfId(user.id);
      } else {
        useGameStore.getState().setSelfId();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setAuthState]);

  return <>{children}</>;
}
