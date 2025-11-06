<!-- src/components/MensagemCard.vue -->
<template>
  <div class="card">
    <h3 class="titulo">
      <slot name="titulo"></slot>
    </h3>

    <p class="conteudo">
      <slot name="conteudo"></slot>
    </p>

    <div class="info">
      <small>👤 <slot name="autor"></slot></small>
      <small>🕒 <slot name="data"></slot></small>
    </div>

    <h3 class="titulo">
      Comentários ({{ comentarios.length }})
    </h3>

    <!-- Filtros de Comentários -->
    <div class="filtros-comentarios" v-if="comentarios.length > 0">
      <div class="filtro-item">
        <input 
          v-model="filtrosComentarios.texto" 
          placeholder="Pesquisar comentários..."
          class="input-filtro"
        />
      </div>
      <div class="filtro-item">
        <select v-model="filtrosComentarios.autor" class="select-filtro">
          <option value="">Todos os autores</option>
          <option v-for="autor in autoresComentariosUnicos" :key="autor" :value="autor">
            {{ autor }}
          </option>
        </select>
      </div>
      <div class="filtro-item">
        <button @click="limparFiltrosComentarios" class="btn-limpar-filtros">
          Limpar Filtros
        </button>
      </div>
      <div class="resultados-info">
        Mostrando {{ comentariosFiltrados.length }} de {{ comentarios.length }} comentários
      </div>
    </div>

     <div v-if="carregando" class="estado carregando">
      <p>⏳ Carregando comentários...</p>
    </div>

    <div v-else-if="erro" class="estado erro">
      <p>⚠️ {{ erro }}</p>
      <button @click="carregarComentarios">Tentar novamente</button>
    </div>

    <!-- Formulário para adicionar novo comentário -->
    <div v-if="mostrarFormularioComentario" class="formulario-comentario">
      <h4>Adicionar Novo Comentário</h4>
      <SubResourceForm
        tipo="comentario"
        modo="criacao"
        :mostrarAutor="true"
        @submit="adicionarComentario"
        @cancelar="mostrarFormularioComentario = false"
      />
    </div>

    <!-- Lista de comentários -->
    <div v-if="comentariosFiltrados.length > 0" class="comentarios-lista">
      <div v-for="comentario in comentariosFiltrados" :key="comentario.id" class="comentario-item">
        <!-- Formulário para editar comentário existente -->
        <div v-if="editandoComentario === comentario.id" class="formulario-comentario">
          <h4>Editar Comentário</h4>
          <SubResourceForm
            tipo="comentario"
            modo="edicao"
            :dadosIniciais="comentario"
            :mostrarAutor="false"
            @submit="(dados) => atualizarComentario(dados, comentario)"
            @cancelar="editandoComentario = null"
          />
        </div>
        
        <!-- Exibir comentário existente -->
        <div v-else>
          <SubResourceList
            @editar="editarComentario(comentario)"
            @remover="excluirComentario(comentario)"
          >
            <template #conteudo>{{ comentario.texto }}</template>
            <template #autor>{{ comentario.autor }}</template>
          </SubResourceList>
        </div>
      </div>
    </div>

    <!-- Botão para adicionar comentário quando não há nenhum -->
    <div v-if="!carregando && !erro && comentarios.length === 0 && !mostrarFormularioComentario" class="estado vazio">
      <p>🗒️ Nenhum comentário encontrado.</p>
      <button class="adicionar-comentario" @click="mostrarFormularioComentario = true">
        ➕ Adicionar Comentário
      </button>
    </div>

    <!-- Botão para adicionar mais comentários -->
    <div v-if="!carregando && !erro && comentarios.length > 0 && !mostrarFormularioComentario" class="adicionar-mais">
      <button class="adicionar-comentario" @click="mostrarFormularioComentario = true">
        ➕ Adicionar Outro Comentário
      </button>
    </div>
  
    <div class="acoes">
      <button class="editar" @click="$emit('editar')">✏️ Editar</button>
      <button class="remover" @click="$emit('remover')">🗑️ Excluir</button>
    </div>
  </div>
</template>

<script setup> 

  

  import { ref, onMounted, computed } from 'vue'
  import { getComentario, criarComentario, atualizarComentario as atualizarComentarioService, removerComentario } from '../services/subresourceService.js'
  import SubResourceList from './SubResourceList.vue'
  import SubResourceForm from './SubResourceForm.vue'

  const comentarios = ref([])
const carregando = ref(true)
const erro = ref(null)
const mostrarFormularioComentario = ref(false)
const editandoComentario = ref(null)

// Filtros de comentários
const filtrosComentarios = ref({
  texto: '',
  autor: ''
})

