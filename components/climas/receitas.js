// components/climas/receitas.js
// ---------------------------------------------------------------------------
// AS RECEITAS DE CADA CLIMA
//
// Uma receita diz três coisas e nada mais: como o clima nasce quando a tela
// é medida, como ele anda a cada quadro, e como é pintado. O laço, a
// medição e os três freios vivem no usarTelaDeClima.js e valem para todos.
//
// A física fica no lib/ (sem DOM, conferida pelos testes); aqui mora só o
// que precisa de tela: os sprites e as chamadas de desenho.
//
// Clima que não aparece neste mapa continua sendo pintado pelas camadas de
// CSS do Ilhas.module.css — é assim que Fogo, Gelo, Lagos e Vento seguem
// funcionando enquanto não chega a vez deles.
// ---------------------------------------------------------------------------

import {
  TONS,
  quantasFolhas,
  criarFolha,
  ventoNoInstante,
  passoDaFolha,
  desenharContornoDeFolha,
} from '@/lib/folhas'
import {
  TONS_VENTO,
  quantasCorrentes,
  criarCorrente,
  segmentosDoRastro,
  envelopeDaCorrente,
  passoDaCorrente,
} from '@/lib/vento'
import {
  TONS_AREIA,
  quantosGraos,
  criarGrao,
  rajadaNoInstante,
  passoDoGrao,
  desenharGraoDeAreia,
} from '@/lib/areia'

// ===========================================================================
// NATUREZA — folhas caindo
// A folha tem um contorno trabalhoso (duas curvas e uma nervura), então vale
// desenhá-la UMA vez fora da tela, num sprite por tom, e a cada quadro só
// reposicionar, girar e achatar o sprite pronto.
// ===========================================================================

const LADO_SPRITE = 56

// Quanto a folha chega a afinar quando fica "de perfil". Zero faria ela
// sumir por completo e piscar; 0,22 deixa ela virar um fiapo e voltar.
const PERFIL_MINIMO = 0.22

function montarSpritesDeFolha(densidade) {
  const lado = Math.round(LADO_SPRITE * densidade)
  return TONS.map((cor) => {
    const sprite = document.createElement('canvas')
    sprite.width = lado
    sprite.height = lado
    const pincel = typeof sprite.getContext === 'function' ? sprite.getContext('2d') : null
    if (!pincel) return null
    pincel.setTransform(densidade, 0, 0, densidade, 0, 0)
    pincel.translate(LADO_SPRITE / 2, LADO_SPRITE / 2)
    pincel.fillStyle = cor
    pincel.strokeStyle = 'rgba(18, 48, 16, 0.55)'
    pincel.lineWidth = 1.3
    pincel.lineJoin = 'round'
    pincel.lineCap = 'round'
    desenharContornoDeFolha(pincel, LADO_SPRITE * 0.86)
    return sprite
  })
}

export const RECEITA_NATUREZA = {
  preparar(ctx, L, A, densidade) {
    const folhas = []
    const quantas = quantasFolhas(L)
    for (let i = 0; i < quantas; i += 1) folhas.push(criarFolha(L, A))
    return { folhas, sprites: montarSpritesDeFolha(densidade) }
  },

  andar(estado, dt, relogio, L, A) {
    const vento = ventoNoInstante(relogio)
    for (let i = 0; i < estado.folhas.length; i += 1) {
      passoDaFolha(estado.folhas[i], dt, vento, L, A)
    }
  },

  pintar(ctx, estado) {
    for (let i = 0; i < estado.folhas.length; i += 1) {
      const folha = estado.folhas[i]
      const sprite = estado.sprites[folha.tom]
      if (!sprite) continue
      // O VIRAR DE PERFIL: a largura da folha encolhe e volta conforme ela
      // gira no eixo de pé. É este achatamento, mais que a rotação, que dá a
      // sensação de que a folha tem frente e verso.
      const perfil = PERFIL_MINIMO + (1 - PERFIL_MINIMO) * Math.abs(Math.cos(folha.fase3d))
      const lado = folha.tamanho
      ctx.save()
      ctx.globalAlpha = folha.opacidade
      ctx.translate(folha.x, folha.y)
      ctx.rotate(folha.giro)
      ctx.scale(perfil, 1)
      ctx.drawImage(sprite, -lado / 2, -lado / 2, lado, lado)
      ctx.restore()
    }
  },
}

// ===========================================================================
// DESERTO — areia atravessando em lufadas
// Sem sprite, ao contrário da folha: o grão é uma elipse, que é primitiva do
// próprio canvas. Reduzir um sprite quadrado até virar um risco de 2px de
// altura só deixaria a borda borrada.
// ===========================================================================

