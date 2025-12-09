// src/services/carAggregatorService.js
const fipeService = require("./fipeService");
const specsService = require("./specsService");

/**
 * Normaliza o nome da marca para melhorar a busca em APIs externas.
 */
function normalizeBrandForSpecs(brand) {
  if (!brand) return "";

  let clean = brand.trim();
  const upper = clean.toUpperCase();

  // casos especiais da FIPE
  if (upper.startsWith("VW")) return "Volkswagen";
  if (upper.startsWith("GM")) return "Chevrolet";

  // Marca com hífen: pega a última parte
  if (clean.includes("-")) {
    clean = clean.split("-").pop().trim();
  }

  // Marca com barra: pega a primeira parte
  if (clean.includes("/")) {
    clean = clean.split("/")[0].trim();
  }

  return clean;
}

/**
 * Essa é a função CRÍTICA corrigida — responsável por extrair o modelo corretamente
 * sem incluir versão, motorização, carroceria, etc.
 */
function extractModelForSpecs(model) {
  if (!model) return "";

  let clean = model;

  // remove textos entre parênteses
  clean = clean.split("(")[0];

  // remove vírgulas
  clean = clean.split(",")[0];

  // remove espaços extra
  clean = clean.replace(/\s+/g, " ").trim();

  const tokens = clean.split(" ");

  // Stopwords comuns em versões/complementos — NÃO podem ir no modelo
  const stopWords = [
    "LX", "EX", "LXS", "EXS", "SI", "SPORT", "TOURING", "TYPE-R",
    "DX", "TSI", "MPI", "GLI", "XDRIVE", "COMPETITION",
    "HGT", "ADVANCED", "RS", "GT", "GTI", "VTI", "M", "SEDAN",
    "HATCH", "CROSS", "PLUS", "PREMIER", "HIGHLINE", "TRENDLINE"
  ];

  const result = [];

  for (const t of tokens) {
    const upper = t.toUpperCase();

    // versão conhecida
    if (stopWords.includes(upper)) break;

    // se for número que parece cilindrada/versão, pare
    if (/\d+(\.\d+)?/.test(t)) break;

    // se for 16V, 8V, TURBO etc, pare
    if (/16V|8V|12V|24V|TURBO|TSI|VTEC/i.test(t)) break;

    result.push(t);
  }

  // fallback
  if (result.length === 0) return tokens[0];

  return result.join(" ");
}

/**
 * Pega dados FIPE + specs externas.
 */
async function getCarDetails({ brandCode, modelCode, yearCode }) {
  // === FIPE ===
  const fipeData = await fipeService.getCarDetails(
    brandCode,
    modelCode,
    yearCode
  );

  if (!fipeData) {
    return {
      fipe: null,
      specs: null,
      hasExtraSpecs: false,
      message: "Não foi possível obter dados da FIPE para este veículo.",
    };
  }

  // Normalização necessária para APIs externas
  const brandForSpecs = normalizeBrandForSpecs(fipeData.Marca);
  const modelForSpecs = extractModelForSpecs(fipeData.Modelo);
  const yearForSpecs = fipeData.AnoModelo;

  console.log("[AGG] FIPE bruto:", {
    Marca: fipeData.Marca,
    Modelo: fipeData.Modelo,
    AnoModelo: fipeData.AnoModelo,
  });

  console.log("[AGG] Normalizado p/ specs:", {
    brandForSpecs,
    modelForSpecs,
    yearForSpecs,
  });

  // === SPECS EXTERNAS ===
  const specs = await specsService.searchCarSpecs({
    brand: brandForSpecs,
    model: modelForSpecs,
    year: yearForSpecs,
  });

  const hasExtraSpecs = !!specs;

  const message = hasExtraSpecs
    ? null
    : "Nenhuma especificação extra encontrada para este modelo. Você ainda pode usar as informações da FIPE.";

  return {
    fipe: fipeData,
    specs,
    hasExtraSpecs,
    message,
  };
}

module.exports = {
  getCarDetails,
};
