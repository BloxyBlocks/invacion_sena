# Matriz de trazabilidad — INVACIÓN SENA

**Versión:** 1.8  
**Estado:** En revisión (G1/G2)  
**Depende de:** `1-specs.md`, `2-plan.md`, `3-tasks.md`  
**Autor Principal:** Diego Alejandro Zamora  

**Regla SEDD:** Ningún requisito o escena narrativa se da por completada sin estar vinculado a su módulo principal, tarea atómica y criterio de verificación.

---

## 1. Mapeo de Requisitos Funcionales (RF)

| Requisito | Descripción | Módulo Principal | Tarea | Criterio / Escenario de Verificación | Estado |
|---|---|---|---|---|---|
| **RF-01** | Menú Principal y Selección de Personaje | `src/scenes/MenuScene.js`, `src/core/AssetManifest.js` | T-105, T-108, T-206, T-208 | Selección funcional entre Zamora, Chantre, Juan y Daiver; logo oficial y retrato de Zamora; música `fondo_menu`; inicio de juego y configuración de sonido. | Completado |
| **RF-02** | Cinemática Escena 1 | `src/scenes/Scene1Ambiente.js`, `src/entities/Zombie.js`, `src/entities/KeyboardProjectile.js`, `src/ui/CutsceneOverlay.js`, `src/core/AudioManager.js` | T-201, T-202, T-203, T-204, T-205, T-208, T-213 | Salón con compañeros e instructor en sus puestos; llegada del jugador a su puesto; clase de SOLID; salto temporal «2 HORAS DESPUÉS...»; salida del grupo con cierre de puerta; grito y reacción «¡¿Qué fue esoo?!»; irrupción del zombi y teclazo contextual. `ambiente_tranquilo` durante la clase y `ambiente_horror` desde la irrupción. | Completado |
| **RF-03** | Movimiento en 8 direcciones y apuntado 360° | `src/core/InputManager.js`, `src/entities/Player.js` | T-103, T-106, T-207, T-209 | Desplazamiento fluido en 8 direcciones, colisiones con el mapa, apuntado con ratón, sprite de estado quieto según la dirección y pasos en bucle para los cuatro personajes mientras se desplazan. | Completado |
| **RF-04** | Interacción con Gabinete de Incendios | `src/scenes/Scene2Pasillo.js`, `src/entities/Weapon.js`, `src/ui/CutsceneOverlay.js` | T-301, T-302, T-303, T-306, T-307 | Pasillo diseñado; mantener `E` frente a la bomba ejecuta 3 golpes (0.55 s cada uno) y rompe el gabinete; una segunda pulsación equipa el Hacha de Incendios con cinemática, la cual inicia la oleada; la puerta de salida conecta con el patio. | Completado |
| **RF-05** | Sistema de Ataque Melee (Hacha) | `src/systems/CombatSystem.js`, `src/entities/Zombie.js` | T-304, T-305 | Arco de ataque en 360° siguiendo la dirección del ratón, daño verificable al zombi, reacción a impactos y eliminación de la oleada de pasillo. | Completado |
| **RF-06** | Drops de Armas de Fuego | `src/systems/CombatSystem.js` | T-405 | Generación de drops tras eliminar enemigos en oleadas avanzadas. | Pendiente |
| **RF-07** | Gestor de 10 Oleadas | `src/systems/WaveManager.js` | T-401, T-402, T-403 | Conteo e incremento de dificultad de la oleada 1 a la 10 en la Helisuperficie. | Pendiente |
| **RF-08** | Evento de Rescate (Rodolfo M. T.) | `src/scenes/Scene3Helipuesto.js` | T-501, T-502, T-503, T-504 | Llegada del helicóptero, señal de abordaje y zona de extracción tras la Oleada 10. | Pendiente |
| **RF-09** | Créditos e Himno del SENA | `src/scenes/Scene4Credits.js` | T-601, T-602, T-603, T-604 | Secuencia final, créditos con mención a Diego Alejandro Zamora, Himno y fundido final. | Pendiente |
| **RF-10** | HUD en Tiempo Real | `src/ui/HUD.js` | T-111, T-404 | HUD con salud, personaje, FPS y etiqueta de escena; la Escena 2 ya muestra arma equipada, oleada y zombis restantes. Faltan el conteo 1→10 y el escalado de I4. | En curso |

