import { getAirbnbBusyDates } from "@/lib/booking-server";
export function validIsoDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
export function getTodayIso() { return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Cancun" }).format(new Date()); }
export async function getAirbnbBusyDatesFromFeed() {
  const calendarUrl = process.env.AIRBNB_ICAL_URL;
  if (!calendarUrl) return { configured: false, dates: [] as string[] };
  const response = await fetch(calendarUrl, { cache: "no-store", signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error("Airbnb calendar feed is unavailable");
  const ics = await response.text();
  if (!ics.includes("BEGIN:VCALENDAR")) throw new Error("Invalid Airbnb calendar feed");
  return { configured: true, dates: getAirbnbBusyDates(ics) };
}


