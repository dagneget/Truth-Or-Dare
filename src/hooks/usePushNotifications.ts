"use client";

import { useEffect, useCallback, useRef } from "react";
import { useGameStore } from "@/store/useGameStore";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

export function usePushNotifications() {
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);

  const requestPermission = useCallback(async function requestPermission(): Promise<NotificationPermission> {
    if (!("Notification" in window)) {
      return "denied";
    }

    if (Notification.permission === "granted") {
      return "granted";
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      return permission;
    }

    return "denied";
  }, []);

  const subscribeToPush = useCallback(async function subscribeToPush(): Promise<PushSubscription | null> {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      console.warn("Push notifications not supported");
      return null;
    }

    try {
      const permission = await requestPermission();
      if (permission !== "granted") {
        console.log("Push permission denied");
        return null;
      }

      const registration = await navigator.serviceWorker.ready;
      registrationRef.current = registration;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as any,
      });

      // Send the subscription to our backend with the player's ID
      const userId = useGameStore.getState().selfId;
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription, userId }),
      });

      console.log("Push subscription successful:", subscription);
      return subscription;
    } catch (error) {
      console.error("Push subscription error:", error);
      return null;
    }
  }, [requestPermission]);

  const unsubscribeFromPush = useCallback(async function unsubscribeFromPush(): Promise<boolean> {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        console.log("Push unsubscribed");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Push unsubscribe error:", error);
      return false;
    }
  }, []);

  const checkSubscription = useCallback(async function checkSubscription(): Promise<PushSubscription | null> {
    try {
      const registration = await navigator.serviceWorker.ready;
      return await registration.pushManager.getSubscription();
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.ready.then((registration) => {
      registrationRef.current = registration;
    });
  }, []);

  return {
    requestPermission,
    subscribeToPush,
    unsubscribeFromPush,
    checkSubscription,
    isSupported: "PushManager" in window,
  };
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(new ArrayBuffer(rawData.length));

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}