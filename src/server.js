const dotenv = require('dotenv');
dotenv.config();

console.log('[BOOT] CAR_SPECS_API_KEY está presente?', !!process.env.CAR_SPECS_API_KEY);

const app = require('./app');

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Tudocarro API rodando na Porta http://localhost:${PORT}`);
});
