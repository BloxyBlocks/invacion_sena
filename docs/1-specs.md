# Especificación funcional — INVACIÓN SENA

**Versión:** 1.2  
**Estado:** En revisión (G1)  
**Producto:** Juego 2D Shooter Web (HTML5 Canvas/WebGL)  
**Autor Principal:** Diego Alejandro Zamora  

---

## 1. Visión del Juego

**INVACIÓN SENA** es un juego de disparo y supervivencia 2D de perspectiva cenital / top-down (o shooter 2D fluido). Los jugadores asumen el rol de uno de los aprendices de programación (Zamora, Chantre, Juan o Daiver) atrapados dentro del centro de formación SENA cuando ocurre una repentina infección que convierte a los estudiantes en zombis aprendices.

El objetivo es avanzar a través de una secuencia narrativa de 4 escenas clave, desde la irrupción del primer infectado en el ambiente de clase hasta la supervivencia a 10 oleadas intensas para lograr la extracción en helicóptero por parte del Sr. Rodolfo Martínez Tono.

### Objetivos Principales
* Ofrecer un control ágil de personaje en 360° con teclado y ratón (o soporte para 2 jugadores locales).
* Integrar narrativa mediante cinemáticas o secuencias animadas breves al inicio y final del juego.
* Mantener 60 FPS estables con múltiples enemigos zombi en pantalla dentro del navegador web.
* Garantizar una experiencia inmersiva con efectos sonoros (SFX) e iluminación dinámica.

---

## 2. Personajes

### 2.1 Personajes Jugables (Seleccionables)
1. **Zamora:** Aprendiz enfocado en balance general y velocidad de recarga/ataque.
2. **Chantre:** Aprendiz con mayor resistencia física y salud máxima.
3. **Juan:** Aprendiz enfocado en velocidad de movimiento y agilidad de esquive.
4. **Daiver:** Aprendiz enfocado en daño de impacto y control de área.

*Nota:* En la versión base se ofrece selección para **1 Jugador (1P)**, dejando preparada la arquitectura en código para activar **2 Jugadores (2P)** en modo cooperativo local.

### 2.2 Personajes No Jugables (NPC)
* **Zombis Aprendices:** Estudiantes del SENA infectados que atacan en hordas.
* **Señor Rodolfo Martínez Tono:** Fundador/Rescatista que llega en la helisuperficie en la Oleada 10 para completar el rescate.

---

## 3. Escenas Narrativas y Progresión

### Escena 1: El Ambiente de Programación
* **Ubicación:** Ambiente / Salón de clase de programación.
* **Contexto:** El personaje principal entra al ambiente y se ubica en su puesto. Los demás aprendices ya están en sus escritorios y el instructor dicta clase desde el suyo.
* **Clase:** El instructor comienza la lección: «Bueno, empecemos. Hoy vamos a ver los principios SOLID...».
* **Salto temporal:** Un parpadeo y el rótulo «2 HORAS DESPUÉS...» indican el paso del tiempo hasta la hora del break.
* **Salida del grupo:** Los compañeros y el instructor salen del ambiente y cierran la puerta.
* **Grito:** Se escucha un fuerte grito proveniente del pasillo.
* **Reacción:** El personaje principal exclama «¡¿Qué fue esoo?!».
* **Evento:** Un zombi aprendiz irrumpe por la puerta. El personaje principal reacciona lanzándole un teclado de ordenador, dejándolo fuera de combate de un golpe.
* **Transición:** El personaje comprende la gravedad de la situación y decide salir al pasillo del centro de formación.

### Escena 2: El Gabinete y la Primera Arma
* **Ubicación:** Pasillos principales del edificio SENA.
* **Mecánica:** El jugador debe desplazarse hacia la bomba/gabinete de agua de incendios más cercano.
* **Acción:** Romper o abrir el gabinete para tomar el **Hacha de incendios**.
* **Combate Inicial:** Con el hacha equipada, el jugador enfrenta y elimina a una primera oleada menor de zombis aprendices para abrirse paso hacia la zona abierta/patio.

### Escena 3: La Helisuperficie y la Supervivencia de 10 Oleadas
* **Ubicación:** Zona abierta / Patio / Helisuperficie del SENA.
* **Mecánica:** Sobrevivir a **10 oleadas de zombis aprendices** con dificultad incremental (mayor velocidad, cantidad y variedad de zombis).
* **Evento Clave (Oleada 10):** Al eliminar al último enemigo de la oleada 10, aparece un helicóptero de rescate pilotado por el **Señor Rodolfo Martínez Tono**, quien despliega la zona de extracción para rescatar al personaje.

### Escena 4: Extracción, Créditos e Himno
* **Ubicación:** Pantalla final de victoria / Salida del helicóptero.
* **Elementos:**
  * Cinemática/Secuencia final del helicóptero alejándose del SENA.
  * Roll de créditos destacando a **Diego Alejandro Zamora** (Desarrollador / Creador principal) y agradecimientos.
  * Reproducción del **Himno del SENA** como banda sonora de cierre.
  * Fundido a negro final (*Fade out to black*).

---

## 4. Requisitos Funcionales