---

## 2. Mapeo de Reglas de Juego (RN)

| Regla | Descripción | Módulo Principal | Tarea | Criterio de Validación | Estado |
|---|---|---|---|---|---|
| **RN-01** | Ataque Contextual de Teclado | `src/scenes/Scene1Ambiente.js` | T-203, T-204 | El teclazo es único en la Escena 1 y deja fuera de combate al zombi inicial. | Completado |
| **RN-02** | Desbloqueo de Ataque | `src/entities/Player.js`, `src/scenes/Scene2Pasillo.js` | T-303, T-304 | El jugador no puede atacar con hacha hasta tomarla en el gabinete en Escena 2; `hasWeapon()` bloquea el ataque antes de la recogida. | Completado |
| **RN-03** | Condición de Game Over | `src/core/Game.js`, `src/core/StateManager.js` | T-107, T-109 | Si la salud del jugador llega a 0, se despliega pantalla de derrota y opción de reinicio. | Completado |
| **RN-04** | Criterio de Fin de Oleada | `src/systems/WaveManager.js` | T-402 | La oleada solo termina cuando `zombiesRemaining == 0` y no quedan enemigos activos. | Pendiente |
| **RN-05** | Escalado de Dificultad | `src/systems/WaveManager.js` | T-402 | Multiplicador incremental de +10% de salud/velocidad de zombis por oleada transcurrida. | Pendiente |
| **RN-06** | Condición de Rescate | `src/scenes/Scene3Helipuesto.js` | T-501, T-502 | El helicóptero aterriza solo con `wave == 10` y `remainingZombies == 0`. | Pendiente |

---

## 3. Mapeo de Requisitos No Funcionales (RNF)

| Requisito | Descripción | Módulo Principal | Tarea | Criterio de Validación | Estado |
|---|---|---|---|---|---|
| **RNF-01** | Rendimiento 60 FPS | `src/core/Game.js` | T-102, T-605 | Fixed Timestep implementado y 60 FPS medidos en I1; falta medición con 100 entidades en T-605. | En revisión |
| **RNF-02** | Ejecución Web Pura | Entorno HTML5 Canvas 2D | T-101 | `npm run build` correcto y ejecución verificada en Chrome; faltan Firefox, Edge y Safari. | En revisión |
| **RNF-03** | Carga Asíncrona | `src/core/AssetLoader.js` | T-104, T-206, T-207, T-208, T-209, T-210, T-211, T-212 | Carga de 20 PNG y 4 MP3 (24/24, 0 errores) y pantalla de carga verificadas en desarrollo y producción. | Completado |
| **RNF-04** | Canales de Audio Independientes | `src/core/AudioManager.js` | T-108, T-208, T-209, T-603 | Canales separados, desbloqueo tras gesto, música contextual con fundidos, pasos y mute centralizado verificados. El Himno del SENA se integra en I6. | Completado |
| **RNF-05** | Controles Adaptables (1P/2P) | `src/core/InputManager.js` | T-103 | Teclado + ratón verificados; estructura 2P pendiente de implementación. | En revisión |

---

## 4. Cobertura de verificación

Antes de cerrar una tarea, sustituir `Pendiente` por el estado real y adjuntar o enlazar la evidencia correspondiente. Una evidencia puede ser una prueba automatizada, pasos manuales reproducibles, una captura/video con fecha o una medición de rendimiento.

