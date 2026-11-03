"use client";

import { useState } from "react";
import { propertyConfig } from "@/config/property";

const links = [{ href: "#alojamiento", es: "Alojamiento", en: "The apartment" }, { href: "#amenidades", es: "Amenidades", en: "Amenities" }, { href: "#ubicacion", es: "Ubicación", en: "Location" }, { href: "#faq", es: "Preguntas frecuentes", en: "FAQ" }];
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [english, setEnglish] = useState(false);
  function switchLanguage() {
    const next = !english;
    setEnglish(next);
    document.documentElement.lang = next ? "en" : "es";
    document.dispatchEvent(new CustomEvent("homun-language", { detail: next ? "en" : "es" }));
  }
  const cta = english ? "Check dates" : "Consultar disponibilidad";
  return <header className="header"><div className="container nav">
    <a className="brand" href="#inicio" aria-label="Homun, inicio">HOMUN</a>
    <nav className="navlinks" aria-label={english ? "Main navigation" : "Navegación principal"}>{links.map((link) => <a key={link.href} href={link.href}>{english ? link.en : link.es}</a>)}</nav>
    <div className="nav-actions"><button className="lang" onClick={switchLanguage} aria-label={english ? "Cambiar idioma a español" : "Switch language to English"}>{english ? "EN" : "ES"}⌄</button><a className="button" href="#consulta">{cta}</a></div>
    <button className="mobile-toggle" aria-label={open ? "Cerrar menú" : "Abrir menú"} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? "×" : "☰"}</button>
    {open && <nav className="mobile-menu" aria-label="Navegación móvil">{links.map((link) => <a key={link.href} href={link.href} onClick={() => setOpen(false)}>{english ? link.en : link.es}</a>)}<a className="button" href="#consulta" onClick={() => setOpen(false)}>{cta}</a></nav>}
  </div></header>;
}
