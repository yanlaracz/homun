"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
type Status = { checkIn: string; checkOut: string; guests: number; status: string };
export default function ConfirmationPage() {
  const [status, setStatus] = useState<Status | null>(null), [error, setError] = useState(false);
  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get("session_id");
    if (!sessionId) { setError(true); return; }
    let active = true, attempts = 0, timer: number;
    const check = async () => {
      try {
        const response = await fetch("/api/booking/status?session_id=" + encodeURIComponent(sessionId), { cache: "no-store" });
        if (!response.ok) throw new Error();
        const data = await response.json() as Status;
        if (!active) return;
        setStatus(data);
        if (data.status === "pending" && attempts++ < 9) timer = window.setTimeout(check, 3000);
      } catch { if (active) setError(true); }
    };
    void check(); return () => { active = false; window.clearTimeout(timer); };
  }, []);
  const date = (value: string) => new Date(value + "T12:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });
  return <main className="section"><div className="container"><div className="booking-card booking-summary">
    <span className="eyebrow">HOMUN · RESIDENCIAL IZAMAL</span>
    <h1>{status?.status === "confirmed" ? "¡Pago recibido!" : "Verificando tu pago"}</h1>
    {status?.status === "confirmed" ? <p>Tu estancia del {date(status.checkIn)} al {date(status.checkOut)} para {status.guests} huésped(es) quedó confirmada. Contáctanos por WhatsApp para coordinar tu llegada.</p> : status?.status === "cancelled" ? <p>El pago no se completó y las fechas se liberaron. Puedes volver al calendario y elegir otras fechas.</p> : error ? <p>No pudimos confirmar el estado todavía. Si se realizó el cobro, contáctanos por WhatsApp para revisar tu reserva.</p> : <p>Stripe está notificando el resultado. Esta página se actualizará automáticamente en unos segundos.</p>}
    <Link className="button" href="/#consulta">Volver al calendario</Link>
  </div></div></main>;
}
