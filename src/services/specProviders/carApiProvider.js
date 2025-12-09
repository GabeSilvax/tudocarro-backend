// src/services/specProviders/carApiProvider.js
const axios = require('axios');

const CARAPI_TOKEN = process.env.CARAPI_TOKEN;
const CARAPI_SECRET = process.env.CARAPI_SECRET;
const CARAPI_BASE_URL = process.env.CARAPI_BASE_URL || 'https://carapi.app/api';

async function searchFromCarApi({ brand, model, year }) {
  if (!CARAPI_TOKEN || !CARAPI_SECRET) {
    console.warn('[CARAPI] Token/Secret não configurados. Pulando CarAPI.');
    return null;
  }

  try {
    const url = `${CARAPI_BASE_URL}/vehicles`;

    const params = {
      year,
      make: brand,
      model,
      // ajuste se a doc pedir outros filtros
    };

    const headers = {
      Authorization: `Token token=${CARAPI_TOKEN}, secret=${CARAPI_SECRET}`,
    };

    console.log('[CARAPI] GET', url, params);

    const { data } = await axios.get(url, {
      params,
      headers,
      timeout: 8000,
    });

    const car = data?.data?.[0] || data[0];
    if (!car) return null;

    return {
      make: car.make || brand,
      model: car.model || model,
      year: car.year || year,
      engine: car.engine?.name || car.engine?.description,
      displacement: car.engine?.displacement,
      horsepower: car.engine?.horsepower,
      torque: car.engine?.torque,
      fuel_type: car.engine?.fuel_type,
      transmission: car.transmission?.name || car.transmission,
      drive: car.drivetrain || car.drive,
      body_style: car.body_style,
      cylinders: car.engine?.cylinders,
      _source: 'carapi',
    };
  } catch (error) {
    console.error('[CARAPI] Erro ao buscar especificações:', error.message);
    if (error.response) {
      console.error('[CARAPI] Status:', error.response.status);
      console.error('[CARAPI] Data:', error.response.data);
    }
    return null;
  }
}

module.exports = { searchFromCarApi };
