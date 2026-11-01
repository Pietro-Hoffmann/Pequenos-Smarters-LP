// lib/fumaca.js
// ---------------------------------------------------------------------------
// A FUMAÇA DO VULCÃO DA ILHA DO FOGO
//
// Contas puras, sem tela e sem navegador. A arte da ilha tem um vulcão
// soltando fumaça e o clima não tinha nenhuma: são poucas baforadas
// largas, lentas e muito translúcidas, que sobem do centro e se abrem
// enquanto sobem.
//
// DUAS DECISÕES QUE VIERAM DE MEDIÇÃO, NÃO DE PALPITE:
//
//   • A COR. Fumaça clara sobre o céu pêssego do Fogo dá 1,07:1 de
//     contraste — ou seja, não existe. É o mesmo erro que custou duas
//     tentativas nas brasas, e desta vez foi medido antes de escrever o
//     código. Esta fumaça puxa para a FULIGEM, que é o que um vulcão em
//     erupção solta de qualquer forma.
//
//   • A OPACIDADE. Isto passa POR TRÁS do texto da seção. Por mais bonita
//     que a fumaça fique, ela não pode chegar perto de atrapalhar a
//     leitura — daí o teto duro logo abaixo, que tem teste próprio.
// ---------------------------------------------------------------------------

import { PASSO_MAXIMO } from './folhas'

// Fuligem morna: 3,75:1 contra o céu pêssego do clima de Fogo.
export const COR_FUMACA = '#7d6757'

// O TETO DURO de opacidade de uma baforada. É enfeite de fundo atrás de
// texto: mexer neste número é mexer na legibilidade da seção. Subiu de
// 0,15 para 0,18 em 1/11 porque a fumaça mal se via na tela — e 0,18
// continua muito longe de atrapalhar a leitura.
export const ALFA_MAXIMO = 0.18

const MINIMO_DE_BAFORADAS = 4
const MAXIMO_DE_BAFORADAS = 9
const PIXELS_POR_BAFORADA = 230

export function quantasBaforadas(largura) {
  const n = Number(largura)
  if (!Number.isFinite(n) || n <= 0) return MINIMO_DE_BAFORADAS
  return Math.max(
    MINIMO_DE_BAFORADAS,
    Math.min(MAXIMO_DE_BAFORADAS, Math.round(n / PIXELS_POR_BAFORADA))
  )
}

const entre = (a, b, t) => a + (b - a) * t

// Média de dois sorteios: concentra no centro, que é onde o vulcão fica,
// sem nunca recortar as bordas de vez.
function pertoDoCentro(s) {
  return (s() + s()) / 2
}

export function criarBaforada(largura, altura, sorteio = Math.random) {
  const s = typeof sorteio === 'function' ? sorteio : Math.random
  const L = Number.isFinite(Number(largura)) && largura > 0 ? Number(largura) : 1
  const A = Number.isFinite(Number(altura)) && altura > 0 ? Number(altura) : 1

  const porte = s()
  const raioInicial = entre(0.04, 0.09, porte) * L

  return {
    x: pertoDoCentro(s) * L,
    y: A * (1 - 0.22 * s()),
    raioInicial,
    // a baforada mais que dobra de tamanho pelo caminho: é o abrir que faz
    // parecer fumaça, e não uma bola subindo
    raioFinal: raioInicial * entre(2.4, 4.2, s()),
    // bem mais devagar que brasa (que vai de 26 a 74 px/s): fumaça demora
    vy: entre(9, 26, s()),
    deriva: entre(-12, 12, s()),
    vida: entre(3.4, 7.5, s()),
    idade: s() * 3,
    alfa: entre(0.09, ALFA_MAXIMO, s()),
  }
}

// A OPACIDADE AO LONGO DA VIDA: nasce invisível, aparece, e some.
// O pico fica cedo (perto de um terço) e a dissipação é longa — fumaça
// aparece depressa e demora a sumir, nunca o contrário.
export function opacidadeDaBaforada(baforada) {
  const idade = Number(baforada && baforada.idade)
  const vida = Number(baforada && baforada.vida)
  const alfa = Number(baforada && baforada.alfa)
  if (!Number.isFinite(idade) || !Number.isFinite(vida) || vida <= 0) return 0
  if (!Number.isFinite(alfa)) return 0
  const andado = idade / vida
  if (andado <= 0 || andado >= 1) return 0
  const subida = Math.min(1, andado / 0.3)
  const descida = Math.min(1, (1 - andado) / 0.7)
  return Math.min(ALFA_MAXIMO, alfa * subida * descida)
}

// O RAIO AO LONGO DA VIDA: a baforada se abre do início ao fim.
export function raioDaBaforada(baforada) {
  const idade = Number(baforada && baforada.idade)
  const vida = Number(baforada && baforada.vida)
  const ini = Number(baforada && baforada.raioInicial)
  const fim = Number(baforada && baforada.raioFinal)
  if (!Number.isFinite(ini) || ini <= 0) return 1
  if (!Number.isFinite(fim) || fim <= ini) return ini
  if (!Number.isFinite(idade) || !Number.isFinite(vida) || vida <= 0) return ini
  const andado = Math.max(0, Math.min(1, idade / vida))
  return entre(ini, fim, andado)
}

export function passoDaBaforada(baforada, dt, largura, altura, sorteio = Math.random) {
  const bruto = Number(dt)
  const passo = Number.isFinite(bruto) && bruto > 0 ? Math.min(bruto, PASSO_MAXIMO) : 0
  const L = Number.isFinite(Number(largura)) && largura > 0 ? Number(largura) : 1
  const A = Number.isFinite(Number(altura)) && altura > 0 ? Number(altura) : 1

  baforada.idade += passo
  baforada.y -= baforada.vy * passo
  baforada.x += baforada.deriva * passo

  if (baforada.idade >= baforada.vida) {
    Object.assign(baforada, criarBaforada(L, A, sorteio))
    baforada.idade = 0
  }

  return baforada
}

// O DESENHO: uma mancha com degradê que termina transparente. Sem isso
// — com borda dura — a fumaça vira uma bola cinzenta.
export function desenharBaforada(ctx, raio, alfa) {
  const R = Number(raio) > 0 ? Number(raio) : 1
  const a = Number.isFinite(Number(alfa)) ? Math.max(0, Math.min(ALFA_MAXIMO, Number(alfa))) : 0
  if (a <= 0) return

  const degrade = ctx.createRadialGradient(0, 0, 0, 0, 0, R)
  degrade.addColorStop(0, `rgba(125, 103, 87, ${a})`)
  degrade.addColorStop(0.45, `rgba(125, 103, 87, ${a * 0.62})`)
  degrade.addColorStop(1, 'rgba(125, 103, 87, 0)')

  ctx.fillStyle = degrade
  ctx.beginPath()
  ctx.arc(0, 0, R, 0, Math.PI * 2)
  ctx.fill()
}
