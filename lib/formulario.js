// lib/formulario.js
// ---------------------------------------------------------------------------
// A VALIDAÇÃO DA CAIXA DE MENSAGEM DO "FALE COM A GENTE"
//
// Contas puras, sem DOM. Estas funções devolvem CHAVES de erro — 'vazio',
// 'curto', 'longo', 'invalido' — e nunca frases prontas. Quem escreve as
// frases é o painel de controle, como todo o texto do site: é isso que
// deixa reescrever um aviso sem abrir uma linha de código.
//
// POR QUE ISTO EXISTE EM VEZ DE SÓ USAR O `required` DO HTML: a validação
// do navegador é boa, mas a mensagem dela não é traduzível nem combina
// com o resto da página, e ela não sabe recusar um texto de duas letras.
// Aqui o controle é nosso, e o `required` continua lá como rede.
// ---------------------------------------------------------------------------

export const LIMITES = {
  nome: 80,
  nomeMinimo: 2,
  email: 120,
  mensagem: 2000,
  mensagemMinima: 10,
}

// Para onde a mensagem vai. O Web3Forms recebe o pacote e repassa para o
// e-mail dono da chave — não é preciso servidor nosso, e a chave não dá
// acesso a nada além de mandar mensagem para aquele endereço.
export const ENDERECO_DO_SERVICO = 'https://api.web3forms.com/submit'

const limpar = (v) => String(v ?? '').trim()

export function validarNome(valor) {
  const v = limpar(valor)
  if (!v) return 'vazio'
  if (v.length < LIMITES.nomeMinimo) return 'curto'
  if (v.length > LIMITES.nome) return 'longo'
  return null
}

// DE PROPÓSITO PERMISSIVA. Recusar um endereço válido é pior do que deixar
// passar um inválido: no segundo caso a mensagem chega e a resposta volta,
// no primeiro a pessoa desiste de falar com a gente. Quem confere de
// verdade é o servidor de e-mail. Só o óbvio é barrado aqui: tem de ter um
// arroba no meio, um ponto no domínio e nenhum espaço.
const FORMATO_DE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validarEmail(valor) {
  const v = limpar(valor)
  if (!v) return 'vazio'
  if (v.length > LIMITES.email) return 'longo'
  if (!FORMATO_DE_EMAIL.test(v)) return 'invalido'
  return null
}

export function validarMensagem(valor) {
  const v = limpar(valor)
  if (!v) return 'vazio'
  if (v.length < LIMITES.mensagemMinima) return 'curto'
  if (v.length > LIMITES.mensagem) return 'longo'
  return null
}

// Devolve TODOS os erros de uma vez. Mostrar um erro por envio obriga a
// pessoa a descobrir o problema por tentativa, e é hostil.
export function validarFormulario(campos) {
  const c = campos || {}
  const erros = {}
  const nome = validarNome(c.nome)
  const email = validarEmail(c.email)
  const mensagem = validarMensagem(c.mensagem)
  if (nome) erros.nome = nome
  if (email) erros.email = email
  if (mensagem) erros.mensagem = mensagem
  return { ok: Object.keys(erros).length === 0, erros }
}

// O CAMPO ESCONDIDO. Ninguém o vê, então gente nenhuma o preenche; robô de
// spam preenche tudo que encontra no formulário. É a proteção que não
// incomoda ninguém — sem desafio de imagem, sem "clique nos semáforos".
export function ehRobo(valorDoCampoEscondido) {
  return limpar(valorDoCampoEscondido).length > 0
}

export function montarEnvio({ chave, nome, email, mensagem, assunto }) {
  const k = limpar(chave)
  if (!k) return null
  return {
    access_key: k,
    name: limpar(nome),
    email: limpar(email),
    message: limpar(mensagem),
    subject: limpar(assunto) || 'Mensagem pelo site',
  }
}
