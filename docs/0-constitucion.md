# Constitución del proyecto — INVACIÓN SENA

**Versión:** 1.1  
**Estado:** Aprobada  
**Método:** SEDD / Spec-Driven Development  
**Proyecto:** INVACIÓN SENA (Shooter 2D Web)

---

## 1. Propósito

Este documento establece los principios no negociables que gobiernan el diseño, la arquitectura, el flujo narrativo y la implementación técnica de **INVACIÓN SENA**, un shooter 2D enfocado en sobrevivir a oleadas de aprendices zombi en las instalaciones del SENA.

Toda especificación, plan técnico, lista de tareas e incremento de código debe ser estritamente coherente con esta constitución. En caso de conflicto entre documentos o código, prevalece la constitución.

---

## 2. Principios del Proyecto

1. **La especificación manda (SEDD).** Ningún cambio de mecánica, escena narrativa o balance de juego se implementará sin antes actualizar `1-specs.md` y sus criterios de aceptación.
2. **Ejecución 100% Web sin fricción.** El juego debe ejecutarse directamente en el navegador (HTML5 / WebGL / Canvas) a 60 FPS estables sin requerir instalaciones ni dependencias externas en tiempo de ejecución.
3. **Preservación narrativa de 4 Escenas.** La progresión del juego debe cumplir estrictamente las 4 escenas principales:
   - *Escena 1:* Ambiente de programación + ataque con teclado.
   - *Escena 2:* Salida del salón, obtención del hacha en gabinete de incendios y primer combate.
   - *Escena 3:* Supervivencia de 10 oleadas hasta el rescate en helicóptero por el Sr. Rodolfo Martínez Tono.
   - *Escena 4:* Créditos (reconocimiento a Diego Alejandro Zamora), Himno del SENA y fundido a negro.
4. **Arquitectura modular por Sprints.** El desarrollo se dividirá en sprints atómicos con entregables mínimos funcionales e independientes.
5. **Simplicidad en el estado del juego.** El loop principal debe ser predecible, desacoplando la lógica de actualización (*update*) del renderizado gráfico (*draw*) mediante un *fixed timestep*.
6. **Soporte de Jugadores Escalable.** El núcleo del código debe diseñarse para 1 Jugador (*Single Player*) desde la base, pero con arquitectura apta para extenderse a 2 Jugadores (*Local Co-op*).
7. **Control de Assets Asíncrono.** El motor de juego debe permitir sustituir *placeholders* temporales por *assets* finales (sprites, audio, fuentes) a medida que sean creados sin romper la lógica del juego.
8. **Puertas de Aprobación Humana.** No se avanza de sprint ni de fase sin revisión y aprobación explícita.

---

## 3. Definición de Hecho (DoD)

Una tarea o sprint se considera terminado cuando:

- [ ] El código implementa el requisito narrativo o de mecánica asignado.
- [ ] Mantiene un rendimiento continuo de 60 FPS en navegador web.
- [ ] No genera excepciones ni errores en la consola del navegador.
- [ ] Es completamente jugable mediante teclado/mouse.
- [ ] Los criterios de aceptación Gherkin asociados en la spec están verificados.
- [ ] La documentación del proyecto (`1-specs.md`, `2-plan.md`, `3-tasks.md`, `4-traceability.md`) está actualizada.
- [ ] La matriz de trazabilidad vincula el requisito con una tarea y una evidencia de verificación.

---

## 4. Puertas de Aprobación

| Puerta | Qué se revisa | Estado |
|---|---|---|
| **G1 — Especificación** | Alcance funcional, historia por escenas, personajes, RF, RN y RNF | En curso (`1-specs.md`) |
| **G2 — Plan Técnico** | Arquitectura WebGL/Canvas, ciclo de juego, máquinas de estado y sprints | Pendiente |
| **G3 — Sprints de Código** | Entregables atómicos de cada Sprint (I1 - I N) | Pendiente |
| **G4 — Convergencia y Créditos** | Escena 4 verificada, créditos a Diego Alejandro Zamora e Himno del SENA | Pendiente |

---

## 5. Convenciones

- **Requisitos:** `RF-xx` (Funcionales), `RNF-xx` (No Funcionales), `RN-xx` (Reglas de Negocio/Juego), `US-xx` (Historias de Usuario/Jugador).
- **Tareas:** `T-xxx`.
- **Personajes Seleccionables:** `Zamora`, `Chantre`, `Juan`, `Daiver`.
- **Enemigos:** Zombis Aprendices SENA (variantes según sprint).
- **Rescatista:** Señor Rodolfo Martínez Tono.
- **Autor Principal:** Diego Alejandro Zamora.
- **Idioma del código y UI:** Comentarios y variables en inglés/español claro; textos de interfaz, historia y diálogos en español.

---

## 6. Glosario del Proyecto

| Término | Definición |
|---|---|
| **Ambiente** | Salón de clase de programación dentro del centro de formación SENA. |
| **Zombi Aprendiz** | Estudiante infectado que actúa como enemigo principal dentro del juego. |
| **Gabinete de Incendios** | Estación donde el jugador obtiene la primera arma de combate cuerpo a cuerpo (Hacha). |
| **Rodolfo Martínez Tono** | Personaje clave que llega en helicóptero al completar la Oleada 10 para rescatar al jugador. |
| **Himno del SENA** | Composición musical que suena durante la pantalla final de créditos (Escena 4). |
| **Fixed Timestep** | Patrón de actualización de físicas e IA a ritmo constante e independiente de los FPS de renderizado. |

---

## 7. Control de Cambios

Cualquier cambio de historia, diseño de personajes o adición de mecánicas debe:
1. Registrarse en `1-specs.md`.
2. Actualizar el plan técnico en `2-plan.md`.
3. Desglosarse en tareas atómicas en `3-tasks.md`.
4. Reflejarse en la matriz de `4-traceability.md`.

## 8. Flujo obligatorio SEDD

La fuente de verdad es esta cadena, en este orden: **constitución → especificación → plan → tareas → código/pruebas → trazabilidad**.

Para cada cambio, el agente debe:

1. Leer esta constitución y la especificación antes de proponer o modificar código.
2. Añadir o ajustar el requisito, regla o criterio de aceptación en `1-specs.md`.
3. Decidir y documentar el enfoque técnico en `2-plan.md` si afecta arquitectura, dependencias, datos o rendimiento.
4. Crear tareas pequeñas y verificables en `3-tasks.md`; cada una debe tener un único resultado observable.
5. Implementar solamente tareas aprobadas y marcar una tarea como completada solo con evidencia reproducible.
6. Actualizar `4-traceability.md` con requisito, tarea, módulo y evidencia (prueba manual, automatizada o medición).

No se permite declarar un requisito completado solo porque exista código: debe tener criterio de aceptación, tarea vinculada y evidencia. Los elementos opcionales se etiquetan explícitamente como opcionales y no bloquean la salida de un sprint.

## 9. Estado y evidencia

- Estados permitidos: `Pendiente`, `En curso`, `Bloqueado`, `En revisión`, `Completado`.
- Una tarea `Completada` debe incluir, en `3-tasks.md` o `4-traceability.md`, la referencia a la evidencia de verificación.
- Los cambios de alcance deben registrar fecha, motivo e impacto en requisitos, plan y tareas en una sección **Registro de cambios** del documento afectado.