// Função para mostrar mensagem de feedback
function mostrarFeedback(texto, tipo = 'sucesso', duracao = 3000) {
  // Criar elemento de feedback dinamicamente
  const feedback = document.createElement('div')
  feedback.className = `mensagem-feedback ${tipo}`
  feedback.innerHTML = `
    <span>${texto}</span>
    <button onclick="this.parentElement.remove()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; margin-left: 1rem;">×</button>
  `
  
  // Adicionar estilos
  feedback.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem;
    border-radius: 8px;
    z-index: 1000;
    animation: slideIn 0.3s ease-out;
    ${tipo === 'sucesso' ? 'background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb;' : ''}
    ${tipo === 'erro' ? 'background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;' : ''}
    ${tipo === 'info' ? 'background-color: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb;' : ''}
  `
  
  document.body.appendChild(feedback)
  
  setTimeout(() => {
    if (feedback.parentElement) {
      feedback.remove()
    }
  }, duracao)
}

  const props = defineProps({
    id: String
  })

  // Computed properties para filtros
  const autoresComentariosUnicos = computed(() => {
    const autores = comentarios.value.map(c => c.autor).filter(Boolean)
    return [...new Set(autores)].sort()
  })

  const comentariosFiltrados = computed(() => {
    return comentarios.value.filter(comentario => {
      const textoMatch = !filtrosComentarios.value.texto || 
        comentario.texto.toLowerCase().includes(filtrosComentarios.value.texto.toLowerCase())
      
      const autorMatch = !filtrosComentarios.value.autor || 
        comentario.autor === filtrosComentarios.value.autor
      
      return textoMatch && autorMatch
    })
  })


  async function carregarComentarios() {
    carregando.value = true
    erro.value = null
    try {
      const comentariosData = await getComentario(props.id)
      comentarios.value = comentariosData || []
    } catch (e) {
      erro.value = e?.message || 'Erro ao carregar comentários.'
    } finally {
      carregando.value = false
    }
  }

  onMounted(carregarComentarios)

  async function adicionarComentario(dados) {
    try {
      // Validação básica
      if (!dados.conteudo?.trim() || !dados.autor?.trim()) {
        alert('Por favor, preencha todos os campos.')
        return
      }

      const novoComentario = await criarComentario({
        texto: dados.conteudo,
        autor: dados.autor,
        mensagemId: props.id
      })
      comentarios.value.push(novoComentario)
      mostrarFormularioComentario.value = false
      mostrarFeedback('Comentário adicionado com sucesso! ✨', 'sucesso')
    } catch (e) {
      mostrarFeedback(e?.message || 'Falha ao enviar comentário.', 'erro', 5000)
    }
  }


  function editarComentario(comentario) {
    editandoComentario.value = comentario.id
  }

  async function atualizarComentario(dados, comentario) {
    if (!comentario) return
    
    try {
      const dadosAtualizados = await atualizarComentarioService(comentario.id, {
        texto: dados.conteudo,
        mensagemId: props.id,
        autor: comentario.autor
      })
      
      // Atualizar o comentário na lista
      const index = comentarios.value.findIndex(c => c.id === comentario.id)
      if (index !== -1) {
        comentarios.value[index].texto = dadosAtualizados.texto
      }
      
      editandoComentario.value = null
      mostrarFeedback('Comentário atualizado com sucesso! ✏️', 'sucesso')
    } catch (e) {
      mostrarFeedback(e?.message || 'Erro ao atualizar comentário.', 'erro', 5000)
    }
  }

  // Remove um comentário
  async function excluirComentario(comentario) {
    if (!comentario) return
    
    if (!confirm(`Deseja realmente excluir este comentário?`)) return

    try {
      await removerComentario(comentario.id)
      // Remover da lista
      const index = comentarios.value.findIndex(c => c.id === comentario.id)
      if (index !== -1) {
        comentarios.value.splice(index, 1)
      }
      mostrarFeedback('Comentário removido com sucesso! 🗑️', 'sucesso')
    } catch (e) {
      mostrarFeedback(e?.message || 'Erro ao remover comentário.', 'erro', 5000)
    }
  }

  // Função para limpar filtros
  function limparFiltrosComentarios() {
    filtrosComentarios.value.texto = ''
    filtrosComentarios.value.autor = ''
  }

</script>

<style scoped>
.card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  background: #fff;
}

.titulo {
  margin-bottom: 6px;
  font-weight: 700;
  color: #222;
}

.conteudo {
  margin-bottom: 12px;
}

.info {
  display: flex;
  justify-content: space-between;
  color: #6b7280;
  font-size: 14px;
}

/* Estilos para Comentários */
.comentarios-lista {
  margin-top: 1rem;
}

.comentario-item {
  margin-bottom: 0.5rem;
}

/* Filtros de Comentários */
.filtros-comentarios {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}

.filtro-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.input-filtro,
.select-filtro {
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.9rem;
  min-width: 150px;
}

.btn-limpar-filtros {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.btn-limpar-filtros:hover {
  background-color: #5a6268;
}

.resultados-info {
  color: #6c757d;
  font-size: 0.9rem;
  font-style: italic;
  margin-left: auto;
}

.formulario-comentario {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
}

.formulario-comentario h4 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #495057;
  font-size: 1rem;
}

.adicionar-comentario {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.adicionar-comentario:hover {
  background-color: #218838;
}

.adicionar-mais {
  text-align: center;
  margin-top: 1rem;
}

/* Estados de carregamento */
.estado {
  text-align: center;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
}

.estado.carregando {
  background-color: #e3f2fd;
  color: #1976d2;
}

.estado.erro {
  background-color: #ffebee;
  color: #c62828;
}

.estado.erro button {
  background-color: #c62828;
  color: white;
  border: none;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 0.5rem;
  font-size: 0.8rem;
}

.estado.vazio {
  text-align: center;
  color: #6c757d;
  padding: 1rem;
  font-size: 0.9rem;
}

.acoes {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

button {
  border: none;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
}

button.editar {
  background: #3b82f6;
  color: white;
}

button.remover {
  background: #ef4444;
  color: white;
}

button:hover {
  opacity: 0.9;
}

.adicionar-comentario {
  background: #42b983;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  margin-top: 8px;
}

.adicionar-comentario:hover {
  background: #379f72;
  opacity: 1;
}

.formulario-comentario {
  margin-top: 16px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.formulario-comentario h4 {
  margin: 0 0 12px 0;
  color: #374151;
  font-size: 16px;
}
</style>