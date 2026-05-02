const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const { obterUsuario, obterRevisoesHoje } = require('../utils/database');

function calcularStreak(topicos) {
  const datasEstudo = topicos
    .filter((t) => t.data_estudo)
    .map((t) => {
      const d = new Date(t.data_estudo);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    });

  if (datasEstudo.length === 0) return 0;

  const unicas = [...new Set(datasEstudo)].sort((a, b) => b - a);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  let streak = 0;
  let diaAtual = hoje.getTime();

  for (const data of unicas) {
    if (data === diaAtual) {
      streak++;
      diaAtual -= 86400000;
    } else if (data === diaAtual + 86400000) {
      diaAtual -= 86400000;
    } else {
      break;
    }
  }

  return streak;
}

function calcularPorcentagemRevisoes(topicos) {
  const todasRevisoes = topicos.flatMap((t) => t.revisoes);
  if (todasRevisoes.length === 0) return null;
  const concluidas = todasRevisoes.filter((r) => r.concluida).length;
  return Math.round((concluidas / todasRevisoes.length) * 100);
}

function barraProgresso(porcentagem, tamanho = 10) {
  const preenchido = Math.round((porcentagem / 100) * tamanho);
  const vazio = tamanho - preenchido;
  return '█'.repeat(preenchido) + '░'.repeat(vazio);
}

function medalhaStreak(streak) {
  if (streak >= 30) return '🏆';
  if (streak >= 14) return '🥇';
  if (streak >= 7) return '🥈';
  if (streak >= 3) return '🥉';
  return '📅';
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('estatisticas')
    .setDescription('Veja um resumo do seu progresso nos estudos para o ENEM'),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const usuarioId = interaction.user.id;
    const nomeUsuario = interaction.user.displayName || interaction.user.username;
    const avatarUrl = interaction.user.displayAvatarURL({ dynamic: true });

    const usuario = obterUsuario(usuarioId);
    const topicos = usuario.topicos || [];
    const revisoesHoje = obterRevisoesHoje(usuarioId);

    const totalTopicos = topicos.length;
    const topicosEstudados = topicos.filter((t) => t.estudado).length;
    const topicosPendentes = totalTopicos - topicosEstudados;

    const todasRevisoes = topicos.flatMap((t) => t.revisoes);
    const totalRevisoes = todasRevisoes.length;
    const revisoesConcluidas = todasRevisoes.filter((r) => r.concluida).length;
    const porcentagem = calcularPorcentagemRevisoes(topicos);

    const streak = calcularStreak(topicos);
    const medalha = medalhaStreak(streak);

    if (totalTopicos === 0) {
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x3498db)
            .setTitle('📊 Suas Estatísticas')
            .setThumbnail(avatarUrl)
            .setDescription(
              `Olá, **${nomeUsuario}**! Você ainda não tem nenhum tópico de estudo.\n\nComece agora com o comando **/topico**!`
            )
            .setTimestamp(),
        ],
      });
    }

    const linhasTopicos = topicos
      .slice(-5)
      .reverse()
      .map((t) => {
        const icone = t.estudado ? '✅' : '📖';
        const dataStr = t.data_estudo
          ? new Date(t.data_estudo).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
            })
          : 'Não estudado';
        return `${icone} **${t.nome}** — ${dataStr}`;
      })
      .join('\n');

    const embed = new EmbedBuilder()
      .setColor(0x2ecc71)
      .setTitle('📊 Suas Estatísticas de Estudo')
      .setThumbnail(avatarUrl)
      .setDescription(`Resumo do progresso de **${nomeUsuario}** para o ENEM`)
      .addFields(
        {
          name: '📚 Tópicos',
          value: [
            `**Total:** ${totalTopicos}`,
            `**Estudados:** ${topicosEstudados}`,
            `**Pendentes:** ${topicosPendentes}`,
          ].join('\n'),
          inline: true,
        },
        {
          name: `${medalha} Sequência (Streak)`,
          value: [
            `**${streak} dia${streak !== 1 ? 's' : ''}** consecutivo${streak !== 1 ? 's' : ''}`,
            streak >= 7
              ? '🔥 Incrível! Continue assim!'
              : streak >= 3
              ? '💪 Boa sequência!'
              : streak === 0
              ? '😴 Estude hoje para começar!'
              : '🌱 Bom começo!',
          ].join('\n'),
          inline: true,
        },
        {
          name: '🗓️ Revisões pendentes hoje',
          value:
            revisoesHoje.length > 0
              ? `**${revisoesHoje.length}** revisão(ões) para fazer hoje`
              : '✅ Nenhuma revisão pendente',
          inline: true,
        }
      );

    if (porcentagem !== null) {
      const barra = barraProgresso(porcentagem);
      embed.addFields({
        name: '📈 Progresso das Revisões',
        value: [
          `\`${barra}\` **${porcentagem}%**`,
          `${revisoesConcluidas} de ${totalRevisoes} revisões concluídas`,
        ].join('\n'),
        inline: false,
      });
    }

    if (linhasTopicos) {
      embed.addFields({
        name: '🕘 Últimos tópicos',
        value: linhasTopicos,
        inline: false,
      });
    }

    embed
      .setFooter({ text: 'Use /revisoes para ver o que revisar hoje • /topico para adicionar mais' })
      .setTimestamp();

    return interaction.editReply({ embeds: [embed] });
  },
};
