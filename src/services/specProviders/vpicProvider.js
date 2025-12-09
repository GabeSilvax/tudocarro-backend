// src/services/specProviders/vpicProvider.js
const axios = require('axios');

const VPIC_BASE_URL =
  process.env.VPIC_BASE_URL || 'https://vpic.nhtsa.dot.gov/api/vehicles';

async function searchFromVpic({ brand, model, year }) {
  try {
    const url = `${VPIC_BASE_URL}/GetModelsForMakeYear/make/${encodeURIComponent(
      brand
    )}/modelyear/${year}`;
    const params = { format: 'json' };

    console.log('[VPIC] GET', url, params);

    const { data } = await axios.get(url, { params, timeout: 8000 });

    if (!data || !data.Results || data.Results.length === 0) return null;

    const resultModel = data.Results.find((it) =>
      it.Model_Name?.toLowerCase().includes(model.toLowerCase())
    );

    if (!resultModel) return null;

    return {
      make: resultModel.Make_Name || brand,
      model: resultModel.Model_Name || model,
      year,
      _source: 'vpic',
    };
  } catch (error) {
    console.error('[VPIC] Erro:', error.message);
    if (error.response) {
      console.error('[VPIC] Status:', error.response.status);
      console.error('[VPIC] Data:', error.response.data);
    }
    return null;
  }
}

module.exports = { searchFromVpic };
