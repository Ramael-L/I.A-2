# I.A 2 — Proyectos de Inteligencia Artificial

> **Estado de la entrega:** README, BITACORA y script de subida publicados. Los directorios `CocinaClara/`, `RiwiMate/` y el ZIP en `entregables/` todavía deben incorporarse desde el paquete de entrega; no están publicados en GitHub. Se incluyen en el ZIP preparado para el equipo.


Repositorio de actividades de Inteligencia Artificial en RIWI.

## Célula
- Tatiana
- Juan Tejada
- Cristian Benítez
- Ramael González

## Proyectos
**Cocina Clara** (`CocinaClara/`): prototipo de búsqueda de recetas, consumo de TheMealDB, cuentas con SQLite, preferencias, recomendaciones por reglas y un asistente preparado para integrar IA generativa.

**RiwiMate** (`RiwiMate/`): prototipo de asistente académico con chat, estados de carga y error, fuentes, consentimiento, perfil de estudiante y posibilidad de conectar IA externa.

El ZIP original de RiwiMate se conserva en `entregables/RiwiMate_Funciones_IA_Responsable.zip`.

## Conocimientos nuevos
- **APIs y JSON:** consultar servicios externos e interpretar sus respuestas.
- **Frontend y backend:** diferenciar la interfaz web del servidor Node.js.
- **IA y LLM:** conectar un modelo mediante API y proteger su clave.
- **Privacidad y consentimiento:** explicar el uso de datos y pedir permiso antes de almacenarlos o enviarlos.
- **Sesgos y límites:** reconocer recomendaciones incompletas, errores y riesgos.
- **Explicabilidad:** mostrar fuentes para que el usuario verifique respuestas.
- **Divulgación:** identificar respuestas generadas por IA frente a respuestas programadas.
- **Bases de datos:** utilizar SQLite para almacenar cuentas y preferencias.
- **Seguridad:** no subir claves privadas y utilizar hashes de contraseñas.
- **Git/GitHub:** organizar entregables y registrar avances.

## Ejecución
Cocina Clara (Node.js 22+):
```bash
cd CocinaClara
PORT=3107 npm start
```
RiwiMate:
```bash
cd RiwiMate
npm install
npm run dev:full
```

> Son prototipos educativos. Las recetas externas y la IA requieren acceso a servicios; la IA generativa necesita una clave propia. Las fechas académicas de ejemplo no son datos reales de Moodle. No subas archivos .env ni bases de datos personales.

## Bitácora
Ver [BITACORA.md](BITACORA.md). La plantilla se dejó deliberadamente sin completar.
