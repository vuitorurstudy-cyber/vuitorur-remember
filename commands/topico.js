const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
} = require('discord.js');
const { adicionarTopico } = require('../utils/database');
const { embedTopicoThread, embedTopicoConfirmacao, embedErro } = require('../utils/embeds');
const config = require('../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('topico')
    .setDescription('Cria um novo tópico de estudo para o ENEM')
    .addStringOption((option) =>
      option
        .setName('nome')
        .setDescription('Nome do tópico de estudo (ex: Funções do 1º Grau)')
        .setRequired(true)
        .setMaxLength(80)
    ),

  async execute(interaction) {
    const nomeTopico = interaction.options.getString('nome').trim();
    const usuarioId = interaction.user.id;

    await interaction.deferReply({ ephemeral: true });

    const topico = adicionarTopico(usuarioId, nomeTopico);
    if (!topico) {
      return interaction.editReply({
        embeds: [embedErro(`Você já tem um tópico chamado **${nomeTopico}**.`)],
      });
    }

    const canal = interaction.guild.channels.cache.get(config.canalId);
    if (!canal) {
      return interaction.editReply({
        embeds: [
          embedErro(
            'Canal configurado não encontrado. Verifique a variável `CANAL_ID`.'
          ),
        ],
      });
    }

    const tiposValidos = [ChannelType.GuildText, ChannelType.GuildForum];
    if (!tiposValidos.includes(canal.type)) {
      return interaction.editReply({
        embeds: [embedErro('O canal configurado não suporta threads.')],
      });
    }

    const botaoEstudado = new ButtonBuilder()
      .setCustomId(`marcar_estudado_${topico.id}_${usuarioId}`)
      .setLabel('✅ Marcar como estudado')
      .setStyle(ButtonStyle.Success);

    const row = new ActionRowBuilder().addComponents(botaoEstudado);

    const thread = await canal.threads.create({
      name: `📚 ${nomeTopico}`,
      autoArchiveDuration: 10080,
      reason: `Tópico de estudo criado por ${interaction.user.tag}`,
    });

    await thread.send({
      embeds: [embedTopicoThread(nomeTopico)],
      components: [row],
    });

    return interaction.editReply({
      embeds: [embedTopicoConfirmacao(nomeTopico)],
    });
  },
};
