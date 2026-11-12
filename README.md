# INVACIÓN SENA

Juego web 2D de supervivencia ambientado en el SENA. El jugador elige a Zamora, Chantre, Juan o Daiver, escapa del ambiente de programación, consigue un hacha, sobrevive diez oleadas y es rescatado en helicóptero por el Sr. Rodolfo Martínez Tono.

El proyecto se guía por **SEDD (Spec-Driven Development)**: la documentación define el trabajo y el código la materializa; el código no redefine el alcance por su cuenta.

## Estado actual

Los **Sprints I1, I2 e I3** están implementados y verificados, pendientes de aprobación humana G3.

**I1 — Base del motor (completado):**

- Motor Vite + JavaScript ES6+ sobre **Canvas 2D**, con loop de actualización fija a 60 Hz.
- Menú de selección entre Zamora, Chantre, Juan y Daiver, con teclado y ratón.
- `InputManager` (WASD/flechas + ratón), `AudioManager` (Web Audio API con desbloqueo tras el primer gesto) y `AssetLoader` asíncrono.
- Escena de prueba con movimiento, colisiones, zonas de daño y HUD base (salud, personaje, FPS).
- Flujo de Game Over con reinicio de escena o vuelta al menú.

**I2 — Escena 1: El Ambiente de Programación (completado):**

- Salón de clase procedural con paredes, pupitres, tablero, reloj y puerta.
- El jugador entra y camina hasta su puesto; los otros tres aprendices ya están en sus pupitres y el instructor dicta clase desde su escritorio.
- Cinemática de llegada y clase de SOLID («Bueno, empecemos. Hoy vamos a ver los principios SOLID...»), con retrato procedural del instructor.
- Salto temporal con destello y rótulo «2 HORAS DESPUÉS...» para representar el break.
- Los compañeros y el instructor salen del ambiente y cierran la puerta; se escucha un grito y el personaje exclama «¡¿Qué fue esoo?!».
- Cinemática breve de irrupción: la puerta se rompe y entra el Zombi Aprendiz.
- Ataque contextual con teclado (`E` / `Espacio`): proyectil con trayectoria, impacto y _knockout_ del zombi.
- Salida al pasillo habilitada tras el _knockout_; al cruzar la zona verde comienza la Escena 2.

**I3 — Escena 2: Pasillos, Gabinete y Hacha (completado):**

- Pasillo del bloque A procedural con paredes texturizadas, obstáculos, puerta de entrada, gabinete de incendios y salida al patio.
- Cinemática de entrada al pasillo con letterbox y aviso del objetivo; se puede saltar con `Enter`/`Espacio`.
- **Gabinete de 3 golpes:** mantener `E` frente a la bomba ejecuta un golpe cada 0.55 s; se requieren 3 golpes (≈1.65 s) para romper el cristal. Soltar `E` reinicia el progreso y una pulsación suelta no rompe el gabinete.
- **Hacha de Incendios:** una segunda pulsación de `E` equipa el arma (`Weapon.js`). Su cinemática de recogida inicia la primera oleada de 6 Zombis Aprendices.
- **Combate Melee:** arco de ataque en 360° según el ratón, alcance de 88 px, daño ×2.4, retroceso, reacción al impacto y muerte de los zombis (`CombatSystem.js`).
- HUD ampliado con arma equipada, número de oleada y zombis restantes.
- Cinemática de pasillo despejado, apertura de la salida verde y panel de cierre de I3 con tiempo y bajas.
- Game Over reinicia la escena que lo provocó (Escena 2 incluida).

**Integración de assets oficiales (completado):**

- Logo principal `assets/img/icons/icon.png` en el arranque, el menú y el favicon.
- Sprites de estado quieto de Zamora, Chantre, Juan y Daiver (`vista_abajo`, `vista_arriba`, `vista_derecha`, `vista_izquierda`) renderizados según la dirección de movimiento o de apuntado.
- Retratos de los cuatro personajes en las tarjetas del menú, el detalle, el HUD y la pantalla de Game Over.
- **No** se implementaron animaciones de caminar, correr ni golpear porque todavía no existen esos sprites; los zombis conservan render procedural.

