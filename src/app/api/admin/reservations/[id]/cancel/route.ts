import { NextResponse } from "next/server";
import { adminCookieName, isAdminSessionValid } from "@/lib/admin-auth";
import { getBookingEnv } from "@/lib/booking-server";

export const dynamic = "force-dynamic";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const token = request.headers.get("cookie")?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${adminCookieName}=`))?.slice(adminCookieName.length + 1);
  if (!isAdminSessionValid(token)) return NextResponse.json({ error: "Inicia sesión para cancelar una reserva." }, { status: 401 });
  const { id } = await context.params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return NextResponse.json({ error: "Reserva no válida." }, { status: 400 });
  const { supabaseUrl, serviceKey } = getBookingEnv();
  if (!supabaseUrl || !serviceKey) return NextResponse.json({ error: "La conexión con la base de reservas no está configurada." }, { status: 503 });
  const query = new URLSearchParams({ id: `eq.${id}`, status: "eq.confirmed", select: "id,check_in,check_out,guests,status,created_at,customer_email" });
  const result = await fetch(`${supabaseUrl}/rest/v1/booking_reservations?${query}`, {
    method: "PATCH",
    headers: { apikey: serviceKey, "Content-Type": "application/json", Prefer: "return=representation" },
    body: JSON.stringify({ status: "cancelled", expires_at: null }),
    cache: "no-store",
  });
  if (!result.ok) return NextResponse.json({ error: "No se pudo cancelar la reserva. Actualiza la lista e inténtalo de nuevo." }, { status: 503 });
  const rows = await result.json() as Array<{ id: string }>;
  if (!rows.length) return NextResponse.json({ error: "No encontramos una reserva confirmada con ese registro. Actualiza la lista." }, { status: 409 });
  return NextResponse.json({ ok: true });
}
