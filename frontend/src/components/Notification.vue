<!-- src/components/Notification.vue -->
<template>
  <div v-if="visivel" class="notificacao" :class="tipo">
    <span>{{ mensagem }}</span>
    <button @click="fechar" class="fechar">×</button>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'

const props = defineProps({
  mensagem: {
    type: String,
    required: true
  },
  tipo: {
    type: String,
    default: 'sucesso', // sucesso, erro, info
    validator: (value) => ['sucesso', 'erro', 'info'].includes(value)
  },
  duracao: {
    type: Number,
    default: 3000
  },
  visivelInicial: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['fechado'])

const visivel = ref(props.visivelInicial)

function fechar() {
  visivel.value = false
  emit('fechado')
}

onMounted(() => {
  if (props.duracao > 0) {
    setTimeout(() => {
      fechar()
    }, props.duracao)
  }
})
</script>

<style scoped>
.notificacao {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 1rem;
  border-radius: 8px;
  z-index: 1000;
  animation: slideIn 0.3s ease-out;
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 300px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.notificacao.sucesso {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.notificacao.erro {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.notificacao.info {
  background-color: #d1ecf1;
  color: #0c5460;
  border: 1px solid #bee5eb;
}

.fechar {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  margin-left: auto;
  padding: 0;
  line-height: 1;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.fechar:hover {
  opacity: 1;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>