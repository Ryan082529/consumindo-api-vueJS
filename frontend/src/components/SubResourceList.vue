
<template>
  <div class="card">

    <p class="conteudo">
      <slot name="conteudo"></slot>
    </p>

    <div class="info">
      <small>👤 <slot name="autor"></slot></small>
    </div>

    <div class="acoes">
      <button class="editar" @click="$emit('editar')">✏️ Editar</button>
      <button class="remover" @click="$emit('remover')">🗑️ Excluir</button>
    </div>
  </div>
</template>

<script setup>
defineEmits(['editar', 'remover'])
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
</style>