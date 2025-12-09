// src/services/specProviders/carQueryProvider.js
const axios = require('axios');

const CARQUERY_BASE_URL =
  process.env.CARQUERY_BASE_URL || 'https://www.carqueryapi.com/api/0.3/';

async function searchFromCarQuery({ brand, model, year }) {
  try {
    const url = CARQUERY_BASE_URL;
    const params = {
      cmd: 'getTrims',
      make: brand,
      model,
      year,
      full_results: 1,
    };

    console.log('[CARQUERY] GET', url, params);

    const { data } = await axios.get(url, { params, timeout: 8000 });

    let parsed = data;
    if (typeof data === 'string') {
      // CarQuery às vezes vem como "callback(JSON)"
      const jsonStr = data.replace(/^[^(]*\(/, '').replace(/\);?$/, '');
      parsed = JSON.parse(jsonStr);
    }

    const trims = parsed?.Trims || parsed?.trims || [];
    if (!trims.length) return null;

    const trim = trims[0];

    return {
      make: trim.make || brand,
      model: trim.model || model,
      year: trim.year || year,
      engine: trim.model_engine_type,
      displacement: trim.model_engine_cc
        ? (trim.model_engine_cc / 1000).toFixed(1)
        : null, // converte cc -> L
      horsepower: trim.model_engine_power_ps || trim.model_engine_power_hp,
      fuel_type: trim.model_engine_fuel,
      transmission: trim.model_transmission_type,
      drive: trim.model_drive,
      body_style: trim.model_body,
      cylinders: trim.model_engine_cyl,
      _source: 'carquery',
    };
  } catch (error) {
    console.error('[CARQUERY] Erro:', error.message);
    if (error.response) {
      console.error('[CARQUERY] Status:', error.response.status);
      console.error('[CARQUERY] Data:', error.response.data);
    }
    return null;
  }
}

module.exports = { searchFromCarQuery };
