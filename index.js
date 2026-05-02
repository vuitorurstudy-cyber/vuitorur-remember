const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./config');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();

function carregarComandos() {
  const pastaComandos = path.join(__dirname, 'commands');
  const arquivos = fs.readdirSync(pastaComandos).filter((f) => f.endsWith('.js'));

  for (const arquivo of arquivos) {
    const comando = require(path.join(pastaComandos, arquivo));
    if (comando.data && comando.execute) {
      client.commands.set(comando.data.name, comando);
      console.log(`📂 Comando carregado: /${comando.data.name}`);
    } else {
      console.warn(`[AVISO] Arquivo ${arquivo} está incompleto (falta data ou execute).`);
    }
  }
}

function carregarEventos() {
  const pastaEventos = path.join(__dirname, 'events');
  const arquivos = fs.readdirSync(pastaEventos).filter((f) => f.endsWith('.js'));

  for (const arquivo of arquivos) {
    const evento = require(path.join(pastaEventos, arquivo));
    if (evento.once) {
      client.once(evento.name, (...args) => evento.execute(...args, client));
    } else {
      client.on(evento.name, (...args) => evento.execute(...args, client));
    }
    console.log(`⚡ Evento registrado: ${evento.name}`);
  }
}

carregarComandos();
carregarEventos();

client.login(config.token).catch((err) => {
  console.error('[ERRO FATAL] Falha ao fazer login. Verifique as variáveis de ambiente.');
  console.error(err.message);
  process.exit(1);
});
