const { marcarEstudado } = require('../utils/database');
const { embedEstudoConcluido, embedErro } = require('../utils/embeds');

module.exports = {
  name: 'interactionCreate',
  once: false,
  async execute(interaction, client) {
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);

      if (!command) {
        console.error(`[ERRO] Comando /${interaction.commandName} não encontrado.`);
        return;
      }

      try {
        await command.execute(interaction);
      } catch (err) {
        console.error(`[ERRO] Falha ao executar /${interaction.commandName}:`, err);

        const payload = {
          embeds: [embedErro('Ocorreu um erro ao executar este comando.')],
          ephemeral: true,
        };

        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(payload).catch(() => {});
        } else {
          await interaction.reply(payload).catch(() => {});
        }
      }

      return;
    }

    if (interaction.isButton()) {
      const customId = interaction.customId;

      if (customId.startsWith('marcar_estudado_')) {
        const partes = customId.split('_');
        const topicoId = partes[2];
        const donoId = partes[3];

        if (interaction.user.id !== donoId) {
          return interaction.reply({
            embeds: [embedErro('Apenas o dono deste tópico pode marcá-lo como estudado.')],
            ephemeral: true,
          });
        }

        await interaction.deferReply({ ephemeral: true });

        const topicoAtualizado = marcarEstudado(donoId, topicoId);

        if (!topicoAtualizado) {
          return interaction.editReply({
            embeds: [embedErro('Tópico não encontrado. Pode ter sido removido.')],
          });
        }

        await interaction.editReply({
          embeds: [embedEstudoConcluido(topicoAtualizado)],
        });

        await interaction.message
          .edit({ components: [] })
          .catch(() => {});

        return;
      }
    }
  },
};
