# Evidencia — Integración visual (menú, skins y texturas)

**Fecha:** 2026-11-09  
**Alcance:** T-210 (fondo del menú), T-211 (skins de Chantre, Juan y Daiver) y T-212 (texturas de los entornos).  
**Estado:** Implementado y verificado; pendiente de aprobación humana G3.

## Objetivo

Registrar de forma reproducible la integración de los nuevos PNG de `assets/img`:

- `assets/img/fondos/fondo_menu.png` como fondo del menú con estética de terror.
- Las 16 vistas de estado quieto de Chantre, Juan y Daiver (4 por personaje), además de las 4 de Zamora.
- `assets/img/texturas/textura_pared.png` y `assets/img/texturas/baldosa_color_crema.png` en la Escena 1 y en la escena de prueba.

No se generaron imágenes nuevas ni se implementaron animaciones de caminar, correr o golpear: solo se usan los sprites de **estado quieto** entregados.

## Entorno de verificación

| Elemento | Valor |
|---|---|
| Sistema operativo | Windows |
| Node.js | v24.21.0 |
| npm | 11.19.0 |
| Vite | 8.3.6 |
| Navegador | Google Chrome 156.0.8078.81 (headless + CDP) |
| Viewport principal | 1280 × 720, DPR 1 |
| Viewports adicionales | 1024 × 600 y 820 × 1000 |
| Fecha de ejecución | 2026-11-09 (UTC 2026-11-10T02:xxZ) |

## Assets verificados

| Grupo | Claves | Cantidad |
|---|---|---|
| Logo | `logo` | 1 |
| Fondo del menú | `menuBackground` | 1 |
| Texturas | `wallTexture`, `floorTexture` | 2 |
| Skins | `{zamora, chantre, juan, daiver}{Abajo, Arriba, Derecha, Izquierda}` | 16 |
| **Imágenes** | | **20** |
| Audio | `fondoMenu`, `ambienteTranquilo`, `ambienteHorror`, `caminar` | 4 |
| **Total** | | **24** |

Los recortes de cada vista se midieron sobre el canal alfa con 4 px de margen y se declaran en `src/core/AssetManifest.js` (`PLAYER_SPRITE_VIEWS`). Todos los personajes se dibujan a 76 px de alto y se anclan a los pies.

## Resultado observado

| Comprobación | Resultado |
|---|---|
| Carga de assets | 20 imágenes + 4 audios = 24; `errors: []` y `missingImages: []` |
| Retratos del menú | Los 4 personajes devuelven `hasSprite: true` e `image: true` |
| Selección | 0 Zamora → 1 Chantre → 2 Juan → 3 Daiver con `→` y clic |
| Layout 1280 × 720 | 2×2 tarjetas, `contentX 627`, `contentW 589`, `detailsBottom 549`, `startBottom 614`; todo dentro del viewport |
| Personaje visible | La columna de contenido empieza en 627 px (> 42 % del ancho), dejando libre la ilustración de la izquierda |
| Layout 1024 × 600 | 2×2, `contentX 502`, botón de inicio en 402; dentro del viewport |
| Layout 820 × 1000 | Una columna centrada (`wide: false`), contenido dentro del viewport |
| Fondo del menú | `fondo_menu.png` en modo *cover*, velo, viñeta y partículas de ceniza/brasa |
| Texturas Escena 1 | `wallTexture` y `floorTexture` activas; capa de suciedad/sangre de 1172 × 547 px |
| Texturas escena de prueba | Pared exterior y baldosa de la arena activas; capa de 1168 × 550 px |
| Vistas en Escena 1 | `abajo`, `arriba`, `derecha` e `izquierda` correctas para los 4 personajes |
| FPS (headless) | Menú 143.97–144.01; Escena 1 y prueba ≈ 144; sin vsync en headless |
| Errores de consola | 0 |
| `npm run build` | Correcto: 49 módulos; 20 PNG + 4 MP3 emitidos en `dist/assets/` |

