# Evidencia — Sprint I1

**Fecha:** 2026-11-08  
**Alcance:** T-101 a T-109 y T-111 (base del motor, menú, input, audio, assets, HUD y Game Over).  
**Estado:** Implementado y verificado; pendiente de aprobación humana G3.

## Entorno de verificación

| Elemento | Valor |
|---|---|
| Sistema operativo | Windows |
| Node.js | v24.21.0 |
| npm | 11.19.0 |
| Vite | 8.3.6 |
| Navegador | Google Chrome 156.0.8078.81 (headless) |
| Viewport principal | 1280 × 720 |
| Viewport compacto | 1024 × 600 |

## Resultado observado

| Comprobación | Resultado |
|---|---|
| Compilación de producción (`npm run build`) | Correcta, 20 módulos transformados |
| FPS en menú y escena de prueba | 60 FPS |
| Carga de assets | 1 imagen SVG, 0 errores |
| Transición boot → menú | Correcta |
| Selección con teclado (←/→) | Índice 0 → 1 → 0 |
| Inicio de partida con Enter | Escena `test`, personaje Zamora, salud 100 |
| Movimiento con `D` durante 600 ms | Desplazamiento de +136 px |
| Toggle de sonido con `M` | Silenciado → activado |
| Desbloqueo de audio tras primera tecla | Correcto |
| Daño por zona roja | Salud reducida hasta Game Over |
| Game Over | Escena `gameOver` |
| Reinicio con Enter | Escena `test`, salud restaurada a 100 |
| Vuelta al menú con `Escape` | Escena `menu` |
| Errores en consola | 0 |
| Vista compacta 1024 × 600 | Menú responsive correcto |

## Capturas

| Captura | Archivo |
|---|---|
| Menú principal 1280 × 720 | [`menu-1280x720.png`](./menu-1280x720.png) |
| Escena de prueba 1280 × 720 | [`test-1280x720.png`](./test-1280x720.png) |
| Game Over 1280 × 720 | [`gameover-1280x720.png`](./gameover-1280x720.png) |
| Menú compacto 1024 × 600 | [`menu-1024x600.png`](./menu-1024x600.png) |

## Cómo reproducir manualmente

1. Ejecutar `npm install` y `npm run dev`.
2. Abrir la URL que muestra Vite (por defecto `http://localhost:5173`).
3. Verificar el menú, cambiar de personaje con `←`/`→` o `A`/`D` y confirmar con `Enter`.
4. Mover al personaje con `WASD` o flechas y apuntar con el ratón.
5. Entrar en una zona roja hasta que la salud llegue a 0.
6. En Game Over, probar `R` para reiniciar y `M` para volver al menú.
7. Comprobar el contador de FPS y que la consola del navegador no muestre errores.

## Limitaciones de esta evidencia

- Los assets definitivos son manuales; I1 usa un logo SVG placeholder y gráficos procedurales.
- La medición de RNF-01 con 100 entidades sigue pendiente para T-605.
- La compatibilidad con Firefox, Edge y Safari no se verificó en esta pasada.
- La carga de audio está implementada; en la fecha de esta evidencia no había archivos finales. La música contextual y los pasos posteriores están en [`docs/evidence/audio/`](../audio/README.md).

## Archivo de datos

Los resultados estructurados están en [`verification.json`](./verification.json).
