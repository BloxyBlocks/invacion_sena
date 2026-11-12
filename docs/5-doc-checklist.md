# Checklist de cierre documental — INVACIÓN SENA

**Versión:** 1.6  
**Estado:** Activo  
**Depende de:** `docs/0-constitucion.md`, `docs/1-specs.md`, `docs/2-plan.md`, `docs/3-tasks.md`, `docs/4-traceability.md`  
**Propósito:** Reducir la dependencia de revisión manual mediante un checklist explícito y una validación automática de la estructura documental.

---

## 1. Cuándo usar este checklist

Antes de:

- Marcar una tarea como `[x]` en `docs/3-tasks.md`.
- Cerrar un sprint.
- Cambiar requisitos, arquitectura, dependencias, tareas o trazabilidad.
- Aprobar una puerta G1–G4.
- Hacer un commit que afecte la documentación.

La validación automática detecta errores estructurales, pero **no sustituye** la revisión de criterios Gherkin, balance de juego, rendimiento ni calidad de la evidencia.

---

## 2. Checklist mínimo

### Requisito

- [ ] El cambio está identificado con un ID `RF-xx`, `RN-xx` o `RNF-xx` en `docs/1-specs.md`.
- [ ] El criterio de aceptación es observable y verificable.
- [ ] Si el requisito es opcional, está marcado explícitamente como **Opcional** y no bloquea la salida del sprint.
- [ ] No se agregaron escenas, personajes, armas o mecánicas fuera de la especificación.

### Plan técnico

- [ ] `docs/2-plan.md` describe el enfoque si el cambio afecta arquitectura, dependencias, datos o rendimiento.
- [ ] La decisión es coherente con `docs/0-constitucion.md`.
- [ ] Si se cambia de tecnología, existe una medición o justificación registrada.

### Tarea

- [ ] Existe una tarea `T-xxx` pequeña y con un único resultado observable.
- [ ] La tarea pertenece a un sprint en `docs/3-tasks.md`.
- [ ] El checkbox coincide con el estado real: `[ ]` Pendiente, `[~]` En curso, `[x]` Completado.
- [ ] La tarea no mezcla implementación, balance y documentación en un solo entregable.

### Evidencia

- [ ] Hay evidencia reproducible: pasos manuales, prueba automatizada, captura, video o medición.
- [ ] Para rendimiento: navegador, equipo, duración y FPS mínimo/promedio.
- [ ] Para audio: reproducción correcta después de un gesto del usuario.
- [ ] Para Gherkin: pasos manuales o prueba que cubra el escenario.
- [ ] La evidencia está enlazada desde `docs/3-tasks.md` o `docs/4-traceability.md`.

### Trazabilidad

- [ ] `docs/4-traceability.md` vincula requisito → módulo → tarea → criterio → estado.
- [ ] El estado es uno de: `Pendiente`, `En curso`, `Bloqueado`, `En revisión`, `Completado`.
- [ ] No hay requisitos ni tareas huérfanas.
- [ ] Las tareas de soporte sin requisito funcional directo están justificadas.

### Documentación

- [ ] `README.md` está actualizado si cambió la estructura o el flujo de trabajo.
- [ ] El cambio tiene fecha, motivo e impacto en el registro de cambios del documento afectado.
- [ ] `npm run docs:check` termina sin errores.
- [ ] Las advertencias y avisos se revisaron y, si aplica, se justificaron.

---

## 3. Validación automática

```bash
npm run docs:check
```

Modo estricto, para integración continua o cierre de sprint:

```bash
npm run docs:check:strict
```

El script `scripts/check-docs.mjs` verifica:

- Que los IDs `RF-xx`, `RN-xx` y `RNF-xx` de `docs/1-specs.md` existan en `docs/4-traceability.md` y viceversa.
- Que las tareas `T-xxx` referenciadas en la trazabilidad existan en `docs/3-tasks.md`.
- Que los estados de la matriz sean permitidos.
- Que cada fila de trazabilidad tenga una tarea asociada.
- Que README, plan, trazabilidad y este checklist enlacen la validación.
- Avisos sobre tareas definidas que aún no se referencian en la trazabilidad.

