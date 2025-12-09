// src/services/specProviders/rapidCarApi2Provider.js
const axios = require('axios');

const RAPIDAPI_CARAPI2_KEY = process.env.RAPIDAPI_CARAPI2_KEY;
const RAPIDAPI_CARAPI2_HOST =
  process.env.RAPIDAPI_CARAPI2_HOST || 'car-api2.p.rapidapi.com';
const RAPIDAPI_CARAPI2_BASE_URL =
  process.env.RAPIDAPI_CARAPI2_BASE_URL || 'https://car-api2.p.rapidapi.com';

async function searchFromRapidCarApi2({ brand, model, year }) {
  if (!RAPIDAPI_CARAPI2_KEY) {
    console.warn('[RAPIDAPI2] RAPIDAPI_CARAPI2_KEY não configurada. Pulando car-api2.');
    return null;
  }

  try {
    // Ajuste esse path conforme a doc:
    // na doc de VIN é /api/vin/{vin}, pra modelo/ano costuma ser /api/trim
    const url = `${RAPIDAPI_CARAPI2_BASE_URL}/api/trim`;

    const params = {
      year,
      make: brand,
      model,
      verbose: true,
      limit: 1,
    };

    const headers = {
      'x-rapidapi-key': RAPIDAPI_CARAPI2_KEY,
      'x-rapidapi-host': RAPIDAPI_CARAPI2_HOST,
    };

    console.log('[RAPIDAPI2] GET', url, params);

    const { data } = await axios.get(url, {
      params,
      headers,
      timeout: 8000,
    });

    const car = data?.data?.[0] || data[0];
    if (!car) return null;

    return {
      make: car.make || car.make_display || brand,
      model: car.model || car.model_display || model,
      year: car.year || year,
      engine: car.engine || car.engine_information?.engine_type,
      displacement:
        car.engine_displacement ||
        car.engine_information?.engine_displacement ||
        car.engine_cc,
      horsepower:
        car.horsepower || car.engine_information?.engine_power || car.engine_hp,
      torque: car.torque || car.engine_information?.engine_torque,
      fuel_type: car.fuel_type || car.engine_information?.fuel_type,
      transmission: car.transmission || car.transmission_type,
      drive: car.drivetrain || car.drive_type,
      body_style: car.body_style || car.body_type,
      cylinders: car.cylinders || car.engine_information?.cylinders,
      _source: 'car_api2_rapidapi',
    };
  } catch (error) {
    console.error('[RAPIDAPI2] Erro ao buscar especificações:', error.message);
    if (error.response) {
      console.error('[RAPIDAPI2] Status:', error.response.status);
      console.error('[RAPIDAPI2] Data:', error.response.data);
    }
    return null;
  }
}

module.exports = { searchFromRapidCarApi2 };
