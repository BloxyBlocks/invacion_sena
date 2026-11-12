# Plan técnico — INVACIÓN SENA

**Versión:** 1.8  
**Estado:** En revisión (G2)  
**Depende de:** `1-specs.md`  
**Autor Principal:** Diego Alejandro Zamora

---

## 1. Arquitectura del Motor Web

Para garantizar un rendimiento óptimo de 60 FPS estables con múltiples zombis en pantalla, el juego se estructura como una aplicación con entidades y sistemas ligeros en **JavaScript ES6+, Vite y Canvas 2D**. WebGL/PixiJS no forman parte del alcance inicial: solo se incorporarán mediante un cambio de plan justificado por una medición de rendimiento.

```
┌────────────────────────────────────────────────────────┐
│                   Main Entry / Game Loop               │
│          (Fixed Timestep Update & Render Pipeline)     │
└───────────────────────────┬────────────────────────────┘
                            │
       ┌────────────────────┼────────────────────┐
       ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌─────────────────┐
│ State Manager│    │ System Layer │    │ Render Engine   │
│ (Scenes 1-4) │    │(Physics/AI)  │    │ (Canvas 2D)     │
└──────────────┘    └──────────────┘    └─────────────────┘
       │                    │                    │
       └────────────────────┼────────────────────┘
                            ▼
                ┌──────────────────────┐
                │ Entity Registry      │
                │ (Player, Zombies,    │
                │ Weapons, Projectiles)│
                └──────────────────────┘
```

---

## 2. Estructura de Proyecto

```
invacion-sena/
├─ index.html
├─ package.json
├─ vite.config.js
├─ scripts/
│  └─ check-docs.mjs      # Validador de consistencia documental (sin dependencias)
├─ assets/
│  ├─ img/
│  │  ├─ icons/
│  │  │  ├─ icon.png       # Logo principal del videojuego
│  │  │  └─ icon.ico       # Variante para iconos de escritorio
│  │  ├─ fondos/
│  │  │  └─ fondo_menu.png # Fondo terrorífico del menú
│  │  ├─ texturas/
│  │  │  ├─ textura_pared.png           # Pared de los entornos
│  │  │  └─ baldosa_color_crema.png     # Suelo del salón y de la arena
│  │  └─ players/
│  │     ├─ zamora/        # Sprites de estado quieto: abajo, arriba, derecha, izquierda
│  │     ├─ chantre/       # Sprites de estado quieto: abajo, arriba, derecha, izquierda
│  │     ├─ juan/          # Sprites de estado quieto: abajo, arriba, derecha, izquierda
│  │     └─ daiver/        # Sprites de estado quieto: abajo, arriba, derecha, izquierda
│  └─ sound/
│     ├─ music/
│     │  ├─ menu/          # fondo_menu.mp3
│     │  └─ ambiental/     # ambiente_tranquilo.mp3 y ambiente_horror.mp3
│     └─ effects/
│        └─ caminar.mp3    # Efecto de pasos en bucle
├─ docs/
│  ├─ 0-constitucion.md
│  ├─ 1-specs.md
│  ├─ 2-plan.md
│  ├─ 3-tasks.md
│  ├─ 4-traceability.md
│  ├─ 5-doc-checklist.md
│  └─ evidence/            # Capturas y verificaciones por sprint, assets, audio y visuales
└─ src/
   ├─ main.js
   ├─ core/
   │  ├─ Game.js           # Inicialización y loop principal (Fixed Timestep)
   │  ├─ StateManager.js   # Manejo de escenas (Boot, Menu, Test, GameOver)
   │  ├─ InputManager.js   # Captura de Teclado + Mouse (soporte 1P / 2P)
   │  ├─ AudioManager.js    # Música contextual, pasos, mute y Web Audio API
   │  ├─ AssetLoader.js    # Carga asíncrona de texturas y audios
   │  └─ AssetManifest.js  # Imports de assets oficiales, pistas y recortes de sprites
   ├─ entities/
   │  ├─ Entity.js         # Clase base con transformadas y bounding box (AABB)
   │  ├─ Player.js         # Personajes, atributos, sprites de estado quieto y pasos
   │  ├─ Zombie.js         # Zombi Aprendiz: entrada, persecución y knockout
   │  ├─ KeyboardProjectile.js # Teclado arrojadizo de la Escena 1
   │  └─ Weapon.js         # Hacha, armas y teclados
   ├─ systems/
   │  ├─ PhysicsSystem.js  # Colisiones AABB / círculo y resolución de empujes
   │  ├─ WaveManager.js    # Gestor de las 10 oleadas de la Escena 3
   │  ├─ CombatSystem.js   # Manejo de daño, hitboxes y salpicaduras
   │  └─ RenderSystem.js   # Renderizado Canvas 2D y efectos de partículas
   ├─ scenes/
   │  ├─ BootScene.js      # Carga asíncrona y pantalla de carga
   │  ├─ MenuScene.js      # Selección de personaje e inicio
   │  ├─ TestScene.js      # Escena de prueba I1: movimiento, colisiones y daño
   │  ├─ GameOverScene.js  # Reinicio de escena o vuelta al menú
   │  ├─ Scene1Ambiente.js # Salón de programación y ataque con teclado
   │  ├─ Scene2Pasillo.js  # Gabinete de incendios y hacha
   │  ├─ Scene3Helipuesto.js # Sobrevivencia 10 oleadas + Helicóptero Rodolfo
   │  └─ Scene4Credits.js  # Créditos a Diego Alejandro Zamora + Himno SENA
   └─ ui/
      ├─ draw.js           # Utilidades de dibujo Canvas 2D
      ├─ textures.js       # Patrones, suciedad y capas offscreen
      ├─ portrait.js       # Retratos recortados para menú, HUD y Game Over
      ├─ HUD.js            # Salud, personaje, FPS, oleada, zombis restantes y arma
      └─ CutsceneOverlay.js# Cuadros de diálogo y narración
```

