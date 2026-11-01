// lib/bolhas.js
// ---------------------------------------------------------------------------
// AS BOLHAS DA ILHA DOS LAGOS
//
// Contas puras, sem tela e sem navegador — mesma divisão dos outros climas.
//
// POR QUE O CONTORNO ESCURO NÃO TINHA RESOLVIDO. Já houve uma tentativa de
// fazer as bolhas aparecerem sobre o céu turquesa claro, dando contorno a
// elas; está escrito no comentário antigo do CSS. Não bastou, e o motivo é
// que a bolha continuou sendo um DISCO PINTADO.
//
// Bolha de verdade é uma CASCA TRANSPARENTE: vê-se o fundo através dela.
// O que o olho reconhece como bolha não é o preenchimento — são três
// coisas, e antes não havia nenhuma:
//   1. o ANEL da borda, onde a luz se refrata;
//   2. o BRILHO ESPECULAR, o pontinho claro no canto de cima;
//   3. o escurecimento na parte de baixo.
//
// E O MOVIMENTO: ela ACELERA (empuxo), sobe em ZIGUE-ZAGUE (bolha real
// sobe em espiral, não em linha), CRESCE no caminho (a pressão cai) e
// ESTOURA no fim. Bolha que some por desbotamento é o que mais entrega
// que aquilo não é água.
// ---------------------------------------------------------------------------

import { PASSO_MAXIMO } from './folhas'

// O anel da bolha. Escuro de propósito: medido contra o céu dos Lagos
// (#b3ece7), os turquesas claros da arte dão 1,31:1 — somem. Este dá 3,7:1.
export const COR_BOLHA = '#1d7d82'

// O brilho especular. Quase branco: é um reflexo de luz, não uma cor.
export const COR_BRILHO = '#f2ffff'

const MINIMO_DE_BOLHAS = 16
const MAXIMO_DE_BOLHAS = 40
// Uma bolha a cada 48px. O primeiro valor foi 34px e, visto na tela em
// 1/11, encheu a seção de ponta a ponta: lia como água, mas competia com
// o título e o texto. Bolha é enfeite de fundo.
const PIXELS_POR_BOLHA = 48

export function quantasBolhas(largura) {
  const n = Number(largura)
  if (!Number.isFinite(n) || n <= 0) return MINIMO_DE_BOLHAS
  return Math.max(MINIMO_DE_BOLHAS, Math.min(MAXIMO_DE_BOLHAS, Math.round(n / PIXELS_POR_BOLHA)))
}

const entre = (a, b, t) => a + (b - a) * t

// A bolha sai da água, que está embaixo. Só a faixa de baixo da seção.
const FAIXA_DE_NASCIMENTO = 0.42

// A partir de quanto da vida a bolha começa a estourar. Os últimos 8%:
// estouro é rápido, senão vira desbotamento, que é justamente o que
// estamos consertando.
const INICIO_DO_ESTOURO = 0.92

export function criarBolha(largura, altura, sorteio = Math.random) {
  const s = typeof sorteio === 'function' ? sorteio : Math.random
  const L = Number.isFinite(Number(largura)) && largura > 0 ? Number(largura) : 1
  const A = Number.isFinite(Number(altura)) && altura > 0 ? Number(altura) : 1

  const porte = s()

  return {
    x: s() * L,
    y: A * (1 - FAIXA_DE_NASCIMENTO * s()),
    // a variação de tamanho é grande de propósito: lago tem bolha graúda e
    // bolha miúda na mesma cena, e é isso que tira o ar de padrão
    raioInicial: entre(4.5, 17, porte),
    // quanto ela engorda ao longo da vida, em fração do raio inicial
    crescimento: entre(0.25, 0.7, s()),
    // velocidade inicial de subida, em pixels por segundo
    vy: entre(18, 52, porte),
    // o zigue-zague: bolha sobe em espiral, não em linha
    fase: s() * Math.PI * 2,
    velFase: entre(1.8, 4.2, s()),
    bamboleio: entre(9, 30, s()),
    // A VIDA É CURTA de propósito. Com o teto antigo (6,2s) e o empuxo, a
    // bolha mais rápida cruzava a seção inteira e estourava lá em cima,
    // perto do título. Água está EMBAIXO: é de lá que a bolha sai e é por
    // ali que ela deve arrebentar.
    vida: entre(1.8, 3.6, s()),
    idade: s() * 2,
    alfa: entre(0.58, 0.95, s()),
    // 0 = ao fundo (anel difuso), 1 = à frente (anel definido)
    nitidez: porte,
  }
}

// Quanto a bolha acelera subindo, em pixels por segundo ao quadrado.
const EMPUXO = 22