export const RECEITA_DESERTO = {
  preparar(ctx, L, A) {
    const graos = []
    const quantos = quantosGraos(L)
    for (let i = 0; i < quantos; i += 1) graos.push(criarGrao(L, A))
    return { graos }
  },

  andar(estado, dt, relogio, L, A) {
    const rajada = rajadaNoInstante(relogio)
    for (let i = 0; i < estado.graos.length; i += 1) {
      passoDoGrao(estado.graos[i], dt, rajada, L, A)
    }
    estado.rajada = rajada
  },

  pintar(ctx, estado) {
    for (let i = 0; i < estado.graos.length; i += 1) {
      const grao = estado.graos[i]
      // O RISCO SE ESTICA NA LUFADA: na rajada forte o grão é desenhado mais
      // comprido, como um rastro. É o mesmo truque do borrão de movimento, e
      // é o que faz a lufada ser sentida além de ser medida.
      const esticado = grao.comprimento * (0.75 + 1.25 * (estado.rajada || 0.4))
      ctx.save()
      ctx.globalAlpha = grao.opacidade
      ctx.fillStyle = TONS_AREIA[grao.tom]
      ctx.translate(grao.x, grao.y)
      ctx.rotate(grao.inclinacao)
      desenharGraoDeAreia(ctx, esticado, grao.espessura)
      ctx.restore()
    }
  },
}

// ===========================================================================
// VENTO — correntes de ar em arco
// Nem sprite nem elipse: aqui o desenho é um TRAÇO que segue o arco e afina
// para trás. Cada corrente vira uma fieira de segmentos curtos com alfa e
// espessura crescentes da cauda para a cabeça — é esse afinamento que dá
// direção ao vento sem precisar de nenhuma seta.
// ===========================================================================

// Quantos pedaços formam o rastro. A semente (rastro curtíssimo) não precisa
// de doze: com três já fica o pontinho redondo que ela deve ser, e isso
// economiza dois terços das chamadas de desenho dela.
const PEDACOS_DO_RASTRO = 12
const PEDACOS_DA_SEMENTE = 3

export const RECEITA_VENTO = {
  preparar(ctx, L, A) {
    const correntes = []
    const quantas = quantasCorrentes(L)
    for (let i = 0; i < quantas; i += 1) correntes.push(criarCorrente(L, A))
    return { correntes }
  },

  andar(estado, dt, relogio, L, A) {
    for (let i = 0; i < estado.correntes.length; i += 1) {
      passoDaCorrente(estado.correntes[i], dt, L, A)
    }
  },

  pintar(ctx, estado) {
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    for (let i = 0; i < estado.correntes.length; i += 1) {
      const c = estado.correntes[i]
      const pontos = segmentosDoRastro(
        c,
        c.semente ? PEDACOS_DA_SEMENTE : PEDACOS_DO_RASTRO
      )
      if (pontos.length < 2) continue
      // o envelope acende a corrente enquanto ela entra e apaga enquanto
      // sai: sem ele o arco apareceria e sumiria do nada no meio do céu,
      // já que ele não atravessa a tela de ponta a ponta
      const aceso = c.opacidade * envelopeDaCorrente(c.progresso)
      if (aceso <= 0.01) continue
      ctx.strokeStyle = TONS_VENTO[c.tom]
      for (let j = 1; j < pontos.length; j += 1) {
        const atras = pontos[j - 1]
        const frente = pontos[j]
        // A RAIZ é o que dá corpo ao rastro. Com a força crua (linear), só
        // o último doze avos do traço ficava forte e todo o resto saía
        // pálido — na tela a corrente virava um fiapo. A raiz mantém a
        // maior parte do rastro firme e deixa só a pontinha se dissolver.
        const vigor = Math.sqrt(frente.forca)
        ctx.globalAlpha = aceso * vigor
        ctx.lineWidth = c.espessura * (0.3 + 0.7 * vigor)
        ctx.beginPath()
        ctx.moveTo(atras.x, atras.y)
        ctx.lineTo(frente.x, frente.y)
        ctx.stroke()
      }
    }
  },
}

// O mapa que o ClimaCanvas consulta. Tema de fora desta lista não ganha
// tela de desenho nenhuma, e continua no CSS.
const RECEITAS = {
  natureza: RECEITA_NATUREZA,
  deserto: RECEITA_DESERTO,
  vento: RECEITA_VENTO,
}

export default RECEITAS
