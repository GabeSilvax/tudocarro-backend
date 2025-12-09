// src/services/specProviders/apiNinjasProvider.js
const axios = require('axios');

const CAR_SPECS_API_KEY = process.env.CAR_SPECS_API_KEY;
const CAR_SPECS_API_URL =
  process.env.CAR_SPECS_API_URL || 'https://api.api-ninjas.com/v1/cars';

async function searchFromApiNinjas({ brand, model, year }) {
  if (!CAR_SPECS_API_KEY) {
    console.warn('[NINJAS] CAR_SPECS_API_KEY não configurada. Pulando API Ninjas.');
    return null;
  }

  const baseConfig = {
    headers: {
      'X-Api-Key': CAR_SPECS_API_KEY,
    },
    timeout: 8000,
  };

  try {
    // 1ª tentativa: com ano
    let params = { make: brand, model, year };
    console.log('[NINJAS] Tentando com ano:', params);

    let res = await axios.get(CAR_SPECS_API_URL, { ...baseConfig, params });
    let data = res.data;

    if (!data || data.length === 0) {
      // 2ª tentativa: sem ano
      params = { make: brand, model };
      console.log('[NINJAS] Nada com ano, tentando sem ano:', params);

      res = await axios.get(CAR_SPECS_API_URL, { ...baseConfig, params });
      data = res.data;

      if (!data || data.length === 0) return null;

      if (year) {
        const match = data.find((c) => Number(c.year) === Number(year));
        if (match) data = [match];
      }
    }

    const car = data[0];
    if (!car) return null;

    return {
      make: car.make,
      model: car.model,
      year: car.year,
      fuel_type: car.fuel_type,
      transmission: car.transmission,
      engine: car.engine,
      displacement: car.displacement,
      cylinders: car.cylinders,
      drive: car.drive,
      body_style: car.class,
      city_mpg: car.city_mpg,
      highway_mpg: car.highway_mpg,
      _source: 'api_ninjas',
    };
  } catch (error) {
    console.error('[NINJAS] Erro ao buscar especificações:', error.message);
    if (error.response) {
      console.error('[NINJAS] Status:', error.response.status);
      console.error('[NINJAS] Data:', error.response.data);
    }
    return null;
  }
}

module.exports = { searchFromApiNinjas };
