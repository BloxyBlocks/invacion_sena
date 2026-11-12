import { Game } from "./core/Game.js";

const canvas = document.getElementById("game");

if (!(canvas instanceof HTMLCanvasElement)) {
  throw new Error("No se encontró el canvas del juego.");
}

const game = new Game(canvas);
game.start();

if (import.meta.env.DEV) {
  window.__INVACION_GAME__ = game;
}
