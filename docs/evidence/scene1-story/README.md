# Evidencia — Nueva historia de la Escena 1

**Fecha:** 2026-11-11  
**Alcance:** Nueva secuencia narrativa del ambiente de programación (llegada, clase de SOLID, salto temporal, salida de compañeros, grito y reacción) integrada al teclazo existente.  
**Estado:** Implementado y verificado en Chrome headless; pendiente de aprobación humana.

## Entorno de verificación

| Elemento | Valor |
|---|---|
| Sistema operativo | Windows |
| Node.js | v24.21.0 |
| npm | 11.19.0 |
| Vite | 8.3.6 |
| Navegador | Chrome headless 157.0.0.0 (CDP) |
| Viewport | 1280 × 720 |
| Personaje de prueba | Zamora |
| Assets | Logo, fondo, texturas y sprites de estado quieto; compañeros e instructor procedurales |

## Resultado observado

| Comprobación | Resultado |
|---|---|
| Compilación de producción (`npm run build`) | Correcta, 53 módulos transformados |
| FPS durante la verificación | 60 FPS |
| Errores de consola | 0 |
| Escena 1 inicia en fase `intro` | `phase: intro` |
| Compañeros en el salón | 3 (Chantre, Juan y Daiver con Zamora seleccionado) |
| Compañeros en su puesto | `true` al iniciar |
| Instructor en su escritorio | `true` al iniciar |
| Llegada del jugador a su puesto | `arrivalDone: true`, coordenadas iguales al asiento |
| Puerta cerrada tras entrar | `doorClosed: true` |
| Cinemática del instructor | 2 cuadros: llegada y clase de SOLID |
| Salto temporal | Fase `timeskip` con «2 HORAS DESPUÉS...» |
| Salida de compañeros e instructor | Fase `departure`, todos llegan a la puerta y desaparecen |
| Cierre de puerta y grito | Fase `scream`, `doorClosed: true`, grito sintetizado |
| Línea del personaje | «¡¿Qué fue esoo?!» en cinemática |
| Irrupción del zombi | Fase `breach`, zombi presente y puerta abierta |
| Teclazo | 1 lanzamiento, 1 impacto, fase `knockout` |
| Salida al pasillo | Fase `free`, `exitOpen: true` |
| Verificación automática | 18/18 comprobaciones |

## Secuencia implementada

```text
menu
  → scene1:intro (el jugador camina del umbral a su puesto; la puerta se cierra)
  → cinemática: llegada + "Bueno, empecemos. Hoy vamos a ver los principios SOLID..."
  → scene1:timeskip ("2 HORAS DESPUÉS..." con destello y parpadeo)
  → scene1:departure (compañeros e instructor salen; la puerta se cierra)
  → scene1:scream (grito sintetizado + destello rojo)
  → cinemática: "¡¿Qué fue esoo?!"
  → scene1:breach (la puerta se rompe y entra el Zombi Aprendiz)
  → scene1:threat (lanzar el teclado con E / Espacio)
  → scene1:knockout → free → exiting
  → scene2
```

## Decisiones de implementación

- Los compañeros y el instructor son NPC procedurales decorativos: no colisionan ni participan en combate.
- Los compañeros se eligen entre los otros tres personajes jugables, de modo que el salón nunca duplica al jugador.
- El jugador recorre el salón con una interpolación suave al iniciar; el control se habilita después del *knockout* del zombi, como en el flujo anterior.
- El salto temporal usa un destello blanco, letterbox y texto parpadeante para comunicar el paso del tiempo sin una escena adicional.
- El grito, la apertura y el cierre de puerta son SFX sintetizados en `AudioManager` (`playScream`, `playDoorOpen`, `playDoorClose`).
- El retrato del instructor se dibuja proceduralmente en `CutsceneOverlay` mediante `portrait: "instructor"`.
- La cinemática del jugador usa el retrato del personaje seleccionado.

## Capturas

| Captura | Archivo |
|---|---|
| Llegada del jugador y compañeros en sus puestos | [`01-llegada-al-ambiente-1280x720.png`](./01-llegada-al-ambiente-1280x720.png) |
| Cinemática de llegada | [`02-clase-solid-profesor-1280x720.png`](./02-clase-solid-profesor-1280x720.png) |
| Instructor dictando SOLID | [`03-profesor-solid-1280x720.png`](./03-profesor-solid-1280x720.png) |
| Salto temporal «2 HORAS DESPUÉS...» | [`04-dos-horas-despues-1280x720.png`](./04-dos-horas-despues-1280x720.png) |
| Compañeros saliendo del ambiente | [`05-companeros-salen-1280x720.png`](./05-companeros-salen-1280x720.png) |
| Grito con la puerta cerrada | [`06-grito-1280x720.png`](./06-grito-1280x720.png) |
| Reacción «¡¿Qué fue esoo?!» | [`07-que-fue-eso-1280x720.png`](./07-que-fue-eso-1280x720.png) |
| Irrupción del Zombi Aprendiz | [`08-irrupcion-zombi-1280x720.png`](./08-irrupcion-zombi-1280x720.png) |
| Aviso para lanzar el teclado | [`09-teclado-lista-1280x720.png`](./09-teclado-lista-1280x720.png) |
| Zombi fuera de combate | [`10-knockout-teclado-1280x720.png`](./10-knockout-teclado-1280x720.png) |
| Salida al pasillo habilitada | [`11-salida-habilitada-1280x720.png`](./11-salida-habilitada-1280x720.png) |

## Cómo reproducir manualmente

1. Ejecutar `npm install` y `npm run dev`.
2. Abrir `http://localhost:5173`, elegir un personaje y confirmar con `Enter`.
3. Observar la llegada automática al puesto y la cinemática del instructor; avanzar con `Enter`, `Espacio` o clic.
4. Confirmar el salto temporal «2 HORAS DESPUÉS...» y la salida de los compañeros hacia la puerta.
5. Escuchar el cierre de la puerta y el grito; avanzar la línea «¡¿Qué fue esoo?!».
6. Esperar la irrupción del zombi y lanzar el teclado con `E` o `Espacio`.
7. Cruzar la salida verde hacia el pasillo y comprobar 0 errores en la consola.

## Limitaciones de esta evidencia

- Los compañeros y el instructor son procedurales; no usan sprites ni animaciones de caminar.
- El grito, la puerta y los pasos son audio sintetizado; no hay archivos de voz.
- La verificación se hizo en Chrome headless con un solo personaje (Zamora); la selección de compañeros se validó por lógica de datos con los cuatro personajes.
- La compatibilidad con Firefox, Edge y Safari no se verificó en esta pasada.
- El cierre de I2 permanece como código heredado no alcanzable; el flujo real conduce a `scene2`.

## Archivo de datos

Los resultados estructurados están en [`verification.json`](./verification.json).