---

## 3. Máquina de Estados del Juego (Scene Lifecycle)

```
[MENÚ PRINCIPAL] --> (Selección de personaje)
       │
       ▼
[ESCENA 1: AMBIENTE] ──> (Teclado vs Zombi) ──> [ESCENA 2: PASILLO]
                                                     │
                                                     ▼
                                            (Gabinete + Hacha)
                                                     │
                                                     ▼
[ESCENA 4: CRÉDITOS] <── (Extracción) <── [ESCENA 3: HELISUPERFICIE]
 (Himno SENA + Zamora)                     (Oleadas 1 a 10 + Rodolfo M. T.)
```

---

## 4. Estrategia de Renderizado y Físicas

1. **Ciclo de Tiempo Fijo (Fixed Timestep):**
   * Actualización lógica a 60 Hz constantes (`dt = 1/60`) independiente de los Hertz de la pantalla.
   * Interpolación visual en el método `render()` para suavizar movimiento a alta velocidad de refresco.

2. **Detección de Colisiones AABB / Círculo:**
   * **Jugador / Zombis:** Colisión por Círculo de impacto para giros suaves en 360°.
   * **Paredes y Mapa:** Delimitadores por rectángulos `AABB` alineados a los ejes.

3. **IA de Horda de Zombis Aprendices:**
   * Algoritmo de persecución directa con *Steering Behavior* simple para atracción al jugador más cercano.
   * Repulsión entre zombis (Separación) para evitar que se apilen en un único punto.

### 4.1 Escena 1 — Implementación de I2 (actualizada con la nueva historia)

La Escena 1 (`src/scenes/Scene1Ambiente.js`) usa una máquina de fases explícita para separar la llegada, la clase, el salto temporal, la salida del grupo y la amenaza:

