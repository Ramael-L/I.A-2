# Cocina Clara — Catálogo y recomendaciones personalizadas

## Ejecutar

Desde **esta carpeta** (debe contener `package.json`):

```bash
PORT=3107 npm start
```

Abrir http://localhost:3107. Si el puerto está ocupado, usar `PORT=3111 npm start`.

## Recetas y fotografías

La aplicación consulta automáticamente las 26 letras del catálogo de **TheMealDB** tras autorizar la conexión externa. TheMealDB publica varios centenares de fichas con fotografía, lista de ingredientes, preparación y URL de origen. **No hay 200 recetas completas incluidas físicamente en el ZIP**: los datos se cargan en vivo, y su número depende de la disponibilidad de la API. La página muestra el recuento real. No presenta recetas inventadas ni atribuye imágenes a platos incorrectos.

Fuente y documentación: https://www.themealdb.com/docs_api_guide.php

## Cuentas y preferencias

Se guardan nombre, correo, contraseña cifrada mediante derivación `scrypt`, fecha de aceptación y, opcionalmente, gustos alimentarios. Si marcas consentimiento separado, se guardan categorías de alergias en SQLite local (`data/cuentas.sqlite`). Puedes borrar alergias desmarcando el consentimiento y guardando, o eliminar tu cuenta. **No se envían alergias a TheMealDB ni al proveedor de IA**. No registramos el historial de consultas.

**Importante: demo educativa, no plataforma médica.** El filtro descarta platos cuando los ingredientes declarados coinciden con alergias seleccionadas. También descarta platos con ingredientes ambiguos o ausentes si se han registrado alergias. No reconoce todas las trazas, ingredientes ocultos, cambios de producto ni contaminación cruzada: nunca certifica que un plato sea seguro. Revisa siempre el origen y consulta a un profesional ante alergias graves.

## IA

El asistente solo usa OpenAI si se configura `OPENAI_API_KEY` en el entorno del servidor. Nunca escribas la clave en el navegador ni la subas a GitHub. En ausencia de clave, solo funciona el asistente de reglas, con fuentes.

## Pruebas

```bash
node --test tests/*.test.js
```

## Transparencia

Catálogo externo con fotografías del proveedor. No se han descargado fotos ni copiado cientos de recetas dentro del ZIP porque el entorno de construcción no tenía acceso directo para descargar el catálogo completo. **El objetivo de 200 o más recetas se cumple únicamente cuando TheMealDB responde con suficientes fichas.**

# Cocina Clara Final · Catálogo automático, fotografías reales, cuentas e IA responsable

Proyecto educativo para RIWI basado en Cocina Clara 4.0. HTML, CSS, JavaScript, Node.js y SQLite incluido en Node 22.

## Empezar

1. Abre una terminal **en la carpeta que contiene `package.json`**.
2. Comprueba `node -v` (se necesita Node 22.5 o superior).
3. Ejecuta `PORT=3001 npm start` si el puerto 3000 está ocupado, o `npm start` en otro caso.
4. Abre `http://localhost:3001` (o `http://localhost:3000`). **No uses Live Server**, pues las rutas API necesitan Node.
5. Prueba «Mi cuenta» → Crear cuenta. Acepta los términos y usa correo de prueba, no una contraseña reutilizada.
6. Para cargar el catálogo actualizado, activa el permiso **Búsquedas de recetas externas** en Privacidad. Las recetas con fotografías reales aparecerán **automáticamente**. Es posible cargar más (páginas agrupadas por letras del alfabeto), volver a actualizar y buscar por nombre o ingrediente. Los datos se consultan a TheMealDB cada vez que visitas el sitio con consentimiento; sin conexión se mantienen las guías locales. Algunas recetas están en inglés.

## Activar la IA generativa

Crea una variable de entorno `OPENAI_API_KEY` **en el servidor**, no en el HTML. Ejemplo temporal en la terminal: `export OPENAI_API_KEY="tu_clave_privada"` y después `PORT=3001 npm start`. La clave no se incluye ni se puede compartir en GitHub. Esta integración usa el endpoint Responses de OpenAI y requiere conexión, una cuenta de API activa y saldo/cuota disponible. En Privacidad se activa cada permiso por separado. Si no hay clave se muestra un asistente de reglas locales claramente identificado como **no IA**.

## Dónde están los datos

`data/cuentas.sqlite` se crea cuando alguien usa cuentas. Contiene nombre, correo, hash de contraseña y sesiones, no texto de contraseña ni historial de preguntas. `data/` está en `.gitignore`. Borra cuentas desde Mi cuenta > Eliminar mi cuenta. En producción exige HTTPS, políticas legales, protección reforzada y gestión de contraseñas. SQLite usa la API integrada experimental de Node 22 (puede aparecer un aviso de Node; no es un error).

## Criterios éticos

- Privacidad: política con finalidad y datos tratados; las cuentas requieren aceptación.
- Consentimiento: IA y API de recetas solo con autorización específica; favoritos/tema opcionales.
- Transparencia: respuestas etiquetadas como reglas o IA; las fuentes externas se muestran.
- Sesgos: advertencia sobre recetas internacionales y diferencias culturales.
- Errores honestos: estados surgen en consultas reales, no hay simulador.
- Ayuda humana: derivación explicativa para preguntas delicadas, no servicio humano conectado.

## Limitaciones

No existe IA activa sin una clave configurada; las búsquedas de TheMealDB dependen de internet y el proveedor. El buscador local continúa disponible. La aplicación no traduce automáticamente recetas externas en inglés. El indicador verde solo expresa el estado de red reportado por el navegador, no garantiza disponibilidad de servicios externos. Las imágenes remotas corresponden a fichas reales del proveedor; verifica los derechos antes de uso comercial.

## Pruebas

`npm test` para la lógica del servidor. Las pruebas del agente utilizan servicios simulados: para la conexión en vivo se necesita una clave y red.

## Imágenes, Google y actualización automática

Las fotos reales **no se descargan de Google Imágenes**: esa búsqueda no ofrece URLs de uso libre y fiable sin configurar la **Google Programmable Search API** y revisar las licencias de cada fotografía. En esta versión, la app muestra las imágenes oficiales incluidas en las fichas de TheMealDB. **No es necesario añadir claves ni realizar búsquedas manuales**.

El endpoint `GET /api/catalog?page=0` consulta TheMealDB por dos letras del alfabeto en cada página; el botón «Cargar más recetas» continúa con la siguiente pareja, hasta completar A–Z. La página 0 se actualiza automáticamente al entrar si existe consentimiento. «Actualizar catálogo» vuelve a consultar la fuente. No es una base de datos infinita y los nuevos platos dependen de que el proveedor los publique. No hay descargas ni scraping de Google.

Si la búsqueda no devuelve resultados en español, intenta el ingrediente en inglés (por ejemplo, `rice`, `chicken`, `pasta`). Los textos de las fichas externas podrían estar en inglés.

## Puertos ocupados en un equipo de RIWI

Desde la carpeta que contiene `package.json` prueba `PORT=3107 npm start`; si ese puerto también está ocupado, usa otro puerto libre como `3207` o consulta el proceso con `ss -ltnp | grep :3107`. No cierres procesos ajenos. Si trabajas en un equipo remoto, `localhost` se refiere al equipo que ejecuta Node.
