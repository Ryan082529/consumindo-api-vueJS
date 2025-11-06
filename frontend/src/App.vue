
<template>
  <div class="container">
    <h1 class="titulo">📬 Mensagens da API</h1>

    <!-- Formulário para adicionar nova mensagem -->
    <ResourceForm 
      v-if="!editandoMensagem"
      tipo="mensagem"
      modo="criacao"
      @submit="adicionarMensagem"
    />

    <!-- Formulário para editar mensagem -->
    <div v-if="editandoMensagem" class="formulario-edicao">
      <h3>Editar Mensagem</h3>
      <ResourceForm
        tipo="mensagem"
        modo="edicao"
        :dadosIniciais="editandoMensagem"
        @submit="salvarMensagemEditada"
        @cancelar="cancelarEdicao"
      />
    </div>

    <!-- Filtros -->
    <div class="filtros-container" v-if="!editandoMensagem">
      <div class="filtros-header">
        <h3>🔍 Filtros</h3>
        <button 
          v-if="temFiltrosAtivos" 
          @click="limparFiltros" 
          class="btn-limpar-filtros"
        >
          Limpar filtros
        </button>
      </div>
      
      <div class="filtros-grid">
        <div class="filtro-grupo">
          <label for="pesquisa">Pesquisar:</label>
          <input 
            id="pesquisa"
            v-model="filtros.pesquisa" 
            placeholder="Buscar por título ou conteúdo..."
            class="filtro-input"
          />
        </div>
        
        <div class="filtro-grupo">
          <label for="autor">Autor:</label>
          <select id="autor" v-model="filtros.autor" class="filtro-select">
            <option value="">Todos os autores</option>
            <option v-for="autor in autoresUnicos" :key="autor" :value="autor">
              {{ autor }}
            </option>
          </select>
        </div>
        
        <div class="filtro-grupo">
          <label for="dataInicio">Data inicial:</label>
          <input 
            id="dataInicio"
            type="date" 
            v-model="filtros.dataInicio" 
            class="filtro-input"
          />
        </div>
        
        <div class="filtro-grupo">
          <label for="dataFim">Data final:</label>
          <input 
            id="dataFim"
            type="date" 
            v-model="filtros.dataFim" 
            class="filtro-input"
          />
        </div>
        
        <div class="filtro-grupo">
          <label for="status">Status:</label>
          <select id="status" v-model="filtros.status" class="filtro-select">
            <option value="">Todos</option>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Mensagens de feedback -->
    <div v-if="mensagemFeedback" :class="['mensagem-feedback', mensagemFeedback.tipo]">
      <span>{{ mensagemFeedback.texto }}</span>
      <button @click="mensagemFeedback = null" class="fechar-feedback">×</button>
    </div>

    <div v-if="carregando" class="estado carregando">
      <p>⏳ Carregando mensagens...</p>
    </div>

    <div v-else-if="erro" class="estado erro">
      <p>⚠️ {{ erro }}</p>
      <button @click="carregarMensagens">Tentar novamente</button>
    </div>

    <div v-else-if="mensagensFiltradas.length === 0" class="estado vazio">
      <p>🗒️ Nenhuma mensagem encontrada com os filtros aplicados.</p>
      <small>Dica: tente ajustar os filtros ou adicione uma nova mensagem!</small>
    </div>

    <div v-else class="lista">
      <div class="resultado-info">
        <p>Mostrando {{ mensagensFiltradas.length }} de {{ mensagens.length }} mensagens</p>
      </div>
      
      <ResourceList  v-for="(msg, i) in mensagensFiltradas"
        :key="msg.id"
        @editar="editarMensagem(msg, i)"
        @remover="excluirMensagem(msg, i)"
        :id = "msg.id"
      >
        <template #titulo>{{ msg.titulo }}</template>
        <template #conteudo>{{ msg.conteudo }}</template>
        <template #autor>{{ msg.autor }}</template>
        <template #data>{{ formatarData(msg.data_criacao) }}</template>
      </ResourceList>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { getMensagens, criarMensagem, atualizarMensagem, removerMensagem } from './services/resourceService.js'
import ResourceList from './components/ResourceList.vue'
import ResourceForm from './components/ResourceForm.vue'
import Notification from './components/Notification.vue'

const mensagens = ref([])
const carregando = ref(true)
const erro = ref(null)
const editandoMensagem = ref(null)
const indiceEdicao = ref(null)
const mensagemFeedback = ref(null)

// Estado dos filtros
const filtros = ref({
  pesquisa: '',
  autor: '',
  dataInicio: '',
  dataFim: '',
  status: ''
})

function formatarData(iso) {
  return new Date(iso).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short'
  })
}

// Computed para autores únicos
const autoresUnicos = computed(() => {
  const autores = mensagens.value.map(msg => msg.autor).filter(Boolean)
  return [...new Set(autores)].sort()
})

// Computed para verificar se há filtros ativos
const temFiltrosAtivos = computed(() => {
  return Object.values(filtros.value).some(valor => valor !== '')
})

