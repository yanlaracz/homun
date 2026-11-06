"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { propertyConfig } from "@/config/property";
import { BookingForm } from "@/components/booking-form";
import { Gallery } from "@/components/gallery";
import { SiteHeader } from "@/components/site-header";
import { AvailabilityCalendar } from "@/components/availability-calendar";

const listing = propertyConfig.property.listingUrl;
const amenities = [
  { title: "Aire acondicionado", icon: "❄", group: "comfort" }, { title: "Wi-Fi", icon: "⌁", group: "comfort" },
  { title: "Smart TV", icon: "▣", group: "comfort" }, { title: "Cocina equipada", icon: "⌂", group: "comfort" },
  { title: "Balcón", icon: "↗", group: "comfort" }, { title: "Alberca compartida", icon: "◉", group: "community" },
  { title: "Áreas verdes", icon: "❋", group: "community" }, { title: "Juegos infantiles", icon: "◇", group: "community" },
  { title: "Cancha de básquetbol", icon: "◌", group: "community" }, { title: "Un cajón de estacionamiento incluido", icon: "P", group: "community" },
];
const guestReviews = [
  { name: "Tania", date: "Hace 1 semana", text: "Un lugar tranquilo, muy bonito, encuentras supermercados cerca y lo más importante es que Estela fue muy atenta con nosotros. Sin duda volveremos." },
  { name: "Daniel", date: "Hace 3 semanas", text: "¡Excelente alojamiento! Sin duda volvería mil veces." },
  { name: "Paco Ortega", date: "Septiembre de 2026", text: "Un alojamiento muy tranquilo, con servicios y equipamiento completo. Al anfitriona siempre pendiente, siempre resolvió dudas." },
  { name: "Victor", date: "Agosto de 2026", text: "Un lugar cómodo, en zona tranquila con seguridad 24/7. Sin duda lo recomiendo, volvería a regresar." },
  { name: "Diana Guadalupe", date: "Junio de 2026", text: "Excelente lugar, camas cómodas, la anfitriona siempre al pendiente hasta nuestra llegada. 10/10 volvería a reservar sin dudar." },
  { name: "Candy", date: "Junio de 2026", text: "El departamento estaba muy bonito, bien ubicado, súper limpio y con muchas facilidades. Ha sido una estadía grata y placentera." },
  { name: "Titi", date: "Mayo de 2026", text: "El depa de Estela es muy bueno, cómodo y limpio. Sin duda volvería a hospedarme en él." },
  { name: "Esteban", date: "Abril de 2026", text: "Muy bonito condominio." },
];

const faqEs = [
  ["¿Cuántas personas pueden hospedarse?", "El alojamiento tiene capacidad autorizada para hasta 6 huéspedes."],
  ["¿Cuántas habitaciones tiene el departamento?", "Tiene 3 habitaciones y 2 baños. La distribución incluye una cama King y dos camas matrimoniales."],
  ["¿Hay estacionamiento?", "Sí, se incluye un espacio de estacionamiento."],
  ["¿Tiene cocina equipada?", "Sí, dispone de cocina equipada."],
  ["¿La alberca es privada o compartida?", "La alberca es compartida con otros residentes."],
  ["¿Cuánto cuesta la estancia?", "La tarifa es de $1,100 MXN por noche durante todo el año. El sitio calcula el total según las fechas seleccionadas."],
  ["¿Cómo se paga y cuál es el depósito?", "El pago de la estancia será completo al reservar. Además se solicitará un depósito de seguridad en efectivo o transferencia, reembolsable al finalizar si no hay inconvenientes."],
  ["¿Ya puedo pagar y confirmar la reserva en línea?", "El pago en línea se procesa de forma segura con Stripe. La reserva queda confirmada únicamente después de completar el pago y ver la confirmación en esta página."],
  ["¿Cuáles son los horarios de entrada y salida?", "Los horarios están pendientes de confirmar. Consúltalos por WhatsApp antes de reservar."],
  ["¿Cuál es la política de cancelación?", "Con 30 días o más antes de la llegada, se reembolsa el total; de 14 a 29 días antes, se reembolsa el 50%; dentro de los últimos 14 días no hay reembolso."],
];
const faqEn = [
  ["How many guests can stay?", "The stated capacity is up to 6 guests."],
  ["How many bedrooms does the apartment have?", "There are 3 bedrooms and 2 bathrooms, with one King bed and two double beds."],
  ["Is parking available?", "Yes, one parking space is included."],
  ["Is there an equipped kitchen?", "Yes, the apartment has an equipped kitchen."],
  ["Is the pool private or shared?", "The pool is shared with other residents."],
  ["How much does a stay cost?", "The rate is MXN $1,100 per night year-round. The site calculates the total for selected dates."],
  ["How do payment and the security deposit work?", "The full stay will be due at booking. A separate security deposit is paid in cash or by transfer and returned after check-out if there are no issues."],
  ["Can I pay and confirm a booking online yet?", "Online payments are processed securely through Stripe. A reservation is confirmed only after successful payment and confirmation on this site."],
  ["What are the check-in and check-out times?", "The times are still to be confirmed. Please ask on WhatsApp before booking."],
  ["What is the cancellation policy?", "30 or more days before arrival: full refund; 14–29 days: 50% refund; within 14 days: no refund."],
];

