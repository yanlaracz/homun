import { NextResponse } from "next/server";
import { getBookingEnv, getNightCounts } from "@/lib/booking-server";
import { getAirbnbBusyDatesFromFeed, getTodayIso, validIsoDate } from "@/lib/booking-validation";
import { propertyConfig } from "@/config/property";
export const dynamic = "force-dynamic";
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://homun-six.vercel.app";
function priceInCentavos(checkIn: string, checkOut: string) {
  const counts = getNightCounts(checkIn, checkOut);
  return propertyConfig.pricing.temporaryCheckoutTotalMxn * 100;
}
export async function POST(request: Request) {
  const { supabaseUrl, serviceKey, stripeKey } = getBookingEnv();
  if (!supabaseUrl || !serviceKey || !stripeKey || !(stripeKey.startsWith("sk_live_") || stripeKey.startsWith("rk_live_")) || !process.env.STRIPE_WEBHOOK_SECRET || !process.env.AIRBNB_ICAL_URL) {
    return NextResponse.json({ error: "El pago aún no está configurado. Contáctanos antes de reservar." }, { status: 503 });
  }
  let body: { checkIn?: unknown; checkOut?: unknown; guests?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 }); }
  const { checkIn, checkOut, guests } = body;
  if (!validIsoDate(checkIn) || !validIsoDate(checkOut) || checkOut <= checkIn || checkIn < getTodayIso() || typeof guests !== "number" || !Number.isInteger(guests) || guests < 1 || guests > 6) {
    return NextResponse.json({ error: "Revisa las fechas y el número de huéspedes." }, { status: 400 });
  }
  const length = (Date.parse(`${checkOut}T12:00:00Z`) - Date.parse(`${checkIn}T12:00:00Z`)) / 86400000;
  if (length > 30) return NextResponse.json({ error: "La estancia no puede superar 30 noches. Escríbenos para estancias más largas." }, { status: 400 });
  let busyDates: string[];
  try { busyDates = (await getAirbnbBusyDatesFromFeed()).dates; }
  catch { return NextResponse.json({ error: "No pudimos actualizar el calendario de Airbnb. Intenta más tarde o contáctanos." }, { status: 503 }); }
  const stayNights = getNightCounts(checkIn, checkOut);
  if (stayNights.regular + stayNights.december === 0) return NextResponse.json({ error: "Selecciona al menos una noche." }, { status: 400 });
  const cursor = new Date(`${checkIn}T12:00:00Z`);
  const end = new Date(`${checkOut}T12:00:00Z`);
  while (cursor < end) {
    if (busyDates.includes(cursor.toISOString().slice(0, 10))) return NextResponse.json({ error: "Una o más noches aparecen ocupadas en Airbnb. Elige otras fechas." }, { status: 409 });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  const rpc = await fetch(`${supabaseUrl.replace(/\/$/, "")}/rest/v1/rpc/create_booking_hold`, {
    method: "POST", headers: { apikey: serviceKey, "Content-Type": "application/json" },
    body: JSON.stringify({ p_check_in: checkIn, p_check_out: checkOut, p_guests: guests }), cache: "no-store",
  });
  if (!rpc.ok) return NextResponse.json({ error: "No pudimos reservar temporalmente esas fechas. Intenta de nuevo." }, { status: 503 });
  const reservationId = await rpc.json() as string | null;
  if (!reservationId) return NextResponse.json({ error: "Alguien acaba de tomar esas fechas. Elige otras fechas disponibles." }, { status: 409 });
  const params = new URLSearchParams();
  params.set("mode", "payment"); params.set("success_url", `${baseUrl}/reserva/confirmacion?session_id={CHECKOUT_SESSION_ID}`);
  params.set("cancel_url", `${baseUrl}/#consulta?reserva=cancelada`); params.set("expires_at", String(Math.floor(Date.now() / 1000) + 3600));
  params.set("locale", "es");
  params.set("line_items[0][quantity]", "1"); params.set("line_items[0][price_data][currency]", "mxn");
  params.set("line_items[0][price_data][unit_amount]", String(priceInCentavos(checkIn, checkOut)));
  params.set("line_items[0][price_data][product_data][name]", `PRUEBA TEMPORAL · Homun · ${length} noches`);
  params.set("line_items[0][price_data][product_data][description]", `Pago real temporal de prueba: $1 MXN total. Entrada ${checkIn} · salida ${checkOut} · ${guests} huésped(es). No representa la tarifa real de hospedaje.`);
  params.set("metadata[reservation_id]", reservationId); params.set("metadata[check_in]", checkIn);
  params.set("metadata[check_out]", checkOut); params.set("metadata[guests]", String(guests));
  const sessionResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST", headers: { Authorization: "Bearer " + stripeKey, "Content-Type": "application/x-www-form-urlencoded" }, body: params,
  });
  const session = await sessionResponse.json() as { id?: string; url?: string; error?: { type?: string; code?: string; param?: string; message?: string; request_log_url?: string } };
  if (!sessionResponse.ok || !session.id || !session.url) {
    const stripeErrorType = typeof session.error?.type === "string" && /^[a-z_]{1,48}$/.test(session.error.type) ? session.error.type : undefined;
    const stripeErrorCode = typeof session.error?.code === "string" && /^[a-z0-9_]{1,64}$/.test(session.error.code) ? session.error.code : undefined;
    const stripeErrorParam = typeof session.error?.param === "string" && /^[a-zA-Z0-9_.\[\]-]{1,100}$/.test(session.error.param) ? session.error.param : undefined;
    const stripeErrorMessage = typeof session.error?.message === "string"
      ? session.error.message.replace(/(?:sk|rk|whsec|sb_secret)_[A-Za-z0-9_-]+/g, "[oculto]").slice(0, 300)
      : undefined;
    console.error("[booking.checkout] Stripe Checkout Session creation failed", {
      status: sessionResponse.status,
      type: stripeErrorType,
      code: stripeErrorCode,
    });
    await fetch(`${supabaseUrl.replace(/\/$/, "")}/rest/v1/booking_reservations?id=eq.${reservationId}`, {
      method: "PATCH", headers: { apikey: serviceKey, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({ status: "cancelled", expires_at: null }),
    });
    return NextResponse.json({ error: "Stripe no pudo iniciar el pago.", stripeErrorType, stripeErrorCode, stripeErrorParam, stripeErrorMessage }, { status: 502 });
  }
  const update = await fetch(`${supabaseUrl.replace(/\/$/, "")}/rest/v1/booking_reservations?id=eq.${reservationId}`, {
    method: "PATCH", headers: { apikey: serviceKey, "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify({ stripe_session_id: session.id }),
  });
  if (!update.ok) return NextResponse.json({ error: "No pudimos completar la reservación. Contáctanos antes de volver a pagar." }, { status: 502 });
  return NextResponse.json({ url: session.url });
}