**Integración visual (completado):**

- Fondo del menú `assets/img/fondos/fondo_menu.png` en modo _cover_, con velo oscuro, viñeta, brasas y paleta carmesí; en pantallas anchas el contenido se desplaza a la derecha para dejar visible al personaje acurrucado.
- Texturas `assets/img/texturas/textura_pared.png` y `baldosa_color_crema.png` repetidas con `CanvasPattern` y teñidas para conservar la atmósfera de terror en la Escena 1 y en la escena de prueba.
- Capas offscreen pre-renderizadas para fondo, suelo, mobiliario y suciedad/sangre; solo la luz parpadeante y las entidades se dibujan por fotograma.
- Corrección del `InputManager`: las pulsaciones de teclado y ratón se conservan hasta que un fotograma ejecuta al menos una actualización fija.

**Audio contextual (completado):**

- Música del menú con `assets/sound/music/menu/fondo_menu.mp3`.
- `ambiente_tranquilo` durante el diálogo de introducción de la Escena 1 y `ambiente_horror` desde la irrupción del zombi.
- Fundido cruzado entre pistas y detención con fundido al entrar a la salida.
- Efecto de pasos `assets/sound/effects/caminar.mp3` en bucle para Zamora, Chantre, Juan y Daiver mientras se desplazan.
- Mute centralizado con `M`; la música queda pendiente hasta el primer gesto del usuario por la política de autoplay del navegador.

Los **assets definitivos son manuales**. La integración actual cubre el logo, el fondo del menú, las texturas de los entornos, las 16 vistas de estado quieto de los cuatro personajes y el audio oficial de menú, ambiente y pasos; el escenario y los zombis siguen siendo procedurales. La evidencia reproducible está en `docs/evidence/i1/`, `docs/evidence/i2/`, `docs/evidence/i3/`, `docs/evidence/assets/`, `docs/evidence/audio/` y `docs/evidence/visuals/`. El siguiente sprint es I4 (`docs/3-tasks.md`).

## Assets gráficos

| Asset              | Ruta                                          | Uso                                                 |
| ------------------ | --------------------------------------------- | --------------------------------------------------- |
| Logo principal     | `assets/img/icons/icon.png`                   | `BootScene`, `MenuScene` y favicon                  |
| Fondo del menú     | `assets/img/fondos/fondo_menu.png`            | Fondo terrorífico del menú principal                |
| Textura de pared   | `assets/img/texturas/textura_pared.png`       | Paredes de la Escena 1 y de la escena de prueba     |
| Baldosa crema      | `assets/img/texturas/baldosa_color_crema.png` | Suelo del salón y arena de prueba                   |
| Zamora (4 vistas)  | `assets/img/players/zamora/vista_*.png`       | Jugador quieto/apuntando en 4 direcciones; retratos |
| Chantre (4 vistas) | `assets/img/players/chantre/vista_*.png`      | Jugador quieto/apuntando en 4 direcciones; retratos |
| Juan (4 vistas)    | `assets/img/players/juan/vista_*.png`         | Jugador quieto/apuntando en 4 direcciones; retratos |
| Daiver (4 vistas)  | `assets/img/players/daiver/vista_*.png`       | Jugador quieto/apuntando en 4 direcciones; retratos |

Los assets se importan desde `src/core/AssetManifest.js`; Vite los emite con hash en `dist/assets/` durante la compilación. Cada vista declara un recorte (`crop`) medido sobre el canal alfa para que el personaje mantenga escala y anclaje al girar. Solo existen sprites de **estado quieto**; caminar, correr y golpear se integrarán cuando se entreguen sus animaciones.

## Audio

