# Tareas — INVACIÓN SENA

**Versión:** 1.8  
**Estado:** I1, I2 e I3 implementados; assets, audio e integración visual integrados (pendiente G3)  
**Depende de:** `2-plan.md`  
**Autor Principal:** Diego Alejandro Zamora

Leyenda de estado: `[ ]` pendiente · `[~]` en curso · `[x]` completada.

---

## Sprint I1 — Base del Motor, Input & Menú de Selección

- [x] **T-101** Configurar estructura del proyecto en Vite + JavaScript ES6 / Canvas 2D (`package.json`, `index.html`, `vite.config.js`).
- [x] **T-102** Implementar el loop principal en `src/core/Game.js` con actualización fija (*Fixed Timestep* a 60 FPS) y renderizado adaptativo.
- [x] **T-103** Crear el gestor de entradas `src/core/InputManager.js` con mapeo de movimiento en 8 direcciones (WASD / Flechas) y apuntado en 360° con ratón.
- [x] **T-104** Crear el cargador asíncrono de assets `src/core/AssetLoader.js` con soporte para sprites y audios.
- [x] **T-105** Diseñar la pantalla de Menú Principal (`src/scenes/MenuScene.js`) con selector de personajes (Zamora, Chantre, Juan, Daiver).
- [x] **T-106** Implementar la base de la clase `src/entities/Player.js` con atributos diferidos por personaje elegible (velocidad, salud, daño).
- [x] **T-107** Implementar `src/core/StateManager.js` y los contratos mínimos de escena (`enter`, `update`, `render`, `exit`).
- [x] **T-108** Implementar `src/core/AudioManager.js` con desbloqueo de audio tras la primera interacción y controles separados para música y SFX.
- [x] **T-109** Implementar el flujo reutilizable de Game Over (reiniciar escena o volver al menú) y su integración con la salud del jugador.
- [x] **T-110** Configurar validación automática de consistencia documental (`scripts/check-docs.mjs`, `package.json`) y checklist manual de cierre (`docs/5-doc-checklist.md`).
  - Evidencia: `npm run docs:check` ejecutado el 2026-11-08; resultado registrado en `docs/5-doc-checklist.md`.
- [x] **T-111** Implementar HUD base reutilizable (`src/ui/HUD.js`) con salud, personaje, FPS y etiqueta de escena; base para RF-10.
  - Evidencia: `docs/evidence/i1/test-1280x720.png`.

**Criterio de salida del Sprint I1:** Menú de selección interactivo que permite elegir personaje e iniciar el loop de juego a 60 FPS en una escena de prueba.

**Evidencia del Sprint I1 (2026-11-08):** `docs/evidence/i1/README.md` y `docs/evidence/i1/verification.json`; capturas de menú, escena de prueba y Game Over. `npm run build` correcto; 60 FPS; 0 errores de consola; movimiento de +136 px con `D`; Game Over, reinicio y vuelta al menú verificados.

---

## Sprint I2 — Escena 1: El Ambiente de Programación y Teclazo

- [x] **T-201** Diseñar el mapa y colisiones del ambiente/salón de clase de programación (`src/scenes/Scene1Ambiente.js`).
- [x] **T-202** Implementar la cinemática/evento de irrupción: animación de puerta rompiéndose e ingreso del Zombi Aprendiz inicial.
- [x] **T-203** Crear la mecánica de ataque contextual `RN-01`: acción de lanzar el teclado del ordenador contra el zombi.
- [x] **T-204** Implementar físicas de impacto del teclado y estado de *knockout* / aturdimiento del zombi (`src/entities/KeyboardProjectile.js`, `src/entities/Zombie.js`).
- [x] **T-205** Crear la zona de transición/salida del ambiente hacia los pasillos del centro de formación SENA.
- [x] **T-206** Integrar el logo principal (`assets/img/icons/icon.png`) en el arranque, el menú, el favicon y el panel de introducción de la Escena 1.
- [x] **T-207** Integrar los sprites de estado quieto de Zamora (`vista_abajo`, `vista_arriba`, `vista_derecha`, `vista_izquierda`) en el jugador, el HUD y los retratos, sin animaciones de caminar, correr ni golpear.
- [x] **T-208** Integrar la música contextual desde `assets/sound/`: `fondo_menu` en el menú, `ambiente_tranquilo` durante el diálogo de la Escena 1 y `ambiente_horror` desde la irrupción del zombi, con fundido cruzado y detención al entrar a la salida.
- [x] **T-209** Integrar `assets/sound/effects/caminar.mp3` como efecto de pasos en bucle para Zamora, Chantre, Juan y Daiver mientras se desplazan, con parada al quedar quietos o cambiar de escena.
- [x] **T-210** Integrar `assets/img/fondos/fondo_menu.png` como fondo terrorífico del menú en modo *cover*, con velo, viñeta, partículas de brasa y layout responsive (2×2 en pantallas anchas, contenido a la derecha para dejar visible al personaje).
  - Evidencia: `docs/evidence/visuals/menu-1280x720.png`, `menu-1024x600.png` y `menu-820x1000.png`.
