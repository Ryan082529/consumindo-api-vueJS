<!-- src/components/SubResourceForm.vue -->
<template>
  <form class="form" @submit.prevent="enviar">
    <!-- Campo de conteúdo (comum para ambos) -->
    <div class="grupo">
      <label for="conteudo">{{ tipo === 'mensagem' ? 'Conteúdo' : 'Comentário' }}</label>
      <textarea 
        id="conteudo"
        v-model.trim="formulario.conteudo"
        rows="3"
        :placeholder="placeholderTexto"
        required
      ></textarea>
    </div>

    <!-- Campo autor para comentários (se necessário) -->
    <div v-if="tipo === 'comentario' && mostrarAutor" class="grupo">
      <label for="autorComentario">Autor</label>
      <input 
        id="autorComentario"
        v-model.trim="formulario.autor"
        type="text"
        placeholder="Seu nome (opcional)"
      />
    </div>

    <div class="acoes-formulario">
      <button 
        v-if="modo === 'edicao'" 
        type="button" 
        class="cancelar" 
        @click="cancelar"
      >
        Cancelar
      </button>
      <button class="enviar" type="submit">
        {{ textoBotao }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  tipo: {
    type: String,
    required: true,
    validator: (value) => ['mensagem', 'comentario'].includes(value)
  },
  modo: {
    type: String,
    default: 'criacao',
    validator: (value) => ['criacao', 'edicao'].includes(value)
  },
  dadosIniciais: {
    type: Object,
    default: () => ({})
  },
  mostrarAutor: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['submit', 'cancelar'])

// Estado do formulário
const formulario = ref({
  conteudo: '',
  autor: ''
})

// Computed properties
const placeholderTexto = computed(() => {
  return props.tipo === 'mensagem' 
    ? 'Escreva o conteúdo da mensagem' 
    : 'Escreva seu comentário'
})

const textoBotao = computed(() => {
  if (props.modo === 'edicao') return 'Atualizar'
  return props.tipo === 'mensagem' ? 'Adicionar Mensagem' : 'Adicionar Comentário'
})

// Watch para preencher dados iniciais em modo de edição
watch(() => props.dadosIniciais, (novosDados) => {
  if (props.modo === 'edicao' && novosDados) {
    formulario.value = {
      conteudo: novosDados.conteudo || '',
      autor: novosDados.autor || ''
    }
  }
}, { immediate: true })

// Funções
function enviar() {
  if (!formulario.value.conteudo) return
  
  const dados = {
    conteudo: formulario.value.conteudo,
    autor: formulario.value.autor || 'Anônimo'
  }
  
  // Adicionar data de criação para novos itens
  if (props.modo === 'criacao') {
    dados.data_criacao = new Date().toISOString()
  }
  
  emit('submit', dados)
  
  // Limpar formulário apenas em modo de criação
  if (props.modo === 'criacao') {
    formulario.value = {
      conteudo: '',
      autor: ''
    }
  }
}

function cancelar() {
  emit('cancelar')
}
</script>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #fff;
  margin-bottom: 20px;
}

.grupo {
  display: flex;
  flex-direction: column;
}

label {
  font-weight: 600;
  margin-bottom: 4px;
  color: #333;
}

input,
textarea {
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 15px;
  outline: none;
  font-family: inherit;
}

input:focus,
textarea:focus {
  border-color: #42b983;
  box-shadow: 0 0 0 2px rgba(66, 185, 131, 0.2);
}

.acoes-formulario {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

button {
  border: none;
  padding: 10px 14px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

button.enviar {
  background: #42b983;
  color: #fff;
}

button.enviar:hover {
  background: #379f72;
}

button.cancelar {
  background: #6b7280;
  color: #fff;
}

button.cancelar:hover {
  background: #4b5563;
}
</style>

