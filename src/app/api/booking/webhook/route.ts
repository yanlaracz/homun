import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { updateReservation } from "@/lib/booking-server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
function validSignature(rawBody: string, header: string, secret: string) {
  const parts = header.split(",").map((part) => part.split("="));
  const timestamp = parts.find(([key]) => key === "t")?.[1];
  const signatures = parts.filter(([key]) => key === "v1").map(([, value]) => value);
  if (!timestamp || Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;
  const expected = createHmac("sha256", secret).update(`${timestamp}.${rawBody}`).digest("hex");
  return signatures.some((signature) => {
    const a = Buffer.from(signature, "hex"), b = Buffer.from(expected, "hex");
    return a.length === b.length && timingSafeEqual(a, b);
  });
}
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  if (!secret || !signature) return NextResponse.json({ error: "Webhook not configured" }, { status: 400 });
  const rawBody = await request.text();
  if (!validSignature(rawBody, signature, secret)) return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  const event = JSON.parse(rawBody) as { type: string; data: { object: Record<string, unknown> } };
  const session = event.data.object;
  const metadata = session.metadata as Record<string, string> | undefined;
  const id = metadata?.reservation_id;
  if (!id) return NextResponse.json({ received: true });
  if ((event.type === "checkout.session.completed" && session.payment_status === "paid") || event.type === "checkout.session.async_payment_succeeded") {
    const paymentIntent = session.payment_intent;
    const details = session.customer_details as { email?: string } | undefined;
    await updateReservation(id, { status: "confirmed", expires_at: null, stripe_payment_intent_id: typeof paymentIntent === "string" ? paymentIntent : null, customer_email: details?.email ?? null }, true);
  } else if (["checkout.session.expired", "checkout.session.async_payment_failed"].includes(event.type)) {
    await updateReservation(id, { status: "cancelled", expires_at: null }, true);
  }
  return NextResponse.json({ received: true });
}
