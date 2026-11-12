# Evidencia — Sprint I2

**Fecha:** 2026-11-08  
**Alcance:** T-201 a T-205 (Escena 1, irrupción del zombi, teclazo contextual, knockout y salida al pasillo).  
**Estado:** Implementado y verificado; pendiente de aprobación humana G3.

**Nota posterior (2026-11-08):** la música contextual (T-208) y los pasos (T-209) se integraron después de esta verificación. Su evidencia reproducible está en [`docs/evidence/audio/`](../audio/README.md).

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
| Assets | Logo oficial y sprites de estado quieto de Zamora; escenario procedural |

## Resultado observado

| Comprobación | Resultado |
|---|---|
| Compilación de producción (`npm run build`) | Correcta, 23 módulos transformados |
| FPS en menú y Escena 1 | 60 FPS |
| Errores de consola | 0 |
| Carga de assets | 5 PNG (logo + 4 vistas de Zamora), 0 errores |
| Audio tras la primera tecla | Desbloqueado |
| Menú → Escena 1 con `Enter` | Correcto; personaje Zamora, salud 100 |
| Cinemática inicial | Fase `intro`, letterbox y diálogo |
| Irrupción del zombi | Fase `breach`; puerta rota y zombi en estado `entering` |
| Amenaza | Fase `threat`; zombi en estado `chase` |
| Teclazo con `E` | 1 lanzamiento, 1 impacto |
| Knockout | Fase `knockout`; zombi en estado `knockedOut` |
| Salida habilitada | Fase `free`, `exitOpen: true` |
| Movimiento con `D` durante 900 ms | +202 px |
| Cruce de la zona verde | Fase `exiting` → `complete` |
| Cierre de I2 | Tiempo registrado 14.2 s; botones de repetir y menú |
| Repetición con `R` | Fase `intro`, salud 100, contadores en 0 |
| Vuelta al menú con `M` / `Esc` | Estado `menu` |
| Vista compacta 1024 × 600 | Escena responsive correcta |

## Flujo verificado

```text
menu
  → scene1:intro
  → scene1:breach
  → scene1:threat
  → scene1:knockout
  → scene1:free
  → scene1:exiting
  → scene1:complete
  → scene1:intro (reinicio)
  → menu
```

## Capturas

| Captura | Archivo |
|---|---|
| Cinemática inicial 1280 × 720 | [`intro-1280x720.png`](./intro-1280x720.png) |
| Puerta rota e ingreso del zombi | [`breach-1280x720.png`](./breach-1280x720.png) |
| Amenaza y aviso de teclazo | [`threat-1280x720.png`](./threat-1280x720.png) |
| Zombi fuera de combate | [`knockout-1280x720.png`](./knockout-1280x720.png) |
| Salida al pasillo habilitada | [`exit-1280x720.png`](./exit-1280x720.png) |
| Cierre del Sprint I2 | [`complete-1280x720.png`](./complete-1280x720.png) |
| Vista compacta 1024 × 600 | [`threat-1024x600.png`](./threat-1024x600.png) |

## Cómo reproducir manualmente

1. Ejecutar `npm install` y `npm run dev`.
2. Abrir la URL que muestra Vite (por defecto `http://localhost:5173`).
3. Elegir un personaje en el menú y confirmar con `Enter`.
4. Esperar la cinemática o saltarla con `Enter`/`Espacio`.
5. Comprobar que la puerta se rompe y que el Zombi Aprendiz entra al salón.
6. Pulsar `E` o `Espacio` para lanzar el teclado y confirmar el knockout.
7. Caminar con `WASD` o flechas hasta la zona verde de salida.
8. Verificar la pantalla de cierre; probar `R` para repetir y `M` para volver al menú.
9. Comprobar 60 FPS y que la consola del navegador no muestre errores.

## Limitaciones de esta evidencia

- Los assets definitivos de escenario, zombis y demás personajes siguen pendientes; I2 usa gráficos procedurales para ellos.
- Zamora solo tiene sprites de estado quieto; caminar, correr y golpear no están animados.
- El pasillo de la Escena 2 se implementa en el Sprint I3; por eso la salida muestra una pantalla de cierre de I2.
- La medición de RNF-01 con 100 entidades sigue pendiente para T-605.
- La compatibilidad con Firefox, Edge y Safari no se verificó en esta pasada.
- La evidencia original de I2 usó SFX sintetizados con Web Audio API; la música contextual y los pasos posteriores se documentan en [`docs/evidence/audio/`](../audio/README.md).

## Archivo de datos

Los resultados estructurados están en [`verification.json`](./verification.json).
