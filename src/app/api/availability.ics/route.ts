import { NextResponse } from "next/server";
import { getBookingEnv } from "@/lib/booking-server";

export const dynamic = "force-dynamic";

type Reservation = { id: string; check_in: string; check_out: string };

function toIcalDate(value: string) {
  return value.replaceAll("-", "");
}

export async function GET() {
  const { supabaseUrl, serviceKey } = getBookingEnv();
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "Calendar export is not configured" }, { status: 503 });
  }

  const query = new URLSearchParams({
    select: "id,check_in,check_out",
    status: "eq.confirmed",
    check_out: `gte.${new Date().toISOString().slice(0, 10)}`,
    order: "check_in.asc",
    limit: "500",
  });
  const response = await fetch(`${supabaseUrl}/rest/v1/booking_reservations?${query}`, {
    headers: { apikey: serviceKey, Accept: "application/json" },
    cache: "no-store",
  });
  if (!response.ok) {
    return NextResponse.json({ error: "Calendar export could not be loaded" }, { status: 503 });
  }

  const reservations = await response.json() as Reservation[];
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const events = reservations
    .filter((reservation) => /^[0-9a-f-]{16,64}$/i.test(reservation.id) && /^\d{4}-\d{2}-\d{2}$/.test(reservation.check_in) && /^\d{4}-\d{2}-\d{2}$/.test(reservation.check_out))
    .map((reservation) => [
      "BEGIN:VEVENT",
      `UID:${reservation.id}@homun-six.vercel.app`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${toIcalDate(reservation.check_in)}`,
      `DTEND;VALUE=DATE:${toIcalDate(reservation.check_out)}`,
      "SUMMARY:Homun - reservado",
      "STATUS:CONFIRMED",
      "TRANSP:OPAQUE",
      "END:VEVENT",
    ].join("\r\n"));

  const calendar = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Homun//Availability Calendar//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    ...events,
    "END:VCALENDAR",
    "",
  ].join("\r\n");

  return new Response(calendar, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": "inline; filename=homun-availability.ics",
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