export default function HomePage() {
  const [en, setEn] = useState(false);
  const [selectedRange, setSelectedRange] = useState<{ checkIn: string; checkOut: string } | null>(null);
  const [quickDates, setQuickDates] = useState({ checkIn: "", checkOut: "" });
  const [calendarRequest, setCalendarRequest] = useState<{ checkIn: string; checkOut: string } | null>(null);
  useEffect(() => {
    const listener = (event: Event) => setEn((event as CustomEvent<string>).detail === "en");
    document.addEventListener("homun-language", listener);
    return () => document.removeEventListener("homun-language", listener);
  }, []);
  const faq = en ? faqEn : faqEs;
  const w = (text: string, translated: string) => en ? translated : text;
  return <>
    <SiteHeader />
    <main>
      <section className="hero" id="inicio"><div className="container hero-grid">
        <div className="hero-copy"><span className="eyebrow">{w("Residencial Izamal · Cancún, Quintana Roo", "Residencial Izamal · Cancún, Quintana Roo")}</span>
          <h1>{w("Más espacio para disfrutar Cancún.", "More room to enjoy Cancún.")}</h1>
          <p>{w("Bienvenido a Homun, un departamento cómodo y funcional en la Zona Sur de Cancún. Un espacio para reunirse, descansar y organizar tus días a tu ritmo.", "Welcome to Homun, a comfortable and practical apartment in southern Cancún. A place to gather, unwind, and plan each day at your own pace.")}</p>
          <div className="hero-facts"><span>♧ {w("Hasta 6 huéspedes", "Up to 6 guests")}</span><span>⌂ 3 {w("habitaciones", "bedrooms")}</span><span>◫ 2 {w("baños", "bathrooms")}</span></div>
          <div className="hero-actions"><a className="button" href="#consulta">{w("Ver fechas y precio", "See dates and price")} <span aria-hidden="true">↗</span></a><a className="scroll-link" href="#alojamiento">{w("Explorar alojamiento", "Explore the apartment")} ↓</a></div>
        </div>
        <div className="hero-media"><Image src="/images/property/sala-principal.jpeg" alt="Sala del departamento Homun" fill priority sizes="(max-width: 900px) 100vw, 50vw" /></div>
      </div></section>
      <div className="container"><div className="stat-band"><div className="stat"><strong>6</strong><span>{w("huéspedes máximo", "guests maximum")}</span></div><div className="stat"><strong>3</strong><span>{w("habitaciones", "bedrooms")}</span></div><div className="stat"><strong>2</strong><span>{w("baños", "bathrooms")}</span></div><div className="stat"><strong>1</strong><span>{w("estacionamiento incluido", "parking space included")}</span></div></div>
        <form className="quick-booking" onSubmit={(event) => { event.preventDefault(); setCalendarRequest({ ...quickDates }); document.getElementById("consulta")?.scrollIntoView({ behavior: "smooth" }); }}>
          <div className="quick-booking-copy"><strong>{w("Planea tu estancia", "Plan your stay")}</strong><span>{w("Elige tus fechas para consultar disponibilidad", "Choose your dates to check availability")}</span></div>
          <label><span>{w("Entrada", "Check-in")}</span><input type="date" required value={quickDates.checkIn} onChange={(event) => setQuickDates({ ...quickDates, checkIn: event.target.value })} /></label>
          <label><span>{w("Salida", "Check-out")}</span><input type="date" required min={quickDates.checkIn || undefined} value={quickDates.checkOut} onChange={(event) => setQuickDates({ ...quickDates, checkOut: event.target.value })} /></label>
          <button className="button" type="submit">{w("Ver disponibilidad", "Check availability")} ↗</button>
        </form>
      </div>

      <section className="section" id="alojamiento"><div className="container"><div className="section-heading"><span className="eyebrow">{w("Una estancia a tu ritmo", "A stay at your own pace")}</span><h2>{w("Un espacio cómodo para compartir y descansar.", "A comfortable place to gather and unwind.")}</h2><p>{w("Homun reúne áreas para convivir y habitaciones independientes para tener espacio durante la estancia. Su cocina equipada y las comodidades esenciales facilitan una visita práctica a Cancún.", "Homun brings together shared living areas and separate bedrooms, with an equipped kitchen and everyday comforts for a practical visit to Cancún.")}</p></div><Gallery /></div></section>

      <section className="section reviews" id="resenas"><div className="container"><div className="section-heading"><span className="eyebrow">{w("Experiencias reales", "Real guest experiences")}</span><h2>{w("Lo que cuentan nuestros huéspedes.", "What our guests say.")}</h2><p>{w("Una selección de reseñas de huéspedes en Airbnb. Consulta el anuncio para ver todas las evaluaciones.", "A selection of guest reviews from Airbnb. Visit the listing to read all reviews.")}</p></div><div className="reviews-grid">{guestReviews.map((review) => <article className="review-card" key={review.name + review.date}><div className="review-top"><span className="review-avatar" aria-hidden="true">{review.name.charAt(0)}</span><div><strong>{review.name}</strong><small>{review.date}</small></div></div><div className="review-stars" aria-label="5 de 5 estrellas">★★★★★</div><blockquote>“{review.text}”</blockquote><span className="review-source">{w("Reseña de Airbnb", "Airbnb guest review")}</span></article>)}</div><a className="button button-outline reviews-link" href={listing} target="_blank" rel="noreferrer">{w("Ver todas las reseñas en Airbnb", "See all reviews on Airbnb")} ↗</a></div></section>

      <section className="section stay"><div className="container stay-grid"><div className="stay-intro"><span className="eyebrow">{w("El alojamiento", "The apartment")}</span><h2>{w("Espacio para cada integrante del viaje.", "Room for everyone on the trip.")}</h2><p>{w("El departamento cuenta con tres habitaciones, dos baños, sala, comedor, cocina equipada y balcón.", "The apartment has three bedrooms, two bathrooms, a living room, dining area, equipped kitchen, and balcony.")}</p><div className="section-photo"><Image src="/images/property/recamara-principal-nueva.jpeg" alt="Recámara principal de Homun" fill sizes="(max-width: 700px) 100vw, 40vw" /></div></div><div className="room-list">
        {[["01", "Recámara principal", "Una cama King · baño privado", "♧"], ["02", "Segunda habitación", "Una cama matrimonial", "⌂"], ["03", "Tercera habitación", "Una cama matrimonial", "⌂"], ["04", "Áreas compartidas", "Sala, comedor, cocina equipada y balcón", "◇"], ["05", "Baño adicional", "Segundo baño completo", "◫"]].map(([num, title, desc, icon]) => <article className="room" key={num}><span className="room-number">{num}</span><div><h3>{w(title, ({"Recámara principal":"Primary bedroom","Segunda habitación":"Second bedroom","Tercera habitación":"Third bedroom","Áreas compartidas":"Shared living areas","Baño adicional":"Additional bathroom"} as Record<string,string>)[title] ?? title)}</h3><p>{w(desc, ({"Una cama King · baño privado":"One King bed · private bathroom","Una cama matrimonial":"One double bed","Sala, comedor, cocina equipada y balcón":"Living room, dining area, equipped kitchen, and balcony","Segundo baño completo":"Second full bathroom"} as Record<string,string>)[desc] ?? desc)}</p></div><span className="room-icon" aria-hidden="true">{icon}</span></article>)}
      </div></div></section>

      <section className="section" id="amenidades"><div className="container"><div className="section-heading"><span className="eyebrow">{w("Comodidad y áreas comunes", "Comfort and shared spaces")}</span><h2>{w("Lo esencial, dentro y alrededor del departamento.", "Everyday comforts in and around the apartment.")}</h2><p>{w("Algunas amenidades forman parte del residencial y son compartidas con otros huéspedes y residentes.", "Some amenities are part of the residential community and are shared with other guests and residents.")}</p></div><div className="amenity-grid">
        <div className="amenity-card"><h3>{w("Comodidad", "Comfort")}</h3><div className="amenity-list">{amenities.filter((item) => item.group === "comfort").map((item) => <div className="amenity-item" key={item.title}><span className="amenity-icon">{item.icon}</span><b>{w(item.title, ({"Aire acondicionado":"Air conditioning","Cocina equipada":"Equipped kitchen","Balcón":"Balcony"} as Record<string,string>)[item.title] ?? item.title)}</b></div>)}</div><p className="subnote">{w("El aire acondicionado se encuentra en las tres habitaciones.", "Air conditioning is available in all three bedrooms.")}</p></div>
        <div className="amenity-card"><h3>{w("Residencial", "Residential community")}</h3><div className="amenity-list">{amenities.filter((item) => item.group === "community").map((item) => <div className="amenity-item" key={item.title}><span className="amenity-icon">{item.icon}</span><b>{w(item.title, ({"Alberca compartida":"Shared pool","Áreas verdes":"Green spaces","Juegos infantiles":"Children's play area","Cancha de básquetbol":"Basketball court","Un cajón de estacionamiento incluido":"One parking space included"} as Record<string,string>)[item.title] ?? item.title)}</b></div>)}</div><p className="subnote">{w("La alberca y las áreas comunes son compartidas. Los detalles operativos del acceso controlado están pendientes de confirmación.", "The pool and common areas are shared. Operational details of controlled access are still to be confirmed.")}</p></div>
      </div><div className="amenity-photos"><div className="section-photo"><Image src="/images/property/alberca-atardecer-nueva.jpeg" alt="Alberca compartida" fill sizes="(max-width: 700px) 100vw, 45vw" /></div><div className="section-photo"><Image src="/images/property/juegos-residencial.jpeg" alt="Juegos infantiles del residencial" fill sizes="(max-width: 700px) 100vw, 45vw" /></div></div></div></section>

      <section className="section location" id="ubicacion"><div className="container location-grid"><div><span className="eyebrow">{w("Ubicación", "Location")}</span><h2>{w("Zona Sur de Cancún.", "Southern Cancún.")}</h2><p>{w("Homun se encuentra en Residencial Izamal, en la Zona Sur de Cancún, Quintana Roo. En Polígono Sur encontrarás comercios y lugares de interés para organizar tus días.", "Homun is in Residencial Izamal, in southern Cancún, Quintana Roo. Polígono Sur has shops and places of interest to help you plan your days.")}</p><p className="subnote">{w("La ubicación exacta no se publica en este sitio. Abre cada punto en Google Maps para consultar la ruta desde tu ubicación.", "The exact address is not published here. Open each place in Google Maps to check directions from your location.")}</p><div className="nearby-list"><h3>{w("Puntos de interés cercanos", "Nearby points of interest")}</h3><a className="nearby-card" href="https://www.google.com/maps/search/?api=1&query=Walmart+Poligono+Sur+Cancun" target="_blank" rel="noreferrer"><span className="nearby-icon" aria-hidden="true">⌕</span><span><strong>Walmart Polígono Sur</strong><small>{w("Supermercado para compras y artículos de uso diario.", "Supermarket for groceries and everyday essentials.")}</small></span><span aria-hidden="true">↗</span></a><a className="nearby-card" href="https://www.google.com/maps/search/?api=1&query=Chedraui+Cancun+Santuario" target="_blank" rel="noreferrer"><span className="nearby-icon" aria-hidden="true">⌕</span><span><strong>Chedraui Cancún Santuario</strong><small>{w("Otra opción para hacer el súper en la zona de Avenida 145.", "Another grocery option in the Avenida 145 area.")}</small></span><span aria-hidden="true">↗</span></a><a className="nearby-card" href="https://www.google.com/maps/search/?api=1&query=Santuario+Maria+Desatadora+de+Nudos+Cancun" target="_blank" rel="noreferrer"><span className="nearby-icon" aria-hidden="true">✧</span><span><strong>{w("Santuario María Desatadora de Nudos", "Mary Undoer of Knots Sanctuary")}</strong><small>{w("Santuario y lugar de oración ubicado en Polígono Sur.", "A sanctuary and place of prayer in Polígono Sur.")}</small></span><span aria-hidden="true">↗</span></a></div></div><div className="section-photo location-photo"><Image src="/images/property/entrada-residencial.jpeg" alt="Acceso a Residencial Izamal" fill sizes="(max-width: 700px) 100vw, 50vw" /></div></div></section>

      <section className="section" id="faq"><div className="container"><div className="section-heading"><span className="eyebrow">{w("Preguntas frecuentes", "Frequently asked questions")}</span><h2>{w("Antes de planear tu estancia.", "Before planning your stay.")}</h2></div><div className="faq-list">{faq.map(([question, answer]) => <details className="faq-item" key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div></div></section>

      <section className="section booking" id="consulta"><div className="container booking-grid"><div><span className="eyebrow">{w("Reserva directa", "Direct booking")}</span><h2>{w("Elige tus fechas y revisa el precio.", "Choose your dates and review the price.")}</h2><p>{w("Selecciona entrada y salida en el calendario. Las fechas ocupadas en Airbnb pueden aparecer aquí; las reservaciones de ambos calendarios deberán administrarse por separado.", "Select check-in and check-out in the calendar. Airbnb dates may appear here; bookings on the two calendars must be managed separately.")}</p><AvailabilityCalendar requestedRange={calendarRequest} onSelectRange={setSelectedRange} /></div><BookingForm selectedRange={selectedRange} /></div></section>

      <section className="cta"><div className="container"><span className="eyebrow">HOMUN · {w("Residencial Izamal", "Residencial Izamal")}</span><h2>{w("Tu hogar para disfrutar Cancún.", "Your home to enjoy Cancún.")}</h2><p>{w("Elige tus fechas y revisa el precio de tu estancia.", "Choose your dates and review the price for your stay.")}</p><a className="button" href="#consulta">{w("Ver fechas y precio", "See dates and price")} ↗</a></div></section>
    </main>
    <footer className="footer"><div className="container"><div className="footer-grid"><div><a className="brand" style={{color:"#e8eee7"}} href="#inicio">HOMUN</a><p>Homun en Residencial Izamal<br />Cancún, Quintana Roo, México</p></div><div><div className="footer-heading">{w("Explorar", "Explore")}</div><nav className="footer-nav"><a href="#alojamiento">{w("Alojamiento", "The apartment")}</a><a href="#amenidades">{w("Amenidades", "Amenities")}</a><a href="#ubicacion">{w("Ubicación", "Location")}</a><a href="#faq">{w("Preguntas frecuentes", "FAQ")}</a></nav></div><div><div className="footer-heading">{w("Contacto", "Contact")}</div><nav className="footer-nav"><a href={`https://wa.me/${propertyConfig.booking.whatsappNumber}`} target="_blank" rel="noreferrer">WhatsApp · {propertyConfig.booking.whatsappDisplayNumber}</a><a href={listing} target="_blank" rel="noreferrer">{w("Ver anuncio complementario en Airbnb", "View the listing on Airbnb")}</a><a href="/privacidad">{w("Aviso de privacidad", "Privacy notice")}</a></nav></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Homun en Residencial Izamal</span><span>{w("Las reservas de Airbnb y de esta página se administran por separado.", "Airbnb and website reservations are managed separately.")}</span></div><div className="footer-host-link"><Link href="/admin">Acceso anfitriones</Link></div></div></footer>
  </>;
}
