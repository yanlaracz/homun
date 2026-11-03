"use client";

import { useEffect, useMemo, useState } from "react";
import { propertyConfig } from "@/config/property";

type DateRange = { checkIn: string; checkOut: string };

function formatDate(value: string, english: boolean) {
  if (!value) return "—";
  return new Date(`${value}T12:00:00`).toLocaleDateString(english ? "en-US" : "es-MX", { day: "numeric", month: "short", year: "numeric" });
}

function estimateStay(range: DateRange | null) {
  if (!range?.checkIn || !range.checkOut) return null;
  const { standardNightlyRate, decemberNightlyRate, decemberMonth } = propertyConfig.pricing;
  const cursor = new Date(`${range.checkIn}T12:00:00Z`);
  const last = new Date(`${range.checkOut}T12:00:00Z`);
  let nights = 0;
  let total = 0;
  const decemberNights = [] as string[];
  while (cursor < last) {
    const iso = cursor.toISOString().slice(0, 10);
    const isDecember = cursor.getUTCMonth() + 1 === decemberMonth;
    total += isDecember ? decemberNightlyRate : standardNightlyRate;
    if (isDecember) decemberNights.push(iso);
    nights += 1;
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return { nights, total, decemberNights: decemberNights.length, regularNights: nights - decemberNights.length };
}

export function BookingForm({ selectedRange }: { selectedRange: DateRange | null }) {
  const [english, setEnglish] = useState(false);
  const [guests, setGuests] = useState("2");
  useEffect(() => {
    const listener = (event: Event) => setEnglish((event as CustomEvent<string>).detail === "en");
    document.addEventListener("homun-language", listener);
    return () => document.removeEventListener("homun-language", listener);
  }, []);

  const estimate = useMemo(() => estimateStay(selectedRange), [selectedRange]);
  const { standardNightlyRate, decemberNightlyRate } = propertyConfig.pricing;
  const policy = propertyConfig.booking.cancellationPolicy;
  const whatsappText = english
    ? `Hello, I have a question before booking at ${propertyConfig.brand.fullName}. Dates: ${selectedRange ? `${selectedRange.checkIn} to ${selectedRange.checkOut || "not selected"}` : "not selected"}. Guests: ${guests}.`
    : `Hola, tengo una duda antes de reservar en ${propertyConfig.brand.fullName}. Fechas: ${selectedRange ? `${selectedRange.checkIn} al ${selectedRange.checkOut || "sin seleccionar"}` : "sin seleccionar"}. Huéspedes: ${guests}.`;

  return <div className="booking-card">
    <div className="booking-summary">
      <h3>{english ? "Your stay" : "Tu estancia"}</h3>
      <div className="booking-dates"><span><small>{english ? "Check-in" : "Entrada"}</small><strong>{formatDate(selectedRange?.checkIn ?? "", english)}</strong></span><span aria-hidden="true">→</span><span><small>{english ? "Check-out" : "Salida"}</small><strong>{formatDate(selectedRange?.checkOut ?? "", english)}</strong></span></div>
      <label className="guest-select" htmlFor="booking-guests">{english ? "Guests" : "Huéspedes"}<select id="booking-guests" value={guests} onChange={(event) => setGuests(event.target.value)}>{Array.from({ length: propertyConfig.property.maxGuests }, (_, index) => index + 1).map((number) => <option key={number} value={number}>{number}</option>)}</select></label>
      {estimate ? <div className="price-estimate"><div><span>{estimate.regularNights} {english ? "nights" : "noches"} × ${standardNightlyRate.toLocaleString("es-MX")}</span><strong>${(estimate.regularNights * standardNightlyRate).toLocaleString("es-MX")} MXN</strong></div>{estimate.decemberNights > 0 && <div><span>{estimate.decemberNights} {english ? "December nights" : "noches de diciembre"} × ${decemberNightlyRate.toLocaleString("es-MX")}</span><strong>${(estimate.decemberNights * decemberNightlyRate).toLocaleString("es-MX")} MXN</strong></div>}<div className="price-total"><span>{english ? `Total · ${estimate.nights} nights` : `Total · ${estimate.nights} noches`}</span><strong>${estimate.total.toLocaleString("es-MX")} MXN</strong></div></div> : <p className="price-placeholder">{english ? "Choose check-in and check-out in the calendar to see your estimated total." : "Selecciona entrada y salida en el calendario para ver el total estimado."}</p>}
      <div className="booking-policy"><p><strong>{english ? "Full stay payment" : "Pago completo de la estancia"}</strong> {english ? "is due at booking. A separate security deposit is paid in cash or by transfer and returned after check-out if there are no issues." : "al reservar. El depósito de seguridad se paga aparte en efectivo o transferencia y se devuelve al finalizar si no hay inconvenientes."}</p><p>{english ? `Cancellation: full refund ${policy.fullRefundBeforeDays}+ days before arrival; ${policy.halfRefundPercent}% refund ${policy.halfRefundBeforeDays}–${policy.fullRefundBeforeDays - 1} days before; no refund within ${policy.halfRefundBeforeDays} days.` : `Cancelación: reembolso completo con ${policy.fullRefundBeforeDays} días o más de anticipación; ${policy.halfRefundPercent}% entre ${policy.halfRefundBeforeDays} y ${policy.fullRefundBeforeDays - 1} días; sin reembolso dentro de los últimos ${policy.halfRefundBeforeDays} días.`}</p></div>
      <button className="button booking-pay" type="button" disabled>{english ? "Online payment coming soon" : "Pago en línea próximamente"}</button>
      <p className="payment-note">{english ? "We’re setting up secure online payments. No reservation or charge is made yet." : "Estamos preparando el pago seguro en línea. Por ahora no se confirma ni se cobra ninguna reserva."}</p>
      <a className="button button-outline contact-before-booking" href={`https://wa.me/${propertyConfig.booking.whatsappNumber}?text=${encodeURIComponent(whatsappText)}`} target="_blank" rel="noreferrer">{english ? "Questions before booking? Talk to us" : "¿Dudas antes de reservar? Habla con nosotros"} <span aria-hidden="true">↗</span></a>
    </div>
  </div>;
}
