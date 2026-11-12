import logoIcon from "../../assets/img/icons/icon.png";
import menuBackground from "../../assets/img/fondos/fondo_menu.png";
import wallTexture from "../../assets/img/texturas/textura_pared.png";
import floorTexture from "../../assets/img/texturas/baldosa_color_crema.png";
import zamoraAbajo from "../../assets/img/players/zamora/vista_abajo.png";
import zamoraArriba from "../../assets/img/players/zamora/vista_arriba.png";
import zamoraDerecha from "../../assets/img/players/zamora/vista_derecha.png";
import zamoraIzquierda from "../../assets/img/players/zamora/vista_izquierda.png";
import chantreAbajo from "../../assets/img/players/chantre/vista_abajo.png";
import chantreArriba from "../../assets/img/players/chantre/vista_arriba.png";
import chantreDerecha from "../../assets/img/players/chantre/vista_derecha.png";
import chantreIzquierda from "../../assets/img/players/chantre/vista_izquierda.png";
import juanAbajo from "../../assets/img/players/juan/vista_abajo.png";
import juanArriba from "../../assets/img/players/juan/vista_arriba.png";
import juanDerecha from "../../assets/img/players/juan/vista_derecha.png";
import juanIzquierda from "../../assets/img/players/juan/vista_izquierda.png";
import daiverAbajo from "../../assets/img/players/daiver/vista_abajo.png";
import daiverArriba from "../../assets/img/players/daiver/vista_arriba.png";
import daiverDerecha from "../../assets/img/players/daiver/vista_derecha.png";
import daiverIzquierda from "../../assets/img/players/daiver/vista_izquierda.png";
import fondoMenu from "../../assets/sound/music/menu/fondo_menu.mp3";
import ambienteTranquilo from "../../assets/sound/music/ambiental/ambiente_tranquilo.mp3";
import ambienteHorror from "../../assets/sound/music/ambiental/ambiente_horror.mp3";
import caminar from "../../assets/sound/effects/caminar.mp3";

/**
 * Manifiesto de assets gráficos y de audio.
 *
 * Vite procesa los imports y emite copias con hash en `dist/`, de modo que
 * las imágenes y los sonidos funcionan igual en desarrollo y en la compilación.
 */
export const ASSET_MANIFEST = {
  images: {
    logo: logoIcon,
    menuBackground,
    wallTexture,
    floorTexture,
    zamoraAbajo,
    zamoraArriba,
    zamoraDerecha,
    zamoraIzquierda,
    chantreAbajo,
    chantreArriba,
    chantreDerecha,
    chantreIzquierda,
    juanAbajo,
    juanArriba,
    juanDerecha,
    juanIzquierda,
    daiverAbajo,
    daiverArriba,
    daiverDerecha,
    daiverIzquierda,
  },
  audio: {
    fondoMenu,
    ambienteTranquilo,
    ambienteHorror,
    caminar,
  },
};

/**
 * Claves de las pistas musicales y del efecto de caminata.
 *
 * Las escenas piden la música por situación; `AudioManager` se encarga del
 * fundido cruzado y de reanudarla cuando el navegador permite reproducir.
 */
export const MUSIC_TRACKS = {
  menu: "fondoMenu",
  calm: "ambienteTranquilo",
  horror: "ambienteHorror",
};

export const FOOTSTEP_SOUND = "caminar";

/**
 * Vistas de estado quieto por personaje.
 *
 * `crop` es el rectángulo del PNG original que contiene al personaje, medido
 * sobre el canal alfa con 4 px de margen. Todos los recortes se dibujan a la
 * misma altura para que el personaje no cambie de tamaño al girar.
 *
 * Los cuatro personajes cuentan solo con estado quieto. Las animaciones de
 * caminar, correr y golpear se integrarán cuando existan sus sprites.
 */
export const PLAYER_SPRITE_VIEWS = {
  zamora: {
    down: { key: "zamoraAbajo", crop: { x: 169, y: 50, w: 366, h: 486 } },
    up: { key: "zamoraArriba", crop: { x: 91, y: 50, w: 367, h: 483 } },
    right: { key: "zamoraDerecha", crop: { x: 99, y: 33, w: 362, h: 479 } },
    left: { key: "zamoraIzquierda", crop: { x: 161, y: 31, w: 370, h: 478 } },
  },
  chantre: {
    down: { key: "chantreAbajo", crop: { x: 106, y: 11, w: 421, h: 529 } },
    up: { key: "chantreArriba", crop: { x: 109, y: 11, w: 411, h: 537 } },
    right: { key: "chantreDerecha", crop: { x: 144, y: 8, w: 344, h: 547 } },
    left: { key: "chantreIzquierda", crop: { x: 143, y: 10, w: 341, h: 545 } },
  },
  juan: {
    down: { key: "juanAbajo", crop: { x: 135, y: 0, w: 363, h: 520 } },
    up: { key: "juanArriba", crop: { x: 127, y: 0, w: 365, h: 524 } },
    right: { key: "juanDerecha", crop: { x: 131, y: 4, w: 357, h: 568 } },
    left: { key: "juanIzquierda", crop: { x: 139, y: 4, w: 357, h: 569 } },
  },
  daiver: {
    down: { key: "daiverAbajo", crop: { x: 97, y: 10, w: 439, h: 533 } },
    up: { key: "daiverArriba", crop: { x: 95, y: 10, w: 439, h: 540 } },
    right: { key: "daiverDerecha", crop: { x: 132, y: 0, w: 374, h: 580 } },
    left: { key: "daiverIzquierda", crop: { x: 122, y: 0, w: 376, h: 580 } },
  },
};
