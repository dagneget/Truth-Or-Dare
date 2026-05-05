import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { subscription, userId } = await req.json();

    if (!subscription) {
      return NextResponse.json({ error: "Missing subscription" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase credentials for push subscription");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    // Initialize Supabase client with the Service Role key to bypass RLS
    // (since push subscriptions might be managed securely by the backend)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Save the subscription to the database
    // We use upsert to avoid duplicate subscriptions for the same endpoint
    const { error } = await supabase
      .from("push_subscriptions")
      .upsert({
        endpoint: subscription.endpoint,
        subscription: subscription,
        user_uid: userId || null, // Optional: tie to a user if provided
        created_at: new Date().toISOString(),
      }, { onConflict: "endpoint" });

    if (error) {
      console.error("Error saving subscription:", error);
      return NextResponse.json({ error: "Failed to save subscription" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Subscription endpoint error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
