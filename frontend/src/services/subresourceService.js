import api from './api.js'

export async function getComentario(id) {
  try {
    const resposta = await api.get(`http://localhost:3000/comentarios?mensagemId=${id}`)
    return resposta.data
  } catch (erro) {
    throw erro.response?.data || {
      erro: 'NetworkError',
      message: 'Falha ao carregar comentários.',
      status: 500
    }
  }
}


export async function criarComentario(dados) {
  try {
    const resposta = await api.post('/comentarios', dados)
    return resposta.data
  } catch (erro) {
    throw erro.response?.data || {
      erro: 'NetworkError',
      message: 'Falha ao criar comentario.',
      status: 500
    }
  }
}

/**
 * Atualiza um comentario existente.
 * PUT /mensagens/:id
 */
export async function atualizarComentario(id, dados) {
  try {
    const resposta = await api.put(`/comentarios/${id}`, dados)
    return resposta.data
  } catch (erro) {
    throw erro.response?.data || {
      erro: 'NetworkError',
      message: 'Falha ao atualizar comentario.',
      status: 500
    }
  }
}

/**
 * Remove uma mensagem.
 * DELETE /comentarios/:id
 */
export async function removerComentario(id) {
  try {
    const resposta = await api.delete(`/comentarios/${id}`)
    return resposta.data
  } catch (erro) {
    throw erro.response?.data || {
      erro: 'NetworkError',
      message: 'Falha ao remover comentarios.',
      status: 500
    }
  }
}