## Capturas

| Captura | Archivo |
|---|---|
| Menú principal (Zamora) | [`menu-1280x720.png`](./menu-1280x720.png) |
| Menú con Zamora seleccionado | [`menu-zamora-1280x720.png`](./menu-zamora-1280x720.png) |
| Menú con Chantre seleccionado | [`menu-chantre-1280x720.png`](./menu-chantre-1280x720.png) |
| Menú con Juan seleccionado | [`menu-juan-1280x720.png`](./menu-juan-1280x720.png) |
| Menú con Daiver seleccionado | [`menu-daiver-1280x720.png`](./menu-daiver-1280x720.png) |
| Menú compacto | [`menu-1024x600.png`](./menu-1024x600.png) |
| Menú vertical | [`menu-820x1000.png`](./menu-820x1000.png) |
| Escena 1 con Zamora | [`scene1-zamora-1280x720.png`](./scene1-zamora-1280x720.png) |
| Escena 1 con Chantre | [`scene1-chantre-1280x720.png`](./scene1-chantre-1280x720.png) |
| Escena 1 con Juan | [`scene1-juan-1280x720.png`](./scene1-juan-1280x720.png) |
| Escena 1 con Daiver | [`scene1-daiver-1280x720.png`](./scene1-daiver-1280x720.png) |
| Escena de prueba texturizada | [`test-textures-1280x720.png`](./test-textures-1280x720.png) |

## Cómo reproducir

### Verificación automatizada (CDP)

El script [`verify-visuals.mjs`](./verify-visuals.mjs) usa el protocolo DevTools de Chrome para navegar el juego, medir layouts, recorrer las cuatro vistas de cada personaje y capturar las pantallas. Requiere Node.js 22+ (por `WebSocket` global), el servidor de desarrollo en `127.0.0.1:5173` y Chrome con `--remote-debugging-port=9222`:

```bash
npm run dev -- --host 127.0.0.1 --port 5173
chrome --headless=new --remote-debugging-port=9222 --remote-allow-origins=* about:blank
node docs/evidence/visuals/verify-visuals.mjs
```

El script sobrescribe las capturas y `verification.json` en esta misma carpeta. Usa el servidor de desarrollo porque `window.__INVACION_GAME__` solo se expone con `import.meta.env.DEV`.

### Comprobación manual

1. Ejecutar `npm install` y `npm run dev`, y abrir `http://localhost:5173`.
2. Confirmar el fondo terrorífico del menú y que la ilustración del personaje queda visible a la izquierda en pantallas anchas.
3. Recorrer las 4 tarjetas con `←`/`→`, `WASD` o el ratón y comprobar que cada retrato usa su sprite.
4. Redimensionar a 1024 × 600 y 820 × 1000: el contenido debe seguir dentro del viewport.
5. Iniciar la Escena 1 con cada personaje, saltar la cinemática y verificar las 4 direcciones con `WASD`.
6. Comprobar la pared texturizada y la baldosa crema oscurecida en el salón y en la escena de prueba.
7. Confirmar 60 FPS y ausencia de errores en la consola.
8. Ejecutar `npm run build` y verificar que `dist/assets/` contiene 20 PNG y 4 MP3.

## Limitaciones

- Solo existe el estado quieto de los cuatro personajes; caminar, correr y golpear siguen sin animación.
- La medición de FPS se hizo en Chrome headless, sin vsync; el objetivo de 60 FPS se cumple con margen, pero no sustituye una medición con 100 entidades (T-605).
- La compatibilidad con Firefox, Edge y Safari no se verificó en esta pasada.
- El fondo del menú y las texturas se dibujan en capas offscreen para sostener el rendimiento; un cambio de tamaño de ventana reconstruye esas capas.
- Los recortes de los nuevos personajes tienen proporciones distintas a las de Zamora; la escala común de 76 px puede requerir ajustes finos al integrar animaciones.

## Archivo de datos

Los resultados estructurados están en [`verification.json`](./verification.json).
