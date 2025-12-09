// src/services/specsService.js
const { searchFromApiNinjas } = require('./specProviders/apiNinjasProvider');
const { searchFromCarQuery } = require('./specProviders/carQueryProvider');
const { searchFromVpic } = require('./specProviders/vpicProvider');

// se quiser 100% públicas, é só tirar o searchFromApiNinjas daqui:
const PROVIDERS = [
  searchFromApiNinjas, // precisa de key
  searchFromCarQuery,  // público
  searchFromVpic,      // público
];

const FIELDS = [
  'engine',
  'displacement',
  'horsepower',
  'torque',
  'fuel_type',
  'transmission',
  'drive',
  'body_style',
  'cylinders',
  'city_mpg',
  'highway_mpg',
];

function mergeSpecs(specsList) {
  const final = {
    make: null,
    model: null,
    year: null,
    _sources: [],
  };

  for (const specs of specsList) {
    if (!specs) continue;

    final.make = final.make || specs.make;
    final.model = final.model || specs.model;
    final.year = final.year || specs.year;

    if (specs._source) final._sources.push(specs._source);

    for (const field of FIELDS) {
      if (final[field] == null && specs[field] != null) {
        final[field] = specs[field];
      }
    }
  }

  return final;
}

function completionRate(specs) {
  const total = FIELDS.length;
  if (total === 0) return 0;
  const filled = FIELDS.filter((f) => specs[f] != null).length;
  return filled / total;
}

async function searchCarSpecs({ brand, model, year }) {
  const partialResults = [];

  for (const provider of PROVIDERS) {
    try {
      const result = await provider({ brand, model, year });
      if (result) {
        partialResults.push(result);

        const merged = mergeSpecs(partialResults);
        const rate = completionRate(merged);
        console.log('[SPECS] Provider ok:', result._source, 'completion', rate);

        if (rate >= 0.9) {
          return { ...merged, completionRate: rate };
        }
      }
    } catch (e) {
      console.error('[SPECS] Erro em provider:', e.message);
    }
  }

  if (partialResults.length === 0) {
    console.log('[SPECS] Nenhum provider retornou dados');
    return null;
  }

  const merged = mergeSpecs(partialResults);
  const rate = completionRate(merged);
  console.log('[SPECS] Resultado final completion:', rate);

  if (rate < 0.1) return null;

  return { ...merged, completionRate: rate };
}

module.exports = {
  searchCarSpecs,
};
