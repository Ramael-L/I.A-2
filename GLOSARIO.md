# GLOSARIO DE TECNOLOGÍAS NUEVAS — I.A 2

**Alcance:** conceptos que aparecieron al crear Cocina Clara y al revisar RiwiMate, priorizando tecnologías que van más allá de los fundamentos de HTML, CSS, algoritmia y JavaScript vistos en RIWI. Las definiciones son introductorias; no implican que Ramael haya configurado todos los servicios por cuenta propia.

## APIs, datos externos y comunicación

**API (interfaz de programación de aplicaciones).** Reglas y rutas que permiten a un programa pedir datos o funciones a otro. Ejemplo: Cocina Clara solicita recetas a TheMealDB sin tener que crear una base propia de miles de platos.

**TheMealDB.** Servicio externo que devuelve fichas de recetas, ingredientes, preparación y fotografías. En Cocina Clara se consultan sus endpoints; no se descargó un catálogo fijo de cientos de recetas al ZIP.

**Endpoint o ruta API.** Dirección concreta que cumple una función. Ejemplo: `/api/recipes` en Cocina Clara devuelve recetas procesadas por nuestro servidor. Un servicio externo también tiene sus propios endpoints.

**HTTP y HTTPS.** Protocolos de comunicación entre navegador y servidor. HTTPS añade cifrado durante el transporte. `localhost` usa normalmente HTTP en desarrollo local; una web pública con cuentas debería utilizar HTTPS.

**Métodos GET y POST.** `GET` solicita información (por ejemplo, recetas); `POST` envía información o solicita una operación (por ejemplo, iniciar sesión o enviar una pregunta).

**Petición y respuesta (request/response).** Una petición contiene lo que el cliente solicita. La respuesta contiene datos y un código de estado, por ejemplo 200 (correcto), 401 (no autorizado) o 503 (servicio no disponible).

**JSON.** Formato de texto estructurado que transporta datos entre sistemas. Aunque se parece a un objeto JavaScript, llega como texto y se convierte a datos para trabajar con él. Ejemplo: nombre, ingredientes y foto de una receta.

**Fetch.** Interfaz para hacer solicitudes HTTP desde JavaScript; también está disponible en Node.js moderno. En el proyecto se usa para consultar rutas locales y servicios externos. Una respuesta fallida debe manejarse con mensajes adecuados.

**Servicio externo o proveedor.** Sistema operado por otra organización. Si deja de funcionar o cambia su información, nuestra aplicación puede verse afectada.

**Consumo de una API.** Proceso completo de enviar la solicitud, esperar la respuesta, convertir el JSON, validar los datos y presentarlos. Integrar una API no consiste solo en pegar una URL.

## Servidores y ejecución

**Frontend.** Parte que ve y utiliza la persona: página, botones, formularios, resultados y estados.

**Backend.** Código que se ejecuta en un servidor y gestiona tareas que no deben confiarse al navegador, como cuentas y claves privadas. En Cocina Clara su archivo principal es `server.js`.

**Node.js.** Entorno que permite ejecutar JavaScript fuera del navegador. Se utiliza para arrancar el servidor local de Cocina Clara.

**Servidor HTTP.** Programa que escucha solicitudes y devuelve archivos o datos. Cocina Clara usa `http.createServer` en Node.js.

**localhost.** Nombre que identifica el mismo computador donde se está ejecutando el servidor. `http://localhost:3107` no es una página pública accesible desde cualquier lugar.

**Puerto.** Número que distingue servicios de red dentro de un equipo. Por ejemplo, `3107` en `localhost:3107`. Si otro programa ocupa el puerto, el servidor puede mostrar `EADDRINUSE`.

**Hosting / despliegue (deploy).** Publicar una aplicación en un servidor accesible a otros usuarios. Ejecutarla en `localhost` es una prueba local y no constituye hosting público.

**npm y package.json.** npm gestiona paquetes de Node. El archivo `package.json` define información y comandos del proyecto, por ejemplo `npm start`, que en Cocina Clara ejecuta `node server.js`.

**Variable de entorno.** Configuración que el proceso lee fuera del código fuente. En Cocina Clara se utilizan `PORT`, `OPENAI_API_KEY` y `OPENAI_MODEL`.

**Archivo .env.example.** Plantilla que muestra los nombres de las variables que se deben configurar. No debe contener una clave real ni confundirse con un archivo `.env` privado.

## IA generativa y responsabilidad

**LLM (modelo grande de lenguaje).** Modelo entrenado para procesar y producir texto. A diferencia de una función que sigue reglas fijas, genera respuestas que deben verificarse.

