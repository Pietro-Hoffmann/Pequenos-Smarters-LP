// lib/folhas.js
// ---------------------------------------------------------------------------
// A FÍSICA DAS FOLHAS DA ILHA DA NATUREZA
//
// Contas puras, sem tela e sem navegador. Quem pinta é o FolhasCanvas.js;
// aqui só mora o "para onde cada folha vai". A separação é de propósito:
// é o que deixa o comportamento ser conferido sem abrir um navegador.
//
// O QUE FAZ UMA FOLHA PARECER FOLHA são três movimentos que correm soltos
// um do outro, e não um só:
//   1. a QUEDA, devagar e no ritmo de cada uma;
//   2. o BALANÇO, um vaivém lateral — folha não cai em linha reta;
//   3. o GIRO no próprio eixo, que mostra a frente e o verso. É o terceiro
//      que faz mais diferença: sem ele a folha vira um adesivo escorregando.
// Por cima dos três, um VENTO que vale para todas ao mesmo tempo, senão as
// rajadas pareceriam sorteio independente de cada folha.
//
// PROFUNDIDADE: cada folha nasce com um valor de 0 a 1. Perto de 0 ela é
// pequena, lenta e pálida (está "ao fundo"); perto de 1 é maior, mais
// rápida e mais firme (está "à frente"). É essa diferença que tira a
// sensação de tudo estar colado no mesmo vidro.
// ---------------------------------------------------------------------------

// OS VERDES. Puxados para o escuro de propósito: o céu da Ilha da Natureza
// é um verde CLARO, e os tons claros da paleta antiga simplesmente sumiam
// nele. Medido na tela em 31/10 — folha pálida sobre céu pálido não é folha
// discreta, é folha invisível.
export const TONS = ['#24561f', '#2f6b2a', '#3a7429', '#498a2e', '#5a9c36']

// O MAIOR PASSO DE TEMPO QUE UM QUADRO PODE VALER, em segundos.
// Aba que ficou minutos em segundo plano devolve um salto enorme no primeiro
// quadro de volta. Sem esta trava, a folha daria um pulo de quilômetros e
// todas reapareceriam no mesmo lugar. 0,05s = 20 quadros por segundo: abaixo
// disso o movimento já está picotado de qualquer jeito.
export const PASSO_MAXIMO = 0.05

const MINIMO_DE_FOLHAS = 18
const MAXIMO_DE_FOLHAS = 60
// Uma folha a cada 45px de largura: no celular dá o piso, num monitor
// grande dá umas quarenta.
const PIXELS_POR_FOLHA = 45

export function quantasFolhas(largura) {
  const n = Number(largura)
  if (!Number.isFinite(n) || n <= 0) return MINIMO_DE_FOLHAS
  return Math.max(MINIMO_DE_FOLHAS, Math.min(MAXIMO_DE_FOLHAS, Math.round(n / PIXELS_POR_FOLHA)))
}

// Mistura dois valores conforme `t` anda de 0 a 1.
const entre = (a, b, t) => a + (b - a) * t

export function criarFolha(largura, altura, sorteio = Math.random) {
  const s = typeof sorteio === 'function' ? sorteio : Math.random
  const L = Number.isFinite(Number(largura)) && largura > 0 ? Number(largura) : 1
  const A = Number.isFinite(Number(altura)) && altura > 0 ? Number(altura) : 1

  const profundidade = s()

  return {
    x: s() * L,
    y: s() * A,
    profundidade,
    // comprimento da folha, em pixels de tela
    tamanho: entre(14, 34, profundidade),
    // velocidade de queda, em pixels por segundo
    vy: entre(22, 62, profundidade),
    // o vaivém: `fase` anda no tempo, `amplitude` diz quanto ele empurra
    fase: s() * Math.PI * 2,
    velFase: entre(1.1, 2.6, s()),
    amplitude: entre(9, 34, s()),
    // o giro no próprio eixo (radianos e radianos por segundo)
    giro: s() * Math.PI * 2,
    velGiro: entre(0.25, 1.5, s()) * (s() < 0.5 ? -1 : 1),
    // o "virar de perfil": outro relógio, de propósito fora de compasso
    // com o giro, senão os dois casam e o movimento fica mecânico
    fase3d: s() * Math.PI * 2,
    velFase3d: entre(0.5, 1.8, s()),
    opacidade: entre(0.5, 0.92, profundidade),
    tom: Math.min(TONS.length - 1, Math.floor(s() * TONS.length)),
  }
}

