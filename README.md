# 🎓 Bot de Estudos ENEM

Bot de Discord com sistema de revisão espaçada para organizar seus estudos do ENEM.

---

## 📁 Estrutura de Pastas

```
discord-bot/
├── commands/
│   ├── topico.js        # Comando /topico
│   └── revisoes.js      # Comando /revisoes
├── events/
│   ├── ready.js         # Evento de inicialização
│   └── interactionCreate.js  # Slash commands + botões
├── utils/
│   ├── database.js      # Leitura/escrita do JSON
│   └── embeds.js        # Builders de embeds
├── config.json          # Token, IDs de canal e servidor
├── database.json        # Banco de dados local (auto-gerado)
├── deploy-commands.js   # Registrar slash commands
├── index.js             # Entrada principal do bot
└── package.json
```

---

## ⚙️ Configuração

### 1. Criar o bot no Discord Developer Portal

1. Acesse https://discord.com/developers/applications
2. Clique em **New Application** e dê um nome
3. Vá em **Bot** → clique em **Reset Token** → copie o token
4. Em **Privileged Gateway Intents**, ative:
   - `MESSAGE CONTENT INTENT`
5. Vá em **OAuth2 → URL Generator**:
   - Scopes: `bot` + `applications.commands`
   - Bot Permissions: `Send Messages`, `Create Public Threads`, `Send Messages in Threads`, `Manage Threads`
6. Copie a URL gerada e adicione o bot ao seu servidor

### 2. Preencher o config.json

Edite o arquivo `config.json` com seus dados:

```json
{
  "token": "SEU_TOKEN_AQUI",
  "clientId": "ID_DA_APLICAÇÃO",
  "guildId": "ID_DO_SEU_SERVIDOR",
  "canalId": "ID_DO_CANAL_ONDE_AS_THREADS_SERÃO_CRIADAS"
}
```

**Onde encontrar os IDs:**
- **clientId**: Developer Portal → Sua aplicação → *Application ID*
- **guildId**: Clique com botão direito no servidor → *Copiar ID do Servidor* (precisa ativar Modo Desenvolvedor em Configurações → Avançado)
- **canalId**: Clique com botão direito no canal → *Copiar ID do Canal*

---

## 🚀 Instalação e Execução

```bash
# Entrar na pasta
cd discord-bot

# Instalar dependências
npm install

# Registrar os slash commands no servidor
node deploy-commands.js

# Iniciar o bot
node index.js
```

> ⚠️ Execute `node deploy-commands.js` **apenas uma vez** (ou quando adicionar novos comandos). Depois, use apenas `node index.js`.

---

## 🤖 Comandos disponíveis

| Comando | Descrição |
|---|---|
| `/topico nome: "Funções"` | Cria uma thread de estudo com botão de conclusão |
| `/revisoes` | Lista os tópicos a revisar hoje |

---

## 📋 Fluxo de uso

1. **Criar tópico**: `/topico nome: "Funções do 1º Grau"`
   - O bot cria uma thread `📚 Funções do 1º Grau` no canal configurado
   - Dentro da thread aparece um embed com instruções + botão **✅ Marcar como estudado**

2. **Estudar**: O usuário posta seus materiais, PDFs e dúvidas na thread

3. **Concluir**: Clicar em **✅ Marcar como estudado**
   - O bot registra a data e agenda revisões: +1, +3, +7 e +15 dias

4. **Revisar**: Usar `/revisoes` para ver o que precisa revisar hoje

---

## 💾 Banco de dados (database.json)

```json
{
  "123456789": {
    "topicos": [
      {
        "id": "1718000000000",
        "nome": "Funções do 1º Grau",
        "data_estudo": "2024-06-10T14:00:00.000Z",
        "estudado": true,
        "revisoes": [
          { "data": "2024-06-11T14:00:00.000Z", "dias": 1, "concluida": false },
          { "data": "2024-06-13T14:00:00.000Z", "dias": 3, "concluida": false },
          { "data": "2024-06-17T14:00:00.000Z", "dias": 7, "concluida": false },
          { "data": "2024-06-25T14:00:00.000Z", "dias": 15, "concluida": false }
        ]
      }
    ]
  }
}
```
