import { NextResponse } from "next/server";
import { adminCookieName, adminSessionSeconds, createAdminSession, getAdminPassword, passwordMatches } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const attempts = new Map<string, { count: number; resetAt: number }>();

export async function POST(request: Request) {
  if (!getAdminPassword()) return NextResponse.json({ error: "El acceso privado aún no está configurado en Vercel." }, { status: 503 });
  const address = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  const record = attempts.get(address);
  if (record && record.resetAt > now && record.count >= 8) return NextResponse.json({ error: "Demasiados intentos. Espera 15 minutos y vuelve a intentar." }, { status: 429 });
  if (!record || record.resetAt <= now) attempts.set(address, { count: 0, resetAt: now + 15 * 60 * 1000 });
  let body: { password?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 }); }
  if (typeof body.password !== "string" || body.password.length > 256 || !passwordMatches(body.password)) {
    const current = attempts.get(address)!;
    current.count += 1;
    return NextResponse.json({ error: "La contraseña no coincide." }, { status: 401 });
  }
  attempts.delete(address);
  const token = createAdminSession();
  if (!token) return NextResponse.json({ error: "El acceso privado no está configurado." }, { status: 503 });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(adminCookieName, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: adminSessionSeconds });
  return response;
}
