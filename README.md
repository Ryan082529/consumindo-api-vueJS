# Consumindo API - Vue.js com JSON Server

Projeto de exemplo para consumir APIs RESTful com Vue.js 3 e JSON Server.

## 🚀 Instalação e Execução

### Pré-requisitos
- Node.js (versão 14 ou superior)

### 1. Frontend

```bash
cd frontend
npm install
npm run dev
```

Disponível em: `http://localhost:5176`

### 2. Backend (JSON Server)

```bash
npm install -g json-server
cd backend
npx json-server --watch db.json --port 3000
```

Disponível em: `http://localhost:3000`

### 3. Configuração

A URL da API está em `frontend/.env`:

```
VITE_API_URL=http://localhost:3000
```

## 📝 Endpoints

- `GET /mensagens` - Listar mensagens
- `POST /mensagens` - Criar mensagem
- `PUT /mensagens/:id` - Atualizar mensagem
- `DELETE /mensagens/:id` - Excluir mensagem
- `GET /mensagens/:id/comentarios` - Listar comentários
- `POST /comentarios` - Criar comentário
- `PUT /comentarios/:id` - Atualizar comentário
- `DELETE /comentarios/:id` - Excluir comentário