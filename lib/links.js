// Quantidade mínima de dígitos de um número de WhatsApp utilizável.
// Brasil com código do país: 55 + DDD (2) + número (8 ou 9) = 12 ou 13 dígitos.
// Sem o código do país sobram 11 dígitos, e o wa.me apontaria para uma conta
// que não existe. Nesse caso é mais honesto não mostrar o cartão.
const MINIMO_DIGITOS_WHATSAPP = 12

export function montarMailto(email, assunto) {
  const limpo = String(email ?? '').trim()
  if (!limpo) return null
  return `mailto:${limpo}?subject=${encodeURIComponent(assunto)}`
}

export function montarWhatsapp(numero, mensagem) {
  const limpo = String(numero ?? '').trim().replace(/\D/g, '')
  if (limpo.length < MINIMO_DIGITOS_WHATSAPP) return null
  return `https://wa.me/${limpo}?text=${encodeURIComponent(mensagem)}`
}

export function temContato(contato) {
  if (!contato) return false
  return Boolean(montarMailto(contato.email, '')) || Boolean(montarWhatsapp(contato.whatsapp, ''))
}

// O NÚMERO ESCRITO PARA GENTE LER: 5551999754680 vira (51) 99975-4680.
// Quem vai tocar usa o link; quem vai anotar num papel ou ligar de outro
// aparelho precisa enxergar o número. Devolve null quando não dá para
// formatar, e aí quem chama decide não mostrar nada — nunca mostrar o
// amontoado de dígitos cru.
export function formatarWhatsapp(numero) {
  const limpo = String(numero ?? '').trim().replace(/\D/g, '')
  if (limpo.length < MINIMO_DIGITOS_WHATSAPP) return null
  // tira o código do país: quem lê a página é daqui
  const semPais = limpo.startsWith('55') ? limpo.slice(2) : limpo
  const ddd = semPais.slice(0, 2)
  const resto = semPais.slice(2)
  if (resto.length < 8) return null
  const meio = resto.length > 8 ? resto.slice(0, 5) : resto.slice(0, 4)
  const fim = resto.slice(meio.length)
  return `(${ddd}) ${meio}-${fim}`
}
