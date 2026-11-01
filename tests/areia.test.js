import { describe, it, expect } from 'vitest'
import {
  TONS_AREIA,
  quantosGraos,
  criarGrao,
  rajadaNoInstante,
  passoDoGrao,
  desenharGraoDeAreia,
} from '@/lib/areia'
import { PASSO_MAXIMO } from '@/lib/folhas'

// ---------------------------------------------------------------------------
// A FÍSICA DA AREIA DA ILHA DO DESERTO
//
// A areia não é folha com outra cor. São três diferenças de comportamento,
// e cada uma tem teste aqui:
//
//   1. ela ATRAVESSA, não cai. No CSS antigo os pontos do Deserto SUBIAM,
//      como fumaça — movimento errado para areia soprada;
//   2. ela vem em LUFADAS. Areia constante vira chuvisco; o vento precisa
//      ter pico e vale;
//   3. ela é mais densa EMBAIXO, perto do chão de onde é levantada.
// ---------------------------------------------------------------------------

function sorteioFixo(valores) {
  let i = 0
  return () => {
    const v = valores[i % valores.length]
    i += 1
    return v
  }
}

describe('quantosGraos', () => {
  it('a areia é bem mais densa que as folhas', () => {
    // folha é objeto grande e raro; grão de areia é miudinho e aos montes
    expect(quantosGraos(1440)).toBeGreaterThan(90)
  })

  it('acompanha a largura, com piso e teto', () => {
    expect(quantosGraos(1600)).toBeGreaterThan(quantosGraos(500))
    expect(quantosGraos(320)).toBeGreaterThanOrEqual(55)
    expect(quantosGraos(6000)).toBeLessThanOrEqual(170)
  })

  it('largura inválida não devolve lixo', () => {
    expect(quantosGraos(NaN)).toBeGreaterThanOrEqual(55)
    expect(quantosGraos(undefined)).toBeGreaterThanOrEqual(55)
  })
})

describe('criarGrao', () => {
  it('nasce dentro da tela e com os traços do desenho', () => {
    const grao = criarGrao(800, 600, sorteioFixo([0.5]))
    expect(grao.x).toBeGreaterThanOrEqual(0)
    expect(grao.x).toBeLessThanOrEqual(800)
    expect(grao.y).toBeGreaterThanOrEqual(0)
    expect(grao.y).toBeLessThanOrEqual(600)
    expect(grao.comprimento).toBeGreaterThan(0)
    expect(grao.vx).toBeGreaterThan(0)
    expect(TONS_AREIA[grao.tom]).toBeTruthy()
  })

  it('o grão é um RISCO, não uma bolinha: comprido e fino', () => {
    // é o alongamento na direção do movimento que o olho lê como velocidade
    const grao = criarGrao(800, 600, sorteioFixo([0.5]))
    expect(grao.comprimento).toBeGreaterThan(grao.espessura * 1.8)
  })

  it('o grão da frente é maior, mais rápido e mais firme que o do fundo', () => {
    const fundo = criarGrao(800, 600, sorteioFixo([0.02]))
    const frente = criarGrao(800, 600, sorteioFixo([0.98]))
    expect(fundo.comprimento).toBeLessThan(frente.comprimento)
    expect(fundo.vx).toBeLessThan(frente.vx)
    expect(fundo.opacidade).toBeLessThan(frente.opacidade)
  })

  it('a areia se junta embaixo: mais grãos na metade de baixo que na de cima', () => {
    const altura = 600
    let embaixo = 0
    for (let i = 0; i < 400; i += 1) {
      if (criarGrao(800, altura).y > altura / 2) embaixo += 1
    }
    expect(embaixo, `só ${embaixo} de 400 nasceram embaixo`).toBeGreaterThan(240)
  })
})

