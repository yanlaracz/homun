import Link from "next/link";
import { propertyConfig } from "@/config/property";

export const metadata = { title: "Aviso de privacidad | Homun en Residencial Izamal", robots: { index: false, follow: true } };
export default function PrivacyPage() {
  return <main className="section"><article className="container" style={{ maxWidth: 800 }}>
    <span className="eyebrow">Homun en Residencial Izamal</span><h1>Aviso de privacidad</h1>
    <p>Esta página no recopila ni almacena información personal en un servidor. El formulario prepara un mensaje en tu dispositivo y te dirige a WhatsApp para que decidas si lo envías.</p>
    <p>Al abrir WhatsApp, el tratamiento posterior de la información se rige por las condiciones y el aviso de privacidad de ese servicio.</p>
    <p><strong>Información pendiente:</strong> antes de publicar, el responsable del alojamiento debe completar y revisar los datos de identificación y contacto del responsable, así como los medios para ejercer derechos de privacidad que resulten aplicables.</p>
    <p>Contacto para consultas: <a href={`https://wa.me/${propertyConfig.booking.whatsappNumber}`}>{propertyConfig.booking.whatsappDisplayNumber}</a>.</p>
    <Link className="button button-outline" href="/">Volver al sitio</Link>
  </article></main>;
}
