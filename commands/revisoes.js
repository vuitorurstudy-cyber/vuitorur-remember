const { SlashCommandBuilder } = require('discord.js');
const { obterRevisoesHoje } = require('../utils/database');
const { embedRevisoesHoje } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('revisoes')
    .setDescription('Mostra os tópicos que você precisa revisar hoje'),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const usuarioId = interaction.user.id;
    const nomeUsuario = interaction.user.displayName || interaction.user.username;

    const revisoesPendentes = obterRevisoesHoje(usuarioId);

    return interaction.editReply({
      embeds: [embedRevisoesHoje(revisoesPendentes, nomeUsuario)],
    });
  },
};
