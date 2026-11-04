const reservationTable = "booking_reservations";

export class SupabaseApiError extends Error {
  constructor(readonly status: number) {
    super("Booking database request failed");
  }
}

export function getBookingEnv() {
  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const serviceKey = process.env.SUPABASE_SECRET_KEY;
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  return { supabaseUrl, serviceKey, stripeKey };
}

export async function supabaseRpc<T>(name: string, body: Record<string, unknown>): Promise<T> {
  const { supabaseUrl, serviceKey } = getBookingEnv();
  if (!supabaseUrl || !serviceKey) throw new Error("Booking database is not configured");
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!response.ok) throw new SupabaseApiError(response.status);
  return response.json() as Promise<T>;
}

export async function updateReservation(id: string, patch: Record<string, unknown>, onlyPending = false) {
  const { supabaseUrl, serviceKey } = getBookingEnv();
  if (!supabaseUrl || !serviceKey) throw new Error("Booking database is not configured");
  const query = new URLSearchParams({ id: `eq.${id}` });
  if (onlyPending) query.set("status", "eq.pending");
  const response = await fetch(`${supabaseUrl}/rest/v1/${reservationTable}?${query}`, {
    method: "PATCH",
    headers: {
      apikey: serviceKey,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(patch),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Could not update booking");
}

export function expandDateRange(start: string, end: string) {
  const dates: string[] = [];
  const cursor = new Date(`${start}T12:00:00Z`);
  const last = new Date(`${end}T12:00:00Z`);
  while (cursor < last) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return dates;
}

export function getNightCounts(checkIn: string, checkOut: string) {
  const cursor = new Date(`${checkIn}T12:00:00Z`);
  const last = new Date(`${checkOut}T12:00:00Z`);
  let regular = 0;
  let december = 0;
  while (cursor < last) {
    if (cursor.getUTCMonth() + 1 === 12) december += 1;
    else regular += 1;
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return { regular, december };
}

export function getAirbnbBusyDates(ics: string) {
  const dates = new Set<string>();
  const unfolded = ics.replace(/\r?\n[ \t]/g, "");
  const events = unfolded.split("BEGIN:VEVENT").slice(1);
  for (const event of events) {
    if (/\nSTATUS:CANCELLED(?:\r?\n|$)/i.test(event)) continue;
    const startLine = event.match(/(?:^|\r?\n)DTSTART[^:]*:([\dT]+)/i)?.[1];
    const endLine = event.match(/(?:^|\r?\n)DTEND[^:]*:([\dT]+)/i)?.[1];
    const start = startLine?.match(/^(\d{4})(\d{2})(\d{2})/);
    const end = endLine?.match(/^(\d{4})(\d{2})(\d{2})/);
    if (!start || !end) continue;
    const first = `${start[1]}-${start[2]}-${start[3]}`;
    const last = `${end[1]}-${end[2]}-${end[3]}`;
    for (const date of expandDateRange(first, last)) dates.add(date);
  }
  return [...dates].sort();
}

export async function getSiteBusyDates(from: string, to: string) {
  const dates = await supabaseRpc<string[]>("list_booking_busy_dates", { p_from: from, p_to: to });
  return Array.isArray(dates) ? dates : [];
}

