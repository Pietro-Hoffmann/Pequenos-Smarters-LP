import { describe, it, expect } from 'vitest'
import {
  TONS,
  PASSO_MAXIMO,
  quantasFolhas,
  criarFolha,
  ventoNoInstante,
  passoDaFolha,
  desenharContornoDeFolha,
} from '@/lib/folhas'

// ---------------------------------------------------------------------------
// A FÍSICA DAS FOLHAS DA ILHA DA NATUREZA
//
// Estas são as contas puras, sem tela e sem navegador: dado uma folha, um
// intervalo de tempo e o vento daquele instante, onde ela vai parar. Ficam
// separadas do canvas de propósito — é o que deixa o comportamento ser
// conferido sem precisar de um navegador de verdade.
//
// O que estes testes protegem:
//   • folha cai, balança de lado e gira (os três movimentos independentes);
//   • folha que sai por baixo volta por cima, e nunca some para sempre;
//   • um salto grande de tempo (aba que ficou parada) não teleporta ninguém;
//   • a quantidade acompanha a largura da tela, com piso e teto.
// ---------------------------------------------------------------------------

// Sorteio previsível: devolve os números da lista, em roda. Serve para
// montar uma folha exata e conferir conta por conta.
function sorteioFixo(valores) {
  let i = 0
  return () => {
    const v = valores[i % valores.length]
    i += 1
    return v
  }
}

describe('quantasFolhas', () => {
  it('acompanha a largura da tela', () => {
    expect(quantasFolhas(1600)).toBeGreaterThan(quantasFolhas(700))
  })

  it('tem piso: num celular estreito ainda caem folhas', () => {
    expect(quantasFolhas(320)).toBeGreaterThanOrEqual(18)
  })

  it('tem teto: num monitor enorme não vira chuva de folha', () => {
    expect(quantasFolhas(5000)).toBeLessThanOrEqual(60)
  })

  it('largura inválida não quebra nem devolve lixo', () => {
    expect(quantasFolhas(0)).toBeGreaterThanOrEqual(18)
    expect(quantasFolhas(NaN)).toBeGreaterThanOrEqual(18)
    expect(quantasFolhas(undefined)).toBeGreaterThanOrEqual(18)
  })
})

describe('criarFolha', () => {
  it('nasce dentro da tela e com os traços que o desenho precisa', () => {
    const folha = criarFolha(800, 600, sorteioFixo([0.5]))
    expect(folha.x).toBeGreaterThanOrEqual(0)
    expect(folha.x).toBeLessThanOrEqual(800)
    expect(folha.y).toBeLessThanOrEqual(600)
    expect(folha.tamanho).toBeGreaterThan(0)
    expect(folha.vy).toBeGreaterThan(0)
    expect(folha.opacidade).toBeGreaterThan(0)
    expect(folha.opacidade).toBeLessThanOrEqual(1)
    expect(TONS[folha.tom]).toBeTruthy()
  })

  it('duas folhas sorteadas diferente não caem iguais', () => {
    const a = criarFolha(800, 600, sorteioFixo([0.1]))
    const b = criarFolha(800, 600, sorteioFixo([0.9]))
    expect(a.vy).not.toBeCloseTo(b.vy, 3)
    expect(a.tamanho).not.toBeCloseTo(b.tamanho, 3)
  })

  it('a folha do fundo é menor, mais lenta e mais pálida que a da frente', () => {
    // é essa diferença que cria a profundidade: sem ela todas parecem
    // estar coladas no mesmo vidro
    const fundo = criarFolha(800, 600, sorteioFixo([0.02]))
    const frente = criarFolha(800, 600, sorteioFixo([0.98]))
    expect(fundo.tamanho).toBeLessThan(frente.tamanho)
    expect(fundo.vy).toBeLessThan(frente.vy)
    expect(fundo.opacidade).toBeLessThan(frente.opacidade)
  })
})

describe('ventoNoInstante', () => {
  it('muda com o tempo, e não é sempre o mesmo empurrão', () => {
    const amostras = [0, 3, 7, 11, 19, 31].map(ventoNoInstante)
    const unicos = new Set(amostras.map((v) => v.toFixed(3)))
    expect(unicos.size).toBeGreaterThan(3)
  })

  it('sopra para os dois lados', () => {
    const amostras = []
    for (let t = 0; t < 120; t += 0.7) amostras.push(ventoNoInstante(t))
    expect(Math.min(...amostras)).toBeLessThan(0)
    expect(Math.max(...amostras)).toBeGreaterThan(0)
  })

  it('nunca vira um furacão', () => {
    for (let t = 0; t < 600; t += 0.3) {
      expect(Math.abs(ventoNoInstante(t))).toBeLessThan(60)
    }
  })
})

