const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'database.json');

function lerDB() {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

function salvarDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

function obterUsuario(usuarioId) {
  const db = lerDB();
  if (!db[usuarioId]) {
    db[usuarioId] = { topicos: [] };
    salvarDB(db);
  }
  return db[usuarioId];
}

function adicionarTopico(usuarioId, nomeTopico) {
  const db = lerDB();
  if (!db[usuarioId]) db[usuarioId] = { topicos: [] };

  const jaExiste = db[usuarioId].topicos.find(
    (t) => t.nome.toLowerCase() === nomeTopico.toLowerCase()
  );
  if (jaExiste) return null;

  const novoTopico = {
    id: Date.now().toString(),
    nome: nomeTopico,
    data_estudo: null,
    revisoes: [],
    estudado: false,
  };

  db[usuarioId].topicos.push(novoTopico);
  salvarDB(db);
  return novoTopico;
}

function marcarEstudado(usuarioId, topicoId) {
  const db = lerDB();
  if (!db[usuarioId]) return null;

  const topico = db[usuarioId].topicos.find((t) => t.id === topicoId);
  if (!topico) return null;

  const agora = new Date();
  topico.data_estudo = agora.toISOString();
  topico.estudado = true;

  const revisoes = [1, 3, 7, 15].map((dias) => {
    const data = new Date(agora);
    data.setDate(data.getDate() + dias);
    return {
      data: data.toISOString(),
      dias,
      concluida: false,
    };
  });

  topico.revisoes = revisoes;
  salvarDB(db);
  return topico;
}

function obterRevisoesHoje(usuarioId) {
  const db = lerDB();
  if (!db[usuarioId]) return [];

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const amanha = new Date(hoje);
  amanha.setDate(amanha.getDate() + 1);

  const pendentes = [];

  for (const topico of db[usuarioId].topicos) {
    for (const revisao of topico.revisoes) {
      if (revisao.concluida) continue;
      const dataRevisao = new Date(revisao.data);
      dataRevisao.setHours(0, 0, 0, 0);
      if (dataRevisao <= hoje) {
        pendentes.push({
          topico: topico.nome,
          topicoId: topico.id,
          dias: revisao.dias,
          data: revisao.data,
          atrasada: dataRevisao < hoje,
        });
      }
    }
  }

  return pendentes;
}

function obterTopicoPorId(usuarioId, topicoId) {
  const db = lerDB();
  if (!db[usuarioId]) return null;
  return db[usuarioId].topicos.find((t) => t.id === topicoId) || null;
}

module.exports = {
  lerDB,
  salvarDB,
  obterUsuario,
  adicionarTopico,
  marcarEstudado,
  obterRevisoesHoje,
  obterTopicoPorId,
};