| Tipo | Cobertura mínima |
|---|---|
| RF / RN | Escenario manual reproducible o prueba automatizada que cubra su criterio de aceptación. |
| RNF-01 | Medición con 100 entidades: navegador, equipo, duración y FPS mínimo/promedio. |
| RNF-02 | Validación manual en los navegadores objetivo. |
| RNF-03 / RNF-04 | Prueba de carga y audio posterior a un gesto del usuario. |

### 4.1 Validación estructural automatizada

La comprobación estructural se ejecuta con `npm run docs:check` (o `node scripts/check-docs.mjs`). El script `scripts/check-docs.mjs` verifica la correspondencia de IDs, la existencia de tareas, los estados permitidos y los enlaces mínimos entre documentos. La tarea asociada es T-110.

El checklist manual complementario está en `docs/5-doc-checklist.md`. La validación automática no sustituye la revisión de criterios Gherkin ni la evidencia de rendimiento.

---

## 5. Trazabilidad por Escenas Narrativas

```
[MENÚ PRINCIPAL]  ──> RF-01 (Selección: Zamora, Chantre, Juan, Daiver)
       │
       ▼
[ESCENA 1]  ────────> RF-02, RN-01 (Ambiente de clase + Teclazo a Zombi)
       │
       ▼
[ESCENA 2]  ────────> RF-04, RF-05, RN-02 (Gabinete de incendios + Hacha + Pasillo)
       │
       ▼
[ESCENA 3]  ────────> RF-06, RF-07, RF-08, RF-10, RN-03, RN-04, RN-05, RN-06
                      (Helisuperficie + 10 Oleadas + Rescate de Rodolfo M. T.)
       │
       ▼
[ESCENA 4]  ────────> RF-09 (Créditos a Diego Alejandro Zamora + Himno del SENA)
```

---

## 6. Evidencia del Sprint I1

**Fecha:** 2026-11-08  
**Evidencia completa:** `docs/evidence/i1/README.md` y `docs/evidence/i1/verification.json`.

| Requisito / Tarea | Evidencia | Estado |
|---|---|---|
| RF-01 / T-105, T-108 | Menú interactivo, selección con teclado y toggle de sonido; `docs/evidence/i1/menu-1280x720.png`. | Completado |
| RF-03 / T-103, T-106 | Movimiento con `D` (+136 px en 600 ms), colisiones de arena y apuntado con ratón; `docs/evidence/i1/test-1280x720.png`. | Completado |
| RF-10 / T-111 | HUD base con salud, personaje, FPS y etiqueta de escena; `docs/evidence/i1/test-1280x720.png`. | En curso (T-404) |
| RN-03 / T-107, T-109 | Salud a 0 → Game Over; reinicio con Enter/R y vuelta al menú con M; `docs/evidence/i1/gameover-1280x720.png`. | Completado |
| RNF-01 / T-102 | 60 FPS en menú y escena de prueba a 1280×720; falta medición con 100 entidades. | En revisión |
| RNF-02 / T-101 | `npm run build` correcto y ejecución en Chrome 156. | En revisión |
| RNF-03 / T-104 | En I1, `AssetLoader` cargaba 1 SVG y `BootScene` mostraba progreso; la integración posterior a 5 PNG y 4 MP3 se registra en las secciones 7.1 y 7.2. | Completado |
| RNF-04 / T-108 | `AudioContext` desbloqueado tras la primera tecla; canales música/SFX y mute; música contextual y pasos verificados en la sección 7.2. | Completado |
| RNF-05 / T-103 | Teclado + ratón verificados; estructura 2P pendiente. | En revisión |

---

## 7. Evidencia del Sprint I2

**Fecha:** 2026-11-08  
**Evidencia completa:** `docs/evidence/i2/README.md` y `docs/evidence/i2/verification.json`.