describe('passoDaFolha', () => {
  const nova = () => criarFolha(800, 600, sorteioFixo([0.5]))

  it('a folha cai', () => {
    const folha = nova()
    const antes = folha.y
    passoDaFolha(folha, 0.016, 0, 800, 600)
    expect(folha.y).toBeGreaterThan(antes)
  })

  it('o vento empurra para o lado que está soprando', () => {
    const paraDireita = nova()
    const paraEsquerda = { ...paraDireita }
    passoDaFolha(paraDireita, 0.016, 200, 800, 600)
    passoDaFolha(paraEsquerda, 0.016, -200, 800, 600)
    expect(paraDireita.x).toBeGreaterThan(paraEsquerda.x)
  })

  it('a folha gira no próprio eixo enquanto cai', () => {
    const folha = nova()
    const antes = folha.giro
    passoDaFolha(folha, 0.1, 0, 800, 600)
    expect(folha.giro).not.toBeCloseTo(antes, 5)
  })

  it('o balanço leva a folha para os dois lados, não só para um', () => {
    // sem vento nenhum: o que sobra é o vaivém. Se ele fosse só para um
    // lado, a "queda" viraria uma diagonal reta.
    const folha = nova()
    folha.x = 400
    const caminho = []
    for (let i = 0; i < 600; i += 1) {
      const antes = folha.x
      passoDaFolha(folha, 0.016, 0, 800, 600)
      caminho.push(folha.x - antes)
    }
    expect(Math.min(...caminho)).toBeLessThan(0)
    expect(Math.max(...caminho)).toBeGreaterThan(0)
  })

  it('folha que sai por baixo volta por cima', () => {
    const folha = nova()
    folha.y = 10000
    passoDaFolha(folha, 0.016, 0, 800, 600)
    expect(folha.y).toBeLessThan(0)
  })

  it('folha que sai pela lateral reaparece do outro lado', () => {
    const folha = nova()
    folha.x = 100000
    passoDaFolha(folha, 0.016, 0, 800, 600)
    expect(folha.x).toBeLessThan(0)

    folha.x = -100000
    passoDaFolha(folha, 0.016, 0, 800, 600)
    expect(folha.x).toBeGreaterThan(800)
  })

  it('um salto grande de tempo não teleporta a folha', () => {
    // a aba ficou minutos em segundo plano, ou o aparelho travou: sem trava
    // o próximo quadro jogaria a folha quilômetros para baixo de uma vez
    const folha = nova()
    const antes = folha.y
    passoDaFolha(folha, 30, 0, 800, 600)
    expect(folha.y - antes).toBeLessThanOrEqual(folha.vy * PASSO_MAXIMO + 0.001)
  })

  it('tempo inválido não estraga a posição da folha', () => {
    const folha = nova()
    const antes = { x: folha.x, y: folha.y }
    passoDaFolha(folha, NaN, 0, 800, 600)
    passoDaFolha(folha, undefined, NaN, 800, 600)
    expect(Number.isFinite(folha.x)).toBe(true)
    expect(Number.isFinite(folha.y)).toBe(true)
    expect(folha.y).toBeGreaterThanOrEqual(antes.y)
  })
})

describe('desenharContornoDeFolha', () => {
  it('desenha um contorno fechado, e não um retângulo', () => {
    const chamadas = []
    const ctx = new Proxy(
      {},
      {
        get: (_, nome) => (...args) => chamadas.push([String(nome), ...args]),
      }
    )
    desenharContornoDeFolha(ctx, 40)
    const nomes = chamadas.map((c) => c[0])
    expect(nomes).toContain('beginPath')
    expect(nomes).toContain('moveTo')
    // são as curvas que fazem a folha ter bico em cima e embaixo
    expect(nomes.filter((n) => n === 'quadraticCurveTo').length).toBeGreaterThanOrEqual(2)
    expect(nomes).toContain('fill')
    expect(nomes, 'folha não é um quadrado').not.toContain('fillRect')
  })
})
