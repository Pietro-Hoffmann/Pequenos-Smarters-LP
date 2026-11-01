// lib/vento.js
// ---------------------------------------------------------------------------
// AS CORRENTES DE AR DA ILHA DO VENTO
//
// Contas puras, sem tela e sem navegador — mesma divisão de folhas.js e
// areia.js.
//
// POR QUE ARCO, E NÃO FAIXA. O Vento já tinha sido consertado uma vez: as
// faixas foram inclinadas e deixadas mais transparentes, e continuou
// parecendo defeito de renderização. O problema não era o ângulo nem o tom,
// era a RETA. Faixas retas, paralelas, igualmente espaçadas e repetindo em
// padrão são a assinatura de artefato de compressão de vídeo — o olho
// reconhece a regularidade, e nenhum ajuste de cor desfaz isso.
//
// Vento, na linguagem do próprio jogo, é curva: a arte da ilha é feita de
// espirais turquesa. Então cada corrente aqui é um ARCO sorteado (uma curva
// de Bézier quadrática), com rastro que afina para trás como cometa. Duas
// correntes nunca saem paralelas, porque nenhuma é copiada de um padrão.
//
// E AS SEMENTES SAEM DE GRAÇA: uma corrente de rastro muito curto e traço
// mais grosso vira um pontinho deslizando pelo arco, que é a poeira levada
// pelo vento. Mesma física, dois visuais, um só tipo de objeto.
// ---------------------------------------------------------------------------

import { PASSO_MAXIMO } from './folhas'

// Turquesas tirados da própria arte da ilha (medidos no PNG: de #40a090 a
// #a0f0e0), ficando com a faixa ESCURA da família. Os claros sumiriam no
// céu cinza esverdeado do clima de Vento, como já aconteceu com os verdes
// das folhas e os marrons da areia.
export const TONS_VENTO = ['#2e8578', '#3b9a8a', '#4aad9c', '#58bdab']

const MINIMO_DE_CORRENTES = 7
const MAXIMO_DE_CORRENTES = 16
// Uma corrente a cada 150px. Bem mais espaçado que folha (45px) ou areia
// (12px): corrente é um objeto grande, que ocupa meia tela sozinho — e com
// o rastro longo (ver abaixo) ela ocupa ainda mais.
const PIXELS_POR_CORRENTE = 150

export function quantasCorrentes(largura) {
  const n = Number(largura)
  if (!Number.isFinite(n) || n <= 0) return MINIMO_DE_CORRENTES
  return Math.max(
    MINIMO_DE_CORRENTES,
    Math.min(MAXIMO_DE_CORRENTES, Math.round(n / PIXELS_POR_CORRENTE))
  )
}

const entre = (a, b, t) => a + (b - a) * t

// O quanto o arco se afasta da reta entre as pontas, em fração do PRÓPRIO
// COMPRIMENTO do arco — e não da altura da tela, como era na primeira
// versão. A diferença importa: medida contra a altura, uma corrente curta
// saía quase reta, e reta é exatamente o defeito que estamos consertando.
// Medido contra o próprio comprimento, toda corrente curva na mesma
// proporção, seja grande ou pequena. O piso não é zero de propósito:
// nenhuma corrente tem permissão de ser reta.
const CURVA_MINIMA = 0.18
const CURVA_MAXIMA = 0.45

// O ARCO NÃO ATRAVESSA A TELA INTEIRA: ele ocupa de 30% a 70% da largura.
// Na primeira versão a corrente ia de ponta a ponta e o rastro mostrava só
// um pedacinho dela — e um pedacinho de um arco grande é indistinguível de
// um segmento de reta. Arco curto com rastro longo é o contrário: a curva
// aparece inteira.
const EXTENSAO_MINIMA = 0.3
const EXTENSAO_MAXIMA = 0.7

