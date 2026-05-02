module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(`✅ Bot online como ${client.user.tag}`);
    console.log(`📡 Conectado a ${client.guilds.cache.size} servidor(es)`);
    client.user.setActivity('ENEM 📚 | /topico', { type: 3 });
  },
};