**API de OpenAI.** Servicio que puede recibir preguntas desde el backend y devolver respuestas generadas por IA. La integración de Cocina Clara usa el endpoint Responses cuando existe una clave configurada.

**API key (clave de API).** Credencial secreta utilizada para autorizar solicitudes al proveedor. Debe permanecer en el servidor y nunca publicarse en GitHub ni en JavaScript visible en el navegador.

**Prompt e instrucciones del sistema.** Texto que orienta el comportamiento del modelo. Cocina Clara envía instrucciones para responder en español, utilizar información de recetas y reconocer límites.

**Contexto de la respuesta.** Datos que se entregan al modelo para fundamentar su respuesta. En Cocina Clara se proporciona información sobre recetas; eso no elimina por completo el riesgo de errores.

**Alucinación de IA.** Respuesta que suena convincente, pero incluye datos inventados o incorrectos. Por eso agregamos fuentes y advertencias en lugar de asumir que el modelo siempre acierta.

**Modelo de reglas / fallback.** Alternativa programada que funciona sin IA generativa cuando no hay clave o servicio. Debe etiquetarse como respuesta local, no como respuesta de IA.

**Sesgo.** Tendencia sistemática que puede favorecer ciertas respuestas o dejar otras de lado. En recetas, un catálogo internacional puede representar mejor unas culturas culinarias que otras.

**Explicabilidad y fuentes.** Explicar de dónde sale un dato y permitir que el usuario consulte su origen. En Cocina Clara se muestran enlaces a las fichas de recetas y se diferencia la respuesta de IA de la regla local.

**Consentimiento informado.** Permiso comprensible y específico que una persona da antes de determinadas acciones, como consultar un proveedor externo o guardar preferencias. No es lo mismo que dar acceso permanente a todos los datos.

## Cuentas, almacenamiento y seguridad

**SQLite.** Base de datos ligera que se guarda en un archivo local. Cocina Clara la usa para cuentas, sesiones y preferencias.

**Autenticación.** Comprobación de que alguien es quien afirma ser al iniciar sesión, normalmente con correo y contraseña.

**Sesión.** Forma de reconocer al usuario durante varias peticiones después del inicio de sesión, sin pedir su contraseña en cada acción.

**Cookie de sesión.** Dato pequeño que el navegador envía al servidor para mantener la sesión. El proyecto usa una cookie `cc_session` con `HttpOnly` y `SameSite=Lax`; la marca `Secure` se activa mediante configuración.

**Hash de contraseña y scrypt.** En lugar de guardar la contraseña en texto plano, el servidor obtiene un valor derivado con `scrypt` y una sal aleatoria para comprobarla posteriormente.

**Dato sensible.** Información que puede causar perjuicios si se utiliza o divulga incorrectamente. Cocina Clara trata las preferencias de alergias con consentimiento separado y limitaciones explícitas.

**localStorage.** Almacenamiento del navegador que permite guardar pequeñas preferencias en el dispositivo, por ejemplo tema y favoritos. No es adecuado para almacenar claves privadas.

**Validación y manejo de errores.** Comprobar entradas y respuestas antes de utilizarlas y explicar al usuario qué salió mal. Ejemplo: mostrar que no hay recetas disponibles, que falta consentimiento o que un servicio no responde.

**Pruebas automatizadas (tests).** Código que comprueba comportamientos esperados. Cocina Clara incluye archivos de prueba para catálogo, personalización y servidor, pero una prueba no sustituye la verificación en un entorno real.

## Tecnologías observadas en RiwiMate

**React.** Librería para construir interfaces mediante componentes reutilizables.

**TypeScript.** Lenguaje basado en JavaScript que agrega comprobaciones de tipos al desarrollar.

**Vite.** Herramienta para ejecutar el entorno de desarrollo y construir aplicaciones web.

**Lovable.** Herramienta de creación de aplicaciones utilizada en el prototipo original de RiwiMate.

**Componente UI.** Pieza reutilizable de una interfaz, como botones, diálogos o pestañas.

**Vitest.** Herramienta de pruebas utilizada en el proyecto de RiwiMate.

**Dependencias y conflictos de versiones.** Paquetes externos que un proyecto necesita para funcionar. Si no son compatibles, `npm install` puede fallar antes de iniciar la página.

---

## Mis ejemplos y dudas (para completar después)

**Tres tecnologías que entendí:**
1.
2.
3.

**Tres tecnologías que todavía debo practicar:**
1.
2.
3.

**Un ejemplo real de petición a una API:**

**Cómo explicaría la diferencia entre frontend y backend:**

**Cómo protegí una clave privada:**

**Qué mejoraría de Cocina Clara:**