| Requisito / Tarea | Evidencia | Estado |
|---|---|---|
| RF-02 / T-201 | Salón procedural con paredes, pupitres y puerta; `docs/evidence/i2/intro-1280x720.png`. | Completado |
| RF-02 / T-202 | Puerta rota, partículas y entrada del Zombi Aprendiz; `docs/evidence/i2/breach-1280x720.png`. | Completado |
| RF-02 / RN-01 / T-203 | Teclazo con `E`: 1 lanzamiento, 1 impacto; `docs/evidence/i2/threat-1280x720.png`. | Completado |
| RF-02 / RN-01 / T-204 | Proyectil con trayectoria, impacto y zombi en estado `knockedOut`; `docs/evidence/i2/knockout-1280x720.png`. | Completado |
| RF-02 / T-205 | Zona verde de salida habilitada; cruce → fase `exiting` → `complete`; `docs/evidence/i2/exit-1280x720.png`. | Completado |
| RN-03 | Reinicio con `R` y vuelta al menú con `M` desde el cierre de I2; verificado por CDP. | Completado |
| RNF-01 | 60 FPS durante la secuencia completa a 1280×720 y 1024×600. | En revisión (falta T-605) |
| RNF-02 | Compilación y ejecución en Chrome 156; faltan Firefox, Edge y Safari. | En revisión |
| RNF-04 | Audio desbloqueado en la primera tecla; SFX de puerta, teclazo, impacto y gruñido. La música contextual posterior se registra en la sección 7.2. | Completado (ver 7.2) |

**Limitaciones:** los sprites de Zamora solo cubren el estado quieto; no existen animaciones de caminar, correr ni golpear. La salida de la Escena 1 muestra el cierre de I2 porque el pasillo pertenece a I3. La medición con 100 entidades sigue pendiente en T-605. El navegador exige un primer gesto antes de reproducir audio. *(Superado en I3: la salida conduce a `scene2`; ver sección 7.4.)*

---

## 7.1 Evidencia de integración de assets

**Fecha:** 2026-11-08  
**Evidencia completa:** `docs/evidence/assets/README.md` y `docs/evidence/assets/verification.json`.

| Requisito / Tarea | Evidencia | Estado |
|---|---|---|
| RF-01 / T-206 | Logo en arranque, menú, favicon y panel de introducción; `docs/evidence/assets/boot-1280x720.png` y `menu-1280x720.png`. | Completado |
| RF-03 / T-207 | Las 4 vistas de Zamora se seleccionan con `WASD`; capturas `facing-right`, `facing-left`, `facing-up` y `facing-down`. | Completado |
| RF-01 / T-207 | Retrato de Zamora en tarjeta, detalle, HUD y Game Over; resto de personajes conserva avatar procedural (`chantre-fallback`). | Completado |
| RNF-03 / T-206, T-207 | 5 PNG cargados (`assetsTotal: 5`, 0 errores) y emitidos por Vite en `dist/assets/`. La carga de audio se registra en la sección 7.2. | Completado (ver 7.2) |
| RNF-01 | 60 FPS a 1280×720 y 1024×600 durante la verificación de assets; falta T-605. | En revisión |
| RNF-02 | Compilación correcta y ejecución en Chrome 156; faltan Firefox, Edge y Safari. | En revisión |

---

## 7.2 Evidencia de audio contextual

**Fecha:** 2026-11-08  
**Evidencia completa:** `docs/evidence/audio/README.md` y `docs/evidence/audio/verification.json`.

