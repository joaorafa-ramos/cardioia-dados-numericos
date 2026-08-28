import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SEED = 42;
const ROW_COUNT_EXPECTED = 120;

function mulberry32(seed) {
  return function random() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const random = mulberry32(SEED);

function normal(mean = 0, sd = 1) {
  const u = Math.max(random(), Number.EPSILON);
  const v = Math.max(random(), Number.EPSILON);
  return mean + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function chance(probability) {
  return random() < clamp(probability, 0, 1) ? 1 : 0;
}

function weightedChoice(entries) {
  const draw = random();
  let cumulative = 0;
  for (const [value, weight] of entries) {
    cumulative += weight;
    if (draw <= cumulative) return value;
  }
  return entries.at(-1)[0];
}

function parseCsv(text) {
  const lines = text.replace(/^\uFEFF/, "").trim().split(/\r?\n/);
  const headers = lines[0].split(",");
  return lines.slice(1).map((line) => {
    const values = line.split(",");
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  });
}

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function syntheticClinicalFields(source) {
  const age = Number(source.idade);
  const male = source.sexo === "M" ? 1 : 0;
  const cls = source.classe;

  const classEffects = {
    NORM: { sbp: 0, dbp: 0, chol: 0, bmi: 0, prior: 0.04 },
    MI: { sbp: 8, dbp: 3, chol: 28, bmi: 1.2, prior: 0.72 },
    STTC: { sbp: 8, dbp: 4, chol: 16, bmi: 0.7, prior: 0.40 },
    CD: { sbp: 5, dbp: 2, chol: 8, bmi: 0.4, prior: 0.52 },
    HYP: { sbp: 22, dbp: 11, chol: 14, bmi: 1.5, prior: 0.44 },
  }[cls];

  const imc = Math.round(clamp(normal(21.8 + 0.055 * (age - 20) + classEffects.bmi, 2.7), 17.2, 39.5) * 10) / 10;
  const currentSmokingProbability = clamp((cls === "MI" ? 0.27 : cls === "STTC" ? 0.18 : 0.12) + 0.04 * male, 0.08, 0.34);
  const formerSmokingProbability = clamp(0.18 + 0.0025 * Math.max(age - 45, 0), 0.18, 0.34);
  const neverSmokingProbability = 1 - currentSmokingProbability - formerSmokingProbability;
  const tabagismo = weightedChoice([
    ["Nunca", neverSmokingProbability],
    ["Ex", formerSmokingProbability],
    ["Atual", currentSmokingProbability],
  ]);
  // Normaliza os pesos da escolha de tabagismo.
  const smokingScore = tabagismo === "Atual" ? 1 : tabagismo === "Ex" ? 0.35 : 0;

  const historicoFamiliar = chance(0.24 + (cls === "MI" ? 0.18 : cls === "HYP" ? 0.10 : 0));
  const diabetesProbability = 0.035 + 0.0045 * Math.max(age - 40, 0) + 0.018 * Math.max(imc - 25, 0) + (cls === "MI" ? 0.09 : 0);
  const diabetes = chance(diabetesProbability);

  let pas = Math.round(clamp(normal(105 + 0.38 * (age - 20) + 3 * male + classEffects.sbp, 10), 90, 195));
  let pad = Math.round(clamp(normal(65 + 0.14 * (age - 20) + 2 * male + classEffects.dbp, 7), 55, 120));
  if (pad >= pas - 18) pad = Math.max(50, pas - 18);

  const hipertensaoProbability = (pas >= 140 || pad >= 90 ? 0.88 : 0.10) + (cls === "HYP" ? 0.22 : 0);
  const hipertensao = chance(hipertensaoProbability);
  if (hipertensao && pas < 130 && random() < 0.55) pas = Math.round(clamp(pas + normal(12, 4), 130, 195));

  const colesterol = Math.round(clamp(normal(145 + 0.78 * (age - 20) + classEffects.chol + 13 * smokingScore, 24), 105, 330));
  const glicemia = Math.round(clamp(normal((diabetes ? 126 : 79) + 0.22 * (age - 20) + 1.3 * Math.max(imc - 25, 0), diabetes ? 22 : 10), 62, 230));

  let frequenciaCardiaca;
  if (cls === "CD") {
    frequenciaCardiaca = random() < 0.62 ? normal(56, 8) : normal(91, 13);
  } else {
    const classHr = cls === "MI" ? 8 : cls === "STTC" ? 5 : cls === "HYP" ? 3 : 0;
    frequenciaCardiaca = normal(69 + classHr + 4 * smokingScore, 10);
  }
  frequenciaCardiaca = Math.round(clamp(frequenciaCardiaca, 42, 132));

  const atividadeFisica = weightedChoice(
    age >= 70 || cls === "MI"
      ? [["Baixa", 0.58], ["Moderada", 0.34], ["Alta", 0.08]]
      : cls === "NORM"
        ? [["Baixa", 0.22], ["Moderada", 0.53], ["Alta", 0.25]]
        : [["Baixa", 0.40], ["Moderada", 0.46], ["Alta", 0.14]],
  );

  const doencaCardiacaPrevia = chance(classEffects.prior + 0.002 * Math.max(age - 55, 0));
  const dorPeito = chance({ NORM: 0.05, MI: 0.68, STTC: 0.38, CD: 0.12, HYP: 0.14 }[cls]);
  const dispneia = chance({ NORM: 0.06, MI: 0.48, STTC: 0.30, CD: 0.23, HYP: 0.31 }[cls]);
  const palpitacoes = chance({ NORM: 0.07, MI: 0.22, STTC: 0.36, CD: 0.45, HYP: 0.20 }[cls]);
  const sincope = chance({ NORM: 0.01, MI: 0.08, STTC: 0.08, CD: 0.28, HYP: 0.06 }[cls]);

  const riskPoints =
    (age >= 65 ? 1 : 0) +
    (pas >= 140 ? 1 : 0) +
    (colesterol >= 240 ? 1 : 0) +
    (tabagismo === "Atual" ? 1 : 0) +
    diabetes +
    doencaCardiacaPrevia +
    dorPeito;
  const perfilRisco = riskPoints >= 4 ? "Alto" : riskPoints >= 2 ? "Moderado" : "Baixo";

  return {
    pressao_sistolica_mmhg: pas,
    pressao_diastolica_mmhg: pad,
    frequencia_cardiaca_bpm: frequenciaCardiaca,
    colesterol_total_mg_dl: colesterol,
    glicemia_jejum_mg_dl: glicemia,
    imc_kg_m2: imc,
    tabagismo,
    atividade_fisica: atividadeFisica,
    historico_familiar_dcv: historicoFamiliar,
    hipertensao_previa: hipertensao,
    diabetes_previa: diabetes,
    doenca_cardiaca_previa: doencaCardiacaPrevia,
    dor_peito: dorPeito,
    dispneia,
    palpitacoes,
    sincope,
    perfil_risco_sintetico: perfilRisco,
  };
}

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.resolve(scriptDir, "..");
const manifestPath = path.join(projectDir, "data", "source", "manifest_ecg_ptbxl.csv");
const outputPath = path.join(projectDir, "data", "cardioia_dataset_numerico.csv");

const sourceRows = parseCsv(await fs.readFile(manifestPath, "utf8"));
if (sourceRows.length !== ROW_COUNT_EXPECTED) {
  throw new Error(`Manifesto deveria conter ${ROW_COUNT_EXPECTED} linhas; encontrou ${sourceRows.length}.`);
}

const rows = sourceRows.map((source) => {
  const clinical = syntheticClinicalFields(source);
  const sintomas = [
    clinical.dor_peito ? "Dor no peito" : null,
    clinical.dispneia ? "Dispneia" : null,
    clinical.palpitacoes ? "Palpitacoes" : null,
    clinical.sincope ? "Sincope" : null,
  ].filter(Boolean);

  return {
    ecg_id: Number(source.ecg_id),
    idade_anos: Number(source.idade),
    sexo: source.sexo,
    pressao_arterial_mmhg: `${clinical.pressao_sistolica_mmhg}/${clinical.pressao_diastolica_mmhg}`,
    colesterol_total_mg_dl: clinical.colesterol_total_mg_dl,
    historico_doenca_cardiaca: clinical.doenca_cardiaca_previa,
    sintomas: sintomas.length ? sintomas.join("; ") : "Nenhum",
    frequencia_cardiaca_bpm: clinical.frequencia_cardiaca_bpm,
    classe_ecg: source.classe,
    glicemia_jejum_mg_dl: clinical.glicemia_jejum_mg_dl,
  };
});

const headers = Object.keys(rows[0]);
const csv = [headers.join(","), ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(","))].join("\n") + "\n";
await fs.writeFile(outputPath, `\uFEFF${csv}`, "utf8");

const counts = (field) => Object.fromEntries([...new Set(rows.map((row) => row[field]))].sort().map((value) => [value, rows.filter((row) => row[field] === value).length]));
const numericSummary = {};
for (const field of ["idade_anos", "frequencia_cardiaca_bpm", "colesterol_total_mg_dl", "glicemia_jejum_mg_dl"]) {
  const values = rows.map((row) => row[field]);
  numericSummary[field] = {
    min: Math.min(...values),
    max: Math.max(...values),
    media: Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10,
  };
}
const sistolicas = rows.map((row) => Number(row.pressao_arterial_mmhg.split("/")[0]));
const diastolicas = rows.map((row) => Number(row.pressao_arterial_mmhg.split("/")[1]));
numericSummary.pressao_sistolica_mmhg = { min: Math.min(...sistolicas), max: Math.max(...sistolicas) };
numericSummary.pressao_diastolica_mmhg = { min: Math.min(...diastolicas), max: Math.max(...diastolicas) };

const validation = {
  seed: SEED,
  linhas: rows.length,
  colunas: headers.length,
  ecg_ids_unicos: new Set(rows.map((row) => row.ecg_id)).size,
  valores_ausentes: rows.reduce((total, row) => total + headers.filter((header) => row[header] === "" || row[header] == null).length, 0),
  classes: counts("classe_ecg"),
  sexo: counts("sexo"),
  resumo_numerico: numericSummary,
  checks: {
    pressao_coerente: rows.every((row) => {
      const [sistolica, diastolica] = row.pressao_arterial_mmhg.split("/").map(Number);
      return sistolica > diastolica;
    }),
    historico_binario: rows.every((row) => [0, 1].includes(row.historico_doenca_cardiaca)),
  },
};

console.log(JSON.stringify(validation, null, 2));
