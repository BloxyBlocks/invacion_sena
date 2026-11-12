# Evidencia — Sprint I3

**Fecha:** 2026-11-11  
**Alcance:** T-301 a T-307 (Escena 2: pasillo del SENA, gabinete de incendios, Hacha de Incendios, combate Melee, primera oleada y cinemáticas).  
**Estado:** Implementado y verificado; pendiente de aprobación humana G3.

## Entorno de verificación

| Elemento | Valor |
|---|---|
| Sistema operativo | Windows |
| Node.js | v24.21.0 |
| npm | 11.19.0 |
| Vite | 8.3.6 |
| Navegador | Chrome headless 157.0.0.0 (CDP) |
| Viewport principal | 1280 × 720 |
| Viewport compacto | 1024 × 600 |
| Assets | Logo, fondo, texturas y sprites de estado quieto; pasillo y zombis procedurales |

## Resultado observado

| Comprobación | Resultado |
|---|---|
| Compilación de producción (`npm run build`) | Correcta, 53 módulos transformados |
| FPS durante la verificación | ≈58.06 FPS |
| Errores de consola | 0 |
| Escena 1 → Escena 2 | `state: scene2` |
| Cinemática inicial | Fase `intro`, `cutscene: true` |
| Fin de la cinemática inicial | Fase `explore` |
| Arco Melee en 4 direcciones | `[true, true, true, true]`; por la espalda `false` |
| Pulsar `E` sin mantener | Gabinete `intact`, `hits: 0` |
| Mantener `E` | 3 golpes, gabinete `broken` |
| Equipar el hacha con `E` | `weapon: fireAxe`, `cabinet: taken`, cinemática activa |
| Inicio de la oleada | Fase `wave`, `queued: 6`, `waveSize: 6` |
| Eliminación de la oleada | `killed: 6`, `alive: 0` |
| Salida tras despejar | Fase `cleared`, `exitOpen: true` |
| Cruce de la salida | Fase `complete`, tiempo final 20.57 s |
| Vista compacta 1024 × 600 | Escena responsive; gabinete dentro del área jugable |
| Salud a 0 | Estado `gameOver` |
| Game Over → reinicio | `state: scene2` |

## Mecánica del gabinete

- El jugador debe estar a 82 px o menos del punto de interacción del gabinete.
- Mantener `E` acumula tiempo; cada **0.55 s** se ejecuta un golpe de hacha.
- Se requieren **3 golpes** (≈1.65 s de pulsación continua) para romper el cristal.
- Si se suelta `E`, el contador vuelve a 0; una pulsación breve no rompe el gabinete.
- Con el gabinete roto, una **segunda pulsación** de `E` (o `Espacio`) equipa el Hacha de Incendios.
- La cinemática de recogida se reproduce al equipar el hacha y **su finalización inicia la oleada**.
- La oleada consta de 6 Zombis Aprendices (90 de salud, 68–78 px/s) que aparecen escalonados desde ambos extremos del pasillo.

## Flujo verificado

```text
menu
  → scene1:intro → breach → threat → knockout → free → exiting
  → scene2:intro (cinemática de entrada)
  → scene2:explore
  → mantener E → 3 golpes → gabinete roto
  → pulsar E → Hacha de Incendios + cinemática
  → scene2:wave (6 zombis)
  → 6 eliminados → scene2:cleared (cinemática de pasillo despejado)
  → cruzar la salida → scene2:exiting → scene2:complete
  → R reinicia scene2 / M vuelve al menú
```

Game Over: salud a 0 → `gameOver` → `R`/`Enter` reinicia `scene2`.

## Capturas

| Captura | Archivo |
|---|---|
| Cinemática de entrada al pasillo | [`intro-cinematic-1280x720.png`](./intro-cinematic-1280x720.png) |
| Progreso de los 3 golpes al gabinete | [`cabinet-hold-progress-1280x720.png`](./cabinet-hold-progress-1280x720.png) |
| Gabinete roto | [`cabinet-broken-1280x720.png`](./cabinet-broken-1280x720.png) |
| Cinemática de recogida del hacha | [`axe-pickup-cinematic-1280x720.png`](./axe-pickup-cinematic-1280x720.png) |
| Oleada de zombis en el pasillo | [`wave-1-1280x720.png`](./wave-1-1280x720.png) |
| Pasillo despejado y salida abierta | [`wave-cleared-exit-1280x720.png`](./wave-cleared-exit-1280x720.png) |
| Panel de Escena 2 completada | [`complete-1280x720.png`](./complete-1280x720.png) |
| Vista compacta 1024 × 600 | [`scene2-1024x600.png`](./scene2-1024x600.png) |

## Cómo reproducir manualmente

1. Ejecutar `npm install` y `npm run dev`.
2. Abrir `http://localhost:5173` y elegir un personaje; confirmar con `Enter`.
3. Completar o saltar la Escena 1: esperar la irrupción, lanzar el teclado con `E` y cruzar la salida verde.
4. En la Escena 2, esperar la cinemática de entrada o saltarla con `Enter`/`Espacio`.
5. Acercarse al gabinete de incendios y **mantener `E`** hasta ver los 3 golpes y el cristal roto.
6. Pulsar `E` de nuevo para tomar el Hacha de Incendios; dejar que termine la cinemática.
7. Confirmar que aparecen 6 zombis y que el HUD muestra el arma, la oleada y los restantes.
8. Apuntar con el ratón y atacar con clic o `Espacio` hasta eliminar a los 6 zombis.
9. Verificar la cinemática de pasillo despejado, cruzar la salida verde y comprobar el panel `SPRINT I3 · ESCENA 2`.
10. Probar `R` para repetir y `M`/`Esc` para volver al menú; confirmar 0 errores en la consola.

## Limitaciones de esta evidencia

- El pasillo, el gabinete y los zombis siguen siendo procedurales; no dependen de assets finales.
- Solo existen sprites de estado quieto: el golpe de hacha usa la estela procedural de `CombatSystem`, no una animación de sprites.
- La oleada de 6 zombis es la primera oleada de la Escena 2; el gestor de 10 oleadas y el escalado de dificultad pertenecen a I4.
- La salida muestra el panel de cierre de I3 porque la helisuperficie se implementa en I4.
- La medición de FPS es headless y sin vsync; la medición con 100 entidades sigue pendiente en T-605.
- La compatibilidad con Firefox, Edge y Safari no se verificó en esta pasada.

## Archivo de datos

Los resultados estructurados están en [`verification.json`](./verification.json).
