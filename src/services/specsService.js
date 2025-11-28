// specsService.js
const axios = require('axios');

const CAR_SPECS_API_KEY = process.env.CAR_SPECS_API_KEY;
console.log('[SPECS] API KEY carregada?', !!CAR_SPECS_API_KEY);

async function searchCarSpecs({ brand, model, year }) {
  if (!CAR_SPECS_API_KEY) {
    console.warn('CAR_SPECS_API_KEY não configurada. Specs desativado.');
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
    const paramsWithYear = {
      make: brand,
      model: model,
      year: year,
    };

    console.log('[SPECS] Tentando com ano:', paramsWithYear);

    let response = await axios.get('https://api.api-ninjas.com/v1/cars', {
      ...baseConfig,
      params: paramsWithYear,
    });

    let data = response.data;
    console.log('[SPECS] Resultado com ano, itens:', data?.length || 0);

    // Se não achou nada, tenta sem ano
    if (!data || data.length === 0) {
      const paramsWithoutYear = {
        make: brand,
        model: model,
      };

      console.log('[SPECS] Nada com ano, tentando sem ano:', paramsWithoutYear);

      response = await axios.get('https://api.api-ninjas.com/v1/cars', {
        ...baseConfig,
        params: paramsWithoutYear,
      });

      data = response.data;
      console.log('[SPECS] Resultado sem ano, itens:', data?.length || 0);

      if (!data || data.length === 0) {
        return null;
      }

      // Se mandou ano, tenta achar um objeto com o mesmo ano
      if (year) {
        const match = data.find(
          (c) => Number(c.year) === Number(year)
        );
        if (match) {
          data = [match];
        }
      }
    }

    // Nesse ponto, data[0] é o carro escolhido
    const car = data[0];

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
    };
  } catch (error) {
    console.error('Erro ao buscar especificações na API externa:', error.message);

    if (error.response) {
      console.error('Status API Ninjas:', error.response.status);
      console.error('Body API Ninjas:', error.response.data);
    }

    return null;
  }
}

module.exports = {
  searchCarSpecs,
};
