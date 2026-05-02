const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./config');

const comandos = [];
const pastaComandos = path.join(__dirname, 'commands');
const arquivos = fs.readdirSync(pastaComandos).filter((f) => f.endsWith('.js'));

for (const arquivo of arquivos) {
  const comando = require(path.join(pastaComandos, arquivo));
  if (comando.data) {
    comandos.push(comando.data.toJSON());
    console.log(`📋 Preparando: /${comando.data.name}`);
  }
}

const rest = new REST({ version: '10' }).setToken(config.token);

(async () => {
  try {
    console.log(`\n🚀 Registrando ${comandos.length} slash command(s)...`);

    await rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId), {
      body: comandos,
    });

    console.log('✅ Slash commands registrados com sucesso!');
    console.log('   Agora execute: node index.js');
  } catch (err) {
    console.error('[ERRO] Falha ao registrar comandos:', err.message);
  }
})();