// Computed para mensagens filtradas
const mensagensFiltradas = computed(() => {
  let resultado = mensagens.value

  // Filtro por pesquisa
  if (filtros.value.pesquisa) {
    const termo = filtros.value.pesquisa.toLowerCase()
    resultado = resultado.filter(msg => 
      msg.titulo?.toLowerCase().includes(termo) ||
      msg.conteudo?.toLowerCase().includes(termo)
    )
  }

  // Filtro por autor
  if (filtros.value.autor) {
    resultado = resultado.filter(msg => msg.autor === filtros.value.autor)
  }

  // Filtro por data inicial
  if (filtros.value.dataInicio) {
    const dataInicio = new Date(filtros.value.dataInicio)
    resultado = resultado.filter(msg => {
      const dataMsg = new Date(msg.data_criacao)
      return dataMsg >= dataInicio
    })
  }

  // Filtro por data final
  if (filtros.value.dataFim) {
    const dataFim = new Date(filtros.value.dataFim)
    dataFim.setHours(23, 59, 59, 999) // Incluir todo o dia
    resultado = resultado.filter(msg => {
      const dataMsg = new Date(msg.data_criacao)
      return dataMsg <= dataFim
    })
  }

  // Filtro por status
  if (filtros.value.status) {
    resultado = resultado.filter(msg => msg.status === filtros.value.status)
  }

  return resultado
})

// Função para mostrar mensagem de feedback
function mostrarFeedback(texto, tipo = 'sucesso', duracao = 3000) {
  mensagemFeedback.value = { texto, tipo }
  setTimeout(() => {
    mensagemFeedback.value = null
  }, duracao)
}

// Função para limpar filtros
function limparFiltros() {
  filtros.value = {
    pesquisa: '',
    autor: '',
    dataInicio: '',
    dataFim: '',
    status: ''
  }
  mostrarFeedback('Filtros limpos com sucesso!', 'info', 2000)
}

async function carregarMensagens() {
  carregando.value = true
  erro.value = null
  try {
    mensagens.value = await getMensagens()
  } catch (e) {
    erro.value = e?.message || 'Erro ao carregar mensagens.'
  } finally {
    carregando.value = false
  }
}

onMounted(carregarMensagens)

async function adicionarMensagem(dados) {
  try {
    // Validação básica
    if (!dados.titulo?.trim() || !dados.conteudo?.trim() || !dados.autor?.trim()) {
      mostrarFeedback('Por favor, preencha todos os campos obrigatórios.', 'erro')
      return
    }

    const novaMensagem = await criarMensagem(dados)
    mensagens.value.push(novaMensagem)
    mostrarFeedback('Mensagem criada com sucesso! ✨', 'sucesso')
  } catch (e) {
    mostrarFeedback(e?.message || 'Falha ao enviar mensagem.', 'erro', 5000)
  }
}

// Inicia edição de mensagem
function editarMensagem(msg, index) {
  editandoMensagem.value = { ...msg }
  indiceEdicao.value = index
}

// Atualiza mensagem via formulário
async function salvarMensagemEditada(dados) {
  if (!editandoMensagem.value || indiceEdicao.value === null) return
  
  // Validação básica
  if (!dados.titulo?.trim() || !dados.conteudo?.trim() || !dados.autor?.trim()) {
    mostrarFeedback('Por favor, preencha todos os campos obrigatórios.', 'erro')
    return
  }
  
  try {
    const dadosAtualizados = await atualizarMensagem(editandoMensagem.value.id, {
      titulo: dados.titulo,
      conteudo: dados.conteudo,
      autor: dados.autor
    })
    mensagens.value[indiceEdicao.value] = dadosAtualizados
    cancelarEdicao()
    mostrarFeedback('Mensagem atualizada com sucesso! ✏️', 'sucesso')
  } catch (e) {
    mostrarFeedback(e?.message || 'Erro ao atualizar mensagem.', 'erro', 5000)
  }
}

// Cancela edição
function cancelarEdicao() {
  editandoMensagem.value = null
  indiceEdicao.value = null
}

// Remove uma mensagem
async function excluirMensagem(msg, index) {
  if (!confirm(`Deseja realmente excluir "${msg.titulo}"?`)) return

  try {
    await removerMensagem(msg.id)
    mensagens.value.splice(index, 1)
    mostrarFeedback('Mensagem removida com sucesso! 🗑️', 'sucesso')
  } catch (e) {
    mostrarFeedback(e?.message || 'Erro ao remover mensagem.', 'erro', 5000)
  }
}
</script>

<style scoped>
.titulo {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 2rem;
}

.formulario-edicao {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.formulario-edicao h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #2c3e50;
}

/* Estilos dos Filtros */
.filtros-container {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.filtros-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.filtros-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.btn-limpar-filtros {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-limpar-filtros:hover {
  background-color: #5a6268;
}

.filtros-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.filtro-grupo {
  display: flex;
  flex-direction: column;
}

.filtro-grupo label {
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #495057;
}

.filtro-input,
.filtro-select {
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.9rem;
}

.filtro-input:focus,
.filtro-select:focus {
  outline: none;
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

/* Mensagens de Feedback */
.mensagem-feedback {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  animation: slideIn 0.3s ease-out;
}

.mensagem-feedback.sucesso {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.mensagem-feedback.erro {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.mensagem-feedback.info {
  background-color: #d1ecf1;
  color: #0c5460;
  border: 1px solid #bee5eb;
}

.fechar-feedback {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: inherit;
  padding: 0;
  margin-left: 1rem;
}

.fechar-feedback:hover {
  opacity: 0.7;
}

@keyframes slideIn {
  from {
    transform: translateY(-10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Informação de resultados */
.resultado-info {
  text-align: center;
  color: #6c757d;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.estado {
  text-align: center;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
}

.carregando {
  background-color: #e3f2fd;
  color: #1976d2;
}

.erro {
  background-color: #ffebee;
  color: #c62828;
}

.erro button {
  background-color: #c62828;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 0.5rem;
}

.erro button:hover {
  background-color: #b71c1c;
}

.vazio {
  text-align: center;
  color: #666;
  padding: 2rem;
}

.lista {
  display: grid;
  gap: 1.5rem;
  margin-top: 2rem;
}
</style>