// src/controllers/carController.js
const fipeService = require('../services/fipeService');
const carAggregatorService = require('../services/carAggregatorService');

exports.getBrands = async (req, res) => {
  try {
    const brands = await fipeService.getBrands();
    res.json(brands);
  } catch (error) {
    console.error('Erro getBrands:', error.message);

    if (error.response) {
      console.error('Status FIPE:', error.response.status);
      console.error('Dados FIPE:', error.response.data);
    }

    res.status(500).json({ error: 'Erro ao buscar marcas' });
  }
};

exports.getModels = async (req, res) => {
  const { brandCode } = req.params;

  try {
    const models = await fipeService.getModels(brandCode);
    res.json(models);
  } catch (error) {
    console.error('Erro getModels:', error.message);

    if (error.response) {
      console.error('Status FIPE:', error.response.status);
      console.error('Dados FIPE:', error.response.data);
    }

    res.status(500).json({ error: 'Erro ao buscar modelos' });
  }
};

exports.getYears = async (req, res) => {
  const { brandCode, modelCode } = req.params;

  try {
    const years = await fipeService.getYears(brandCode, modelCode);
    res.json(years);
  } catch (error) {
    console.error('Erro getYears:', error.message);

    if (error.response) {
      console.error('Status FIPE:', error.response.status);
      console.error('Dados FIPE:', error.response.data);
    }

    res.status(500).json({ error: 'Erro ao buscar anos' });
  }
};

exports.getCarDetails = async (req, res) => {
  const { brandCode, modelCode, yearCode } = req.params;

  try {
    const data = await carAggregatorService.getCarDetails({
      brandCode,
      modelCode,
      yearCode,
    });

    res.json(data);
  } catch (error) {
    console.error('Erro getCarDetails:', error.message);

    if (error.response) {
      console.error('Status FIPE:', error.response.status);
      console.error('Dados FIPE:', error.response.data);
    }

    res.status(500).json({ error: 'Erro ao buscar detalhes do veículo' });
  }
};
