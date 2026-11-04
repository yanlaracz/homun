# Configuración de reservas con pago

El checkout en línea solo se activa con Stripe en modo real, calendario iCal conectado, base de datos y webhook configurados. La clave de prueba no habilita cobros públicos.

## Preparar la base de reservas

1. Crea un proyecto en Supabase.
2. En el SQL Editor, pega y ejecuta el archivo supabase/booking-schema.sql.
3. En Vercel, añade las variables de entorno de producción: SUPABASE_URL y SUPABASE_SECRET_KEY. Mantén la Secret API key privada y solo del lado del servidor.
4. Conserva AIRBNB_ICAL_URL en Vercel y vuelve a desplegar cuando cambies variables.

## Preparar Stripe

1. Crea una clave restringida con permiso para crear sesiones de Checkout. Guarda la clave en Vercel como STRIPE_SECRET_KEY; nunca la pegues en el chat ni en el código.
2. Configura un webhook de Stripe dirigido a https://homun-six.vercel.app/api/booking/webhook. Sus eventos son checkout.session.completed, checkout.session.async_payment_succeeded, checkout.session.expired y checkout.session.async_payment_failed.
3. Guarda el secreto de firma del webhook en Vercel como STRIPE_WEBHOOK_SECRET.
4. Usa primero las claves de prueba para validar el flujo. Para cobrar al público tendrás que sustituirlas por claves y secreto de webhook del modo real y verificar el perfil de Stripe.
5. Añade NEXT_PUBLIC_SITE_URL=https://homun-six.vercel.app en Vercel si el dominio público cambia.

## Cómo protege las fechas

La base guarda un bloqueo temporal mientras se paga y confirma una reserva solo tras el webhook de Stripe. Las noches de Airbnb se consultan desde su iCal al mostrar el calendario y antes de iniciar Checkout. Airbnb actualiza iCal periódicamente, no como un bloqueo instantáneo compartido; por eso las reservas de Airbnb todavía deben revisarse y bloquearse en el otro calendario manualmente.

El depósito de seguridad sigue cobrándose aparte, en efectivo o transferencia. El precio en línea cobra la estancia completa según las tarifas configuradas.


