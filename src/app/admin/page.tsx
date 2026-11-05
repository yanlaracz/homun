"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";

type Reservation = {
  id: string;
  check_in: string;
  check_out: string;
  guests: number;
  status: "pending" | "confirmed" | "cancelled";
  created_at: string;
  customer_email: string | null;
  expires_at: string | null;
};

function dateLabel(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
}

function statusLabel(status: Reservation["status"]) {
  return status === "confirmed" ? "Confirmada" : status === "pending" ? "Pago pendiente" : "Cancelada";
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadReservations = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/reservations", { cache: "no-store" });
      const data = await response.json();
      if (response.status === 503 && String(data.error || "").includes("acceso privado")) {
        setConfigured(false);
        setAuthenticated(false);
        setError(data.error);
        return;
      }
      setConfigured(true);
      if (response.status === 401) { setAuthenticated(false); return; }
      if (!response.ok) throw new Error(data.error || "No se pudieron cargar las reservas.");
      setReservations(data.reservations || []);
      setAuthenticated(true);
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : "No se pudieron cargar las reservas.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void loadReservations(); }, [loadReservations]);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
      const data = await response.json();
      setPassword("");
      if (!response.ok) {
        if (response.status === 503) setConfigured(false);
        throw new Error(data.error || "No se pudo iniciar sesión.");
      }
      setConfigured(true);
      setAuthenticated(true);
      await loadReservations();
    } catch (issue) { setError(issue instanceof Error ? issue.message : "No se pudo iniciar sesión."); }
  }

  async function cancelReservation(reservation: Reservation) {
    const prompt = `¿Cancelar la reserva del ${dateLabel(reservation.check_in)} al ${dateLabel(reservation.check_out)}?\n\nEsto liberará las fechas en el calendario Homun y su iCal al actualizarse. No reembolsa el pago de Stripe.`;
    if (!window.confirm(prompt)) return;
    setBusyId(reservation.id);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/admin/reservations/${reservation.id}/cancel`, { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo cancelar la reserva.");
      setNotice("Reserva cancelada. Actualiza el calendario importado en Airbnb para que se refleje el cambio.");
      await loadReservations();
    } catch (issue) { setError(issue instanceof Error ? issue.message : "No se pudo cancelar la reserva."); }
    finally { setBusyId(""); }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthenticated(false);
    setReservations([]);
    setNotice("");
  }

  return <main className="admin-page"><div className="admin-wrap">
    <Link className="admin-back" href="/">← Volver al sitio</Link>
    {!authenticated ? <section className="admin-login-card">
      <span className="admin-eyebrow">HOMUN · PANEL PRIVADO</span>
      <h1>Administrar reservas</h1>
      <p>Inicia sesión para revisar las reservas y liberar fechas del calendario.</p>
      {configured === false ? <div className="admin-setup"><strong>Falta activar el acceso privado</strong><p>En Vercel, abre <b>Settings → Environment Variables</b> y agrega <code>HOMUN_ADMIN_PASSWORD</code> para Production. Usa una contraseña larga (mínimo 24 caracteres) y compártela únicamente con tu mamá. Guarda el cambio y vuelve a desplegar.</p></div> : <form onSubmit={login} className="admin-login-form"><label htmlFor="admin-password">Contraseña de anfitriones</label><input id="admin-password" type="password" autoComplete="current-password" minLength={24} required value={password} onChange={(event) => setPassword(event.target.value)} /><button className="button" type="submit" disabled={loading}>Entrar al panel</button></form>}
      {error && <p className="admin-error" role="alert">{error}</p>}
    </section> : <section className="admin-dashboard">
      <div className="admin-heading"><div><span className="admin-eyebrow">HOMUN · PANEL PRIVADO</span><h1>Reservas</h1><p>Las cancelaciones liberan las noches del iCal de Homun. Airbnb puede tardar en actualizarse.</p></div><div className="admin-actions"><button type="button" className="admin-secondary" onClick={() => void loadReservations()}>Actualizar</button><button type="button" className="admin-secondary" onClick={() => void logout()}>Cerrar sesión</button></div></div>
      {notice && <p className="admin-notice" role="status">{notice}</p>}
      {error && <p className="admin-error" role="alert">{error}</p>}
      {loading ? <p className="admin-loading">Cargando reservas…</p> : reservations.length === 0 ? <div className="admin-empty">Todavía no hay reservas registradas.</div> : <div className="admin-reservations">{reservations.map((reservation) => <article className="admin-reservation" key={reservation.id}>
        <div className="admin-reservation-dates"><span>Entrada</span><strong>{dateLabel(reservation.check_in)}</strong><span>Salida</span><strong>{dateLabel(reservation.check_out)}</strong></div>
        <div className="admin-reservation-info"><span className={`admin-status status-${reservation.status}`}>{statusLabel(reservation.status)}</span><span>{reservation.guests} {reservation.guests === 1 ? "huésped" : "huéspedes"}</span>{reservation.customer_email && <span>{reservation.customer_email}</span>}{reservation.status === "pending" && <small>El intento de pago expira {reservation.expires_at ? new Date(reservation.expires_at).toLocaleString("es-MX") : "pronto"}; no canceles mientras se completa el pago.</small>}</div>
        {reservation.status === "confirmed" && <button className="admin-cancel" type="button" disabled={busyId === reservation.id} onClick={() => void cancelReservation(reservation)}>{busyId === reservation.id ? "Cancelando…" : "Cancelar reserva"}</button>}
      </article>)}</div>}
      <p className="admin-footnote">Cancelar aquí no hace un reembolso. Si corresponde devolver el pago, se gestiona por separado en Stripe.</p>
    </section>}
  </div></main>;
}
