const path = require('path');

let fileConfig = {};
try {
  fileConfig = require('./config.json');
} catch {
  // Em produção não existe config.json, usa só env vars
}

const config = {
  token: process.env.TOKEN || fileConfig.token,
  clientId: process.env.CLIENT_ID || fileConfig.clientId,
  guildId: process.env.GUILD_ID || fileConfig.guildId,
  canalId: process.env.CANAL_ID || fileConfig.canalId,
};

const faltando = Object.entries(config)
  .filter(([, v]) => !v || v.includes('_AQUI'))
  .map(([k]) => k);

if (faltando.length > 0) {
  console.error('[ERRO] Variáveis não configuradas:', faltando.join(', '));
  console.error('Configure no Railway: Settings → Variables');
  process.exit(1);
}

module.exports = config;
