import { NextResponse } from "next/server";
import { getBookingEnv } from "@/lib/booking-server";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const sessionId = new URL(request.url).searchParams.get("session_id");
  const { supabaseUrl, serviceKey, stripeKey } = getBookingEnv();
  if (!sessionId || !supabaseUrl || !serviceKey || !stripeKey) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const response = await fetch(`${supabaseUrl}/rest/v1/booking_reservations?select=check_in,check_out,guests,status,stripe_session_id&stripe_session_id=eq.${encodeURIComponent(sessionId)}&limit=1`, {
    headers: { apikey: serviceKey }, cache: "no-store",
  });
  if (!response.ok) return NextResponse.json({ error: "Could not check reservation" }, { status: 503 });
  const rows = await response.json() as Array<{ check_in: string; check_out: string; guests: number; status: string }>;
  if (!rows.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const row = rows[0];
  return NextResponse.json({ checkIn: row.check_in, checkOut: row.check_out, guests: row.guests, status: row.status });
}