// O VENTO DO INSTANTE, em pixels por segundo, igual para todas as folhas.
// Duas ondas de períodos que não são múltiplos uma da outra: a soma demora
// muito para se repetir, então a rajada nunca soa decorada.
export function ventoNoInstante(segundos) {
  const t = Number(segundos)
  if (!Number.isFinite(t)) return 0
  return Math.sin(t * 0.21) * 22 + Math.sin(t * 0.073 + 1.7) * 14
}

export function passoDaFolha(folha, dt, vento, largura, altura, sorteio = Math.random) {
  const bruto = Number(dt)
  const passo = Number.isFinite(bruto) && bruto > 0 ? Math.min(bruto, PASSO_MAXIMO) : 0
  const sopro = Number.isFinite(Number(vento)) ? Number(vento) : 0
  const L = Number.isFinite(Number(largura)) && largura > 0 ? Number(largura) : 1
  const A = Number.isFinite(Number(altura)) && altura > 0 ? Number(altura) : 1

  folha.y += folha.vy * passo
  folha.fase += folha.velFase * passo
  folha.x += (Math.sin(folha.fase) * folha.amplitude + sopro) * passo
  folha.giro += folha.velGiro * passo
  folha.fase3d += folha.velFase3d * passo

  // SAIU POR BAIXO: volta por cima já sorteada de novo, com outro tamanho,
  // outra velocidade e outro tom. Reaproveitar o objeto em vez de criar um
  // novo é o que mantém a lista do mesmo tamanho a tarde inteira.
  if (folha.y - folha.tamanho > A) {
    Object.assign(folha, criarFolha(L, A, sorteio))
    folha.y = -folha.tamanho * 2
  }

  // SAIU PELO LADO: entra pelo outro, para nenhuma folha se perder de vez
  // quando o vento sopra muito tempo para a mesma direção.
  const margem = folha.tamanho * 2
  if (folha.x < -margem) folha.x = L + margem
  else if (folha.x > L + margem) folha.x = -margem

  return folha
}

// O CONTORNO DA FOLHA, desenhado uma única vez num sprite fora da tela.
// Duas curvas espelhadas dão o bico em cima e embaixo; a nervura no meio é
// o que impede a forma de ser lida como "um grão de arroz".
// A origem (0,0) fica no CENTRO da folha: é isso que deixa o giro acontecer
// em torno dela mesma, e não em torno de um canto.
export function desenharContornoDeFolha(ctx, tamanho) {
  const L = Number(tamanho) > 0 ? Number(tamanho) : 1
  const meia = L / 2
  const barriga = L * 0.34

  ctx.beginPath()
  ctx.moveTo(0, -meia)
  ctx.quadraticCurveTo(barriga, -L * 0.08, 0, meia)
  ctx.quadraticCurveTo(-barriga, -L * 0.08, 0, -meia)
  ctx.closePath()
  ctx.fill()
  // o contorno é o que separa a folha do céu claro da Natureza; sem ele a
  // silhueta se dissolve no fundo e sobra uma mancha
  ctx.stroke()

  // a nervura: um fio mais escuro do bico de cima até o de baixo
  ctx.beginPath()
  ctx.moveTo(0, -meia * 0.86)
  ctx.lineTo(0, meia * 0.92)
  ctx.stroke()
}
