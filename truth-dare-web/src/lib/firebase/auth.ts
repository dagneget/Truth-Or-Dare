"use client";

import {
  GoogleAuthProvider,
  signInWithRedirect,
  signInAnonymously,
  signOut,
  type User,
} from "firebase/auth";
import { getFirebaseAuth } from "./client";

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

/**
 * Full-page Google OAuth (no popup). Avoids `auth/popup-blocked` in strict browsers
 * and embedded WebViews. The app navigates to Google, then returns;
 * `getRedirectResult` in `AuthProvider` completes the session.
 */
export async function signInWithGoogle(): Promise<null> {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Firebase is not configured. Add NEXT_PUBLIC_FIREBASE_* to .env.local.");
  await signInWithRedirect(auth, googleProvider);
  return null;
}

export async function signInAsGuest(): Promise<User> {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Firebase is not configured. Add NEXT_PUBLIC_FIREBASE_* to .env.local.");
  const { user } = await signInAnonymously(auth);
  return user;
}

export async function signOutFirebase(): Promise<void> {
  const auth = getFirebaseAuth();
  if (!auth) return;
  await signOut(auth);
}