export function criarCorrente(largura, altura, sorteio = Math.random) {
  const s = typeof sorteio === 'function' ? sorteio : Math.random
  const L = Number.isFinite(Number(largura)) && largura > 0 ? Number(largura) : 1
  const A = Number.isFinite(Number(altura)) && altura > 0 ? Number(altura) : 1

  const extensao = entre(EXTENSAO_MINIMA, EXTENSAO_MAXIMA, s()) * L
  // começa em qualquer lugar, inclusive já saindo pela borda: quem cuida de
  // a corrente não aparecer do nada é o envelope mais abaixo, não a posição
  const x0 = entre(-0.15, 0.9, s()) * L
  const y0 = s() * A
  // a corrente não termina na mesma altura em que começou: ela sobe ou desce
  const y1 = y0 + entre(-0.2, 0.2, s()) * A

  const paraCima = s() < 0.5
  const curva = entre(CURVA_MINIMA, CURVA_MAXIMA, s()) * extensao * (paraCima ? -1 : 1)

  // Uma em cada três é SEMENTE: rastro curtinho e traço mais grosso, o que
  // na tela vira um pontinho viajando pelo arco em vez de um risco.
  const semente = s() > 0.7

  return {
    x0,
    y0,
    // o controle de uma Bézier quadrática fica no MEIO do caminho em x —
    // é isso que garante que a corrente nunca volta para trás ao avançar...
    cx: x0 + extensao / 2,
    // ...e o deslocamento em y é de onde vem toda a curvatura
    cy: (y0 + y1) / 2 + curva,
    x1: x0 + extensao,
    y1,
    // sorteado para as correntes não entrarem todas no mesmo instante
    progresso: s(),
    // fração do caminho por segundo: a corrente percorre o arco em 2 a 6 s
    velocidade: entre(0.18, 0.5, s()),
    // O RASTRO É LONGO de propósito: ele precisa cobrir meio arco para a
    // curva ser vista. Rastro curto num arco é um segmento de reta.
    cauda: semente ? entre(0.02, 0.05, s()) : entre(0.3, 0.65, s()),
    espessura: semente ? entre(3, 5.4, s()) : entre(2.2, 5, s()),
    semente,
    opacidade: entre(0.5, 0.9, s()),
    tom: Math.min(TONS_VENTO.length - 1, Math.floor(s() * TONS_VENTO.length)),
  }
}

// O ENVELOPE: o quanto a corrente inteira está acesa, de 0 a 1.
// Como o arco não atravessa a tela toda, a corrente poderia aparecer e
// sumir no meio do céu, do nada. O envelope resolve isso sem precisar
// empurrar os arcos para fora do quadro: ela acende enquanto entra e
// apaga enquanto sai.
export function envelopeDaCorrente(progresso) {
  const t = Number(progresso)
  if (!Number.isFinite(t) || t <= 0 || t >= 1) return 0
  return Math.min(1, t / 0.2, (1 - t) / 0.28)
}

// Onde a corrente está no parâmetro t do caminho (0 = início, 1 = fim).
// Bézier quadrática: P(t) = (1-t)²·P0 + 2(1-t)t·C + t²·P1
export function pontoNoArco(corrente, t) {
  const u = 1 - t
  const a = u * u
  const b = 2 * u * t
  const c = t * t
  return {
    x: a * corrente.x0 + b * corrente.cx + c * corrente.x1,
    y: a * corrente.y0 + b * corrente.cy + c * corrente.y1,
  }
}

// O RASTRO, em pontos do mais fraco (ponta da cauda) ao mais forte (cabeça).
// `forca` vai de 0 a 1 e é o que afina o traço para trás — é esse
// afinamento que dá direção à corrente sem precisar de nenhuma seta.
// Pedaço que ainda não entrou no caminho, ou que já saiu, é descartado:
// sem isso a cauda ficaria presa fora do começo do arco.
export function segmentosDoRastro(corrente, quantos = 12) {
  const pontos = []
  const total = Math.max(1, Math.round(quantos))
  for (let i = 0; i <= total; i += 1) {
    const forca = i / total
    const t = corrente.progresso - corrente.cauda * (1 - forca)
    if (t < 0 || t > 1) continue
    const p = pontoNoArco(corrente, t)
    pontos.push({ x: p.x, y: p.y, forca })
  }
  return pontos
}

export function passoDaCorrente(corrente, dt, largura, altura, sorteio = Math.random) {
  const bruto = Number(dt)
  const passo = Number.isFinite(bruto) && bruto > 0 ? Math.min(bruto, PASSO_MAXIMO) : 0
  const L = Number.isFinite(Number(largura)) && largura > 0 ? Number(largura) : 1
  const A = Number.isFinite(Number(altura)) && altura > 0 ? Number(altura) : 1

  corrente.progresso += corrente.velocidade * passo

  // Chegou ao fim do arco (já apagada pelo envelope): a corrente renasce com
  // outro caminho, outra curvatura e outro ritmo. Reaproveitar o objeto
  // mantém a lista do mesmo tamanho a tarde inteira.
  if (corrente.progresso > 1) {
    Object.assign(corrente, criarCorrente(L, A, sorteio))
    corrente.progresso = 0
  }

  return corrente
}
