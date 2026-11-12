import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const OUT_DIR = path.dirname(fileURLToPath(import.meta.url));
fs.mkdirSync(OUT_DIR, { recursive: true });

const results = {
  generatedAt: new Date().toISOString(),
  environment: {},
  assets: {},
  menu: {},
  scenes: {},
  screenshots: [],
  consoleErrors: [],
};

const consoleErrors = [];
let messageId = 0;
const pending = new Map();

function connect(url) {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(url);
    socket.addEventListener("open", () => resolve(socket));
    socket.addEventListener("error", (error) => reject(error));
  });
}

function attach(socket) {
  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) {
        reject(new Error(JSON.stringify(message.error)));
      } else {
        resolve(message.result);
      }
      return;
    }

    if (message.method === "Runtime.exceptionThrown") {
      consoleErrors.push(
        message.params.exceptionDetails?.exception?.description ??
          message.params.exceptionDetails?.text ??
          "excepción desconocida",
      );
    }
    if (message.method === "Runtime.consoleAPICalled" && message.params.type === "error") {
      consoleErrors.push(
        message.params.args.map((arg) => arg.value ?? arg.description ?? "").join(" "),
      );
    }
    if (message.method === "Log.entryAdded" && message.params.entry.level === "error") {
      consoleErrors.push(message.params.entry.text);
    }
  });
}

function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++messageId;
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
}

async function evaluate(expression, awaitPromise = false) {
  const result = await send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise,
    userGesture: true,
  });
  if (result.exceptionDetails) {
    throw new Error(
      result.exceptionDetails.exception?.description ??
        result.exceptionDetails.text ??
        "Error al evaluar",
    );
  }
  return result.result.value;
}

async function waitFor(expression, timeout = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const value = await evaluate(expression);
      if (value) {
        return value;
      }
    } catch {
      // La página aún está cargando.
    }
    await sleep(150);
  }
  throw new Error(`Tiempo de espera agotado: ${expression}`);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const KEYS = {
  ArrowDown: { key: "ArrowDown", code: "ArrowDown", keyCode: 40 },
  ArrowLeft: { key: "ArrowLeft", code: "ArrowLeft", keyCode: 37 },
  ArrowRight: { key: "ArrowRight", code: "ArrowRight", keyCode: 39 },
  ArrowUp: { key: "ArrowUp", code: "ArrowUp", keyCode: 38 },
  Enter: { key: "Enter", code: "Enter", keyCode: 13 },
  Space: { key: " ", code: "Space", keyCode: 32 },
};

async function keyDown(name) {
  const info = KEYS[name];
  await send("Input.dispatchKeyEvent", {
    type: "keyDown",
    key: info.key,
    code: info.code,
    windowsVirtualKeyCode: info.keyCode,
    nativeVirtualKeyCode: info.keyCode,
  });
}

async function keyUp(name) {
  const info = KEYS[name];
  await send("Input.dispatchKeyEvent", {
    type: "keyUp",
    key: info.key,
    code: info.code,
    windowsVirtualKeyCode: info.keyCode,
    nativeVirtualKeyCode: info.keyCode,
  });
}

async function press(name, hold = 120) {
  await keyDown(name);
  await sleep(hold);
  await keyUp(name);
  await sleep(120);
}

async function screenshot(name) {
  const { data } = await send("Page.captureScreenshot", { format: "png" });
  const file = path.join(OUT_DIR, name);
  fs.writeFileSync(file, Buffer.from(data, "base64"));
  results.screenshots.push(name);
  return file;
}

async function setViewport(width, height) {
  await send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await sleep(350);
}

async function measureFps(seconds = 3) {
  const samples = [];
  const count = Math.max(2, Math.round(seconds * 2));
  for (let index = 0; index < count; index += 1) {
    await sleep(500);
    samples.push(await evaluate("window.__INVACION_GAME__.fps"));
  }
  const sorted = [...samples].sort((a, b) => a - b);
  return {
    samples,
    min: sorted[0],
    median: sorted[Math.floor(sorted.length / 2)],
    max: sorted[sorted.length - 1],
  };
}

async function ensureSelection(target) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const index = await evaluate("window.__INVACION_GAME__.state.current.selectedIndex");
    if (index === target) {
      return index;
    }
    await press("ArrowRight", 180);
    await sleep(120);
  }
  return evaluate("window.__INVACION_GAME__.state.current.selectedIndex");
}

