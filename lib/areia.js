// lib/areia.js
// ---------------------------------------------------------------------------
// A FÍSICA DA AREIA DA ILHA DO DESERTO
//
// Contas puras, sem tela e sem navegador — mesma divisão do lib/folhas.js.
//
// AREIA NÃO É FOLHA COM OUTRA COR. São três diferenças de comportamento, e
// foram elas que definiram este arquivo:
//
//   1. ela ATRAVESSA, não cai. A camada de CSS que existia antes fazia os
//      pontos do Deserto SUBIREM, como fumaça. Areia soprada anda de lado,
//      rente ao chão;
//   2. ela vem em LUFADAS. Areia a velocidade constante vira chuvisco: o
//      vento precisa de pico e de vale, e passar mais tempo no vale;
//   3. ela se junta EMBAIXO, perto do chão de onde é levantada, e rareia
//      para cima.
//
// E o grão é desenhado como um RISCO deitado, não como bolinha: é o
// alongamento na direção do movimento que o olho lê como velocidade.
// ---------------------------------------------------------------------------

import { PASSO_MAXIMO } from './folhas'

// Os tons escureceram pelo mesmo motivo dos verdes das folhas: o céu do
// clima de Deserto é areia clara, e marrom claro sobre areia clara não
// aparece. Medido na tela em 1/11.
export const TONS_AREIA = ['#6b4f1c', '#7d5d22', '#8f6b28', '#a37d33', '#b89146']

const MINIMO_DE_GRAOS = 55
const MAXIMO_DE_GRAOS = 170
// Um grão a cada 12px de largura — bem mais apertado que as folhas (45px).
// Folha é objeto grande e raro; areia é miudinha e aos montes. O primeiro
// valor foi 18px e, medido na tela em 1/11, cobria só 0,16% dos pixels no
// pico da lufada: dava para contar os grãos um a um, e não lia como
// tempestade.
const PIXELS_POR_GRAO = 12

export function quantosGraos(largura) {
  const n = Number(largura)
  if (!Number.isFinite(n) || n <= 0) return MINIMO_DE_GRAOS
  return Math.max(MINIMO_DE_GRAOS, Math.min(MAXIMO_DE_GRAOS, Math.round(n / PIXELS_POR_GRAO)))
}

const entre = (a, b, t) => a + (b - a) * t

// O quanto a areia se amontoa embaixo. Expoente menor que 1 puxa o sorteio
// para perto de 1, ou seja, para a base da tela. Em 0,55 cerca de dois
// terços dos grãos nascem na metade de baixo.
const CONCENTRACAO_NO_CHAO = 0.55

export function criarGrao(largura, altura, sorteio = Math.random) {
  const s = typeof sorteio === 'function' ? sorteio : Math.random
  const L = Number.isFinite(Number(largura)) && largura > 0 ? Number(largura) : 1
  const A = Number.isFinite(Number(altura)) && altura > 0 ? Number(altura) : 1

  const profundidade = s()

  return {
    x: s() * L,
    y: A * Math.pow(s(), CONCENTRACAO_NO_CHAO),
    profundidade,
    comprimento: entre(4.5, 15, profundidade),
    espessura: entre(1.2, 2.8, profundidade),
    // velocidade de travessia em pixels por segundo, antes da lufada
    vx: entre(90, 380, profundidade),
    // a areia desce DE LEVE enquanto atravessa: ela está sendo carregada,
    // não soprada para cima
    deriva: entre(-4, 16, s()),
    fase: s() * Math.PI * 2,
    velFase: entre(1.4, 3.2, s()),
    balanco: entre(3, 12, s()),
    // uma inclinaçãozinha por grão, senão a rajada vira pauta de caderno
    inclinacao: entre(-0.1, 0.1, s()),
    opacidade: entre(0.38, 0.85, profundidade),
    tom: Math.min(TONS_AREIA.length - 1, Math.floor(s() * TONS_AREIA.length)),
  }
}

// A LUFADA, de 0,2 (quase parado) a 1 (rajada cheia).
// Duas ondas somadas dão a variação; a potência é o que transforma a soma
// em LUFADA: ela afunda os valores médios, então o vento passa a maior
// parte do tempo fraco e sobe de vez em quando. Sem a potência isto seria
// um sopro constante que só muda de intensidade.
export function rajadaNoInstante(segundos) {
  const t = Number(segundos)
  if (!Number.isFinite(t)) return 0.25
  const onda = (Math.sin(t * 0.55) * 0.6 + Math.sin(t * 0.23 + 2.1) * 0.4 + 1) / 2
  return 0.2 + 0.8 * Math.pow(Math.max(0, onda), 2.2)
}

// Folga para o grão sumir de vez antes de ser recolocado.
const MARGEM = 24

export function passoDoGrao(grao, dt, rajada, largura, altura, sorteio = Math.random) {
  const bruto = Number(dt)
  const passo = Number.isFinite(bruto) && bruto > 0 ? Math.min(bruto, PASSO_MAXIMO) : 0
  const sopro = Number.isFinite(Number(rajada)) ? Number(rajada) : 0
  const L = Number.isFinite(Number(largura)) && largura > 0 ? Number(largura) : 1
  const A = Number.isFinite(Number(altura)) && altura > 0 ? Number(altura) : 1

  grao.x += grao.vx * sopro * passo
  grao.fase += grao.velFase * passo
  grao.y += (grao.deriva + Math.sin(grao.fase) * grao.balanco) * passo

  // SAIU PELA DIREITA: volta pela esquerda já sorteado de novo. Reaproveitar
  // o objeto mantém a lista do mesmo tamanho a tarde inteira.
  if (grao.x - grao.comprimento > L) {
    Object.assign(grao, criarGrao(L, A, sorteio))
    grao.x = -grao.comprimento - MARGEM
  }

  // A DERIVA VERTICAL dá a volta sem resortear: o grão só deslizou para fora
  // de cima ou de baixo, e continua sendo o mesmo grão atravessando.
  if (grao.y < -MARGEM) grao.y = A + MARGEM / 2
  else if (grao.y > A + MARGEM) grao.y = -MARGEM / 2

  return grao
}

// O DESENHO DO GRÃO: uma elipse deitada, com a origem no centro.
// Vai direto no contexto, sem sprite — diferente da folha. A folha tem um
// contorno trabalhoso que vale desenhar uma vez e reaproveitar; o grão é uma
// primitiva, e reduzir um sprite quadrado até virar um risco fino só deixaria
// a borda borrada.
export function desenharGraoDeAreia(ctx, comprimento, espessura) {
  const C = Number(comprimento) > 0 ? Number(comprimento) : 1
  const E = Number(espessura) > 0 ? Number(espessura) : 1
  ctx.beginPath()
  ctx.ellipse(0, 0, C / 2, E / 2, 0, 0, Math.PI * 2)
  ctx.fill()
}