| Archivo                                               | Duración | Uso                                              |
| ----------------------------------------------------- | -------- | ------------------------------------------------ |
| `assets/sound/music/menu/fondo_menu.mp3`              | 148.04 s | Música del menú principal                        |
| `assets/sound/music/ambiental/ambiente_tranquilo.mp3` | 181.99 s | Escena 1 durante el diálogo de introducción      |
| `assets/sound/music/ambiental/ambiente_horror.mp3`    | 122.04 s | Escena 1 desde la irrupción del zombi y Escena 2 |
| `assets/sound/effects/caminar.mp3`                    | 5.92 s   | Pasos en bucle al desplazarse                    |

`AudioManager` conecta cada pista al grafo Web Audio con un `GainNode` propio para hacer fundidos cruzados y usa un `masterGain` común para el mute. La pista solicitada se guarda como pendiente hasta que el primer gesto del usuario desbloquea el contexto de audio.

La música cambia por situación: menú → `fondo_menu`; introducción → `ambiente_tranquilo`; irrupción, amenaza, knockout, fase libre y Escena 2 → `ambiente_horror`; entrada a la salida → silencio con fundido; reinicio → `ambiente_tranquilo`; regreso al menú → `fondo_menu`.

El efecto de pasos se activa en `Player.update()` solo cuando el desplazamiento real supera 0.05 px. Como la lógica vive en `Player`, aplica a los cuatro personajes. Se detiene al quedar quieto, cambiar de escena, entrar a la salida o al ocultar la pestaña.

## Ejecución del proyecto

### 1. Requisitos

| Elemento          | Versión / condición                                                                    |
| ----------------- | -------------------------------------------------------------------------------------- |
| Node.js           | 20 o superior; verificado con 24.21.0                                                  |
| npm               | 10 o superior; verificado con 11.19.0                                                  |
| Navegador         | Moderno, con Canvas 2D y Web Audio API; verificado en Chrome 156 y Chrome headless 157 |
| Assets            | Incluidos en `assets/img/` y `assets/sound/`; no se requiere descarga adicional        |
| Sistema operativo | Windows, macOS o Linux con Node.js instalado                                           |

### 2. Instalación

Desde la raíz del repositorio:

```bash
npm install
```

Esto instala Vite como dependencia de desarrollo. El validador documental no tiene dependencias externas.

## JUGAR YA CON PYTHON

Solo necesita un servidor estático sencillo, no Node ni npm:

# Si tiene Python:

python -m http.server 8080 -d dist

# Abrir http://localhost:8080

### 3. Modo desarrollo

```bash
npm run dev
```

Vite sirve el juego en `http://localhost:5173` y abre el navegador automáticamente (`server.open: true` en `vite.config.js`). Para fijar host y puerto, por ejemplo en un entorno local o remoto:

```bash
npm run dev -- --host 127.0.0.1 --port 5173
```

Si el puerto está ocupado:

```bash
npm run dev -- --port 5174
```

Los cambios en `src/`, `index.html` o `vite.config.js` se recargan en caliente. El servidor se detiene con `Ctrl + C`.

### 4. Compilación y previsualización

```bash
npm run build      # genera la versión de producción en dist/
npm run preview    # sirve dist/ para revisar la compilación
```

`dist/` no se versiona. La compilación actual transforma 53 módulos y emite las 20 imágenes y los 4 MP3 en `dist/assets/`; no requiere configuración adicional.

### 5. Flujo jugable actual

```text
Boot (carga de assets)
  → Menú de selección de personaje
  → Escena 1: llegada al puesto, clase de SOLID, «2 HORAS DESPUÉS...»,
    salida del grupo, grito, «¡¿Qué fue esoo?!», irrupción y teclazo
  → Escena 2: cinemática de entrada, gabinete, Hacha de Incendios y oleada
  → Panel de cierre de I3 (la helisuperficie se implementa en I4)
  → Repetir escena o volver al menú
```

