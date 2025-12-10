// src/services/carAggregatorService.js
const fipeService = require("./fipeService");
const specsService = require("./specsService");

// Mantém o nome original da marca
function normalizeBrandForSpecs(brand) {
  return brand ? brand.trim() : "";
}

// Mantém o nome original do modelo FIPE
function normalizeModelForSpecs(model) {
  return model ? model.trim() : "";
}

async function getCarDetails({ brandCode, modelCode, yearCode }) {
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

  const brandForSpecs = normalizeBrandForSpecs(fipeData.Marca);
  const modelForSpecs = normalizeModelForSpecs(fipeData.Modelo);
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

  const specs = await specsService.searchCarSpecs({
    brand: brandForSpecs,
    model: modelForSpecs,
    year: yearForSpecs,
  });

  return {
    fipe: fipeData,
    specs,
    hasExtraSpecs: !!specs,
    message: specs
      ? null
      : "Nenhuma especificação extra encontrada para este modelo. Você ainda pode usar as informações da FIPE.",
  };
}

module.exports = {
  getCarDetails,
};