El script **no** verifica:

- Que el criterio Gherkin se cumpla.
- Que el rendimiento sea de 60 FPS.
- Que los assets existan o tengan licencia.
- Que el balance de juego sea correcto.
- Que la evidencia sea suficiente o verdadera.

---

## 4. Evidencia de cierre

Registrar cada ejecución relevante:

| Fecha | Tarea / Sprint | Validación | Resultado | Responsable |
|---|---|---|---|---|
| 2026-11-08 | T-110 / I1 | `npm run docs:check` | 0 errores, 0 advertencias, 3 avisos (T-107, T-301, T-306) | Diego Alejandro Zamora |
| 2026-11-08 | I1 (T-101 a T-109, T-111) | `npm run docs:check` | 0 errores, 0 advertencias, 0 avisos | Diego Alejandro Zamora |
| 2026-11-08 | I1 (T-101 a T-109, T-111) | `npm run build` | Compilación correcta: 20 módulos, salida en `dist/` | Diego Alejandro Zamora |
| 2026-11-08 | I1 (verificación funcional) | Chrome headless + CDP | 60 FPS, 0 errores de consola, assets listos, audio desbloqueado | Diego Alejandro Zamora |
| 2026-11-08 | I2 (T-201 a T-205) | `npm run docs:check` y `npm run docs:check:strict` | 0 errores, 0 advertencias, 0 avisos | Diego Alejandro Zamora |
| 2026-11-08 | I2 (T-201 a T-205) | `npm run build` | Compilación correcta: 23 módulos, salida en `dist/` | Diego Alejandro Zamora |
| 2026-11-08 | I2 (verificación funcional) | Chrome headless + CDP | 60 FPS, 0 errores de consola, flujo completo hasta el cierre de I2 | Diego Alejandro Zamora |
| 2026-11-08 | Assets (T-206, T-207) | `npm run docs:check` y `npm run docs:check:strict` | 0 errores, 0 advertencias, 0 avisos | Diego Alejandro Zamora |
| 2026-11-08 | Assets (T-206, T-207) | `npm run build` | Compilación correcta: 29 módulos y 5 imágenes emitidas en `dist/assets/` | Diego Alejandro Zamora |
| 2026-11-08 | Assets (verificación funcional) | Chrome headless + CDP | 5/5 PNG cargados, 4 vistas de Zamora, 60 FPS, 0 errores de consola | Diego Alejandro Zamora |
| 2026-11-08 | Audio (T-208, T-209) | `npm run docs:check` y `npm run docs:check:strict` | 0 errores, 0 advertencias, 0 avisos | Diego Alejandro Zamora |
| 2026-11-08 | Audio (T-208, T-209) | `npm run build` | Compilación correcta: 33 módulos y 4 MP3 emitidos en `dist/assets/` | Diego Alejandro Zamora |
| 2026-11-08 | Audio (verificación funcional) | Chrome headless + CDP | 9/9 assets, música por situación, pasos con 4 personajes, mute, 60 FPS, 0 errores de consola | Diego Alejandro Zamora |
| 2026-11-09 | Visual (T-210, T-211, T-212) | `npm run docs:check` y `npm run docs:check:strict` | 0 errores, 0 advertencias, 0 avisos | Diego Alejandro Zamora |
| 2026-11-09 | Visual (T-210, T-211, T-212) | `npm run build` | Compilación correcta: 49 módulos; 20 PNG + 4 MP3 emitidos en `dist/assets/` | Diego Alejandro Zamora |
| 2026-11-09 | Visual (verificación funcional) | Chrome headless + CDP | 24/24 assets, 4 retratos, 4 vistas × 4 personajes, texturas en Escena 1 y prueba, ≈144 FPS, 0 errores de consola | Diego Alejandro Zamora |
| 2026-11-11 | I3 (T-301 a T-307) | `npm run docs:check` y `npm run docs:check:strict` | 0 errores, 0 advertencias, 0 avisos | Diego Alejandro Zamora |
| 2026-11-11 | I3 (T-301 a T-307) | `npm run build` | Compilación correcta: 53 módulos; 20 PNG + 4 MP3 emitidos en `dist/assets/` | Diego Alejandro Zamora |
| 2026-11-11 | I3 (verificación funcional) | Chrome headless 157 + CDP | 15/15 comprobaciones, 3 golpes sostenidos, hacha, oleada de 6 eliminada, 3 cinemáticas, Game Over → Escena 2, ≈58 FPS, 0 errores de consola | Diego Alejandro Zamora |
| 2026-11-11 | Escena 1 — nueva historia (T-213) | `npm run docs:check` y `npm run docs:check:strict` | 0 errores, 0 advertencias, 0 avisos | Diego Alejandro Zamora |
| 2026-11-11 | Escena 1 — nueva historia (T-213) | `npm run build` | Compilación correcta: 53 módulos; 20 PNG + 4 MP3 emitidos en `dist/assets/` | Diego Alejandro Zamora |
| 2026-11-11 | Escena 1 — nueva historia (T-213) | Chrome headless 157 + CDP | 18/18 comprobaciones: llegada, 3 compañeros, instructor, SOLID, «2 HORAS DESPUÉS...», salida, grito, reacción, irrupción, teclazo y salida; 60 FPS, 0 errores de consola | Diego Alejandro Zamora |