La escena de prueba de I1 (`test`) sigue registrada en el motor como apoyo de depuración, pero el menú inicia la Escena 1.

### 6. Verificación

Antes de cerrar una tarea o sprint:

```bash
npm run docs:check         # consistencia documental
npm run docs:check:strict  # falla también ante advertencias
npm run build              # compilación de producción
```

Comprobación manual mínima de I1 + I2 + I3 + audio + integración visual:

1. Abrir el juego y verificar el fondo terrorífico del menú, el logo oficial y la ilustración del personaje a la izquierda en pantallas anchas.
2. Recorrer las tarjetas con `←`/`→` y confirmar con `Enter`; cada personaje debe mostrar su propio sprite en la tarjeta y en el panel de detalles.
3. Pulsar una tecla o hacer clic y confirmar que suena `fondo_menu` en el menú.
4. En la Escena 1, comprobar la llegada automática al puesto, la cinemática del instructor con `ambiente_tranquilo` y el rótulo «2 HORAS DESPUÉS...».
5. Confirmar que los compañeros salen, la puerta se cierra, suena el grito y aparece la línea «¡¿Qué fue esoo?!».
6. Verificar que la puerta se rompe, que entra el Zombi Aprendiz y que la música cambia a `ambiente_horror`.
7. Mover a cada personaje en las cuatro direcciones y comprobar que los pasos suenan solo mientras se desplaza y que el sprite cambia entre `vista_abajo`, `vista_arriba`, `vista_derecha` y `vista_izquierda`.
8. Lanzar el teclado con `E` o `Espacio` y comprobar el _knockout_.
9. Caminar hasta la zona verde de salida y confirmar que la música se detiene y comienza la Escena 2 con su cinemática.
10. En la Escena 2, pulsar `E` sin mantener frente al gabinete y comprobar que **no** se rompe; después mantener `E` hasta completar los 3 golpes.
11. Pulsar `E` de nuevo para tomar el Hacha de Incendios y dejar que la cinemática inicie la oleada de 6 zombis.
12. Apuntar con el ratón y atacar con clic o `Espacio`; comprobar el arco, el daño, la muerte de los zombis y el HUD con arma, oleada y restantes.
13. Tras eliminar la oleada, ver la cinemática de pasillo despejado, cruzar la salida verde y comprobar el panel de cierre de I3.
14. Probar `R` para repetir la Escena 2 y `Esc`/`M` para volver al menú; confirmar que Game Over reinicia la Escena 2.
15. En el menú, probar `M` o el botón de sonido para silenciar y restaurar todo el audio.
16. Confirmar la pared texturizada y la baldosa crema oscurecida en el salón, el pasillo y la escena de prueba.
17. Redimensionar la ventana a 1024 × 600 y 820 × 1000 y comprobar que el contenido sigue dentro del viewport.
18. Confirmar 60 FPS y ausencia de errores en la consola del navegador.

La evidencia reproducible de cada sprint está en `docs/evidence/i1/`, `docs/evidence/i2/`, `docs/evidence/i3/`, `docs/evidence/scene1-story/`, `docs/evidence/assets/`, `docs/evidence/audio/` y `docs/evidence/visuals/`.

### 7. Scripts disponibles

| Script                      | Qué hace                                    |
| --------------------------- | ------------------------------------------- |
| `npm run dev`               | Inicia el servidor de desarrollo de Vite    |
| `npm run build`             | Compila la versión de producción en `dist/` |
| `npm run preview`           | Sirve la compilación de producción          |
| `npm run docs:check`        | Valida la consistencia de la documentación  |
| `npm run docs:check:strict` | Valida y falla ante errores o advertencias  |

### 8. Problemas comunes

