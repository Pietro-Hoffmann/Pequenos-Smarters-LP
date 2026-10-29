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