| Requisito / Tarea | Evidencia | Estado |
|---|---|---|
| RF-01 / T-208 | `currentMusicKey: fondoMenu` tras el primer gesto; ganancia 1 para `fondo_menu` y 0 para las demás pistas; `docs/evidence/audio/menu-music-1280x720.png`. | Completado |
| RF-02 / T-208 | Introducción con `ambienteTranquilo` (`intro-calm-1280x720.png`); irrupción con `ambienteHorror` (`breach-horror-1280x720.png`); horror activo durante knockout y fase libre (`knockout-horror-1280x720.png`). | Completado |
| RF-02 / T-208 | Entrada a la salida: `currentMusicKey: null` y `desiredMusicKey: null`; las tres pistas quedan en pausa (`complete-music-stopped-1280x720.png`). Reinicio → calma; regreso al menú → `fondoMenu`. | Completado |
| RF-03 / T-209 | Pasos activos con Zamora, Chantre, Juan y Daiver; avance de 0.40–0.41 s durante 0.4 s de caminata; capturas `steps-<personaje>-1280x720.png`. | Completado |
| RF-03 / T-209 | Al soltar el movimiento: `paused: true` y `footstepWanted: false` en los cuatro personajes; también se detienen al cambiar de escena y al ocultar la pestaña. | Completado |
| RNF-03 / T-208, T-209 | 9/9 assets cargados (5 PNG + 4 MP3), 0 errores; `npm run build` transforma 33 módulos y emite los 4 MP3 en `dist/assets/`. | Completado |
| RNF-04 / T-208, T-209 | Grafo con `MediaElementAudioSourceNode` y `GainNode` por pista, fundido cruzado de 0.8 s, `masterGain` 0.8; mute verificado (0.8 → 0 → 0.8). | Completado |
| RNF-01 | 60 FPS durante todo el recorrido de audio a 1280×720; falta la medición con 100 entidades de T-605. | En revisión |
| RNF-02 | Ejecución correcta en Chrome 156; faltan Firefox, Edge y Safari. | En revisión |

**Limitaciones:** el audio requiere un primer gesto del usuario (política de autoplay). La verificación se hizo en Chrome headless con CDP y no sustituye una escucha manual en todos los navegadores objetivo. No se agregaron animaciones de caminar, correr ni golpear.

---

## 7.3 Evidencia de integración visual

**Fecha:** 2026-11-09  
**Evidencia completa:** `docs/evidence/visuals/README.md` y `docs/evidence/visuals/verification.json`.

| Requisito / Tarea | Evidencia | Estado |
|---|---|---|
| RF-01 / T-210 | Fondo `fondo_menu.png` en modo *cover*, con velo, viñeta y brasas; menú 2×2 y contenido a la derecha para dejar visible al personaje; `menu-1280x720.png`, `menu-1024x600.png` y `menu-820x1000.png`. | Completado |
| RF-01 / T-211 | Los 4 retratos devuelven `hasSprite: true` e `image: true`; selección 0 Zamora → 1 Chantre → 2 Juan → 3 Daiver; capturas `menu-<personaje>-1280x720.png`. | Completado |
| RF-03 / T-211 | Las 4 vistas de los 4 personajes se verificaron en la Escena 1 (`abajo`, `arriba`, `derecha`, `izquierda`); capturas `scene1-<personaje>-1280x720.png`. | Completado |
| RF-02 / T-212 | Pared texturizada y baldosa crema oscurecida en la Escena 1, con capa de suciedad/sangre de 1172 × 547 px. | Completado |
| RF-03 / T-212 | Pared exterior, arena texturizada y obstáculos texturizados en la escena de prueba; `test-textures-1280x720.png`. | Completado |
| RNF-03 / T-210–T-212 | 20 imágenes + 4 audios = 24 assets, `errors: []`, `missingImages: []`; `npm run build` transforma 49 módulos y emite 20 PNG + 4 MP3. | Completado |
| RNF-01 / T-210–T-212 | Capas offscreen para fondo, suelo y mobiliario; ≈144 FPS en menú, Escena 1 y prueba en Chrome headless; falta la medición con 100 entidades de T-605. | En revisión |
| RNF-02 | Ejecución correcta en Chrome 156; faltan Firefox, Edge y Safari. | En revisión |

**Limitaciones:** solo existe el estado quieto de los cuatro personajes; caminar, correr y golpear siguen sin animación. La medición de FPS es headless y sin vsync. Los recortes de Chantre, Juan y Daiver tienen proporciones distintas a Zamora y pueden requerir ajustes al integrar animaciones.

---

## 7.4 Evidencia del Sprint I3

**Fecha:** 2026-11-11  
**Evidencia completa:** `docs/evidence/i3/README.md` y `docs/evidence/i3/verification.json`.