| Fase | Comportamiento |
|---|---|
| `intro` | El jugador entra por la puerta y camina hasta su puesto con una interpolación suave; la puerta se cierra. Después se reproduce la cinemática de llegada y la clase de SOLID del instructor. |
| `timeskip` | Destello blanco, letterbox y texto parpadeante «2 HORAS DESPUÉS...» para representar el break. |
| `departure` | Compañeros e instructor caminan hacia la puerta y salen; la puerta se cierra y se añade una breve pausa. |
| `scream` | Destello rojo, temblor y grito sintetizado; después aparece la cinemática «¡¿Qué fue esoo?!». |
| `breach` | Ruptura de la puerta con partículas, sonido y entrada del zombi desde el pasillo. |
| `threat` | Persecución directa del zombi y aviso contextual para lanzar el teclado. |
| `knockout` | El proyectil impacta, el zombi cae y se reproduce el estado de aturdimiento. |
| `free` | Se habilita la zona verde de salida y el jugador camina hacia ella. |
| `exiting` / `complete` | Fundido a negro y transición directa a `scene2`; el panel de cierre de I2 queda como código heredado no alcanzable. |

Composición del salón:

- Los otros tres personajes jugables se ubican automáticamente en pupitres distintos al del jugador; nunca se duplica el personaje seleccionado.
- El instructor tiene un escritorio propio y se dibuja con gafas y corbata para distinguirlo.
- Compañeros e instructor son NPC decorativos: no colisionan, no reciben daño y no participan en el combate.
- El retrato del instructor se dibuja proceduralmente en `CutsceneOverlay` mediante `portrait: "instructor"`.

Decisiones de I2:

- El escenario y los zombis siguen siendo procedurales; el logo, el fondo del menú, las texturas y los 16 sprites de estado quieto son oficiales y se cargan desde `assets/img/`.
- `KeyboardProjectile.js` aplica una corrección de trayectoria leve para que el teclazo contextual sea fiable con el movimiento del zombi.
- `Zombie.js` implementa solo la entrada, persecución directa y *knockout* necesarios para I2. La IA de horda y la repulsión entre zombis se amplían en I4 (T-403).
- La salida conduce a una pantalla de cierre de I2; el pasillo real se implementa en I3 para no adelantar alcance. *(Actualizado en I3: la salida ahora cambia directamente a `scene2` y el cierre de I2 quedó como código heredado no alcanzable.)*
- `AudioManager` incorpora `playDoorOpen`, `playDoorClose` y `playScream`; la voz del instructor y la reacción del jugador usan texto en pantalla, no audio de voz.

### 4.2 Integración de assets oficiales

`src/core/AssetManifest.js` importa los PNG para que Vite los emita en `dist/assets/` y declara un recorte por vista:

| Vista | Archivo fuente | Tecla de asset | Recorte `x, y, w, h` |
|---|---|---|---|
| Zamora abajo | `assets/img/players/zamora/vista_abajo.png` | `zamoraAbajo` | `169, 50, 366, 486` |
| Zamora arriba | `assets/img/players/zamora/vista_arriba.png` | `zamoraArriba` | `91, 50, 367, 483` |
| Zamora derecha | `assets/img/players/zamora/vista_derecha.png` | `zamoraDerecha` | `99, 33, 362, 479` |
| Zamora izquierda | `assets/img/players/zamora/vista_izquierda.png` | `zamoraIzquierda` | `161, 31, 370, 478` |
| Chantre (4 vistas) | `assets/img/players/chantre/vista_*.png` | `chantre*` | `106, 11, 421, 529` · `109, 11, 411, 537` · `144, 8, 344, 547` · `143, 10, 341, 545` |
| Juan (4 vistas) | `assets/img/players/juan/vista_*.png` | `juan*` | `135, 0, 363, 520` · `127, 0, 365, 524` · `131, 4, 357, 568` · `139, 4, 357, 569` |
| Daiver (4 vistas) | `assets/img/players/daiver/vista_*.png` | `daiver*` | `97, 10, 439, 533` · `95, 10, 439, 540` · `132, 0, 374, 580` · `122, 0, 376, 580` |

