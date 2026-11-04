import { NextResponse } from "next/server";
import { getBookingEnv, getSiteBusyDates, SupabaseApiError } from "@/lib/booking-server";
import { getAirbnbBusyDatesFromFeed } from "@/lib/booking-validation";
export const dynamic = "force-dynamic";
export async function GET() {
  const { supabaseUrl, serviceKey } = getBookingEnv();
  const siteConfigured = Boolean(supabaseUrl && serviceKey);
  let airbnb: Awaited<ReturnType<typeof getAirbnbBusyDatesFromFeed>>;
  try {
    airbnb = await getAirbnbBusyDatesFromFeed();
  } catch {
    return NextResponse.json({ configured: Boolean(process.env.AIRBNB_ICAL_URL), airbnbConfigured: Boolean(process.env.AIRBNB_ICAL_URL), siteConfigured, error: true, errorSource: "airbnb", busyDates: [] }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
  let siteDates: string[] = [];
  if (siteConfigured) {
    try {
      siteDates = await getSiteBusyDates(new Date().toISOString().slice(0, 10), new Date(Date.now() + 400 * 86400000).toISOString().slice(0, 10));
    } catch (error) {
      return NextResponse.json({ configured: airbnb.configured, airbnbConfigured: airbnb.configured, siteConfigured, error: true, errorSource: "database", databaseStatus: error instanceof SupabaseApiError ? error.status : undefined, databaseCode: error instanceof SupabaseApiError ? error.code : undefined, busyDates: [] }, { status: 503, headers: { "Cache-Control": "no-store" } });
    }
  }
  return NextResponse.json({ configured: airbnb.configured, airbnbConfigured: airbnb.configured, siteConfigured, busyDates: [...new Set([...airbnb.dates, ...siteDates])].sort() }, { headers: { "Cache-Control": "no-store" } });
}
