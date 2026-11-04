import { NextResponse } from "next/server";
import { getBookingEnv } from "@/lib/booking-server";
export const dynamic = "force-dynamic";
export async function GET() {
  const { supabaseUrl, serviceKey, stripeKey } = getBookingEnv();
  const liveKey = Boolean(stripeKey?.startsWith("sk_live_") || stripeKey?.startsWith("rk_live_"));
  const testKey = Boolean(stripeKey?.startsWith("sk_test_") || stripeKey?.startsWith("rk_test_"));
  const configured = Boolean(supabaseUrl && serviceKey && stripeKey && process.env.STRIPE_WEBHOOK_SECRET && process.env.AIRBNB_ICAL_URL);
  return NextResponse.json({ enabled: configured && liveKey, testMode: configured && testKey }, { headers: { "Cache-Control": "no-store" } });
}