Reglas de render:

- La vista se elige por la dirección dominante del movimiento; si el jugador está quieto, por la dirección de apuntado del ratón.
- Todos los recortes se escalan a 76 px de alto y se anclan a los pies del jugador para conservar escala y posición.
- El logo se usa en el arranque, el menú, el favicon y el panel de introducción. `src/ui/portrait.js` recorta el rostro para menú, HUD y Game Over.
- **No** se animan caminar, correr ni golpear: solo existe el estado quieto. Los zombis mantienen el render procedural.

### 4.3 Integración visual: menú, skins y texturas (T-210–T-212)

**Fondo del menú (T-210).** `assets/img/fondos/fondo_menu.png` se dibuja en modo *cover* con `getCoverRect()` y se pre-renderiza en una capa offscreen junto con el velo, la viñeta y el oscurecimiento inferior. La capa se reconstruye solo al cambiar el tamaño de la ventana. En pantallas anchas (`width >= 900`) la columna de contenido se alinea a la derecha (46 % del ancho, entre 420 y 720 px) para dejar visible al personaje acurrucado de la ilustración. El layout usa tarjetas 2×2, panel de detalles con barras de estadísticas, botón carmesí de inicio y botón de sonido debajo. En modo compacto (`height < 640`) el panel de detalles muestra las estadísticas en una sola línea.

**Skins (T-211).** Los cuatro personajes comparten el mismo flujo de render: `PLAYER_SPRITE_VIEWS` declara las 16 vistas y `Player.getSpriteView()` resuelve la tecla según `facing`. `ui/portrait.js` toma la vista frontal de cada personaje para las tarjetas, el panel de detalles, el HUD y Game Over. Todos los recortes se midieron sobre el canal alfa con 4 px de margen.

**Texturas (T-212).** `src/ui/textures.js` centraliza el texturizado:

| Función | Uso |
|---|---|
| `getTexturePattern(image, scale)` | Crea y cachea un `CanvasPattern` repetido por imagen y escala. |
| `fillTexture(ctx, rect, image, options)` | Rellena un rectángulo con la textura, con alfa y tinte opcionales. |
| `createGrimeLayer(w, h, options)` | Genera una capa de suciedad, manchas y sangre con semilla determinista. |
| `createLayerCanvas(w, h)` | Crea un canvas offscreen con la escala del dispositivo aplicada. |
| `drawVignette`, `getCoverRect`, `bloodGradient` | Viñeta, encuadre *cover* y degradado carmesí reutilizables. |

La Escena 1 pre-renderiza pared, piso, suciedad, pizarra, reloj y pupitres en `roomLayer`; por fotograma solo se dibujan la luz parpadeante y las entidades. La escena de prueba hace lo mismo con `pageLayer` (pared exterior) y `arenaLayer` (baldosa, suciedad y obstáculos). Las texturas se tiñen con verdes oscuros para conservar la atmósfera de terror.

**Corrección de entrada.** `Game.loop()` llama a `InputManager.endFrame()` únicamente cuando el frame ejecutó al menos una actualización fija, de modo que una pulsación que llega mientras el frame no actualiza no se descarta antes de que la escena la consuma.

### 4.4 Escena 2 — Implementación de I3

`src/scenes/Scene2Pasillo.js` reutiliza la máquina de fases de la Escena 1 y añade el gabinete, el hacha, el combate Melee y la primera oleada:

| Fase | Comportamiento |
|---|---|
| `intro` | Letterbox y tres cuadros narrativos de entrada al pasillo; movimiento bloqueado y salto con `Enter`/`Espacio`. Al terminar pasa a `explore`. |
| `explore` | Movimiento libre, gabinete intacto y aviso contextual. Mantener `E` frente al gabinete ejecuta los golpes. |
| `wave` | Tras equipar el hacha y completar su cinemática, se genera la oleada de 6 Zombis Aprendices y se habilita el ataque Melee. |
| `cleared` | Todos los zombis eliminados: se abre la salida verde y se reproduce la cinemática de pasillo despejado. |
| `exiting` | Fundido a negro al cruzar la salida y detención de la música con fundido. |
| `complete` | Panel de cierre de I3 con tiempo, bajas y opciones de repetir o volver al menú. |

