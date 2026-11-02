// lib/neve.js
// ---------------------------------------------------------------------------
// A NEVE DA ILHA DO GELO
//
// Contas puras, sem tela e sem navegador — mesma divisão dos outros climas.
//
// O DILEMA DESTE CLIMA, e ele não é técnico: NEVE É BRANCA e o céu do
// Gelo é QUASE BRANCO. Medido em 1/11, branco puro sobre o fundo do céu
// (#dcf0fb) dá 1,17:1 — ou seja, não existe. E a arte da ilha inteira é
// feita de azuis claríssimos, que somem pelo mesmo motivo.
//
// Escurecer a neve resolve a visibilidade e DESTRÓI A IDENTIDADE: floco
// azul-escuro não é neve, é confete. A tentativa anterior está escrita no
// comentário antigo do CSS ("a neve é azulada") e escolheu um meio-termo
// que não é nem branco nem visível.
//
// SÃO DUAS SAÍDAS, e as duas são usadas aqui:
//
//   1. MIOLO BRANCO COM CONTORNO AZUL. É o mesmo princípio do Fogo e das
//      bolhas, invertido: lá o miolo era saturado e a borda escura; aqui o
//      miolo é branco de verdade e quem faz o trabalho de visibilidade é o
//      contorno.
//
//   2. A FORMA. Seis braços é uma silhueta tão reconhecível que carrega a
//      identidade mesmo com pouco contraste — o olho completa o resto.
//      Vale só para os flocos graúdos: nos miúdos a forma não se veria e
//      só custaria desenho.
// ---------------------------------------------------------------------------

import { PASSO_MAXIMO } from './folhas'

// O miolo é branco de verdade. Escurecer isto é desfazer o conserto.
export const COR_FLOCO = '#ffffff'

// O contorno faz TODO o trabalho de visibilidade: 2,7:1 contra o céu.
export const COR_CONTORNO = '#4e97cc'

// A partir deste raio o floco é desenhado como cristal de seis braços.
// Abaixo dele, vira um pontinho: naquele tamanho a forma não apareceria.
export const RAIO_DO_CRISTAL = 4.4

const MINIMO_DE_FLOCOS = 24
const MAXIMO_DE_FLOCOS = 70
const PIXELS_POR_FLOCO = 26

export function quantosFlocos(largura) {
  const n = Number(largura)
  if (!Number.isFinite(n) || n <= 0) return MINIMO_DE_FLOCOS
  return Math.max(MINIMO_DE_FLOCOS, Math.min(MAXIMO_DE_FLOCOS, Math.round(n / PIXELS_POR_FLOCO)))
}

const entre = (a, b, t) => a + (b - a) * t

export function criarFloco(largura, altura, sorteio = Math.random) {
  const s = typeof sorteio === 'function' ? sorteio : Math.random
  const L = Number.isFinite(Number(largura)) && largura > 0 ? Number(largura) : 1
  const A = Number.isFinite(Number(altura)) && altura > 0 ? Number(altura) : 1

  const porte = s()
  const raio = entre(1.6, 8.5, porte)

  return {
    x: s() * L,
    y: s() * A,
    raio,
    // graúdo ganha os seis braços; miúdo fica como pontinho
    cristal: raio >= RAIO_DO_CRISTAL,
    // NEVE CAI DEVAGAR. Para comparar: folha vai de 22 a 62 px/s e areia
    // atravessa a 380. Floco flutua para baixo, não despenca.
    vy: entre(11, 42, porte),
    // o vaguear: neve não cai em linha reta, ela erra o caminho
    fase: s() * Math.PI * 2,
    velFase: entre(0.5, 1.5, s()),
    vagar: entre(6, 22, s()),
    // o giro é LENTO: floco pesa quase nada e não tem por que rodopiar
    giro: s() * Math.PI * 2,
    velGiro: entre(0.12, 0.6, s()) * (s() < 0.5 ? -1 : 1),
    opacidade: entre(0.55, 1, porte),
    nitidez: porte,
  }
}

// A BRISA que desloca o conjunto, em pixels por segundo.
// Duas ondas lentas de períodos que não casam. Amplitude pequena de
// propósito: neve é leve, mas isto é nevasca mansa, não vendaval — aquilo
// seria o clima do Vento, que é outra ilha.
export function brisaNoInstante(segundos) {
  const t = Number(segundos)
  if (!Number.isFinite(t)) return 0
  return Math.sin(t * 0.17) * 13 + Math.sin(t * 0.061 + 2.4) * 9
}

export function passoDoFloco(floco, dt, brisa, largura, altura, sorteio = Math.random) {
  const bruto = Number(dt)
  const passo = Number.isFinite(bruto) && bruto > 0 ? Math.min(bruto, PASSO_MAXIMO) : 0
  const sopro = Number.isFinite(Number(brisa)) ? Number(brisa) : 0
  const L = Number.isFinite(Number(largura)) && largura > 0 ? Number(largura) : 1
  const A = Number.isFinite(Number(altura)) && altura > 0 ? Number(altura) : 1

  floco.y += floco.vy * passo
  floco.fase += floco.velFase * passo
  floco.x += (Math.sin(floco.fase) * floco.vagar + sopro) * passo
  floco.giro += floco.velGiro * passo

  // SAIU POR BAIXO: volta por cima já sorteado de novo.
  if (floco.y - floco.raio > A) {
    Object.assign(floco, criarFloco(L, A, sorteio))
    floco.y = -floco.raio * 2
  }

  // SAIU PELO LADO: entra pelo outro, para nenhum floco se perder de vez
  // quando a brisa sopra muito tempo para a mesma direção.
  const margem = floco.raio * 3
  if (floco.x < -margem) floco.x = L + margem
  else if (floco.x > L + margem) floco.x = -margem

  return floco
}

// O CRISTAL DE SEIS BRAÇOS, com a origem no centro.
// Três linhas cruzando o centro dão os seis braços; as farpas curtas perto
// da ponta são o que separa um floco de uma estrelinha. É traçado, não
// preenchido: floco de neve é vazado.
export function desenharCristal(ctx, raio) {
  const R = Number(raio) > 0 ? Number(raio) : 1
  const farpa = R * 0.36

  ctx.beginPath()
  for (let i = 0; i < 6; i += 1) {
    const angulo = (Math.PI / 3) * i
    const px = Math.cos(angulo) * R
    const py = Math.sin(angulo) * R
    ctx.moveTo(0, 0)
    ctx.lineTo(px, py)

    // as duas farpas do braço, abertas a 45 graus a dois terços do caminho
    const bx = Math.cos(angulo) * R * 0.62
    const by = Math.sin(angulo) * R * 0.62
    for (const lado of [-1, 1]) {
      const a2 = angulo + lado * (Math.PI / 4)
      ctx.moveTo(bx, by)
      ctx.lineTo(bx + Math.cos(a2) * farpa, by + Math.sin(a2) * farpa)
    }
  }
  ctx.stroke()
}