| Síntoma                                            | Causa probable                                            | Solución                                                                            |
| -------------------------------------------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `npm` no se reconoce                               | Node.js no está instalado o no está en `PATH`             | Instalar Node.js 20+ y abrir una terminal nueva                                     |
| El puerto 5173 está ocupado                        | Otro proceso o servidor Vite activo                       | Usar `npm run dev -- --port 5174` o detener el proceso anterior                     |
| Pantalla en negro                                  | Error de JavaScript o assets                              | Revisar la consola del navegador y ejecutar `npm run build`                         |
| No se escucha audio                                | El navegador bloquea audio hasta un gesto del usuario     | Hacer clic o pulsar una tecla; el audio se desbloquea en la primera interacción     |
| Los personajes o el escenario no muestran texturas | Los assets no se cargaron o el canvas no soporta patrones | Revisar `missingImages` en la consola y ejecutar `npm run build`                    |
| Los personajes no cambian de animación al caminar  | Solo existen sprites de estado quieto                     | Es el alcance actual; las animaciones se integrarán cuando se entreguen sus sprites |
| FPS por debajo de 60                               | Pestaña en segundo plano o equipo limitado                | Mantener la pestaña activa y revisar la medición en primer plano                    |

## Mapa del repositorio

```text
.
├─ README.md                 # Punto de entrada para personas y agentes
├─ index.html                # Documento raíz y canvas del juego
├─ vite.config.js            # Configuración de Vite
├─ package.json              # Dependencias y scripts de desarrollo/validación
├─ scripts/
│  └─ check-docs.mjs         # Validador de consistencia documental
├─ assets/
│  ├─ img/
│  │  ├─ icons/icon.png      # Logo principal del videojuego
│  │  ├─ fondos/             # fondo_menu.png
│  │  ├─ texturas/           # textura_pared.png y baldosa_color_crema.png
│  │  └─ players/            # Sprites de estado quieto en 4 direcciones
│  │     ├─ zamora/
│  │     ├─ chantre/
│  │     ├─ juan/
│  │     └─ daiver/
│  └─ sound/
│     ├─ music/menu/         # fondo_menu.mp3
│     ├─ music/ambiental/    # ambiente_tranquilo.mp3 y ambiente_horror.mp3
│     └─ effects/caminar.mp3 # Efecto de pasos en bucle
├─ docs/
│  ├─ 0-constitucion.md      # Principios, alcance innegociable y flujo SEDD
│  ├─ 1-specs.md             # Fuente de verdad funcional: RF, RN, RNF y aceptación
│  ├─ 2-plan.md              # Decisiones técnicas, arquitectura y sprints
│  ├─ 3-tasks.md             # Trabajo atómico por sprint; lista operativa
│  ├─ 4-traceability.md      # Relación requisito → tarea → módulo → verificación
│  ├─ 5-doc-checklist.md     # Checklist manual de cierre documental
│  ├─ evidence/i1/           # Capturas y verificación estructurada del Sprint I1
│  ├─ evidence/i2/           # Capturas y verificación estructurada del Sprint I2
│  ├─ evidence/i3/           # Escena 2, gabinete, hacha, oleada y cinemáticas
│  ├─ evidence/assets/       # Verificación de la integración de assets oficiales
│  ├─ evidence/audio/        # Verificación de música contextual y pasos
│  └─ evidence/visuals/      # Fondo del menú, skins y texturas (T-210–T-212)
└─ src/
   ├─ main.js                # Punto de entrada: crea y arranca el juego
   ├─ core/
   │  ├─ Game.js             # Loop principal con Fixed Timestep y canvas
   │  ├─ StateManager.js     # Registro y transición de escenas
   │  ├─ InputManager.js     # Teclado y ratón
   │  ├─ AudioManager.js     # Música contextual, pasos, mute y Web Audio API
   │  ├─ AssetLoader.js      # Carga asíncrona de imágenes y audio
   │  └─ AssetManifest.js    # Manifiesto de assets, pistas y recortes de sprites
   ├─ entities/
   │  ├─ Entity.js           # Base con posición e interpolación
   │  ├─ Player.js           # Personajes, sprites de estado quieto, atributos, pasos y arma
   │  ├─ Zombie.js           # Zombi Aprendiz: entrada, persecución, salud y muerte
   │  ├─ KeyboardProjectile.js # Proyectil de teclado con trayectoria e impacto
   │  └─ Weapon.js           # Hacha de Incendios y estadísticas de armas
   ├─ systems/
   │  ├─ PhysicsSystem.js    # Colisiones círculo-rectángulo y movimiento
   │  └─ CombatSystem.js     # Arco Melee, enfriamiento, impactos y estela de golpe
   ├─ scenes/
   │  ├─ BootScene.js        # Carga inicial y presentación del logo
   │  ├─ MenuScene.js        # Fondo terrorífico, selección de personaje e inicio
   │  ├─ Scene1Ambiente.js   # Escena 1: llegada, clase, salto temporal, grito, teclazo y salida
   │  ├─ Scene2Pasillo.js    # Escena 2: pasillo, gabinete, hacha, oleada y cinemáticas
   │  ├─ TestScene.js        # Escena de prueba de I1 con texturas
   │  └─ GameOverScene.js    # Reinicio de la escena activa o vuelta al menú
   └─ ui/
      ├─ draw.js             # Utilidades de dibujo Canvas 2D
      ├─ textures.js         # Patrones, capas de suciedad y capas offscreen
      ├─ portrait.js         # Retratos recortados de los cuatro personajes
      ├─ CutsceneOverlay.js  # Letterbox, cuadros narrativos y avance de cinemáticas
      └─ HUD.js              # Salud, personaje, FPS, oleada, restantes y arma
```