- [x] **T-211** Integrar las skins de estado quieto de Chantre, Juan y Daiver (4 vistas cada uno) junto con las de Zamora, en el jugador y en los retratos del menú, HUD y Game Over, sin animaciones de caminar, correr ni golpear.
  - Evidencia: `docs/evidence/visuals/menu-<personaje>-1280x720.png` y `scene1-<personaje>-1280x720.png` de los cuatro personajes.
- [x] **T-212** Integrar `assets/img/texturas/textura_pared.png` y `baldosa_color_crema.png` en la Escena 1 y la escena de prueba mediante `CanvasPattern` teñido, con capas offscreen de suciedad/sangre y rendimiento estable.
  - Evidencia: `docs/evidence/visuals/scene1-*-1280x720.png`, `test-textures-1280x720.png` y `verification.json`.
- [x] **T-213** Implementar la nueva secuencia narrativa de la Escena 1: llegada del jugador a su puesto, compañeros e instructor en el salón, clase de SOLID, salto temporal «2 HORAS DESPUÉS...», salida del grupo con cierre de puerta, grito, reacción «¡¿Qué fue esoo?!» e irrupción del zombi.
  - Evidencia: `docs/evidence/scene1-story/README.md` y `docs/evidence/scene1-story/verification.json`.

**Criterio de salida del Sprint I2:** Escena 1 completamente jugable, donde la llegada, la clase, el salto temporal, la salida del grupo y el grito conducen a la irrupción del zombi y a la secuencia del teclado que abre paso hacia los pasillos.

**Evidencia del Sprint I2 (2026-11-08):** `docs/evidence/i2/README.md` y `docs/evidence/i2/verification.json`. Flujo verificado: menú → Escena 1 → irrupción → teclazo → *knockout* → salida → cierre; 60 FPS y 0 errores de consola. La salida conduce a una pantalla de cierre que indica que el pasillo se implementa en I3.

**Evidencia de la nueva historia de Escena 1 (2026-11-11):** `docs/evidence/scene1-story/README.md` y `docs/evidence/scene1-story/verification.json` para T-213. Flujo verificado: llegada al puesto y cierre de puerta; 3 compañeros y el instructor en sus puestos; cinemática de clase de SOLID; salto temporal; salida del grupo con cierre de puerta; grito y línea «¡¿Qué fue esoo?!»; irrupción del zombi; teclazo y *knockout*; salida habilitada. 18/18 comprobaciones, 60 FPS y 0 errores de consola.

**Actualización I3 (2026-11-11):** la salida de la Escena 1 ahora conduce directamente a `scene2`; el cierre de I2 quedó como código heredado no alcanzable.

**Evidencia de assets (2026-11-08):** `docs/evidence/assets/README.md` y `docs/evidence/assets/verification.json` para T-206 y T-207. Logo y 4 sprites cargados sin errores; las 4 vistas de Zamora se verificaron con movimiento real; Chantre conserva el render procedural; 60 FPS y 0 errores de consola a 1280×720 y 1024×600.

