"use client";

import Image from "next/image";
import { useState } from "react";
import { galleryItems, propertyConfig } from "@/config/property";

export function Gallery() {
  const [active, setActive] = useState<number | null>(null);
  const [missing, setMissing] = useState<Record<number, boolean>>({});
  return <>
    <div className="gallery-grid">
      {galleryItems.map((item, index) => <div className="gallery-card" key={item.src}>
        {missing[index] ? <div className="image-placeholder"><div><div className="placeholder-mark">H</div><strong>Fotografía pendiente</strong><br /><small>{item.label}</small></div></div> : <Image src={`${propertyConfig.media.directory}${item.src}`} alt={item.alt} fill sizes="(max-width:700px) 100vw, 40vw" priority={index === 0} onError={() => setMissing((current) => ({ ...current, [index]: true }))} />}
        <button aria-label={`Ampliar fotografía: ${item.label}`} onClick={() => setActive(index)} />
        <span className="gallery-label">{item.label}</span>
      </div>)}
    </div>
    <p className="gallery-help">Fotos mejoradas digitalmente a partir de las imágenes del alojamiento; la luz, el color y algunos detalles pueden diferir de la escena original.</p>
    {active !== null && <div className="lightbox" role="dialog" aria-modal="true" aria-label={`Fotografía: ${galleryItems[active].label}`} onClick={() => setActive(null)} onKeyDown={(event) => { if (event.key === "Escape") setActive(null); }}>
      <div className="lightbox-content" onClick={(event) => event.stopPropagation()}>
        <button className="lightbox-close" onClick={() => setActive(null)} aria-label="Cerrar fotografía">×</button>
        {missing[active] ? <div className="image-placeholder"><strong>Fotografía pendiente: {galleryItems[active].label}</strong></div> : <Image src={`${propertyConfig.media.directory}${galleryItems[active].src}`} alt={galleryItems[active].alt} fill sizes="90vw" onError={() => setMissing((current) => ({ ...current, [active]: true }))} />}
        <span className="lightbox-caption">{galleryItems[active].label}</span>
      </div>
    </div>}
  </>;
}