describe('rajadaNoInstante', () => {
  it('tem pico e vale: é lufada, não sopro constante', () => {
    const amostras = []
    for (let t = 0; t < 180; t += 0.25) amostras.push(rajadaNoInstante(t))
    expect(Math.max(...amostras), 'falta o pico da lufada').toBeGreaterThan(0.85)
    expect(Math.min(...amostras), 'falta o vale entre as lufadas').toBeLessThan(0.45)
  })

  it('nunca para de todo nem estoura', () => {
    for (let t = 0; t < 600; t += 0.3) {
      const r = rajadaNoInstante(t)
      expect(r).toBeGreaterThan(0.15)
      expect(r).toBeLessThanOrEqual(1.01)
    }
  })

  it('passa mais tempo no vale que no pico: lufada é evento, não rotina', () => {
    let noPico = 0
    let total = 0
    for (let t = 0; t < 400; t += 0.2) {
      total += 1
      if (rajadaNoInstante(t) > 0.7) noPico += 1
    }
    expect(noPico / total).toBeLessThan(0.45)
  })

  it('tempo inválido não quebra', () => {
    expect(Number.isFinite(rajadaNoInstante(NaN))).toBe(true)
    expect(Number.isFinite(rajadaNoInstante(undefined))).toBe(true)
  })
})

describe('passoDoGrao', () => {
  const novo = () => criarGrao(800, 600, sorteioFixo([0.5]))

  it('a areia ATRAVESSA: anda muito mais de lado do que para baixo', () => {
    // este é o teste que pega a volta do defeito antigo, em que a areia subia
    const grao = novo()
    const x0 = grao.x
    const y0 = grao.y
    for (let i = 0; i < 60; i += 1) passoDoGrao(grao, 1 / 60, 1, 800, 600)
    expect(Math.abs(grao.x - x0)).toBeGreaterThan(Math.abs(grao.y - y0) * 4)
  })

  it('a lufada acelera: com rajada forte o grão anda mais', () => {
    const fraco = novo()
    const forte = { ...fraco }
    passoDoGrao(fraco, 0.016, 0.3, 800, 600)
    passoDoGrao(forte, 0.016, 1, 800, 600)
    expect(forte.x).toBeGreaterThan(fraco.x)
  })

  it('grão que sai pela direita volta pela esquerda', () => {
    const grao = novo()
    grao.x = 100000
    passoDoGrao(grao, 0.016, 1, 800, 600)
    expect(grao.x).toBeLessThan(0)
  })

  it('grão que deriva para fora por cima ou por baixo reaparece do outro lado', () => {
    const grao = novo()
    grao.y = -500
    passoDoGrao(grao, 0.016, 1, 800, 600)
    expect(grao.y).toBeGreaterThan(0)

    grao.y = 5000
    passoDoGrao(grao, 0.016, 1, 800, 600)
    expect(grao.y).toBeLessThan(600)
  })

  it('um salto grande de tempo não teleporta o grão', () => {
    const grao = novo()
    const x0 = grao.x
    passoDoGrao(grao, 30, 1, 800, 600)
    expect(grao.x - x0).toBeLessThanOrEqual(grao.vx * PASSO_MAXIMO + 0.001)
  })

  it('tempo ou rajada inválidos não estragam a posição', () => {
    const grao = novo()
    passoDoGrao(grao, NaN, 1, 800, 600)
    passoDoGrao(grao, 0.016, NaN, 800, 600)
    passoDoGrao(grao, undefined, undefined, 800, 600)
    expect(Number.isFinite(grao.x)).toBe(true)
    expect(Number.isFinite(grao.y)).toBe(true)
  })
})

describe('desenharGraoDeAreia', () => {
  it('desenha um risco deitado, e não um círculo', () => {
    const chamadas = []
    const ctx = new Proxy(
      {},
      { get: (_, nome) => (...args) => chamadas.push([String(nome), ...args]) }
    )
    desenharGraoDeAreia(ctx, 9, 2)
    const nomes = chamadas.map((c) => c[0])
    expect(nomes).toContain('beginPath')
    expect(nomes).toContain('ellipse')
    expect(nomes).toContain('fill')

    const elipse = chamadas.find((c) => c[0] === 'ellipse')
    // ellipse(x, y, raioX, raioY, ...): o raio horizontal tem de ser o maior
    expect(elipse[3], 'o grão precisa ser mais comprido que alto').toBeGreaterThan(elipse[4])
  })
})
