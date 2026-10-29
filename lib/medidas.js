// lib/medidas.js
// ---------------------------------------------------------------------------
// AS CONTAS DA PRÉVIA DOS PAINÉIS
// Funções puras, sem DOM: limitam porcentagens, validam os poucos valores
// que o painel de controle pode escrever (situação, tendência, estado de
// ilha) e calculam o traço do anel de progresso. Tudo que vem do site.js
// passa por aqui antes de virar desenho — um número errado no painel de
// controle nunca quebra a página, no máximo vira 0 ou 100.
// ---------------------------------------------------------------------------

export const STATUS = ['bem', 'evolucao', 'atencao']
export const TENDENCIAS = ['sobe', 'estavel', 'desce']
export const ESTADOS_ILHA = ['ok', 'atual', 'bloq']

export const SETAS = { sobe: '↑', estavel: '→', desce: '↓' }

// Porcentagem inteira entre 0 e 100. O que não é número vira 0.
export function limitarPct(v) {
  const n = Number(v)
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(100, Math.round(n)))
}

export function statusValido(s) {
  return STATUS.includes(s) ? s : 'bem'
}

export function tendenciaValida(t) {
  return TENDENCIAS.includes(t) ? t : null
}

export function estadoIlhaValido(e) {
  return ESTADOS_ILHA.includes(e) ? e : 'bloq'
}

// O anel é um círculo SVG com stroke-dasharray = circunferência e
// stroke-dashoffset = a parte que fica escondida. 100% = nada escondido.
export function tracoDoAnel(pct, raio) {
  const circunferencia = 2 * Math.PI * raio
  const deslocamento = circunferencia * (1 - limitarPct(pct) / 100)
  return { circunferencia, deslocamento }
}
