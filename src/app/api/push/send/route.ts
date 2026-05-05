import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

if (vapidPublicKey?.length === 87 && vapidPrivateKey?.length === 43) {
  webpush.setVapidDetails(
    "mailto:your-email@example.com",
    vapidPublicKey,
    vapidPrivateKey
  );
}

export async function POST(req: Request) {
  try {
    const { userId, userIds, title, body, url } = await req.json();

    const targets = userIds || (userId ? [userId] : []);

    if (targets.length === 0) {
      return NextResponse.json({ error: "Missing userId or userIds" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    // Use the Service Role Key to bypass RLS and read subscriptions
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all subscriptions for these users
    const { data: subscriptions, error } = await supabase
      .from("push_subscriptions")
      .select("subscription, endpoint")
      .in("user_uid", targets);

    if (error || !subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ error: "No subscriptions found for user" }, { status: 404 });
    }

    const payload = JSON.stringify({
      title: title || "Truth or Dare",
      body: body || "You have a new notification!",
      url: url || "/",
    });

    // Send notifications to all the user's devices
    const sendPromises = subscriptions.map((sub) =>
      webpush.sendNotification(sub.subscription, payload).catch(async (e) => {
        console.error("Error sending push to a device:", e);
        // If the subscription is no longer valid (e.g. user revoked permission), delete it
        if (e.statusCode === 410 || e.statusCode === 404) {
          await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
        }
      })
    );

    await Promise.all(sendPromises);

    return NextResponse.json({ success: true, sentCount: subscriptions.length });
  } catch (error) {
    console.error("Push notification send error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
