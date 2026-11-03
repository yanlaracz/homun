"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { propertyConfig } from "@/config/property";
import { BookingForm } from "@/components/booking-form";
import { Gallery } from "@/components/gallery";
import { SiteHeader } from "@/components/site-header";

const listing = propertyConfig.property.listingUrl;
const amenities = [
  { title: "Aire acondicionado", icon: "❄", group: "comfort" }, { title: "Wi-Fi", icon: "⌁", group: "comfort" },
  { title: "Smart TV", icon: "▣", group: "comfort" }, { title: "Cocina equipada", icon: "⌂", group: "comfort" },
  { title: "Balcón", icon: "↗", group: "comfort" }, { title: "Alberca compartida", icon: "◉", group: "community" },
  { title: "Áreas verdes", icon: "❋", group: "community" }, { title: "Juegos infantiles", icon: "◇", group: "community" },
  { title: "Cancha de básquetbol", icon: "◌", group: "community" }, { title: "Un cajón de estacionamiento incluido", icon: "P", group: "community" },
];

const faqEs = [
  ["¿Cuántas personas pueden hospedarse?", "El alojamiento tiene capacidad autorizada para hasta 6 huéspedes."],
  ["¿Cuántas habitaciones tiene el departamento?", "Tiene 3 habitaciones y 2 baños. La distribución incluye una cama King y dos camas matrimoniales."],
  ["¿Hay estacionamiento?", "Sí, se incluye un espacio de estacionamiento."],
  ["¿Tiene cocina equipada?", "Sí, dispone de cocina equipada."],
  ["¿La alberca es privada o compartida?", "La alberca es compartida con otros residentes."],
  ["¿Cómo puedo consultar disponibilidad?", "Completa el formulario de esta página para enviar una consulta por WhatsApp."],
  ["¿Cómo se confirma una reservación?", "La consulta no confirma una reserva. La disponibilidad, precio y proceso de confirmación deben acordarse directamente."],
  ["¿Se aceptan niños?", "Consulta por WhatsApp para confirmar las condiciones aplicables a tu estancia."],
  ["¿Cuáles son los horarios de entrada y salida?", "Los horarios están pendientes de confirmar. Consúltalos por WhatsApp antes de reservar."],
  ["¿Cuáles son las políticas de cancelación?", "Las políticas de cancelación están pendientes de confirmar. Solicita los detalles antes de reservar."],
];
const faqEn = [
  ["How many guests can stay?", "The stated capacity is up to 6 guests."],
  ["How many bedrooms does the apartment have?", "There are 3 bedrooms and 2 bathrooms, with one King bed and two double beds."],
  ["Is parking available?", "Yes, one parking space is included."],
  ["Is there an equipped kitchen?", "Yes, the apartment has an equipped kitchen."],
  ["Is the pool private or shared?", "The pool is shared with other residents."],
  ["How can I check availability?", "Use the form on this page to send an inquiry through WhatsApp."],
  ["How is a reservation confirmed?", "An inquiry does not confirm a booking. Availability, price, and the confirmation process must be agreed directly."],
  ["Are children welcome?", "Please contact us on WhatsApp to confirm the conditions for your stay."],
  ["What are the check-in and check-out times?", "The times are still to be confirmed. Please ask on WhatsApp before booking."],
  ["What is the cancellation policy?", "The cancellation policy is still to be confirmed. Please ask for details before booking."],
];

