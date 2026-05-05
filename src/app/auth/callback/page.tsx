"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/store/useGameStore";

export default function AuthCallback() {
  const router = useRouter();
  const setAuthState = useGameStore((s: any) => s.setAuthState);

  useEffect(() => {
    // Check for hash params in URL (Supabase sends token in hash)
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    
    if (params.has("access_token")) {
      // Parse the tokens from URL
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");
      
      // Store tokens ( Supabase client will handle them automatically)
      if (accessToken) {
        localStorage.setItem("sb-access-token", accessToken);
      }
      if (refreshToken) {
        localStorage.setItem("sb-refresh-token", refreshToken);
      }
      
      // Redirect to room after successful auth
      setTimeout(() => {
        router.push("/room");
      }, 1000);
    } else {
      // No token found, redirect to home
      router.push("/");
    }
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center.bg-black">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--neon-purple)] border-t-transparent" />
        <p className="mt-4 text-white/60">Completing sign in...</p>
      </div>
    </div>
  );
}