let socket;

try {
  const targets = await fetch("http://127.0.0.1:9222/json/list").then((response) =>
    response.json(),
  );
  const target = targets.find((item) => item.type === "page");
  if (!target) {
    throw new Error("Chrome no expuso una pestaña para CDP.");
  }

  socket = await connect(target.webSocketDebuggerUrl);
  attach(socket);

  await send("Page.enable");
  await send("Runtime.enable");
  await send("Log.enable");
  await setViewport(1280, 720);
  await send("Page.navigate", { url: "http://127.0.0.1:5173/" });

  await waitFor("Boolean(window.__INVACION_GAME__)");
  await waitFor("window.__INVACION_GAME__.state.currentId === 'menu'");
  await sleep(900);

  results.environment = await evaluate(`({
    viewport: [window.innerWidth, window.innerHeight],
    dpr: window.devicePixelRatio,
    userAgent: navigator.userAgent
  })`);

  results.assets = await evaluate(`(() => {
    const game = window.__INVACION_GAME__;
    const keys = [
      'logo', 'menuBackground', 'wallTexture', 'floorTexture',
      'zamoraAbajo', 'zamoraArriba', 'zamoraDerecha', 'zamoraIzquierda',
      'chantreAbajo', 'chantreArriba', 'chantreDerecha', 'chantreIzquierda',
      'juanAbajo', 'juanArriba', 'juanDerecha', 'juanIzquierda',
      'daiverAbajo', 'daiverArriba', 'daiverDerecha', 'daiverIzquierda'
    ];
    const missing = keys.filter((key) => !game.assets.getImage(key));
    return {
      images: game.assets.images.size,
      audio: game.assets.audio.size,
      total: game.assets.total,
      errors: game.assets.errors.slice(),
      missingImages: missing
    };
  })()`);

  results.menu.layout1280 = await evaluate(`(() => {
    const scene = window.__INVACION_GAME__.state.current;
    const layout = scene.getLayout();
    return {
      wide: layout.wide,
      cols: layout.cols,
      rows: layout.rows,
      cards: layout.cards.length,
      contentX: Math.round(layout.contentX),
      contentW: Math.round(layout.contentW),
      cardTop: Math.round(layout.cardsTop),
      cardBottom: Math.round(layout.cardsBottom),
      detailsBottom: Math.round(layout.details.y + layout.details.h),
      startBottom: Math.round(layout.start.y + layout.start.h),
      insideViewport: layout.cards.every((card) => card.x >= 0 && card.x + card.w <= layout.width && card.y + card.h <= layout.height),
      characterVisible: layout.contentX > layout.width * 0.42
    };
  })()`);

  results.menu.portraits = await evaluate(`(async () => {
    const game = window.__INVACION_GAME__;
    const { getPortraitSource } = await import('/src/ui/portrait.js');
    const { CHARACTERS } = await import('/src/entities/Player.js');
    return CHARACTERS.map((character) => {
      const source = getPortraitSource(game.assets, character);
      return {
        id: character.id,
        hasSprite: Boolean(source),
        image: Boolean(source && source.image)
      };
    });
  })()`, true);

  await screenshot("menu-1280x720.png");

  results.menu.selection = [];
  for (let index = 0; index < 4; index += 1) {
    if (index > 0) {
      await ensureSelection(index);
    }
    const state = await evaluate(`(async () => {
      const scene = window.__INVACION_GAME__.state.current;
      const character = (await import('/src/entities/Player.js')).CHARACTERS[scene.selectedIndex];
      return { index: scene.selectedIndex, id: character.id, name: character.name };
    })()`, true);
    await sleep(250);
    await screenshot(`menu-${state.id}-1280x720.png`);
    results.menu.selection.push(state);
  }

  // Menú en viewport compacto y en formato vertical.
  await setViewport(1024, 600);
  await sleep(300);
  results.menu.layout1024 = await evaluate(`(() => {
    const layout = window.__INVACION_GAME__.state.current.getLayout();
    return {
      wide: layout.wide,
      cols: layout.cols,
      contentX: Math.round(layout.contentX),
      startBottom: Math.round(layout.start.y + layout.start.h),
      insideViewport: layout.start.y + layout.start.h < layout.height - 30
    };
  })()`);
  await screenshot("menu-1024x600.png");

  await setViewport(820, 1000);
  await sleep(300);
  results.menu.layout820 = await evaluate(`(() => {
    const layout = window.__INVACION_GAME__.state.current.getLayout();
    return {
      wide: layout.wide,
      cols: layout.cols,
      contentX: Math.round(layout.contentX),
      insideViewport: layout.start.y + layout.start.h < layout.height - 30
    };
  })()`);
  await screenshot("menu-820x1000.png");

  await setViewport(1280, 720);
  await sleep(300);
  results.menu.fps = await measureFps(3);

  // Escena 1 con cada personaje: texturas, sprites y cuatro direcciones.
  const characters = ["zamora", "chantre", "juan", "daiver"];
  results.scenes.scene1 = [];

  for (const characterId of characters) {
    await evaluate(`window.__INVACION_GAME__.state.switchTo('scene1', { characterId: '${characterId}' })`);
    await waitFor(`window.__INVACION_GAME__.state.currentId === 'scene1' && window.__INVACION_GAME__.state.current.player.character.id === '${characterId}'`);
    await sleep(400);

    const textures = await evaluate(`(() => {
      const scene = window.__INVACION_GAME__.state.current;
      const game = window.__INVACION_GAME__;
      return {
        wallTexture: Boolean(game.assets.getImage('wallTexture')),
        floorTexture: Boolean(game.assets.getImage('floorTexture')),
        roomOverlay: Boolean(scene.roomOverlay),
        overlaySize: scene.roomOverlay ? [scene.roomOverlay.width, scene.roomOverlay.height] : null
      };
    })()`);

    // Saltar la introducción y esperar la fase de amenaza (movimiento activo).
    await press("Enter", 80);
    await sleep(1900);

    const directions = {};
    const sequence = [
      ["ArrowDown", "down"],
      ["ArrowUp", "up"],
      ["ArrowRight", "right"],
      ["ArrowLeft", "left"],
    ];

    for (const [key, expected] of sequence) {
      await keyDown(key);
      await sleep(280);
      directions[expected] = await evaluate(`(() => {
        const player = window.__INVACION_GAME__.state.current.player;
        const view = player.getSpriteView();
        return { facing: player.facing, view: view ? view.view.key : null, moving: player.moving };
      })()`);
      await keyUp(key);
      await sleep(140);
    }

    await keyDown("ArrowDown");
    await sleep(220);
    await screenshot(`scene1-${characterId}-1280x720.png`);
    await keyUp("ArrowDown");
    await sleep(150);

    const fps = await measureFps(1.5);

    results.scenes.scene1.push({
      characterId,
      phase: await evaluate("window.__INVACION_GAME__.state.current.phase"),
      textures,
      directions,
      fps,
    });
  }

  // Escena de prueba: pared exterior y baldosa interior.
  await evaluate("window.__INVACION_GAME__.state.switchTo('test', { characterId: 'chantre' })");
  await waitFor("window.__INVACION_GAME__.state.currentId === 'test'");
  await sleep(700);
  results.scenes.test = await evaluate(`(() => {
    const scene = window.__INVACION_GAME__.state.current;
    return {
      floorOverlay: Boolean(scene.floorOverlay),
      overlaySize: scene.floorOverlay ? [scene.floorOverlay.width, scene.floorOverlay.height] : null,
      wallTexture: Boolean(window.__INVACION_GAME__.assets.getImage('wallTexture')),
      floorTexture: Boolean(window.__INVACION_GAME__.assets.getImage('floorTexture')),
      sprite: scene.player.getSpriteView()?.view?.key ?? null
    };
  })()`);
  await screenshot("test-textures-1280x720.png");
  results.scenes.testFps = await measureFps(1.5);

  // Regresar al menú para medir FPS estable.
  await evaluate("window.__INVACION_GAME__.state.switchTo('menu')");
  await waitFor("window.__INVACION_GAME__.state.currentId === 'menu'");
  await sleep(500);
  results.menu.finalFps = await measureFps(3);

  results.consoleErrors = consoleErrors;
} catch (error) {
  results.fatalError = error.message;
  results.consoleErrors = consoleErrors;
  process.exitCode = 1;
} finally {
  if (socket) {
    socket.close();
  }
  fs.writeFileSync(
    path.join(OUT_DIR, "verification.json"),
    `${JSON.stringify(results, null, 2)}\n`,
  );
  console.log(JSON.stringify(results, null, 2));
}
