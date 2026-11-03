# Homun en Residencial Izamal

Sitio informativo para consultas directas de disponibilidad por WhatsApp. Las consultas no crean ni confirman reservaciones automáticamente.

## Ejecutar localmente

Requiere Node.js 20.9 o posterior.

```bash
npm install
npm run dev
```

Abre http://localhost:3000. Para validar una compilación de producción, ejecuta `npm run lint`, `npm run typecheck` y `npm run build`; después puedes probarla con `npm start`.

## Publicar

1. Crea un repositorio privado o público en GitHub y sube estos archivos desde tu equipo.
2. Importa el repositorio en Vercel con la configuración automática de Next.js.
3. Cuando tengas dominio, agrégalo al proyecto de Vercel y configura los registros DNS que indique el panel.
4. Sustituye el dominio provisional del sitemap por el dominio definitivo en `src/app/sitemap.ts` y configura el canonical en metadatos.

El código está publicado en https://github.com/yanlaracz/homun. No se compraron servicios ni dominios.

## Antes de publicar

- Añade y autoriza las fotos reales descritas en `public/images/property/README.md`.
- Confirma discrepancias de capacidad entre este brief (6) y el anuncio enlazado (Airbnb indica 5 al consultarlo).
- Confirma la distribución de baños, detalles del acceso y amenidades, horarios, política de cancelación y admisión de niños.
- Completa los datos del responsable en el aviso de privacidad.
- Cambia `https://example.com` en el sitemap y establece el dominio canonical.
- Confirma que el número de WhatsApp sea el canal adecuado y esté operativo.

## Características

- Página responsive en español con selector de idioma ES/EN.
- Formulario validado en el cliente que prepara un mensaje para WhatsApp.
- Galería con ampliación, textos alternativos y marcadores cuando faltan fotos.
- Metadatos, Open Graph, sitemap, robots, manifest y favicon.
- Contenido sin coordenadas exactas, datos de acceso, precios, disponibilidad, reseñas ni políticas inventadas.
