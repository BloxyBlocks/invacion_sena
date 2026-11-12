#!/usr/bin/env node
/**
 * Validador de consistencia documental de INVACIÓN SENA.
 *
 * No tiene dependencias externas. Comprueba la estructura mínima de SEDD:
 * - IDs de requisitos (RF/RN/RNF) definidos en 1-specs.md y presentes en 4-traceability.md.
 * - Tareas T-xxx definidas en 3-tasks.md y referenciadas en 4-traceability.md.
 * - Estados permitidos en la matriz de trazabilidad.
 * - Enlaces mínimos entre README, plan, trazabilidad y checklist.
 *
 * Uso:
 *   node scripts/check-docs.mjs
 *   node scripts/check-docs.mjs --strict
 *
 * --strict hace que las advertencias también fallen.
 */

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const STRICT = process.argv.includes("--strict");

const FILES = {
  readme: "README.md",
  specs: "docs/1-specs.md",
  plan: "docs/2-plan.md",
  tasks: "docs/3-tasks.md",
  traceability: "docs/4-traceability.md",
  checklist: "docs/5-doc-checklist.md",
};

const ALLOWED_STATUSES = new Set([
  "Pendiente",
  "En curso",
  "Bloqueado",
  "En revisión",
  "Completado",
]);

const errors = [];
const warnings = [];
const infos = [];

function read(relativePath) {
  const absolutePath = join(ROOT, relativePath);
  if (!existsSync(absolutePath)) {
    errors.push(`Falta el archivo obligatorio: ${relativePath}`);
    return "";
  }
  return readFileSync(absolutePath, "utf8");
}

function unique(values) {
  return [...new Set(values)];
}

function difference(left, right) {
  return [...left].filter((value) => !right.has(value));
}

const docs = Object.fromEntries(
  Object.entries(FILES).map(([key, relativePath]) => [key, read(relativePath)]),
);

const requirementPattern = /\*\*(RNF-\d{2}|RF-\d{2}|RN-\d{2})\*\*/g;

function requirementIds(text) {
  return unique([...text.matchAll(requirementPattern)].map((match) => match[1]));
}

const specRequirements = requirementIds(docs.specs);
const traceRequirements = requirementIds(docs.traceability);

const specSet = new Set(specRequirements);
const traceSet = new Set(traceRequirements);

for (const id of difference(specSet, traceSet)) {
  errors.push(`Requisito ${id} definido en 1-specs.md pero ausente en 4-traceability.md.`);
}

for (const id of difference(traceSet, specSet)) {
  errors.push(`Requisito ${id} presente en 4-traceability.md pero no definido en 1-specs.md.`);
}

// Tareas definidas en 3-tasks.md.
const taskPattern = /^-\s+\[([ x~])\]\s+\*\*(T-\d{3})\*\*/;
const definedTasks = new Map();

for (const line of docs.tasks.split(/\r?\n/)) {
  if (!/^-\s+\[/.test(line)) {
    continue;
  }

  const match = line.match(taskPattern);
  if (!match) {
    errors.push(`Tarea con formato inválido en 3-tasks.md: ${line.trim()}`);
    continue;
  }

  const [, marker, id] = match;
  if (definedTasks.has(id)) {
    errors.push(`Tarea duplicada en 3-tasks.md: ${id}.`);
    continue;
  }

  definedTasks.set(id, marker);
}

const traceTaskRefs = unique(
  [...docs.traceability.matchAll(/\bT-\d{3}\b/g)].map((match) => match[0]),
);
const traceTaskSet = new Set(traceTaskRefs);
const definedTaskSet = new Set(definedTasks.keys());

for (const id of difference(traceTaskSet, definedTaskSet)) {
  errors.push(`Tarea ${id} referenciada en 4-traceability.md pero no definida en 3-tasks.md.`);
}

for (const id of difference(definedTaskSet, traceTaskSet)) {
  infos.push(`${id} está definida en 3-tasks.md pero no se referencia en 4-traceability.md.`);
}

// Estados y tareas de cada fila de la matriz de trazabilidad.
const traceRows = docs.traceability
  .split(/\r?\n/)
  .filter((line) => /^\|\s*\*\*(RNF-\d{2}|RF-\d{2}|RN-\d{2})\*\*\s*\|/.test(line));

for (const line of traceRows) {
  const cells = line
    .split("|")
    .slice(1, -1)
    .map((cell) => cell.trim());

  if (cells.length < 6) {
    errors.push(`Fila de trazabilidad incompleta: ${line.trim()}`);
    continue;
  }

  const id = cells[0].replaceAll("**", "");
  const taskCell = cells[3];
  const status = cells[5];

  if (!ALLOWED_STATUSES.has(status)) {
    errors.push(
      `${id}: estado no permitido "${status}". Usa: ${[...ALLOWED_STATUSES].join(", ")}.`,
    );
  }

  if (!/\bT-\d{3}\b/.test(taskCell)) {
    errors.push(`${id}: no tiene una tarea T-xxx asociada en la columna Tarea.`);
  }

  if (status === "Completado") {
    const linkedTasks = taskCell.match(/\bT-\d{3}\b/g) ?? [];
    const hasCompletedTask = linkedTasks.some((taskId) => definedTasks.get(taskId) === "x");
    if (!hasCompletedTask) {
      warnings.push(
        `${id}: figura como Completado, pero ninguna de sus tareas está marcada [x].`,
      );
    }
  }
}

// Enlaces mínimos para que la validación sea descubrible y no quede aislada.
if (!docs.readme.includes("npm run docs:check")) {
  warnings.push("README.md no menciona el comando npm run docs:check.");
}

if (!docs.plan.includes("check-docs.mjs")) {
  warnings.push("docs/2-plan.md no documenta scripts/check-docs.mjs.");
}

if (!docs.traceability.includes("check-docs.mjs")) {
  warnings.push("docs/4-traceability.md no enlaza scripts/check-docs.mjs.");
}

if (!docs.checklist.includes("npm run docs:check")) {
  warnings.push("docs/5-doc-checklist.md no menciona npm run docs:check.");
}

const counts = {
  RF: specRequirements.filter((id) => id.startsWith("RF-")).length,
  RN: specRequirements.filter((id) => id.startsWith("RN-")).length,
  RNF: specRequirements.filter((id) => id.startsWith("RNF-")).length,
};

console.log("INVACIÓN SENA - validación documental");
console.log("=====================================");
console.log(`Requisitos: ${specRequirements.length} (RF: ${counts.RF}, RN: ${counts.RN}, RNF: ${counts.RNF})`);
console.log(`Tareas: ${definedTasks.size}`);
console.log("");

function printBlock(title, items, prefix) {
  console.log(`${title} (${items.length})`);
  for (const item of items) {
    console.log(`  ${prefix} ${item}`);
  }
  console.log("");
}

printBlock("Errores", errors, "[ERROR]");
printBlock("Advertencias", warnings, "[WARN] ");
printBlock("Avisos", infos, "[INFO] ");

let failed = errors.length > 0 || (STRICT && warnings.length > 0);

if (failed) {
  console.log(
    STRICT && errors.length === 0
      ? "Resultado: FALLÓ por advertencias en modo estricto."
      : "Resultado: FALLÓ. Corrige los errores antes de cerrar la tarea o el sprint.",
  );
  process.exitCode = 1;
} else {
  console.log(
    infos.length > 0
      ? `Resultado: OK con ${infos.length} aviso(s). Revisa si algún aviso requiere acción.`
      : "Resultado: OK. Documentación consistente.",
  );
  process.exitCode = 0;
}
