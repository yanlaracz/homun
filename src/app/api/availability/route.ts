import { NextResponse } from "next/server";
import { getBookingEnv, getSiteBusyDates } from "@/lib/booking-server";
import { getAirbnbBusyDatesFromFeed } from "@/lib/booking-validation";
export const dynamic = "force-dynamic";
export async function GET() {
  const { supabaseUrl, serviceKey } = getBookingEnv();
  try {
    const airbnb = await getAirbnbBusyDatesFromFeed();
    const siteDates = supabaseUrl && serviceKey ? await getSiteBusyDates(new Date().toISOString().slice(0, 10), new Date(Date.now() + 400 * 86400000).toISOString().slice(0, 10)) : [];
    return NextResponse.json({ configured: airbnb.configured, airbnbConfigured: airbnb.configured, siteConfigured: Boolean(supabaseUrl && serviceKey), busyDates: [...new Set([...airbnb.dates, ...siteDates])].sort() }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ configured: Boolean(process.env.AIRBNB_ICAL_URL), airbnbConfigured: Boolean(process.env.AIRBNB_ICAL_URL), siteConfigured: Boolean(supabaseUrl && serviceKey), error: true, busyDates: [] }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