export default function HomePage() {
  const [en, setEn] = useState(false);
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
          <div className="hero-actions"><a className="button" href="#consulta">{w("Consultar disponibilidad", "Check availability")} <span aria-hidden="true">↗</span></a><a className="scroll-link" href="#alojamiento">{w("Explorar alojamiento", "Explore the apartment")} ↓</a></div>
        </div>
        <div className="hero-media"><Image src="/images/property/sala-principal.jpeg" alt="Sala del departamento Homun" fill priority sizes="(max-width: 900px) 100vw, 50vw" /></div>
      </div></section>
      <div className="container"><div className="stat-band"><div className="stat"><strong>6</strong><span>{w("huéspedes máximo", "guests maximum")}</span></div><div className="stat"><strong>3</strong><span>{w("habitaciones", "bedrooms")}</span></div><div className="stat"><strong>2</strong><span>{w("baños", "bathrooms")}</span></div><div className="stat"><strong>1</strong><span>{w("estacionamiento incluido", "parking space included")}</span></div></div></div>

      <section className="section" id="alojamiento"><div className="container"><div className="section-heading"><span className="eyebrow">{w("Una estancia a tu ritmo", "A stay at your own pace")}</span><h2>{w("Un espacio cómodo para compartir y descansar.", "A comfortable place to gather and unwind.")}</h2><p>{w("Homun reúne áreas para convivir y habitaciones independientes para tener espacio durante la estancia. Su cocina equipada y las comodidades esenciales facilitan una visita práctica a Cancún.", "Homun brings together shared living areas and separate bedrooms, with an equipped kitchen and everyday comforts for a practical visit to Cancún.")}</p></div><Gallery /></div></section>

      <section className="section stay"><div className="container stay-grid"><div className="stay-intro"><span className="eyebrow">{w("El alojamiento", "The apartment")}</span><h2>{w("Espacio para cada integrante del viaje.", "Room for everyone on the trip.")}</h2><p>{w("El departamento cuenta con tres habitaciones, dos baños, sala, comedor, cocina equipada y balcón.", "The apartment has three bedrooms, two bathrooms, a living room, dining area, equipped kitchen, and balcony.")}</p><div className="section-photo"><Image src="/images/property/recamara-principal-nueva.jpeg" alt="Recámara principal de Homun" fill sizes="(max-width: 700px) 100vw, 40vw" /></div></div><div className="room-list">
        {[["01", "Recámara principal", "Una cama King · baño privado", "♧"], ["02", "Segunda habitación", "Una cama matrimonial", "⌂"], ["03", "Tercera habitación", "Una cama matrimonial", "⌂"], ["04", "Áreas compartidas", "Sala, comedor, cocina equipada y balcón", "◇"], ["05", "Baño adicional", "Segundo baño completo", "◫"]].map(([num, title, desc, icon]) => <article className="room" key={num}><span className="room-number">{num}</span><div><h3>{w(title, ({"Recámara principal":"Primary bedroom","Segunda habitación":"Second bedroom","Tercera habitación":"Third bedroom","Áreas compartidas":"Shared living areas","Baño adicional":"Additional bathroom"} as Record<string,string>)[title] ?? title)}</h3><p>{w(desc, ({"Una cama King · baño privado":"One King bed · private bathroom","Una cama matrimonial":"One double bed","Sala, comedor, cocina equipada y balcón":"Living room, dining area, equipped kitchen, and balcony","Segundo baño completo":"Second full bathroom"} as Record<string,string>)[desc] ?? desc)}</p></div><span className="room-icon" aria-hidden="true">{icon}</span></article>)}
      </div></div></section>

      <section className="section" id="amenidades"><div className="container"><div className="section-heading"><span className="eyebrow">{w("Comodidad y áreas comunes", "Comfort and shared spaces")}</span><h2>{w("Lo esencial, dentro y alrededor del departamento.", "Everyday comforts in and around the apartment.")}</h2><p>{w("Algunas amenidades forman parte del residencial y son compartidas con otros huéspedes y residentes.", "Some amenities are part of the residential community and are shared with other guests and residents.")}</p></div><div className="amenity-grid">
        <div className="amenity-card"><h3>{w("Comodidad", "Comfort")}</h3><div className="amenity-list">{amenities.filter((item) => item.group === "comfort").map((item) => <div className="amenity-item" key={item.title}><span className="amenity-icon">{item.icon}</span><b>{w(item.title, ({"Aire acondicionado":"Air conditioning","Cocina equipada":"Equipped kitchen","Balcón":"Balcony"} as Record<string,string>)[item.title] ?? item.title)}</b></div>)}</div><p className="subnote">{w("El aire acondicionado se encuentra en las tres habitaciones.", "Air conditioning is available in all three bedrooms.")}</p></div>
        <div className="amenity-card"><h3>{w("Residencial", "Residential community")}</h3><div className="amenity-list">{amenities.filter((item) => item.group === "community").map((item) => <div className="amenity-item" key={item.title}><span className="amenity-icon">{item.icon}</span><b>{w(item.title, ({"Alberca compartida":"Shared pool","Áreas verdes":"Green spaces","Juegos infantiles":"Children's play area","Cancha de básquetbol":"Basketball court","Un cajón de estacionamiento incluido":"One parking space included"} as Record<string,string>)[item.title] ?? item.title)}</b></div>)}</div><p className="subnote">{w("La alberca y las áreas comunes son compartidas. Los detalles operativos del acceso controlado están pendientes de confirmación.", "The pool and common areas are shared. Operational details of controlled access are still to be confirmed.")}</p></div>
      </div><div className="amenity-photos"><div className="section-photo"><Image src="/images/property/alberca-atardecer-nueva.jpeg" alt="Alberca compartida" fill sizes="(max-width: 700px) 100vw, 45vw" /></div><div className="section-photo"><Image src="/images/property/juegos-residencial.jpeg" alt="Juegos infantiles del residencial" fill sizes="(max-width: 700px) 100vw, 45vw" /></div></div></div></section>

      <section className="section location" id="ubicacion"><div className="container location-grid"><div><span className="eyebrow">{w("Ubicación", "Location")}</span><h2>{w("Zona Sur de Cancún.", "Southern Cancún.")}</h2><p>{w("Homun se encuentra en Residencial Izamal, en la Zona Sur de Cancún, Quintana Roo. En Polígono Sur encontrarás comercios y lugares de interés para organizar tus días.", "Homun is in Residencial Izamal, in southern Cancún, Quintana Roo. Polígono Sur has shops and places of interest to help you plan your days.")}</p><p className="subnote">{w("La ubicación exacta no se publica en este sitio. Abre cada punto en Google Maps para consultar la ruta desde tu ubicación.", "The exact address is not published here. Open each place in Google Maps to check directions from your location.")}</p><div className="nearby-list"><h3>{w("Puntos de interés cercanos", "Nearby points of interest")}</h3><a className="nearby-card" href="https://www.google.com/maps/search/?api=1&query=Walmart+Poligono+Sur+Cancun" target="_blank" rel="noreferrer"><span className="nearby-icon" aria-hidden="true">⌕</span><span><strong>Walmart Polígono Sur</strong><small>{w("Supermercado para compras y artículos de uso diario.", "Supermarket for groceries and everyday essentials.")}</small></span><span aria-hidden="true">↗</span></a><a className="nearby-card" href="https://www.google.com/maps/search/?api=1&query=Chedraui+Cancun+Santuario" target="_blank" rel="noreferrer"><span className="nearby-icon" aria-hidden="true">⌕</span><span><strong>Chedraui Cancún Santuario</strong><small>{w("Otra opción para hacer el súper en la zona de Avenida 145.", "Another grocery option in the Avenida 145 area.")}</small></span><span aria-hidden="true">↗</span></a><a className="nearby-card" href="https://www.google.com/maps/search/?api=1&query=Santuario+Maria+Desatadora+de+Nudos+Cancun" target="_blank" rel="noreferrer"><span className="nearby-icon" aria-hidden="true">✧</span><span><strong>{w("Santuario María Desatadora de Nudos", "Mary Undoer of Knots Sanctuary")}</strong><small>{w("Santuario y lugar de oración ubicado en Polígono Sur.", "A sanctuary and place of prayer in Polígono Sur.")}</small></span><span aria-hidden="true">↗</span></a></div></div><div className="section-photo location-photo"><Image src="/images/property/entrada-residencial.jpeg" alt="Acceso a Residencial Izamal" fill sizes="(max-width: 700px) 100vw, 50vw" /></div></div></section>

      <section className="section" id="faq"><div className="container"><div className="section-heading"><span className="eyebrow">{w("Preguntas frecuentes", "Frequently asked questions")}</span><h2>{w("Antes de planear tu estancia.", "Before planning your stay.")}</h2></div><div className="faq-list">{faq.map(([question, answer]) => <details className="faq-item" key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div></div></section>

      <section className="section booking" id="consulta"><div className="container booking-grid"><div><span className="eyebrow">{w("Consulta directa", "Direct inquiry")}</span><h2>{w("Cuéntanos las fechas de tu viaje.", "Tell us your travel dates.")}</h2><p>{w("Envía una solicitud para conocer disponibilidad y precio. La respuesta y la confirmación se realizan manualmente.", "Send an inquiry to ask about availability and price. Responses and confirmation are handled manually.")}</p><p className="subnote">{w("También puedes escribir directamente al", "You can also message us directly at")} <a href={`https://wa.me/${propertyConfig.booking.whatsappNumber}`}><strong>{propertyConfig.booking.whatsappDisplayNumber}</strong></a>.</p></div><BookingForm /></div></section>

      <section className="cta"><div className="container"><span className="eyebrow">HOMUN · {w("Residencial Izamal", "Residencial Izamal")}</span><h2>{w("Tu hogar para disfrutar Cancún.", "Your home to enjoy Cancún.")}</h2><p>{w("Planea tu estancia y consulta tus fechas con nosotros.", "Plan your stay and ask us about your dates.")}</p><a className="button" href="#consulta">{w("Consultar disponibilidad", "Check availability")} ↗</a></div></section>
    </main>
    <footer className="footer"><div className="container"><div className="footer-grid"><div><a className="brand" style={{color:"#e8eee7"}} href="#inicio">HOMUN</a><p>Homun en Residencial Izamal<br />Cancún, Quintana Roo, México</p></div><div><div className="footer-heading">{w("Explorar", "Explore")}</div><nav className="footer-nav"><a href="#alojamiento">{w("Alojamiento", "The apartment")}</a><a href="#amenidades">{w("Amenidades", "Amenities")}</a><a href="#ubicacion">{w("Ubicación", "Location")}</a><a href="#faq">{w("Preguntas frecuentes", "FAQ")}</a></nav></div><div><div className="footer-heading">{w("Contacto", "Contact")}</div><nav className="footer-nav"><a href={`https://wa.me/${propertyConfig.booking.whatsappNumber}`} target="_blank" rel="noreferrer">WhatsApp · {propertyConfig.booking.whatsappDisplayNumber}</a><a href={listing} target="_blank" rel="noreferrer">{w("Ver anuncio complementario en Airbnb", "View the listing on Airbnb")}</a><a href="/privacidad">{w("Aviso de privacidad", "Privacy notice")}</a></nav></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Homun en Residencial Izamal</span><span>{w("Disponibilidad y reservaciones sujetas a confirmación manual.", "Availability and bookings subject to manual confirmation.")}</span></div></div></footer>
  </>;
}