// O RAIO AO LONGO DA VIDA: a bolha engorda enquanto sobe.
export function raioDaBolha(bolha) {
  const ini = Number(bolha && bolha.raioInicial)
  if (!Number.isFinite(ini) || ini <= 0) return 1
  const idade = Number(bolha && bolha.idade)
  const vida = Number(bolha && bolha.vida)
  const cresce = Number(bolha && bolha.crescimento)
  if (!Number.isFinite(idade) || !Number.isFinite(vida) || vida <= 0) return ini
  if (!Number.isFinite(cresce)) return ini
  const andado = Math.max(0, Math.min(1, idade / vida))
  return ini * (1 + cresce * andado)
}

// O ESTOURO, de 0 (intacta) a 1 (no instante em que some).
// Só acontece no finalzinho: é ele que faz a bolha ARREBENTAR em vez de
// desbotar, e é o detalhe que mais separa isto de confete subindo.
export function estouroDaBolha(bolha) {
  const idade = Number(bolha && bolha.idade)
  const vida = Number(bolha && bolha.vida)
  if (!Number.isFinite(idade) || !Number.isFinite(vida) || vida <= 0) return 0
  const andado = idade / vida
  if (andado < INICIO_DO_ESTOURO) return 0
  return Math.min(1, (andado - INICIO_DO_ESTOURO) / (1 - INICIO_DO_ESTOURO))
}

export function passoDaBolha(bolha, dt, largura, altura, sorteio = Math.random) {
  const bruto = Number(dt)
  const passo = Number.isFinite(bruto) && bruto > 0 ? Math.min(bruto, PASSO_MAXIMO) : 0
  const L = Number.isFinite(Number(largura)) && largura > 0 ? Number(largura) : 1
  const A = Number.isFinite(Number(altura)) && altura > 0 ? Number(altura) : 1

  bolha.idade += passo
  bolha.vy += EMPUXO * passo
  bolha.y -= bolha.vy * passo
  bolha.fase += bolha.velFase * passo
  bolha.x += Math.sin(bolha.fase) * bolha.bamboleio * passo

  // ESTOUROU, ou escapou pelo topo: volta a sair lá de baixo, nova.
  if (bolha.idade >= bolha.vida || bolha.y < -raioDaBolha(bolha) * 3) {
    Object.assign(bolha, criarBolha(L, A, sorteio))
    bolha.idade = 0
  }

  return bolha
}

// O DESENHO DA CASCA.
// O miolo fica TRANSPARENTE — é isso que faz ver o céu através da bolha, e
// é a diferença entre uma bolha e um disco colorido. O anel é construído
// como um degradê radial: transparente até perto da borda, um realce
// claro, a cor do anel, e de volta ao transparente.
//
// O DESFOQUE DE PROFUNDIDADE sai de graça daqui, pelo mesmo truque do
// Fogo: a bolha do fundo tem o anel LARGO (paradas espalhadas), a da
// frente tem o anel ESTREITO (paradas juntas). Não é preciso filtro.
export function desenharBolha(ctx, bolha) {
  const R = Number(bolha && bolha.raio) > 0 ? Number(bolha.raio) : 1
  const alfa = Number.isFinite(Number(bolha && bolha.alfa))
    ? Math.max(0, Math.min(1, Number(bolha.alfa)))
    : 1
  if (alfa <= 0) return
  const nit = Number.isFinite(Number(bolha && bolha.nitidez))
    ? Math.max(0, Math.min(1, Number(bolha.nitidez)))
    : 1

  // anel estreito à frente (0,16 do raio), largo ao fundo (0,42)
  const espessura = 0.42 - 0.26 * nit
  const inicio = Math.max(0, 1 - espessura)
  const realce = inicio + (1 - inicio) * 0.34

  const degrade = ctx.createRadialGradient(0, 0, 0, 0, 0, R)
  degrade.addColorStop(0, 'rgba(29, 125, 130, 0)')
  degrade.addColorStop(inicio, 'rgba(29, 125, 130, 0)')
  degrade.addColorStop(realce, `rgba(180, 244, 240, ${alfa * 0.5})`)
  degrade.addColorStop(0.94, `rgba(29, 125, 130, ${alfa})`)
  degrade.addColorStop(1, 'rgba(29, 125, 130, 0)')

  ctx.fillStyle = degrade
  ctx.beginPath()
  ctx.arc(0, 0, R, 0, Math.PI * 2)
  ctx.fill()

  // O BRILHO ESPECULAR: o pontinho de luz no canto de cima, onde o sol
  // bate. É pequeno e é o que mais faz o olho dizer "bolha" — sem ele o
  // anel sozinho parece um aro, não uma esfera.
  const raioDoBrilho = R * 0.2
  ctx.fillStyle = `rgba(242, 255, 255, ${alfa * 0.85})`
  ctx.beginPath()
  ctx.arc(-R * 0.34, -R * 0.38, raioDoBrilho, 0, Math.PI * 2)
  ctx.fill()
}