**Evidencia de audio (2026-11-08):** `docs/evidence/audio/README.md` y `docs/evidence/audio/verification.json` para T-208 y T-209. Las tres pistas se cargan y cambian por situación (menú, introducción, irrupción); la música se detiene al entrar a la salida y se reanuda al reiniciar o volver al menú; los pasos se activaron con los cuatro personajes y se detuvieron al quedar quietos; `masterGain` respondió al mute; 60 FPS y 0 errores de consola.

**Evidencia visual (2026-11-09):** `docs/evidence/visuals/README.md` y `docs/evidence/visuals/verification.json` para T-210, T-211 y T-212. Fondo del menú visible en 1280×720, 1024×600 y 820×1000; layout 2×2 dentro del viewport; los 4 retratos usan sprite; selección 0→3 correcta; las 4 direcciones de los 4 personajes se verificaron en la Escena 1; pared y baldosa texturizadas en Escena 1 y escena de prueba; 20 imágenes + 4 audios cargados sin errores; 0 errores de consola y ≈144 FPS en headless.

---

## Sprint I3 — Escena 2: Gabinete de Incendios y Combate Melee con Hacha

- [x] **T-301** Diseñar el mapa de los pasillos principales del SENA (`src/scenes/Scene2Pasillo.js`).
- [x] **T-302** Crear la entidad e interacción con la bomba/gabinete de agua de incendios (Tecla `E` / Espacio), exigiendo mantener `E` para completar tres golpes.
- [x] **T-303** Implementar el evento de ruptura del gabinete y equipamiento del **Hacha de Incendios** (`src/entities/Weapon.js`).
- [x] **T-304** Desarrollar el sistema de combate Melee (`src/systems/CombatSystem.js`) con arco de ataque en 360° según el apuntado del ratón.
- [x] **T-305** Crear la primera oleada de pasillo de Zombis Aprendices con detección de colisión AABB / Círculo y reacción a impactos de hacha.
- [x] **T-306** Diseñar la puerta de salida hacia el patio / helisuperficie del SENA.
- [x] **T-307** Implementar las cinemáticas de la Escena 2 (entrada al pasillo, recogida del hacha con aviso de oleada y salida al patio) mediante `src/ui/CutsceneOverlay.js`.
  - Evidencia: `docs/evidence/i3/README.md` y `docs/evidence/i3/verification.json`.

**Criterio de salida del Sprint I3:** Interacción con el gabinete de incendios funcional, obtención del hacha y eliminación de la oleada de pasillo.

**Evidencia del Sprint I3 (2026-11-11):** `docs/evidence/i3/README.md` y `docs/evidence/i3/verification.json`. Flujo verificado: Escena 1 → Escena 2 con cinemática de entrada; pulsaciones sueltas de `E` no rompen el gabinete; mantener `E` produce 3 golpes (0.55 s cada uno) y rompe el cristal; una segunda pulsación de `E` equipa el Hacha de Incendios y su cinemática inicia la oleada de 6 zombis; el arco Melee responde a las 4 direcciones del apuntado; al eliminar la oleada se abre la salida al patio, se reproduce la cinemática de cierre y aparece el panel de Escena 2 completada. Game Over reinicia la Escena 2; 1024 × 600 responsive; `npm run build` transforma 53 módulos; ≈58 FPS y 0 errores de consola.

---

## Sprint I4 — Escena 3: Sobrevivencia de 10 Oleadas en la Helisuperficie

- [ ] **T-401** Diseñar la arena de combate abierta de la helisuperficie (`src/scenes/Scene3Helipuesto.js`).
- [ ] **T-402** Desarrollar el gestor de oleadas `src/systems/WaveManager.js` para controlar el conteo de 1 a 10 oleadas y la dificultad progresiva (`RN-05`).
- [ ] **T-403** Desarrollar la IA de horda de Zombis Aprendices (`src/entities/Zombie.js`) con conductas de persecución y repulsión entre infectados.
- [ ] **T-404** Construir la interfaz de usuario `src/ui/HUD.js` para mostrar la salud activa del jugador, número de oleada, zombis restantes y arma equipada.
- [ ] **T-405** Implementar sistema de dropeo de munición/armas secundarias al eliminar enemigos en oleadas avanzadas.

**Criterio de salida del Sprint I4:** Escena de supervivencia jugable con escalado funcional hasta la oleada 10 e interfaz HUD en tiempo real.

