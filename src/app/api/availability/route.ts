import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function unfoldIcs(text: string) {
  return text.replace(/\r?\n[ \t]/g, "");
}

function dateFromIcs(value: string) {
  const match = value.match(/^(\d{4})(\d{2})(\d{2})/);
  if (!match) return null;
  return `${match[1]}-${match[2]}-${match[3]}`;
}

function getBusyDates(ics: string) {
  const dates = new Set<string>();
  const events = unfoldIcs(ics).split("BEGIN:VEVENT").slice(1);

  for (const event of events) {
    if (/\nSTATUS:CANCELLED(?:\r?\n|$)/i.test(event)) continue;
    const startLine = event.match(/(?:^|\r?\n)DTSTART[^:]*:([^\r\n]+)/i)?.[1];
    const endLine = event.match(/(?:^|\r?\n)DTEND[^:]*:([^\r\n]+)/i)?.[1];
    const start = startLine ? dateFromIcs(startLine) : null;
    const end = endLine ? dateFromIcs(endLine) : null;
    if (!start || !end) continue;

    const cursor = new Date(`${start}T12:00:00Z`);
    const last = new Date(`${end}T12:00:00Z`);
    while (cursor < last) {
      dates.add(cursor.toISOString().slice(0, 10));
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
  }

  return [...dates].sort();
}

export async function GET() {
  const calendarUrl = process.env.AIRBNB_ICAL_URL;
  if (!calendarUrl) {
    return NextResponse.json({ configured: false, busyDates: [] }, { headers: { "Cache-Control": "no-store" } });
  }

  try {
    const response = await fetch(calendarUrl, { cache: "no-store", signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new Error(`Calendar feed returned ${response.status}`);
    const ics = await response.text();
    if (!ics.includes("BEGIN:VCALENDAR")) throw new Error("Invalid calendar feed");

    return NextResponse.json(
      { configured: true, busyDates: getBusyDates(ics) },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json({ configured: true, error: true, busyDates: [] }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