## Controles actuales (I1 + I2 + I3)

| Contexto          | Acción                      | Entrada                                     |
| ----------------- | --------------------------- | ------------------------------------------- |
| Menú              | Cambiar personaje           | `←` `→` / `A` `D` / ratón                   |
| Menú              | Iniciar partida             | `Enter` / `Espacio` / clic en el botón      |
| Menú              | Activar o silenciar audio   | `M` / botón de sonido                       |
| Escena 1          | Avanzar cinemáticas         | `Enter` / `Espacio` / Clic                  |
| Escena 1          | Mover                       | `WASD` / flechas                            |
| Escena 1          | Apuntar                     | Ratón                                       |
| Escena 1          | Lanzar el teclado           | `E` / `Espacio`                             |
| Escena 1          | Salir al pasillo            | Caminar a la zona verde de salida           |
| Escena 1          | Volver al menú              | `Esc`                                       |
| Escena 2          | Saltar cinemáticas          | `Enter` / `Espacio`                         |
| Escena 2          | Mover                       | `WASD` / flechas                            |
| Escena 2          | Apuntar                     | Ratón                                       |
| Escena 2          | Romper el gabinete          | Mantener `E` frente a la bomba (3 golpes)   |
| Escena 2          | Tomar el Hacha de Incendios | `E` / `Espacio` con el gabinete roto        |
| Escena 2          | Atacar                      | Clic / `Espacio`                            |
| Escena 2          | Salir al patio              | Eliminar la oleada y cruzar la salida verde |
| Escena 2          | Volver al menú              | `Esc`                                       |
| Cierre de I3      | Repetir escena              | `R` / `Enter` con la opción seleccionada    |
| Cierre de I3      | Volver al menú              | `M` / `Esc`                                 |
| Game Over (I1–I3) | Reiniciar la escena activa  | `R` / `Enter` con la opción seleccionada    |
| Game Over (I1–I3) | Volver al menú              | `M` / `Esc`                                 |

## Lectura obligatoria para un agente

Antes de editar código, leer en este orden:

1. `docs/0-constitucion.md`
2. `docs/1-specs.md`
3. `docs/2-plan.md`
4. `docs/3-tasks.md`
5. `docs/4-traceability.md`

La cadena de autoridad es:

