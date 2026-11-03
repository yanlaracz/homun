"use client";

import { useEffect, useMemo, useState } from "react";

type CalendarState = { configured: boolean; busyDates: string[]; error?: boolean };
const weekdays = ["L", "M", "M", "J", "V", "S", "D"];

export function AvailabilityCalendar() {
  const [month, setMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [calendar, setCalendar] = useState<CalendarState | null>(null);
  const [english, setEnglish] = useState(false);

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

  return <div className="availability-card" aria-label={english ? "Availability calendar" : "Calendario de disponibilidad"}>
    <div className="availability-heading">
      <div><h3>{english ? "Availability calendar" : "Calendario de disponibilidad"}</h3><p>{english ? "Check dates before sending your inquiry." : "Revisa las fechas antes de enviar tu consulta."}</p></div>
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
        const className = ["calendar-day", past ? "past" : "", busy ? "busy" : ""].filter(Boolean).join(" ");
        return <span className={className} key={iso} aria-label={`${iso}${busy ? (english ? ", unavailable" : ", no disponible") : ""}`}>{day}</span>;
      })}
    </div>
    <div className="calendar-legend"><span><i className="legend-dot busy-dot" />{english ? "Unavailable" : "No disponible"}</span><span><i className="legend-dot" />{english ? "Ask to confirm" : "Consultar disponibilidad"}</span></div>
    <p className={`calendar-status ${calendar?.error ? "status-error" : ""}`} role="status">
      {!calendar ? (english ? "Loading calendar…" : "Cargando calendario…") : calendar.error ? (english ? "Calendar could not be updated. Please confirm dates by WhatsApp." : "No se pudo actualizar el calendario. Confirma las fechas por WhatsApp.") : calendar.configured ? (english ? "Airbnb calendar connected by iCal. Updates may take up to 3 hours; confirm before booking." : "Calendario de Airbnb conectado por iCal. Puede tardar hasta 3 horas en actualizarse; confirma antes de reservar.") : (english ? "Airbnb calendar not connected yet. Dates are not confirmed until we reply." : "Aún no está conectado el calendario de Airbnb. Las fechas no se confirman hasta recibir respuesta.")}
    </p>
  </div>;
}