| ID | Requisito | Descripción | Escena / Fase |
|---|---|---|---|
| **RF-01** | Menú Principal | Selección de personaje (Zamora, Chantre, Juan, Daiver), opción de iniciar partida y configuración de sonido. | Menú |
| **RF-02** | Cinemática Escena 1 | Secuencia del salón: llegada y ubicación en el puesto, clase de SOLID del instructor, salto temporal «2 HORAS DESPUÉS...», salida de compañeros con cierre de puerta, grito, reacción del personaje, irrupción del zombi y lanzamiento del teclado. | Escena 1 |
| **RF-03** | Movimiento del Jugador | Control en 8 direcciones (WASD / Flechas) con colisión contra paredes del ambiente. | Juego |
| **RF-04** | Interacción con Objeto | Botón de acción (`E` / Espacio) para interactuar con la bomba de incendios y coger el hacha. | Escena 2 |
| **RF-05** | Sistema de Ataque Melee | Disparo / Ataque cuerpo a cuerpo con el hacha (apuntado en 360° con el ratón). | Escena 2 / 3 |
| **RF-06** | Sistema de Armas de Fuego (Opcional por Oleada) | Drops de armas de fuego al vencer zombis en oleadas avanzadas. | Escena 3 |
| **RF-07** | Gestor de Oleadas | Control de 1 a 10 oleadas, spawning de zombis aprendices e indicador en la HUD. | Escena 3 |
| **RF-08** | Evento de Rescate (Rodolfo Martínez Tono) | Animación de llegada del helicóptero al cumplir la oleada 10 y trigger de extracción. | Escena 3 |
| **RF-09** | Créditos e Himno | Pantalla de créditos con el nombre de Diego Alejandro Zamora y reproducción de audio del Himno del SENA. | Escena 4 |
| **RF-10** | HUD de Juego | Visualización de salud del jugador, oleada actual, zombis restantes y arma equipada. | Juego |

---

## 5. Reglas del Juego (Business Logic)

| ID | Regla |
|---|---|
| **RN-01** | **Ataque de Teclado:** En la Escena 1, el lanzamiento de teclado es una acción contextual única que aturde o knocking out automáticamente al primer zombi. |
| **RN-02** | **Desbloqueo de Ataque:** El jugador no puede realizar ataques regulares Melee hasta tomar el hacha del gabinete de incendios en la Escena 2. |
| **RN-03** | **Condición de Derrota:** Si la vida del jugador llega a 0 en cualquier escena, se muestra la pantalla de Game Over con opción de reiniciar la escena o ir al menú. |
| **RN-04** | **Condición de Victoria de Oleada:** Una oleada finaliza únicamente cuando la cantidad de zombis aprendices generados sea 0 y todos hayan sido eliminados. |
| **RN-05** | **Escalado de Oleadas:** Cada oleada posterior incrementa la salud base o la velocidad de desplazamiento de los zombis en un 10%. |
| **RN-06** | **Disparo de Extracción:** El helicóptero del Sr. Rodolfo Martínez Tono aterriza únicamente tras verificar `currentWave == 10` y `remainingZombies == 0`. |

---

## 6. Requisitos No Funcionales

| ID | Requisito |
|---|---|
| **RNF-01** | **Rendimiento:** Mantener una tasa de refresco constante de 60 FPS con hasta 100 entidades activas en pantalla. |
| **RNF-02** | **Plataforma Web:** Debe ser ejecutable en cualquier navegador moderno (Chrome, Firefox, Edge, Safari) compatible con HTML5 Canvas y WebGL. |
| **RNF-03** | **Carga de Assets:** Carga asíncrona de recursos gráficos y audios con pantalla de carga (*Loading Screen*) previa al inicio. |
| **RNF-04** | **Audio:** Soporte para canales de audio independientes (Música de fondo, Efectos de sonido SFX y Voz/Himno). |
| **RNF-05** | **Controles Adaptables:** Soporte prioritario para Teclado + Mouse (1P) y estructura modular para sumar Gamepad / Teclado 2 (2P). |

---

## 7. Criterios de Aceptación (Gherkin)

```gherkin
Escenario: Inicio de la aventura en la Escena 1
  Dado que el jugador selecciona al personaje "Zamora" en el menú
  Cuando inicia la partida en la Escena 1 (Ambiente de programación)
  Y ocurre la irrupción del zombi aprendiz por la puerta
  Entonces se activa la cinemática del lanzamiento de teclado
  Y el zombi queda fuera de combate
  Y se habilita el paso hacia la Escena 2

Escenario: Obtención del hacha en el gabinete de incendios
  Dado que el jugador está en los pasillos en la Escena 2
  Cuando se aproxima a la bomba de incendios y mantiene presionada la tecla de interacción "E" hasta dar tres golpes
  Entonces el gabinete se rompe
  Y al pulsar "E" de nuevo el personaje equipa el Hacha
  Y la interfaz actualiza el arma activa a "Hacha de Incendios"
  Y se activa el primer ataque de oleada de pasillo al terminar la cinemática de recogida

Escenario: Finalización de la Oleada 10 y llegada de Rodolfo Martínez Tono
  Dado que el jugador está enfrentando la Oleada 10 en la Escena 3
  Cuando elimina al último zombi aprendiz de la oleada
  Entonces la oleada se marca como completada
  Y se reproduce la animación de llegada del helicóptero del Sr. Rodolfo Martínez Tono
  Y se activa la zona de extracción en la helisuperficie

Escenario: Final de juego, créditos e Himno del SENA
  Dado que el jugador ingresa a la zona de extracción en la helisuperficie
  Cuando despega el helicóptero de rescate
  Entonces se da paso a la Escena 4
  Y se muestran los créditos principales nombrando a Diego Alejandro Zamora
  Y comienza la reproducción del Himno del SENA
  Y finaliza con un fundido a negro
```