```text
Constitución → Especificación → Plan → Tareas → Código/pruebas → Trazabilidad
```

Si dos documentos discrepan, prevalece el que esté más a la izquierda. Si el código discrepa con la documentación, el cambio no está aceptado hasta actualizar la documentación y obtener la aprobación humana indicada por las puertas G1–G4.

## Protocolo de trabajo SEDD

Para implementar una funcionalidad:

1. Localizar los IDs afectados (`RF-xx`, `RN-xx`, `RNF-xx`) en la especificación.
2. Confirmar que el plan define el enfoque técnico. Si no lo define, actualizar `docs/2-plan.md` antes de implementar.
3. Localizar o crear una tarea `T-xxx` pequeña, verificable y asociada a un sprint en `docs/3-tasks.md`.
4. Implementar únicamente el alcance de esa tarea.
5. Verificar el criterio de aceptación correspondiente; no marcar la tarea como completada sin evidencia reproducible.
6. Actualizar `docs/4-traceability.md` con los módulos modificados, el estado y la evidencia.
7. Ejecutar `npm run docs:check` y corregir los errores antes de cerrar la tarea o el sprint.

Los estados permitidos son `Pendiente`, `En curso`, `Bloqueado`, `En revisión` y `Completado`. Mantener los checkboxes de tareas sincronizados con ese estado.

## Validación

Validación documental (sin dependencias externas):

```bash
npm run docs:check
npm run docs:check:strict
```

El primero reporta errores y advertencias; el segundo falla también ante advertencias. El checklist manual complementario está en `docs/5-doc-checklist.md`.

Verificación técnica del sprint:

```bash
npm run build
```

La evidencia de I1, I2, I3, de la integración de assets, del audio contextual y de la integración visual, con capturas, entorno y pasos de reproducción, está en `docs/evidence/i1/README.md`, `docs/evidence/i2/README.md`, `docs/evidence/i3/README.md`, `docs/evidence/assets/README.md`, `docs/evidence/audio/README.md` y `docs/evidence/visuals/README.md`.

## Límites de alcance actuales

- Plataforma inicial: navegador moderno, JavaScript ES6+, Vite y Canvas 2D.
- WebGL o PixiJS solo se evalúan si una medición demuestra que Canvas 2D no cumple el objetivo de rendimiento.
- Un jugador es el alcance de la primera versión; el diseño debe permitir sumar cooperativo local más adelante, sin implementarlo ahora.
- Armas de fuego y sus drops son opcionales; no bloquean la ruta principal de finalización.
- Los assets definitivos se producen manualmente; el código debe funcionar con placeholders mientras tanto.
- No inventar escenas, personajes, armas, mecánicas ni contenido narrativo fuera de `docs/1-specs.md`.

## Criterios de calidad no negociables

- Juego navegable con teclado y ratón.
- Bucle de actualización fijo a 60 Hz y objetivo de 60 FPS con hasta 100 entidades activas.
- Sin errores en la consola del navegador.
- Carga asíncrona de assets y canales de audio separados; la música se elige por situación y los pasos acompañan el desplazamiento.
- Cada requisito completado debe tener tarea y evidencia en trazabilidad.
- La documentación pasa `npm run docs:check` antes de cerrar una tarea o sprint.

## Convenciones

- Requisitos: `RF-xx` (funcionales), `RN-xx` (reglas de juego), `RNF-xx` (no funcionales).
- Tareas: `T-xxx`.
- Código: nombres técnicos claros en inglés; interfaz, historia y diálogos en español.
- Cambios de alcance: documentar motivo, impacto y fecha en los documentos afectados antes de editar código.

## Ruta principal del juego

```text
Menú → Escena 1: teclado contra zombi → Escena 2: gabinete y hacha
     → Escena 3: 10 oleadas y extracción → Escena 4: créditos e Himno del SENA
```

Para el detalle funcional y los escenarios Gherkin, consultar `docs/1-specs.md`.
