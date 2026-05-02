const { EmbedBuilder } = require('discord.js');

const CORES = {
  verde: 0x2ecc71,
  azul: 0x3498db,
  azulEscuro: 0x1a5276,
  amarelo: 0xf1c40f,
  vermelho: 0xe74c3c,
  cinza: 0x95a5a6,
  roxo: 0x8e44ad,
};

function embedTopicoThread(nomeTopico) {
  return new EmbedBuilder()
    .setColor(CORES.azul)
    .setTitle(`📚 ${nomeTopico}`)
    .setDescription(
      '> Envie **PDFs**, **anotações** e **erros** aqui para organizar seus estudos.'
    )
    .addFields(
      {
        name: '📌 Como usar esta thread',
        value:
          '• Cole links de materiais\n• Registre suas dúvidas\n• Anote erros de questões',
        inline: false,
      },
      {
        name: '✅ Concluiu o estudo?',
        value: 'Clique no botão abaixo para registrar e agendar revisões.',
        inline: false,
      }
    )
    .setFooter({ text: 'Sistema de Estudos ENEM • Revisão Espaçada' })
    .setTimestamp();
}

function embedTopicoConfirmacao(nomeTopico) {
  return new EmbedBuilder()
    .setColor(CORES.verde)
    .setTitle('✅ Tópico criado com sucesso!')
    .setDescription(`A thread **📚 ${nomeTopico}** foi criada para você.`)
    .addFields({
      name: '📖 Próximos passos',
      value:
        '1. Acesse a thread criada\n2. Adicione seus materiais\n3. Clique em "Marcar como estudado" quando terminar',
    })
    .setColor(CORES.verde)
    .setTimestamp();
}

function embedEstudoConcluido(topico) {
  const revisoes = topico.revisoes
    .map((r) => {
      const data = new Date(r.data);
      const formatada = data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      return `• **+${r.dias} dia${r.dias > 1 ? 's' : ''}** → ${formatada}`;
    })
    .join('\n');

  return new EmbedBuilder()
    .setColor(CORES.verde)
    .setTitle('🎉 Estudo registrado!')
    .setDescription(`Parabéns! O tópico **${topico.nome}** foi marcado como estudado.`)
    .addFields({
      name: '🗓️ Revisões agendadas',
      value: revisoes,
      inline: false,
    })
    .setFooter({ text: 'Use /revisoes para ver o que revisar hoje' })
    .setTimestamp();
}

function embedRevisoesHoje(revisoes, nomeUsuario) {
  if (revisoes.length === 0) {
    return new EmbedBuilder()
      .setColor(CORES.verde)
      .setTitle('✅ Nenhuma revisão pendente!')
      .setDescription(
        `Ótimo trabalho, **${nomeUsuario}**! Você está em dia com suas revisões.`
      )
      .setFooter({ text: 'Continue estudando com /topico' })
      .setTimestamp();
  }

  const atrasadas = revisoes.filter((r) => r.atrasada);
  const hoje = revisoes.filter((r) => !r.atrasada);

  let descricao = '';

  if (atrasadas.length > 0) {
    descricao += `⚠️ **${atrasadas.length} revisão(ões) atrasada(s)**\n\n`;
  }

  descricao += `Olá, **${nomeUsuario}**! Você tem **${revisoes.length}** revisão(ões) para fazer hoje.`;

  const camposAtrasadas = atrasadas.map((r) => {
    const dataOriginal = new Date(r.data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    });
    return {
      name: `⚠️ ${r.topico}`,
      value: `Revisão de **+${r.dias} dia(s)** — deveria ter sido em **${dataOriginal}**`,
      inline: false,
    };
  });

  const camposHoje = hoje.map((r) => ({
    name: `📖 ${r.topico}`,
    value: `Revisão de **+${r.dias} dia(s)**`,
    inline: false,
  }));

  const embed = new EmbedBuilder()
    .setColor(atrasadas.length > 0 ? CORES.amarelo : CORES.azul)
    .setTitle('📋 Revisões de Hoje')
    .setDescription(descricao)
    .setFooter({ text: `Total: ${revisoes.length} revisão(ões) pendente(s)` })
    .setTimestamp();

  if (camposAtrasadas.length > 0) embed.addFields(...camposAtrasadas);
  if (camposHoje.length > 0) embed.addFields(...camposHoje);

  return embed;
}

function embedErro(mensagem) {
  return new EmbedBuilder()
    .setColor(CORES.vermelho)
    .setTitle('❌ Erro')
    .setDescription(mensagem)
    .setTimestamp();
}

module.exports = {
  embedTopicoThread,
  embedTopicoConfirmacao,
  embedEstudoConcluido,
  embedRevisoesHoje,
  embedErro,
};
