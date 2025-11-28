const axios = require('axios');

const FIPE_BASE_URL =
  process.env.FIPE_BASE_URL || 'https://parallelum.com.br/fipe/api/v1';

// Lista de marcas
async function getBrands() {
  const url = `${FIPE_BASE_URL}/carros/marcas`;
  console.log('[FIPE] GET', url);
  const { data } = await axios.get(url);
  return data;
}

// Modelos de uma marca
async function getModels(brandCode) {
  const url = `${FIPE_BASE_URL}/carros/marcas/${brandCode}/modelos`;
  console.log('[FIPE] GET', url);
  const { data } = await axios.get(url);
  return data;
}

// Anos de um modelo
async function getYears(brandCode, modelCode) {
  const url = `${FIPE_BASE_URL}/carros/marcas/${brandCode}/modelos/${modelCode}/anos`;
  console.log('[FIPE] GET', url);
  const { data } = await axios.get(url);
  return data;
}

// 🔹 Detalhes de um veículo específico (é ESSA que o carAggregator chama)
async function getCarDetails(brandCode, modelCode, yearCode) {
  const url = `${FIPE_BASE_URL}/carros/marcas/${brandCode}/modelos/${modelCode}/anos/${yearCode}`;
  console.log('[FIPE] GET', url);
  const { data } = await axios.get(url);
  return data;
}

module.exports = {
  getBrands,
  getModels,
  getYears,
  getCarDetails, 
};
