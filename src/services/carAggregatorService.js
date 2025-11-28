const fipeService = require('./fipeService');
const specsService = require('./specsService');

function normalizeBrandForSpecs(brand) {
  if (!brand) return '';

  let clean = brand.trim();
  const upper = clean.toUpperCase();

  // Casos especiais FIPE
  if (upper.startsWith('VW')) return 'Volkswagen';
  if (upper.startsWith('GM')) return 'Chevrolet';

  // Ex: "FIAT - IMPORTADO"  => "IMPORTADO"
  if (clean.includes('-')) {
    const parts = clean.split('-');
    return parts[parts.length - 1].trim();
  }

  // Ex: "Mercedes-Benz/Chrysler" => "Mercedes-Benz"
  if (clean.includes('/')) {
    return clean.split('/')[0].trim();
  }

  // Padrão: devolve a marca inteira ("Alfa Romeo", "Land Rover", etc)
  return clean;
}

function extractModelForSpecs(model) {
  if (!model) return '';

  let clean = model;

  clean = clean.split('(')[0];
  clean = clean.split(',')[0];

  // normaliza espaços
  clean = clean.replace(/\s+/g, ' ').trim();

  const tokens = clean.split(' ');

  const result = [];
  for (const t of tokens) {
    if (/\d+(\.\d+)?/.test(t) || /16V|8V|12V|24V|TURBO/i.test(t)) break;
    result.push(t);
  }

  if (result.length === 0) {
    return tokens[0];
  }

  return result.join(' ');
}

async function getCarDetails({ brandCode, modelCode, yearCode }) {
  const fipeData = await fipeService.getCarDetails(brandCode, modelCode, yearCode);

  if (!fipeData) {
    return { fipe: null, specs: null };
  }

  const brandForSpecs = normalizeBrandForSpecs(fipeData.Marca);
  const modelForSpecs = extractModelForSpecs(fipeData.Modelo);
  const yearForSpecs = fipeData.AnoModelo;

  console.log('[AGG] FIPE bruto:', {
    Marca: fipeData.Marca,
    Modelo: fipeData.Modelo,
    AnoModelo: fipeData.AnoModelo,
  });

  console.log('[AGG] Normalizado p/ specs:', {
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
  };
}

module.exports = {
  getCarDetails,
};