**Gabinete de incendios (T-302, T-303).** El gabinete se ancla a la pared superior, al 38 % del ancho del pasillo, y su punto de interacción tiene un alcance de 82 px. La ruptura exige **mantener `E`**: el contador `cabinetHold` solo avanza mientras la tecla permanece presionada y cada 0.55 s ejecuta un golpe, por lo que se requieren 3 golpes y al menos ~1.65 s de pulsación continua. Al soltar `E` el contador vuelve a 0; una pulsación suelta no rompe el gabinete. El tercer golpe cambia el estado a `broken`, dispara la alarma visual, partículas de vidrio y `playGlassBreak()`.

**Hacha de Incendios (T-303).** Una segunda pulsación de `E` con el gabinete roto y el jugador dentro del alcance equipa `FIRE_AXE` (`src/entities/Weapon.js`): multiplicador de daño 2.4, alcance 88 px, arco `Math.PI * 0.82`, retroceso 190 y enfriamiento `max(0.34, 0.58 / attackSpeed)`. La recogida reproduce `playAxePickup()` y lanza la cinemática `getAxeBeats()`; **su finalización** ejecuta `startWave()`, de modo que la oleada comienza al tomar el hacha, no al romper el cristal.

**Combate Melee (T-304, T-305).** `CombatSystem.attack()` usa el ángulo de apuntado del ratón y la función `targetInArc()`, que combina distancia, apertura del arco y radio del enemigo. Cada golpe aplica daño una sola vez y `Zombie.takeHit()` descuenta salud, aplica retroceso, activa la reacción de impacto y la animación de muerte. El ataque se dispara con clic o `Espacio` y solo funciona si `player.hasWeapon()` es verdadero (RN-02). `renderSwing()` dibuja la estela del arco y el filo del hacha.

**Oleada de pasillo (T-305).** La oleada consta de 6 zombis con 90 de salud y velocidad 68–78 px/s. Se generan de forma escalonada (`0.55 + índice * 0.85` s) desde ambos extremos del pasillo, entran caminando y persiguen al jugador con separación entre vecinos. El contacto aplica 8 de daño. La oleada termina solo cuando la cola de generación está vacía y todos los zombis están muertos (RN-04); entonces se abre la salida (T-306).

**Cinemáticas (T-307).** `src/ui/CutsceneOverlay.js` centraliza el letterbox, el avance por temporizador y el salto con `Enter`/`Espacio`. La Escena 2 define tres secuencias: entrada al pasillo (3 cuadros), recogida del hacha con aviso de oleada (3 cuadros) y pasillo despejado (2 cuadros). La cinemática de recogida es la que encadena la oleada.

**Integración de flujo.** La salida de la Escena 1 llama a `scene2` directamente, `GameOverScene` reinicia la escena indicada por el parámetro `scene` y el HUD muestra salud, personaje, FPS, arma equipada, número de oleada y zombis restantes. La música `ambiente_horror` continúa durante el pasillo y se detiene al entrar a la salida.

---

## 5. Arquitectura del Sistema de Audio

* **Música / Narrativa:** Canales separados para temas ambientales de tensión por escena y el **Himno del SENA** en la escena final.
* **Efectos Sonoros (SFX):**
  * Impacto de teclado (Escena 1).
  * Apertura de gabinete e impacto de Hacha (Escena 2 y 3).
  * Gruñidos y caídas de Zombis Aprendices.
  * Sonido de motor de helicóptero (Llegada del Sr. Rodolfo Martínez Tono).
  * Pasos del jugador mientras se desplaza.

