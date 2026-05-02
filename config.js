let fileConfig = {};
try {
  fileConfig = require('./config.json');
} catch {
  // Em produção não existe config.json, usa só env vars
}

const config = {
  token: process.env.TOKEN || fileConfig.token,
  clientId: process.env.CLIENT_ID || fileConfig.clientId,
  guildId: process.env.GUILD_ID || fileConfig.guildId || null,
  canalId: process.env.CANAL_ID || fileConfig.canalId,
};

const obrigatorias = ['token', 'clientId', 'canalId'];
const faltando = obrigatorias.filter((k) => !config[k] || config[k].includes('_AQUI'));

if (faltando.length > 0) {
  console.error('[ERRO] Variáveis não configuradas:', faltando.join(', '));
  console.error('Configure no Railway: Settings → Variables');
  process.exit(1);
}

module.exports = config;