| Requisito / Tarea | Evidencia | Estado |
|---|---|---|
| RF-04 / T-301 | Pasillo del bloque A con paredes, puerta izquierda/derecha, obstáculos, gabinete y salida; `docs/evidence/i3/intro-cinematic-1280x720.png`. | Completado |
| RF-04 / T-302 | Pulsar `E` sin mantener: `state: intact`, `hits: 0`. Mantener `E`: 3 golpes y `state: broken`; `cabinet-hold-progress-1280x720.png` y `cabinet-broken-1280x720.png`. | Completado |
| RF-04 / T-303 | Segunda pulsación de `E`: `weapon: fireAxe`, `cabinet: taken` y cinemática activa; `axe-pickup-cinematic-1280x720.png`. | Completado |
| RF-04 / T-307 | Tres cinemáticas: entrada (fase `intro` → `explore`), recogida del hacha (3 cuadros) y pasillo despejado (2 cuadros), con letterbox y salto con `Enter`/`Espacio`. | Completado |
| RF-05 / T-304 | Arco Melee acierta en las 4 direcciones del apuntado (`hits: [true, true, true, true]`) y no golpea por la espalda (`behind: false`). | Completado |
| RF-05 / T-305 | Oleada de 6 zombis: `queued: 6`, `killed: 6`, `alive: 0`; reacción a impactos y muerte; `wave-1-1280x720.png`. | Completado |
| RF-04 / T-306 | Al despejar la oleada: `phase: cleared`, `exitOpen: true`; al cruzar la salida: `phase: complete`; `wave-cleared-exit-1280x720.png` y `complete-1280x720.png`. | Completado |
| RN-02 / T-303, T-304 | `player.hasWeapon()` es falso antes de la recogida y `attack()` retorna sin golpear; tras equipar `fireAxe` el ataque queda disponible. | Completado |
| RF-10 / T-111 | HUD muestra salud, personaje, FPS, arma equipada, oleada `1/1` y zombis restantes (6 → 0) durante la Escena 2. | En curso (T-404) |
| RN-03 | Salud a 0 en Escena 2 abre Game Over; `R`/`Enter` reinicia `scene2` con salud 100. | Completado |
| RNF-01 | ≈58 FPS durante la verificación headless a 1280×720; falta la medición con 100 entidades de T-605. | En revisión |
| RNF-02 | `npm run build` correcto: 53 módulos; ejecución en Chrome headless 157; faltan Firefox, Edge y Safari. | En revisión |

**Limitaciones:** el pasillo y los zombis siguen siendo procedurales. Solo existe el estado quieto de los personajes: el golpe de hacha se representa con la estela procedural de `CombatSystem`, no con sprites de animación. La oleada de 6 zombis pertenece a la Escena 2; el gestor de 10 oleadas y el escalado de dificultad corresponden a I4. La salida conduce al panel de cierre de I3 porque la helisuperficie se implementa en I4. La medición de FPS es headless y sin vsync.

---

## 7.5 Evidencia de la nueva historia de la Escena 1

**Fecha:** 2026-11-11  
**Evidencia completa:** `docs/evidence/scene1-story/README.md` y `docs/evidence/scene1-story/verification.json`.