En la primera ejecución, los 3 avisos correspondían a tareas de soporte aún no referenciadas en la matriz. Se enlazaron `T-107` con `RN-03` y `T-301`/`T-306` con `RF-04`; la validación posterior quedó sin avisos. La evidencia funcional de I1 está en `docs/evidence/i1/`.

---

## 5. Registro de cambios

| Fecha | Cambio | Motivo | Impacto |
|---|---|---|---|
| 2026-11-08 | Creación del checklist de cierre documental. | Reducir la dependencia de revisión manual y estandarizar el cierre de tareas. | No cambia requisitos de juego; agrega un control de proceso. |
| 2026-11-08 | Se agrega la evidencia de I1 y se actualiza el resultado de validación. | Registrar el cierre técnico del sprint y dejar el estado sin avisos. | I1 queda implementado y pendiente de aprobación G3; se enlazan T-107, T-301 y T-306. |
| 2026-11-08 | Se agrega la evidencia de I2. | Registrar el cierre técnico de la Escena 1. | I2 queda implementado y pendiente de aprobación G3; el pasillo se difiere a I3. |
| 2026-11-08 | Se agrega la evidencia de integración de assets. | Registrar el cierre técnico de T-206 y T-207. | El logo y los sprites de estado quieto de Zamora quedan verificados; las animaciones siguen pendientes. |
| 2026-11-08 | Se agrega la evidencia de audio contextual. | Registrar el cierre técnico de T-208 y T-209. | La música por situación y los pasos de los cuatro personajes quedan verificados; el audio requiere un primer gesto. |
| 2026-11-09 | Se agrega la evidencia de integración visual. | Registrar el cierre técnico de T-210, T-211 y T-212. | Fondo del menú, skins de los cuatro personajes y texturas de los entornos quedan verificados; las animaciones siguen pendientes. |
| 2026-11-11 | Se agrega la evidencia del Sprint I3. | Registrar el cierre técnico de T-301 a T-307. | Pasillo, gabinete de 3 golpes sostenidos, Hacha de Incendios, combate Melee, oleada de 6 zombis y tres cinemáticas quedan verificados; el gestor de 10 oleadas sigue pendiente en I4. |
| 2026-11-11 | Se agrega la evidencia de la nueva historia de la Escena 1. | Registrar el cierre técnico de T-213. | Llegada, clase de SOLID, salto temporal, salida del grupo, grito, reacción e irrupción quedan verificados junto con el teclazo; 18/18 comprobaciones. |