### 5.1 Música contextual y pasos (T-208, T-209)

Los archivos oficiales viven en `assets/sound/` y se importan desde `src/core/AssetManifest.js`, que exporta `MUSIC_TRACKS` y `FOOTSTEP_SOUND`:

| Clave | Archivo | Duración | Situación |
|---|---|---|---|
| `fondoMenu` | `music/menu/fondo_menu.mp3` | 148.04 s | Menú principal |
| `ambienteTranquilo` | `music/ambiental/ambiente_tranquilo.mp3` | 181.99 s | Escena 1 durante el diálogo de introducción y tras reiniciar |
| `ambienteHorror` | `music/ambiental/ambiente_horror.mp3` | 122.04 s | Escena 1 desde la irrupción del zombi hasta la salida |
| `caminar` | `effects/caminar.mp3` | 5.92 s | Pasos en bucle mientras el jugador se desplaza |

Diseño técnico:

- `AudioManager` crea un `MediaElementAudioSourceNode` y un `GainNode` por pista. Los fundidos cruzados duran 0.8 s y el `masterGain` centraliza el mute (`masterVolume 0.8`, `musicVolume 0.5`, `sfxVolume 0.9`).
- Las escenas piden la música por situación con `playMusic(MUSIC_TRACKS.*)`; `stopMusic()` se usa al entrar a la salida y en las escenas sin música.
- Si el contexto de audio aún no está desbloqueado, la pista se guarda en `desiredMusicKey` y se inicia con el primer gesto del usuario, respetando la política de autoplay.
- Los pasos se activan en `Player.update()` cuando el desplazamiento real supera 0.05 px y se detienen al quedar quieto. La ganancia es 2 porque el archivo original tiene un RMS máximo aproximado de 0.022.
- `StateManager` detiene los pasos en cada transición y `Game.onVisibilityChange()` los detiene al ocultar la pestaña. `Game.destroy()` cierra el contexto y libera las pistas.
- La salida de la Escena 1 detiene la música con un fundido de 0.9 s; el reinicio vuelve a `ambienteTranquilo` y el menú recupera `fondoMenu`.

---

## 6. Integración de Sprints (Estrategia SEDD)

El desarrollo se organizará en los siguientes **Sprints de entregables atómicos**:

| Sprint | Enfoque Principal | Entregable Mínimo Funcional |
| :--- | :--- | :--- |
| **I1** | Base del Motor & Menú | Loop de juego 60 FPS, selección de personaje y escena base de pruebas. |
| **I2** | Escena 1 & Cinemática Teclado | Salón de clase, interacción con zombi inicial y lanzamiento de teclado. |
| **I3** | Escena 2 & Sistema Melee | Pasillo, interacción con gabinete, recolección de Hacha y combate básico. |
| **I4** | Escena 3 & Spawner de 10 Oleadas | Helisuperficie, IA de zombis, HUD de oleadas y dificultad progresiva. |
| **I5** | Helicóptero de Rescate & Rodolfo M. T. | Oleada 10, animación de helicóptero y trigger de zona de extracción. |
| **I6** | Escena 4 (Créditos & Himno SENA) | Pantalla final, créditos a Diego Alejandro Zamora, audio del himno y pulido visual. |

**Estado de ejecución (2026-11-11):** I1, I2 e I3 implementados y verificados; integración de assets oficiales, audio contextual e integración visual (fondo del menú, skins y texturas) completadas; pendientes de aprobación G3. I4–I6 pendientes. La evidencia de I3 está en `docs/evidence/i3/`.

---

## 7. Control de Riesgos Técnicos

| Riesgo | Impacto | Mitigación |
| :--- | :--- | :--- |
| **Caída de FPS por excesivos zombis en pantalla** | Alto | Implementar *Object Pooling* para reutilizar instancias de zombis y proyectiles. |
| **Retraso o desincronización en la reproducción de audio Web** | Medio | Precargar las pistas y SFX con `AssetLoader`, desbloquear el contexto en la primera interacción y usar fundidos con `GainNode` por pista. |
| **Incompatibilidad de controles de teclado** | Bajo | Mapeo centralizado en `InputManager` con teclas alternativas (`WASD` + Flechas). |

