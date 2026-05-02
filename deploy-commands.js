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
    console.log(`\n🚀 Registrando ${comandos.length} slash command(s) globalmente...`);

    await rest.put(Routes.applicationCommands(config.clientId), {
      body: comandos,
    });

    console.log('✅ Slash commands registrados globalmente com sucesso!');
    console.log('⏳ Pode levar até 1 hora para aparecer em todos os servidores.');
  } catch (err) {
    console.error('[ERRO] Falha ao registrar comandos:', err.message);
  }
})();
