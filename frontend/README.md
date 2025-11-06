# Frontend - Consumindo API

Frontend desenvolvido com Vue.js 3 e Vite para consumir uma API RESTful.

## 🚀 Tecnologias

- Vue.js 3 com Composition API
- Vite (build tool)
- Axios (HTTP client)
- CSS puro com estilos modernos

## 📁 Estrutura

```
src/
├── App.vue                 # Componente principal
├── main.js                 # Entry point
├── components/
│   ├── ResourceList.vue    # Lista de recursos (mensagens)
│   ├── ResourceForm.vue    # Formulário de recursos
│   ├── SubResourceList.vue # Lista de sub-recursos (comentários)
│   ├── SubResourceForm.vue # Formulário de sub-recursos
│   └── Notification.vue   # Componente de notificação
├── services/
│   ├── api.js             # Configuração do Axios
│   ├── resourceService.js # Serviço para mensagens
│   └── subresourceService.js # Serviço para comentários
└── assets/                # Arquivos estáticos
```

## 🚀 Comandos

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```
VITE_API_URL=http://localhost:3001
```

### Porta do Servidor

Por padrão, o servidor de desenvolvimento roda na porta 5176. Para mudar:

```bash
npm run dev -- --port 3000
```

## 📝 Funcionalidades

- **Gerenciamento de Mensagens**: CRUD completo
- **Sistema de Comentários**: Múltiplos comentários por mensagem
- **Filtros Avançados**: Busca por texto, autor, data e status
- **Validação**: Validação em tempo real
- **Notificações**: Feedback visual para ações do usuário
- **UX Aprimorada**: Animações e estados de carregamento
