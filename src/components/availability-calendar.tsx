"use client";

import { useEffect, useMemo, useState } from "react";

type CalendarState = { configured: boolean; busyDates: string[]; error?: boolean };
const weekdays = ["L", "M", "M", "J", "V", "S", "D"];

type DateRange = { checkIn: string; checkOut: string };

export function AvailabilityCalendar({ onSelectRange }: { onSelectRange: (range: DateRange | null) => void }) {
  const [month, setMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [calendar, setCalendar] = useState<CalendarState | null>(null);
  const [english, setEnglish] = useState(false);
  const [selected, setSelected] = useState<DateRange | null>(null);
  const [choosing, setChoosing] = useState("");

  useEffect(() => {
    const listener = (event: Event) => setEnglish((event as CustomEvent<string>).detail === "en");
    document.addEventListener("homun-language", listener);
    fetch("/api/availability", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        setCalendar(response.ok ? data : { configured: true, busyDates: [], error: true });
      })
      .catch(() => setCalendar({ configured: true, busyDates: [], error: true }));
    return () => document.removeEventListener("homun-language", listener);
  }, []);

  const days = useMemo(() => {
    const offset = (month.getDay() + 6) % 7;
    const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    return [...Array(offset).fill(null), ...Array.from({ length: count }, (_, index) => index + 1)];
  }, [month]);
  const busyDates = new Set(calendar?.busyDates ?? []);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const label = month.toLocaleDateString(english ? "en-US" : "es-MX", { month: "long", year: "numeric" });

  function changeMonth(delta: number) {
    setMonth((value) => new Date(value.getFullYear(), value.getMonth() + delta, 1));
  }

  function selectDate(iso: string) {
    if (!selected || selected.checkOut || iso <= selected.checkIn) {
      const next = { checkIn: iso, checkOut: "" };
      setSelected(next);
      onSelectRange(null);
      setChoosing(english ? "Choose your check-out date." : "Ahora elige tu fecha de salida.");
      return;
    }

    const cursor = new Date(`${selected.checkIn}T12:00:00Z`);
    const last = new Date(`${iso}T12:00:00Z`);
    while (cursor < last) {
      if (busyDates.has(cursor.toISOString().slice(0, 10))) {
        setChoosing(english ? "Those dates include unavailable nights. Choose another check-in date." : "Ese rango incluye noches ocupadas. Elige otra fecha de entrada.");
        setSelected(null);
        onSelectRange(null);
        return;
      }
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    const next = { checkIn: selected.checkIn, checkOut: iso };
    setSelected(next);
    onSelectRange(next);
    setChoosing(english ? "Dates selected. Review the estimated total below." : "Fechas seleccionadas. Revisa el total estimado abajo.");
  }

  return <div className="availability-card" aria-label={english ? "Availability calendar" : "Calendario de disponibilidad"}>
    <div className="availability-heading">
      <div><h3>{english ? "Choose your dates" : "Elige tus fechas"}</h3><p>{english ? "Select check-in, then check-out." : "Toca la entrada y después la salida."}</p></div>
      <div className="calendar-controls"><button type="button" onClick={() => changeMonth(-1)} aria-label={english ? "Previous month" : "Mes anterior"}>‹</button><button type="button" onClick={() => changeMonth(1)} aria-label={english ? "Next month" : "Mes siguiente"}>›</button></div>
    </div>
    <div className="calendar-month">{label}</div>
    <div className="calendar-grid" role="grid">
      {weekdays.map((day, index) => <span className="calendar-weekday" key={`${day}-${index}`}>{english ? ["M", "T", "W", "T", "F", "S", "S"][index] : day}</span>)}
      {days.map((day, index) => {
        if (!day) return <span className="calendar-day empty" key={`empty-${index}`} />;
        const date = new Date(month.getFullYear(), month.getMonth(), day);
        const iso = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const past = date < today;
        const busy = busyDates.has(iso);
        const inRange = !!selected && iso >= selected.checkIn && !!selected.checkOut && iso <= selected.checkOut;
        const isEdge = !!selected && (iso === selected.checkIn || iso === selected.checkOut);
        const className = ["calendar-day", past ? "past" : "", busy ? "busy" : "", inRange ? "in-range" : "", isEdge ? "selected" : ""].filter(Boolean).join(" ");
        return <button className={className} key={iso} type="button" disabled={past || busy} onClick={() => selectDate(iso)} aria-label={`${iso}${busy ? (english ? ", unavailable" : ", no disponible") : ""}`} aria-pressed={isEdge}>{day}</button>;
      })}
    </div>
    <div className="calendar-legend"><span><i className="legend-dot busy-dot" />{english ? "Unavailable" : "No disponible"}</span><span><i className="legend-dot" />{english ? "Available to select" : "Disponible para elegir"}</span></div>
    {choosing && <p className="calendar-selection" role="status">{choosing}</p>}
    <p className={`calendar-status ${calendar?.error ? "status-error" : ""}`} role="status">
      {!calendar ? (english ? "Loading calendar…" : "Cargando calendario…") : calendar.error ? (english ? "Could not update Airbnb dates. Contact us before paying." : "No se pudieron actualizar las fechas de Airbnb. Contáctanos antes de pagar.") : calendar.configured ? (english ? "Airbnb dates appear here via iCal. This site does not send its bookings back to Airbnb, so the calendars must be managed separately." : "Aquí aparecen las fechas de Airbnb por iCal. Esta página no envía sus reservas a Airbnb; los calendarios se administran por separado.") : (english ? "Airbnb calendar is not connected. Dates shown here may not include Airbnb bookings." : "El calendario de Airbnb no está conectado. Las fechas de aquí podrían no incluir reservas de Airbnb.")}
    </p>
  </div>;
}
