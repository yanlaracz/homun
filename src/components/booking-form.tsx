"use client";
import { useEffect, useMemo, useState } from "react";
import { propertyConfig } from "@/config/property";
type DateRange = { checkIn: string; checkOut: string };
function formatDate(value: string, english: boolean) {
  if (!value) return "—";
  return new Date(value + "T12:00:00").toLocaleDateString(english ? "en-US" : "es-MX", { day: "numeric", month: "short", year: "numeric" });
}
function estimateStay(range: DateRange | null) {
  if (!range || !range.checkIn || !range.checkOut) return null;
  const cursor = new Date(range.checkIn + "T12:00:00Z"), last = new Date(range.checkOut + "T12:00:00Z");
  let nights = 0, total = 0, decemberNights = 0;
  while (cursor < last) {
    const isDecember = cursor.getUTCMonth() + 1 === 12;
    total += isDecember ? propertyConfig.pricing.decemberNightlyRate : propertyConfig.pricing.standardNightlyRate;
    if (isDecember) decemberNights++;
    nights++; cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return { nights, total, decemberNights, regularNights: nights - decemberNights };
}
export function BookingForm({ selectedRange }: { selectedRange: DateRange | null }) {
  const [english, setEnglish] = useState(false), [guests, setGuests] = useState("2");
  const [paymentReady, setPaymentReady] = useState(false), [testMode, setTestMode] = useState(false), [loading, setLoading] = useState(false), [error, setError] = useState("");
  useEffect(() => {
    const listener = (event: Event) => setEnglish((event as CustomEvent<string>).detail === "en");
    document.addEventListener("homun-language", listener);
    fetch("/api/booking/config", { cache: "no-store" }).then((response) => response.json()).then((data) => { setPaymentReady(data.enabled === true); setTestMode(data.testMode === true); }).catch(() => {});
    return () => document.removeEventListener("homun-language", listener);
  }, []);
  useEffect(() => { setError(""); }, [selectedRange]);
  const estimate = useMemo(() => estimateStay(selectedRange), [selectedRange]);
  const whatsappText = (english ? "Hello, I have a question before booking at " : "Hola, tengo una duda antes de reservar en ") + propertyConfig.brand.fullName + ". " + (english ? "Dates: " : "Fechas: ") + (selectedRange ? selectedRange.checkIn + " al " + (selectedRange.checkOut || "sin seleccionar") : "sin seleccionar") + ". " + (english ? "Guests: " : "Huéspedes: ") + guests + ".";
  async function startCheckout() {
    if (!selectedRange || !paymentReady || loading) return;
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/booking/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ checkIn: selectedRange.checkIn, checkOut: selectedRange.checkOut, guests: Number(guests) }) });
      const result = await response.json();
      if (!response.ok || !result.url) {
        const diagnostic = [result.stripeErrorType, result.stripeErrorCode, result.stripeErrorParam].filter((value: unknown) => typeof value === "string").join(" / ");
        const detail = typeof result.stripeErrorMessage === "string" ? ` ${result.stripeErrorMessage}` : "";
        throw new Error((result.error || (english ? "Could not start payment." : "No se pudo iniciar el pago.")) + (diagnostic ? ` (${diagnostic})` : "") + detail);
      }
      window.location.assign(result.url);
    } catch (issue) { setError(issue instanceof Error ? issue.message : "No se pudo iniciar el pago."); setLoading(false); }
  }
  const policy = propertyConfig.booking.cancellationPolicy;
  return <div className="booking-card"><div className="booking-summary">
    <h3>{english ? "Your stay" : "Tu estancia"}</h3>
    <div className="booking-dates"><span><small>{english ? "Check-in" : "Entrada"}</small><strong>{formatDate(selectedRange ? selectedRange.checkIn : "", english)}</strong></span><span aria-hidden="true">→</span><span><small>{english ? "Check-out" : "Salida"}</small><strong>{formatDate(selectedRange ? selectedRange.checkOut : "", english)}</strong></span></div>
    <label className="guest-select" htmlFor="booking-guests">{english ? "Guests" : "Huéspedes"}<select id="booking-guests" value={guests} onChange={(event) => setGuests(event.target.value)}>{Array.from({ length: propertyConfig.property.maxGuests }, (_, index) => index + 1).map((number) => <option key={number} value={number}>{number}</option>)}</select></label>
    {estimate ? <div className="price-estimate"><div><span>{estimate.regularNights} {english ? "nights" : "noches"} × $900</span><strong>${(estimate.regularNights * 900).toLocaleString("es-MX")} MXN</strong></div>{estimate.decemberNights > 0 && <div><span>{estimate.decemberNights} {english ? "December nights" : "noches de diciembre"} × $1,000</span><strong>${(estimate.decemberNights * 1000).toLocaleString("es-MX")} MXN</strong></div>}<div className="price-total"><span>{english ? "Total · " + estimate.nights + " nights" : "Total · " + estimate.nights + " noches"}</span><strong>${estimate.total.toLocaleString("es-MX")} MXN</strong></div></div> : <p className="price-placeholder">{english ? "Choose check-in and check-out in the calendar to see your estimated total." : "Selecciona entrada y salida en el calendario para ver el total estimado."}</p>}
    <div className="booking-policy"><p><strong>{english ? "Full stay payment" : "Pago completo de la estancia"}</strong> {english ? "is due at booking. A separate security deposit is paid in cash or by transfer and returned after check-out if there are no issues." : "al reservar. El depósito de seguridad se paga aparte en efectivo o transferencia y se devuelve al finalizar si no hay inconvenientes."}</p><p>{english ? "Cancellation: full refund " + policy.fullRefundBeforeDays + "+ days before arrival; " + policy.halfRefundPercent + "% refund " + policy.halfRefundBeforeDays + "–" + (policy.fullRefundBeforeDays - 1) + " days before; no refund within " + policy.halfRefundBeforeDays + " days." : "Cancelación: reembolso completo con " + policy.fullRefundBeforeDays + " días o más de anticipación; " + policy.halfRefundPercent + "% entre " + policy.halfRefundBeforeDays + " y " + (policy.fullRefundBeforeDays - 1) + " días; sin reembolso dentro de los últimos " + policy.halfRefundBeforeDays + " días."}</p></div>
    <button className="button booking-pay" type="button" onClick={startCheckout} disabled={!paymentReady || !selectedRange || !selectedRange.checkIn || !selectedRange.checkOut || loading}>{loading ? (english ? "Opening secure payment…" : "Abriendo pago seguro…") : english ? "Book and pay securely" : "Reservar y pagar seguro"}</button>
    {error && <p className="payment-note status-error" role="alert">{error}</p>}
    {testMode ? <p className="payment-note">{english ? "Payments are in test mode. Real payments are not enabled." : "Stripe sigue en modo de prueba. Los pagos reales todavía no están habilitados."}</p> : !paymentReady && <p className="payment-note">{english ? "Online booking is being configured. No payment or reservation will be taken yet." : "La reservación en línea se está configurando. Por ahora no se cobra ni confirma ninguna reserva."}</p>}
    <a className="button button-outline contact-before-booking" href={"https://wa.me/" + propertyConfig.booking.whatsappNumber + "?text=" + encodeURIComponent(whatsappText)} target="_blank" rel="noreferrer">{english ? "Questions before booking? Talk to us" : "¿Dudas antes de reservar? Habla con nosotros"} <span aria-hidden="true">↗</span></a>
  </div></div>;
}