---

## 8. Validación documental

Para reducir la dependencia de revisión manual, el repositorio incorpora `scripts/check-docs.mjs`, un validador sin dependencias que comprueba:

- Correspondencia de IDs `RF-xx`, `RN-xx` y `RNF-xx` entre `docs/1-specs.md` y `docs/4-traceability.md`.
- Existencia de las tareas `T-xxx` referenciadas en la trazabilidad.
- Estados permitidos y presencia de tarea en cada fila de trazabilidad.
- Enlaces mínimos entre README, plan, trazabilidad y checklist.
- Avisos sobre tareas definidas que todavía no se referencian en la trazabilidad.

Comandos:

```bash
npm run docs:check
npm run docs:check:strict
```

El checklist manual complementario está en `docs/5-doc-checklist.md`. La validación automática no sustituye la verificación de criterios Gherkin, las mediciones de rendimiento ni la revisión de assets.

---

## 9. Registro de cambios

| Fecha | Cambio | Motivo | Impacto |
|---|---|---|---|
| 2026-11-08 | Se agrega validación documental automatizada y checklist de cierre. | Reducir la dependencia de revisión manual de la trazabilidad. | No cambia requisitos de juego; agrega `scripts/check-docs.mjs`, `package.json` y `docs/5-doc-checklist.md`. |
| 2026-11-08 | Se alinea el plan a Canvas 2D y se documenta la estructura real de I1. | Evitar ambigüedad tecnológica y reflejar los módulos implementados. | Se agregan `BootScene`, `TestScene`, `GameOverScene`, `AssetManifest` y `draw.js`; I1 queda implementado. |
| 2026-11-08 | Se documenta la implementación de la Escena 1 y sus entidades. | Reflejar el alcance real de I2 sin depender de assets finales. | Se agregan `Scene1Ambiente.js`, `Zombie.js` y `KeyboardProjectile.js`; I2 queda implementado. |
| 2026-11-08 | Se documenta la integración de assets oficiales. | Reflejar el logo y los sprites de estado quieto de Zamora en el plan técnico. | Se agregan `assets/img` al árbol, recortes por vista y `ui/portrait.js`; no se adelantan animaciones. |
| 2026-11-08 | Se documenta la música contextual y los pasos. | Reflejar los archivos de `assets/sound` y el comportamiento por situación. | Se agrega `assets/sound` al árbol, `MUSIC_TRACKS`, `FOOTSTEP_SOUND` y la sección 5.1; no se agregan animaciones ni audio sintetizado nuevo. |
| 2026-11-09 | Se documenta la integración visual (T-210–T-212). | Reflejar el fondo del menú, las skins de los cuatro personajes y las texturas de los entornos. | Se agregan `fondos/`, `texturas/`, `players/{chantre,juan,daiver}` y `ui/textures.js`; se documentan capas offscreen y la corrección de entrada. No se agregan animaciones. |
| 2026-11-11 | Se documenta la implementación de la Escena 2 y el combate Melee (I3). | Reflejar el pasillo, el gabinete de 3 golpes sostenidos, el hacha, la oleada y las cinemáticas. | Se agrega la sección 4.4; `Scene1Ambiente` conduce a `scene2`; se registran `CombatSystem`, `Weapon` y `CutsceneOverlay`; I3 queda implementado y pendiente de G3. |
| 2026-11-11 | Se actualiza la Escena 1 con la nueva historia (llegada, SOLID, salto temporal, salida, grito y reacción). | Alinear el libreto del salón con la secuencia narrativa solicitada. | La fase `intro` incluye llegada y clase; se agregan `timeskip`, `departure` y `scream`; compañeros e instructor son NPC procedurales; se añaden SFX de puerta y grito. |