---

## Sprint I5 — Helicóptero de Rescate y Rodolfo Martínez Tono

- [ ] **T-501** Crear el evento de verificación de victoria de la Oleada 10 (`remainingZombies == 0` y `wave == 10`).
- [ ] **T-502** Desarrollar la entidad y animación del helicóptero de rescate aterrizando en la helisuperficie.
- [ ] **T-503** Incorporar el sprite/modelo del **Señor Rodolfo Martínez Tono** y su secuencia de diálogo o señal de abordaje.
- [ ] **T-504** Crear la zona de *trigger* de abordaje al helicóptero que dispara la finalización del combate.

**Criterio de salida del Sprint I5:** La oleada 10 concluye con la llegada animada del helicóptero del Sr. Rodolfo Martínez Tono y activa la transición de extracción.

---

## Sprint I6 — Escena 4: Créditos, Himno del SENA y Cierre

- [ ] **T-601** Diseñar la pantalla final de créditos `src/scenes/Scene4Credits.js` con animación de alejamiento del helicóptero.
- [ ] **T-602** Renderizar el texto de créditos destacando a **Diego Alejandro Zamora** como creador principal y desarrollador.
- [ ] **T-603** Configurar la reproducción completa y de alta calidad del **Himno del SENA** en el gestor de audio.
- [ ] **T-604** Implementar el efecto de fundido a negro (*Fade out to black*) al finalizar el tema musical.
- [ ] **T-605** Pasada final de pulido visual, balance de armas, pruebas a 60 FPS y verificación de trazabilidad (`4-traceability.md`).

**Criterio de salida del Sprint I6:** Créditos completos desplegados con mención a Diego Alejandro Zamora, reproducción sincrónica del Himno del SENA y juego 100% finalizado.

---

## Registro de cambios

| Fecha | Cambio | Motivo | Impacto |
|---|---|---|---|
| 2026-11-08 | Se agrega T-110 y se marca completada con evidencia. | Reducir la dependencia de documentación manual. | No altera tareas de juego; incorpora validación automática y checklist de cierre. |
| 2026-11-08 | Se completan T-101 a T-109 y se agrega T-111 (HUD base). | Implementar el Sprint I1 y dejar evidencia verificable. | Menú, motor, input, audio, assets y Game Over disponibles; I1 pendiente de G3. |
| 2026-11-08 | Se completan T-201 a T-205. | Implementar la Escena 1 y el teclazo contextual del Sprint I2. | Salón, irrupción, teclazo, knockout y salida implementados; I2 pendiente de G3. |
| 2026-11-08 | Se agregan y completan T-206 y T-207. | Integrar el logo principal y los sprites de estado quieto de Zamora. | El menú, el arranque y la Escena 1 usan los assets oficiales; las animaciones quedan pendientes. |
| 2026-11-08 | Se agregan y completan T-208 y T-209. | Integrar la música contextual y el efecto de pasos desde `assets/sound/`. | Menú, introducción e irrupción usan pistas oficiales; los cuatro personajes suenan al caminar; el audio sintetizado de UI/SFX se conserva. |
| 2026-11-09 | Se agregan y completan T-210, T-211 y T-212. | Integrar el fondo del menú, las skins de Chantre/Juan/Daiver y las texturas de los entornos. | El menú usa `fondo_menu.png`; los cuatro personajes tienen 4 vistas y retrato; pared y baldosa texturizan Escena 1 y prueba; se corrigen pulsaciones perdidas. |
| 2026-11-11 | Se completan T-301 a T-306 y se agrega T-307. | Implementar la Escena 2, el combate Melee y las cinemáticas obligatorias del Sprint I3. | Pasillo, gabinete de 3 golpes sostenidos, Hacha de Incendios, oleada de 6 zombis, salida y tres cinemáticas implementados; la Escena 1 ahora conduce directamente a la Escena 2. |
| 2026-11-11 | Se agrega y completa T-213. | Implementar la nueva historia de la Escena 1 solicitada por el usuario. | Llegada al puesto, clase de SOLID, salto temporal, salida del grupo, grito, reacción e irrupción quedan implementados y verificados sin alterar el teclazo. |
