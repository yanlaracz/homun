"use client";

import { useState, type FormEvent } from "react";
import { propertyConfig } from "@/config/property";

export function BookingForm() {
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const checkIn = String(form.get("checkIn") ?? "");
    const checkOut = String(form.get("checkOut") ?? "");
    const guests = Number(form.get("guests"));
    const optionalMessage = String(form.get("message") ?? "").trim();
    const errors: Record<string, string> = {};

    if (!name) errors.name = "Escribe tu nombre.";
    if (!checkIn) errors.checkIn = "Selecciona la fecha de entrada.";
    if (!checkOut) errors.checkOut = "Selecciona la fecha de salida.";
    if (checkIn && checkOut && checkOut <= checkIn) errors.checkOut = "La salida debe ser posterior a la entrada.";
    if (!Number.isInteger(guests) || guests < 1 || guests > propertyConfig.property.maxGuests) errors.guests = `Elige de 1 a ${propertyConfig.property.maxGuests} huéspedes.`;
    setFieldErrors(errors);
    setError("");
    if (Object.keys(errors).length) {
      setError("Revisa los campos señalados para continuar.");
      return;
    }

    const message = [
      `Hola, me interesa hospedarme en ${propertyConfig.brand.fullName}.`,
      "",
      `Nombre: ${name}`,
      `Entrada: ${checkIn}`,
      `Salida: ${checkOut}`,
      `Huéspedes: ${guests}`,
      "",
      "¿Podrían confirmarme la disponibilidad y el precio total de la estancia?",
      optionalMessage ? `\nMensaje: ${optionalMessage}` : "",
    ].filter(Boolean).join("\n");
    window.open(`https://wa.me/${propertyConfig.booking.whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  }

  const minDate = new Date().toLocaleDateString("en-CA");
  return (
    <form className="booking-card" onSubmit={submit} noValidate>
      <div className="form-grid">
        <div className="field field-wide"><label htmlFor="name">Tu nombre</label><input id="name" name="name" autoComplete="name" aria-invalid={!!fieldErrors.name} aria-describedby={fieldErrors.name ? "name-error" : undefined} />{fieldErrors.name && <span id="name-error" className="field-error">{fieldErrors.name}</span>}</div>
        <div className="field"><label htmlFor="checkIn">Entrada</label><input id="checkIn" name="checkIn" type="date" min={minDate} aria-invalid={!!fieldErrors.checkIn} aria-describedby={fieldErrors.checkIn ? "checkin-error" : undefined} />{fieldErrors.checkIn && <span id="checkin-error" className="field-error">{fieldErrors.checkIn}</span>}</div>
        <div className="field"><label htmlFor="checkOut">Salida</label><input id="checkOut" name="checkOut" type="date" min={minDate} aria-invalid={!!fieldErrors.checkOut} aria-describedby={fieldErrors.checkOut ? "checkout-error" : undefined} />{fieldErrors.checkOut && <span id="checkout-error" className="field-error">{fieldErrors.checkOut}</span>}</div>
        <div className="field field-wide"><label htmlFor="guests">Huéspedes</label><select id="guests" name="guests" defaultValue="2" aria-invalid={!!fieldErrors.guests} aria-describedby={fieldErrors.guests ? "guests-error" : undefined}>{Array.from({ length: propertyConfig.property.maxGuests }, (_, index) => index + 1).map((number) => <option key={number} value={number}>{number} {number === 1 ? "huésped" : "huéspedes"}</option>)}</select>{fieldErrors.guests && <span id="guests-error" className="field-error">{fieldErrors.guests}</span>}</div>
        <div className="field field-wide"><label htmlFor="message">Mensaje opcional</label><textarea id="message" name="message" placeholder="Cuéntanos algo que debamos saber" /></div>
      </div>
      {error && <p role="alert" className="form-error">{error}</p>}
      <p className="form-help">Esta solicitud no confirma una reservación. La disponibilidad y el precio se confirmarán manualmente por WhatsApp.</p>
      <button className="button" type="submit">Continuar por WhatsApp <span aria-hidden="true">↗</span></button>
      <p className="privacy">Los datos se usan solo para preparar el mensaje en WhatsApp. Este sitio no los guarda ni los envía a un servidor.</p>
    </form>
  );
}
