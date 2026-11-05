import { NextResponse } from "next/server";
import { adminCookieName, getAdminPassword, isAdminSessionValid } from "@/lib/admin-auth";
import { getBookingEnv } from "@/lib/booking-server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!getAdminPassword()) return NextResponse.json({ error: "El acceso privado aún no está configurado en Vercel." }, { status: 503 });
  if (!isAdminSessionValid(request.headers.get("cookie")?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${adminCookieName}=`))?.slice(adminCookieName.length + 1))) {
    return NextResponse.json({ error: "Inicia sesión para ver las reservas." }, { status: 401 });
  }
  const { supabaseUrl, serviceKey } = getBookingEnv();
  if (!supabaseUrl || !serviceKey) return NextResponse.json({ error: "La conexión con la base de reservas no está configurada." }, { status: 503 });
  const query = new URLSearchParams({
    select: "id,check_in,check_out,guests,status,created_at,customer_email,expires_at",
    order: "created_at.desc",
    limit: "100",
  });
  const result = await fetch(`${supabaseUrl}/rest/v1/booking_reservations?${query}`, { headers: { apikey: serviceKey }, cache: "no-store" });
  if (!result.ok) return NextResponse.json({ error: "No pudimos cargar las reservas. Intenta actualizar." }, { status: 503 });
  const reservations = await result.json();
  return NextResponse.json({ reservations }, { headers: { "Cache-Control": "no-store" } });
}
