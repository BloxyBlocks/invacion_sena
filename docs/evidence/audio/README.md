# Evidencia — Audio contextual y pasos

**Fecha:** 2026-11-08  
**Alcance:** T-208 (música contextual) y T-209 (efecto de pasos para todos los personajes).  
**Estado:** Implementado y verificado; pendiente de aprobación humana G3.

## Entorno de verificación

| Elemento | Valor |
|---|---|
| Sistema operativo | Windows |
| Node.js | v24.21.0 |
| npm | 11.19.0 |
| Vite | 8.3.6 |
| Navegador | Google Chrome 156.0.8078.81 (headless + CDP) |
| Viewport | 1280 × 720 |
| Servidor | `npm run dev` en `http://127.0.0.1:5173` |

## Archivos de audio integrados

| Archivo | Duración | Uso |
|---|---|---|
| `assets/sound/music/menu/fondo_menu.mp3` | 148.04 s | Música del menú principal |
| `assets/sound/music/ambiental/ambiente_tranquilo.mp3` | 181.99 s | Escena 1 durante el diálogo de introducción |
| `assets/sound/music/ambiental/ambiente_horror.mp3` | 122.04 s | Escena 1 desde la irrupción del zombi |
| `assets/sound/effects/caminar.mp3` | 5.92 s | Pasos en bucle mientras cualquier personaje se desplaza |

Los cuatro archivos se importan desde `src/core/AssetManifest.js`; Vite los emite con hash en `dist/assets/`. No se generó audio nuevo.

## Diseño implementado

- `AudioManager` conecta cada pista al grafo Web Audio mediante `MediaElementAudioSourceNode` y un `GainNode` propio, lo que permite fundidos cruzados de 0.8 s y un `masterGain` único para el mute.
- La pista pedida queda como `desiredMusicKey` hasta que el navegador permite reproducir. El primer gesto (tecla o clic) desbloquea el contexto e inicia la música pendiente.
- `Scene1Ambiente` pide `ambienteTranquilo` en la introducción, `ambienteHorror` en `beginBreach()` y detiene la música al entrar a la salida; el reinicio vuelve a la calma.
- `Player.update()` activa los pasos solo cuando el desplazamiento real supera 0.05 px y los detiene al quedar quieto. Como la llamada vive en `Player`, aplica a Zamora, Chantre, Juan y Daiver.
- `StateManager` y `Game.onVisibilityChange()` detienen los pasos al cambiar de escena o al ocultar la pestaña.
- El efecto de pasos usa ganancia 2 porque el archivo original es muy bajo (RMS máximo ≈ 0.022).

## Resultado observado

| Comprobación | Resultado |
|---|---|
| `npm run build` | Correcto: 33 módulos y 4 MP3 emitidos en `dist/assets/` |
| Carga de assets | `assetsTotal: 9`, `assetsLoaded: 9`, `assetErrors: []` |
| Menú | `currentMusicKey: fondoMenu`; ganancia de pista 1 y demás pistas en 0 |
| Introducción de Escena 1 | `currentMusicKey: ambienteTranquilo`; menú detenido y horror en 0 |
| Irrupción del zombi | `currentMusicKey: ambienteHorror`; calma detenida y horror con ganancia 1 |
| Knockout y fase libre | Horror continúa activo |
| Entrada a la salida | `currentMusicKey: null`, `desiredMusicKey: null`; las tres pistas quedan en pausa |
| Reinicio (`R`) | Vuelve a `ambienteTranquilo` |
| Regreso al menú | Vuelve a `fondoMenu` con ganancia 1 |
| Pasos con Zamora | Reproducción activa, avance de 0.41 s en 0.4 s de caminata |
| Pasos con Chantre | Reproducción activa, avance de 0.41 s |
| Pasos con Juan | Reproducción activa, avance de 0.41 s |
| Pasos con Daiver | Reproducción activa, avance de 0.40 s |
| Pasos al detenerse | `paused: true`, `footstepWanted: false` en los cuatro personajes |
| Mute (`M`) | `masterGain` pasa de 0.8 a 0 y vuelve a 0.8 |
| FPS | 60 en 1280×720 |
| Errores de consola | 0 |
| Flujo I2 completo | Irrupción → teclazo → knockout → salida → cierre, sin regresiones |

## Capturas

| Captura | Archivo |
|---|---|
| Menú con música de fondo | [`menu-music-1280x720.png`](./menu-music-1280x720.png) |
| Introducción con `ambiente_tranquilo` | [`intro-calm-1280x720.png`](./intro-calm-1280x720.png) |
| Irrupción con `ambiente_horror` | [`breach-horror-1280x720.png`](./breach-horror-1280x720.png) |
| Knockout con música de horror | [`knockout-horror-1280x720.png`](./knockout-horror-1280x720.png) |
| Salida habilitada | [`exit-ready-1280x720.png`](./exit-ready-1280x720.png) |
| Cierre con la música detenida | [`complete-music-stopped-1280x720.png`](./complete-music-stopped-1280x720.png) |
| Pasos con Zamora | [`steps-zamora-1280x720.png`](./steps-zamora-1280x720.png) |
| Pasos con Chantre | [`steps-chantre-1280x720.png`](./steps-chantre-1280x720.png) |
| Pasos con Juan | [`steps-juan-1280x720.png`](./steps-juan-1280x720.png) |
| Pasos con Daiver | [`steps-daiver-1280x720.png`](./steps-daiver-1280x720.png) |

## Cómo reproducir manualmente

1. Ejecutar `npm install` y `npm run dev`.
2. Abrir `http://127.0.0.1:5173` y pulsar cualquier tecla o hacer clic para desbloquear el audio.
3. Confirmar que suena `fondo_menu` en el menú.
4. Entrar a la Escena 1: durante el diálogo debe sonar `ambiente_tranquilo`.
5. Saltar el diálogo con `Enter` o `Espacio`: la irrupción debe cambiar a `ambiente_horror`.
6. Mover a cada personaje con `WASD` o flechas y comprobar que los pasos suenan solo al desplazarse.
7. Usar `M` para silenciar y restaurar el audio.
8. Salir por la puerta: la música debe detenerse con un fundido.
9. Reiniciar con `R` (vuelve la calma) y regresar al menú (vuelve `fondo_menu`).
10. Ejecutar `npm run build` y verificar los MP3 emitidos en `dist/assets/`.

## Limitaciones

- El navegador exige un primer gesto del usuario; antes de ese gesto la pista queda pendiente y no suena.
- La música y los pasos se verificaron en Chrome; Firefox, Edge y Safari no se probaron en esta pasada.
- Solo existe el estado quieto de Zamora: no hay animaciones de caminar, correr ni golpear; el efecto de pasos es sonoro, no visual.
- Chantre, Juan, Daiver y el Zombi Aprendiz mantienen render procedural.
- La aprobación humana G3 de I1, I2 y de esta integración de audio sigue pendiente.

## Archivo de datos

Los resultados estructurados están en [`verification.json`](./verification.json).
