# Evidencia — Integración de assets oficiales

**Fecha:** 2026-11-08  
**Alcance:** T-206 (logo principal) y T-207 (sprites de estado quieto de Zamora).  
**Estado:** Implementado y verificado; pendiente de aprobación humana G3.

## Entorno de verificación

| Elemento | Valor |
|---|---|
| Sistema operativo | Windows |
| Node.js | v24.21.0 |
| npm | 11.19.0 |
| Vite | 8.3.6 |
| Navegador | Google Chrome 156.0.8078.81 (headless + CDP) |
| Viewport principal | 1280 × 720 |
| Viewport compacto | 1024 × 600 |

## Assets integrados

| Asset | Dimensiones | Uso |
|---|---|---|
| `assets/img/icons/icon.png` | 1512 × 1512 | Arranque, menú, favicon y panel de introducción |
| `assets/img/players/zamora/vista_abajo.png` | 627 × 627 | Jugador mirando abajo; retratos de menú, HUD y Game Over |
| `assets/img/players/zamora/vista_arriba.png` | 627 × 627 | Jugador mirando arriba |
| `assets/img/players/zamora/vista_derecha.png` | 627 × 627 | Jugador mirando a la derecha |
| `assets/img/players/zamora/vista_izquierda.png` | 627 × 627 | Jugador mirando a la izquierda |

Los cuatro recortes se midieron sobre el canal alfa y se declaran en `src/core/AssetManifest.js`.

## Resultado observado

| Comprobación | Resultado |
|---|---|
| `npm run build` | Correcto: 29 módulos y 5 PNG emitidos en `dist/assets/` |
| Carga de assets | `assetsTotal: 5`, `assetsLoaded: 5`, `assetErrors: []` |
| Favicon en desarrollo | `/assets/img/icons/icon.png` |
| Favicon en producción | Vite lo reescribe al PNG con hash de `dist/assets/` |
| Logo en arranque | Visible junto a “INVACIÓN SENA” |
| Logo en menú | Emblema + título, sin deformación (aspecto cuadrado respetado) |
| Logo en introducción | Emblema en el panel de diálogo de la Escena 1 |
| Retrato de Zamora | Visible en tarjeta, detalle, HUD y Game Over |
| Vistas de Zamora | `right`, `left`, `up`, `down` verificadas con `D`, `A`, `W` y `S` |
| Dirección con el jugador quieto | Se toma del apuntado del ratón |
| Personajes sin sprites | Chantre conserva el avatar procedural y el jugador circular |
| Animaciones | No implementadas: solo existe el estado quieto |
| FPS | 60 en 1280×720 y 1024×600 |
| Errores de consola | 0 |
| Flujo I2 completo | Irrupción → teclazo → knockout → salida → cierre, sin regresiones |

## Capturas

| Captura | Archivo |
|---|---|
| Arranque con logo | [`boot-1280x720.png`](./boot-1280x720.png) |
| Menú con logo y retrato | [`menu-1280x720.png`](./menu-1280x720.png) |
| Menú compacto | [`menu-1024x600.png`](./menu-1024x600.png) |
| Introducción con emblema | [`intro-1280x720.png`](./intro-1280x720.png) |
| Escena 1 con sprite | [`threat-1280x720.png`](./threat-1280x720.png) |
| Vista derecha | [`facing-right-1280x720.png`](./facing-right-1280x720.png) |
| Vista izquierda | [`facing-left-1280x720.png`](./facing-left-1280x720.png) |
| Vista arriba | [`facing-up-1280x720.png`](./facing-up-1280x720.png) |
| Vista abajo | [`facing-down-1280x720.png`](./facing-down-1280x720.png) |
| Escena compacta | [`scene1-1024x600.png`](./scene1-1024x600.png) |
| Fallback procedural (Chantre) | [`chantre-fallback-1280x720.png`](./chantre-fallback-1280x720.png) |

## Cómo reproducir manualmente

1. Ejecutar `npm install` y `npm run dev`.
2. Abrir `http://localhost:5173` y comprobar el logo en el arranque y el menú.
3. Verificar el retrato de Zamora en la tarjeta, el detalle y el HUD.
4. Entrar a la Escena 1 y saltar la cinemática con `Enter` o `Espacio`.
5. Mover a Zamora con `WASD` en las cuatro direcciones y comprobar el cambio de vista.
6. Confirmar que Chantre, Juan y Daiver siguen usando el avatar procedural.
7. Comprobar 60 FPS y ausencia de errores en la consola.
8. Ejecutar `npm run build` y verificar los PNG emitidos en `dist/assets/`.

## Limitaciones

- Solo existe el estado quieto de Zamora; caminar, correr y golpear no están animados.
- Chantre, Juan, Daiver y el Zombi Aprendiz mantienen render procedural.
- El audio de esta verificación era sintetizado; la música contextual y los pasos posteriores se documentan en [`docs/evidence/audio/`](../audio/README.md).
- La compatibilidad con Firefox, Edge y Safari no se verificó en esta pasada.
- La medición de RNF-01 con 100 entidades sigue pendiente para T-605.

## Archivo de datos

Los resultados estructurados están en [`verification.json`](./verification.json).