| Requisito / Tarea | Evidencia | Estado |
|---|---|---|
| RF-02 / T-213 | El jugador entra y llega a su puesto (`arrivalDone: true`); la puerta se cierra tras él. `01-llegada-al-ambiente-1280x720.png`. | Completado |
| RF-02 / T-213 | Tres compañeros (Chantre, Juan y Daiver con Zamora) en sus pupitres y el instructor en su escritorio. `02-clase-solid-profesor-1280x720.png`. | Completado |
| RF-02 / T-213 | Cinemática de dos cuadros: llegada y clase de SOLID («Bueno, empecemos. Hoy vamos a ver los principios SOLID...»). `03-profesor-solid-1280x720.png`. | Completado |
| RF-02 / T-213 | Salto temporal `timeskip` con destello y rótulo «2 HORAS DESPUÉS...». `04-dos-horas-despues-1280x720.png`. | Completado |
| RF-02 / T-213 | Compañeros e instructor salen hacia la puerta y desaparecen; la puerta se cierra. `05-companeros-salen-1280x720.png` y `06-grito-1280x720.png`. | Completado |
| RF-02 / T-213 | Grito sintetizado con destello rojo y temblor; línea del jugador «¡¿Qué fue esoo?!». `06-grito-1280x720.png` y `07-que-fue-eso-1280x720.png`. | Completado |
| RF-02 / RN-01 / T-203, T-204 | Irrupción del zombi y teclazo: `throws: 1`, `knockouts: 1`, fase `knockout`; salida habilitada en `free`. `08-irrupcion-zombi-1280x720.png` a `11-salida-habilitada-1280x720.png`. | Completado |
| RNF-01 / T-213 | 60 FPS durante la secuencia completa en Chrome headless a 1280×720; falta la medición con 100 entidades de T-605. | En revisión |
| RNF-02 / T-213 | `npm run build` correcto: 53 módulos; ejecución en Chrome headless 157; faltan Firefox, Edge y Safari. | En revisión |

**Limitaciones:** los compañeros y el instructor son NPC procedurales sin sprites ni animaciones de caminar. El grito y las puertas son audio sintetizado; no hay archivos de voz. La verificación se hizo con Zamora; la selección de compañeros se validó con los cuatro personajes. La medición de FPS es headless y sin vsync.

---

## 8. Registro de cambios

| Fecha | Cambio | Motivo | Impacto |
|---|---|---|---|
| 2026-11-08 | Se agrega validación estructural con `scripts/check-docs.mjs` y checklist manual. | Reducir la dependencia de revisión manual. | No cambia requisitos; agrega control de consistencia y T-110. |
| 2026-11-08 | Se actualizan estados y se agrega evidencia del Sprint I1. | Registrar la implementación verificada. | RF-01, RF-03 y RN-03 completados; RF-10 y RNF en revisión. T-107, T-301 y T-306 quedan enlazadas a sus requisitos. |
| 2026-11-08 | Se completan RF-02 y RN-01 con evidencia del Sprint I2. | Registrar la Escena 1 verificada. | El menú inicia la Escena 1; el flujo llega hasta el cierre de I2. |
| 2026-11-08 | Se integran el logo y los sprites de estado quieto de Zamora. | Registrar T-206 y T-207 con evidencia verificable. | RF-01 y RF-03 completados; el resto de personajes conserva el render procedural. |
| 2026-11-08 | Se integran la música contextual y los pasos desde `assets/sound/`. | Registrar T-208 y T-209 con evidencia verificable. | RF-01, RF-02, RF-03, RNF-03 y RNF-04 completados; se agrega la sección 7.2; el audio requiere un primer gesto. |
| 2026-11-09 | Se integran el fondo del menú, las skins y las texturas. | Registrar T-210–T-212 con evidencia verificable. | RF-01, RF-02 y RF-03 completados; RNF-03 completado; se agrega la sección 7.3 y la evidencia `docs/evidence/visuals/`. |
| 2026-11-11 | Se completan RF-04, RF-05 y RN-02 con la evidencia de I3. | Registrar la Escena 2, el combate Melee y las cinemáticas verificadas. | La salida de la Escena 1 conduce a `scene2`; se agrega la sección 7.4; RF-10 queda en curso hasta el conteo de oleadas de I4. |
| 2026-11-11 | Se amplía RF-02 con la nueva historia de la Escena 1 y se agrega T-213. | Registrar llegada, clase de SOLID, salto temporal, salida del grupo, grito y reacción verificados. | RF-02 sigue completado con 18/18 comprobaciones; se agrega la sección 7.5 y la evidencia `docs/evidence/scene1-story/`. |
