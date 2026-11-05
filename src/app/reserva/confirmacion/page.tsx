"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { propertyConfig } from "@/config/property";

type Status = { checkIn: string; checkOut: string; guests: number; status: string };

function formatDate(value: string) {
  return new Date(value + "T12:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });
}

function countNights(checkIn: string, checkOut: string) {
  return Math.max(0, (Date.parse(`${checkOut}T12:00:00Z`) - Date.parse(`${checkIn}T12:00:00Z`)) / 86400000);
}

export default function ConfirmationPage() {
  const [status, setStatus] = useState<Status | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get("session_id");
    if (!sessionId) { setError(true); setLoading(false); return; }
    let active = true, attempts = 0, timer: number;
    const check = async () => {
      try {
        const response = await fetch("/api/booking/status?session_id=" + encodeURIComponent(sessionId), { cache: "no-store" });
        if (!response.ok) throw new Error();
        const data = await response.json() as Status;
        if (!active) return;
        setStatus(data);
        setError(false);
        if (data.status === "pending" && attempts++ < 14) timer = window.setTimeout(check, 2000);
        else setLoading(false);
      } catch {
        if (!active) return;
        setError(true);
        if (attempts++ < 14) timer = window.setTimeout(check, 2000);
        else setLoading(false);
      }
    };
    setLoading(true);
    void check();
    return () => { active = false; window.clearTimeout(timer); };
  }, [retry]);

  const confirmed = status?.status === "confirmed";
  const cancelled = status?.status === "cancelled";
  const nightCount = useMemo(() => status ? countNights(status.checkIn, status.checkOut) : 0, [status]);
  const whatsappText = confirmed && status
    ? `Hola, acabo de completar el pago de mi reservación en Homun. Fechas: ${status.checkIn} al ${status.checkOut}; ${status.guests} huésped(es). ¿Me ayudan a coordinar mi llegada?`
    : "Hola, acabo de realizar un pago para reservar en Homun y quisiera confirmar los detalles de mi estancia.";
  const whatsappUrl = `https://wa.me/${propertyConfig.booking.whatsappNumber}?text=${encodeURIComponent(whatsappText)}`;

  return <main className="section confirmation-section"><div className="container confirmation-container">
    <article className={`confirmation-card${confirmed ? " is-confirmed" : cancelled ? " is-cancelled" : ""}`}>
      <div className={`confirmation-icon${confirmed ? " is-confirmed" : cancelled ? " is-cancelled" : ""}`} aria-hidden="true">{confirmed ? "✓" : cancelled ? "×" : "·"}</div>
      <p className="eyebrow">HOMUN · RESIDENCIAL IZAMAL</p>
      <p className={`confirmation-status${confirmed ? " is-confirmed" : cancelled ? " is-cancelled" : ""}`}>{confirmed ? "PAGO RECIBIDO · RESERVA CONFIRMADA" : cancelled ? "PAGO NO COMPLETADO" : loading ? "VERIFICANDO CON STRIPE" : error ? "NECESITAMOS REVISAR TU PAGO" : "PAGO EN PROCESO"}</p>
      <h1>{confirmed ? "¡Gracias por reservar con nosotros!" : cancelled ? "No se completó la reserva" : loading ? "Estamos confirmando tu pago" : error ? "No pudimos confirmar el estado" : "Tu pago sigue en proceso"}</h1>
      <p className="confirmation-lead">{confirmed
        ? "Tu pago quedó registrado y las fechas de tu estancia están confirmadas. Escríbenos para coordinar la llegada y compartirte las instrucciones de acceso."
        : cancelled
          ? "No se completó el pago y las fechas se liberaron. Puedes regresar al calendario para elegir otras fechas."
          : loading
            ? "Stripe nos está enviando la confirmación. No vuelvas a pagar; esta página se actualizará automáticamente."
            : "Si Stripe ya realizó el cobro, contáctanos y revisaremos tu reservación contigo. No intentes pagar otra vez mientras verificamos."}</p>

      {status && <div className="confirmation-details" aria-label="Detalles de la reservación">
        <div><span>Entrada</span><strong>{formatDate(status.checkIn)}</strong></div>
        <div><span>Salida</span><strong>{formatDate(status.checkOut)}</strong></div>
        <div><span>Duración</span><strong>{nightCount} {nightCount === 1 ? "noche" : "noches"}</strong></div>
        <div><span>Huéspedes</span><strong>{status.guests}</strong></div>
      </div>}

      {confirmed && <div className="confirmation-next"><strong>¿Qué sigue?</strong><p>Ponte en contacto con nosotros para coordinar tu llegada. El depósito de seguridad se entrega por separado y se devuelve al finalizar la estancia si no hay inconvenientes.</p></div>}
      {!confirmed && !cancelled && !loading && <div className="confirmation-next"><strong>Estamos para ayudarte</strong><p>Escríbenos por WhatsApp con la misma información que usaste al reservar; revisaremos el estado del pago antes de que vuelvas a intentarlo.</p></div>}

      <div className="confirmation-actions">
        {(confirmed || (!cancelled && !loading)) && <a className="button confirmation-contact" href={whatsappUrl} target="_blank" rel="noreferrer">Contactar por WhatsApp <span aria-hidden="true">↗</span></a>}
        {loading && <span className="confirmation-wait"><span className="confirmation-spinner" aria-hidden="true" /> Esperando confirmación segura…</span>}
        {cancelled && <Link className="button confirmation-contact" href="/#consulta">Volver al calendario</Link>}
        {!loading && <Link className="button button-outline confirmation-home" href="/">Volver al alojamiento</Link>}
        {!loading && !confirmed && !cancelled && <button className="confirmation-retry" type="button" onClick={() => { setError(false); setRetry((value) => value + 1); }}>Volver a revisar el pago</button>}
      </div>
      <p className="confirmation-phone">WhatsApp · {propertyConfig.booking.whatsappDisplayNumber}</p>
    </article>
  </div></main>;
}
