import { describe, it, expect } from 'vitest'
import {
  COR_BOLHA,
  COR_BRILHO,
  quantasBolhas,
  criarBolha,
  raioDaBolha,
  estouroDaBolha,
  passoDaBolha,
  desenharBolha,
} from '@/lib/bolhas'
import { PASSO_MAXIMO } from '@/lib/folhas'

// ---------------------------------------------------------------------------
// AS BOLHAS DA ILHA DOS LAGOS
//
// POR QUE O CONTORNO ESCURO NÃO TINHA RESOLVIDO. Já houve uma tentativa de
// fazer as bolhas aparecerem sobre o céu turquesa claro, dando contorno a
// elas (está no comentário antigo do CSS). Não bastou, porque a bolha
// continuou sendo um DISCO PINTADO. Bolha de verdade é uma CASCA
// TRANSPARENTE: vê-se o fundo através dela.
//
// O que o olho reconhece como bolha não é o preenchimento — é o anel da
// borda, o BRILHO ESPECULAR no canto de cima e o escurecimento embaixo.
//
// E o movimento: ela ACELERA (empuxo), sobe em ZIGUE-ZAGUE (bolha real
// sobe em espiral), CRESCE no caminho (a pressão cai) e ESTOURA no fim.
// Bolha que some por desbotamento é o que mais entrega que aquilo não é
// água.
// ---------------------------------------------------------------------------

function sorteioFixo(valores) {
  let i = 0
  return () => {
    const v = valores[i % valores.length]
    i += 1
    return v
  }
}

describe('quantasBolhas', () => {
  it('acompanha a largura, com piso e teto', () => {
    expect(quantasBolhas(1600)).toBeGreaterThan(quantasBolhas(500))
    expect(quantasBolhas(320)).toBeGreaterThanOrEqual(16)
    expect(quantasBolhas(6000)).toBeLessThanOrEqual(40)
  })

  it('largura inválida não devolve lixo', () => {
    expect(quantasBolhas(NaN)).toBeGreaterThanOrEqual(16)
    expect(quantasBolhas(undefined)).toBeGreaterThanOrEqual(16)
  })
})

describe('as cores da bolha', () => {
  const lum = (hex) => {
    const h = hex.replace('#', '')
    const canal = (i) => {
      const c = parseInt(h.slice(i, i + 2), 16) / 255
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
    }
    return 0.2126 * canal(0) + 0.7152 * canal(2) + 0.0722 * canal(4)
  }
  const contra = (hex, fundo) => {
    const a = lum(hex)
    const b = lum(fundo)
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
  }

  it('o anel é escuro o bastante para existir sobre o céu turquesa', () => {
    // os turquesas claros da arte dão 1,31:1 contra o céu — somem
    expect(contra(COR_BOLHA, '#b3ece7'), 'o anel clareou e vai sumir').toBeGreaterThan(2.5)
  })

  it('o brilho é claro, senão não parece reflexo de luz', () => {
    expect(lum(COR_BRILHO)).toBeGreaterThan(lum(COR_BOLHA))
  })
})

describe('criarBolha', () => {
  it('nasce com os traços que o desenho precisa', () => {
    const b = criarBolha(800, 600, sorteioFixo([0.5]))
    expect(Number.isFinite(b.x)).toBe(true)
    expect(Number.isFinite(b.y)).toBe(true)
    expect(b.raioInicial).toBeGreaterThan(0)
    expect(b.vy).toBeGreaterThan(0)
    expect(b.vida).toBeGreaterThan(0)
    expect(b.nitidez).toBeGreaterThanOrEqual(0)
    expect(b.nitidez).toBeLessThanOrEqual(1)
  })

  it('nasce na parte de baixo: bolha vem da água, não do céu', () => {
    const A = 600
    let embaixo = 0
    for (let i = 0; i < 300; i += 1) {
      if (criarBolha(800, A).y > A * 0.55) embaixo += 1
    }
    expect(embaixo, `só ${embaixo} de 300 nasceram embaixo`).toBeGreaterThan(250)
  })

  it('os tamanhos variam muito: bolha grande e bolha miúda na mesma cena', () => {
    const raios = []
    for (let i = 0; i < 200; i += 1) raios.push(criarBolha(800, 600).raioInicial)
    expect(Math.max(...raios) / Math.min(...raios)).toBeGreaterThan(2.5)
  })
})

describe('raioDaBolha', () => {
  it('A BOLHA CRESCE enquanto sobe: a pressão cai', () => {
    const b = { idade: 0, vida: 4, raioInicial: 10, crescimento: 0.5 }
    expect(raioDaBolha({ ...b, idade: 3 })).toBeGreaterThan(raioDaBolha(b))
  })

  it('valor inválido devolve um raio utilizável', () => {
    expect(raioDaBolha({})).toBeGreaterThan(0)
    expect(raioDaBolha({ idade: NaN, vida: 2, raioInicial: 8 })).toBeGreaterThan(0)
  })
})

describe('estouroDaBolha', () => {
  it('não estoura no começo nem no meio da vida', () => {
    expect(estouroDaBolha({ idade: 0, vida: 4 })).toBe(0)
    expect(estouroDaBolha({ idade: 2, vida: 4 })).toBe(0)
  })

  it('ESTOURA no fim, e o estouro cresce até o último instante', () => {
    const quase = estouroDaBolha({ idade: 3.9, vida: 4 })
    const fim = estouroDaBolha({ idade: 3.99, vida: 4 })
    expect(quase).toBeGreaterThan(0)
    expect(fim).toBeGreaterThan(quase)
    expect(fim).toBeLessThanOrEqual(1)
  })

  it('valor inválido não estoura, em vez de quebrar', () => {
    expect(estouroDaBolha({ idade: NaN, vida: 4 })).toBe(0)
    expect(estouroDaBolha({ idade: 1, vida: 0 })).toBe(0)
    expect(estouroDaBolha({})).toBe(0)
  })
})

describe('passoDaBolha', () => {
  const nova = () => criarBolha(800, 600, sorteioFixo([0.5]))

  it('a bolha SOBE', () => {
    const b = nova()
    const y0 = b.y
    passoDaBolha(b, 0.1, 800, 600)
    expect(b.y).toBeLessThan(y0)
  })

  it('ACELERA pelo empuxo: o segundo trecho anda mais que o primeiro', () => {
    const b = nova()
    b.vida = 999
    const y0 = b.y
    for (let i = 0; i < 20; i += 1) passoDaBolha(b, 1 / 60, 800, 600)
    const primeiro = y0 - b.y
    const y1 = b.y
    for (let i = 0; i < 20; i += 1) passoDaBolha(b, 1 / 60, 800, 600)
    expect(y1 - b.y).toBeGreaterThan(primeiro)
  })

  it('sobe em ZIGUE-ZAGUE, para os dois lados', () => {
    const b = nova()
    b.vida = 999
    const passos = []
    for (let i = 0; i < 500; i += 1) {
      const antes = b.x
      passoDaBolha(b, 1 / 60, 800, 600)
      passos.push(b.x - antes)
    }
    expect(Math.min(...passos)).toBeLessThan(0)
    expect(Math.max(...passos)).toBeGreaterThan(0)
  })

  it('a bolha que estourou volta a sair lá de baixo', () => {
    const b = nova()
    b.idade = b.vida + 1
    passoDaBolha(b, 1 / 60, 800, 600)
    expect(b.idade).toBeLessThan(0.1)
    expect(b.y).toBeGreaterThan(600 * 0.5)
  })

  it('um salto grande de tempo não teleporta a bolha', () => {
    const b = nova()
    const y0 = b.y
    passoDaBolha(b, 30, 800, 600)
    expect(y0 - b.y).toBeLessThan(b.vy * PASSO_MAXIMO * 3)
  })

  it('tempo inválido não estraga a bolha', () => {
    const b = nova()
    passoDaBolha(b, NaN, 800, 600)
    passoDaBolha(b, undefined, 800, 600)
    expect(Number.isFinite(b.x)).toBe(true)
    expect(Number.isFinite(b.y)).toBe(true)
  })
})

describe('desenharBolha', () => {
  const pintar = (opcoes = {}) => {
    const chamadas = []
    const ctx = new Proxy(
      {},
      {
        get: (_, nome) => {
          if (nome === 'createRadialGradient') {
            return (...args) => {
              chamadas.push(['createRadialGradient', ...args])
              return { addColorStop: (onde, cor) => chamadas.push(['stop', onde, cor]) }
            }
          }
          return (...args) => chamadas.push([String(nome), ...args])
        },
        set: () => true,
      }
    )
    desenharBolha(ctx, { raio: 14, nitidez: 1, alfa: 1, ...opcoes })
    return chamadas
  }

  it('É UM ANEL, não um disco cheio: o miolo deixa ver o céu', () => {
    const paradas = pintar().filter((c) => c[0] === 'stop')
    expect(paradas.length).toBeGreaterThanOrEqual(4)
    // a primeira parada (o centro da bolha) tem de ser transparente
    expect(String(paradas[0][2]), 'o miolo da bolha está pintado').toMatch(/,\s*0\)$/)
  })

  it('tem BRILHO ESPECULAR, e ele fica no quadrante de cima', () => {
    const arcos = pintar().filter((c) => c[0] === 'arc')
    expect(arcos.length, 'faltou o brilho, que é um segundo desenho').toBeGreaterThanOrEqual(2)
    // arc(x, y, r, ...): o brilho é deslocado para cima (y negativo)
    const brilho = arcos[arcos.length - 1]
    expect(brilho[2], 'o brilho tem de ser menor que a bolha').toBeLessThan(14)
    expect(brilho[1], 'o brilho tem de ficar na parte de cima').toBeLessThan(0)
  })

  it('a bolha do FUNDO tem o anel mais difuso que a da FRENTE', () => {
    // mesmo truque do Fogo: o desfoque é a forma do degradê, não um filtro
    // o anel vai da parada onde ele COMEÇA (a segunda, ainda transparente)
    // até a borda. Medir do zero pegaria o degradê inteiro, que vai sempre
    // de 0 a 1 e não diria nada.
    const larguraDoAnel = (nitidez) => {
      const p = pintar({ nitidez }).filter((c) => c[0] === 'stop').map((c) => c[1])
      return p[p.length - 1] - p[1]
    }
    expect(larguraDoAnel(0)).toBeGreaterThan(larguraDoAnel(1))
  })

  it('as paradas do degradê ficam em ordem, seja qual for a nitidez', () => {
    for (const n of [0, 0.5, 1, NaN, undefined]) {
      const p = pintar({ nitidez: n }).filter((c) => c[0] === 'stop').map((c) => c[1])
      for (let i = 1; i < p.length; i += 1) {
        expect(p[i], `parada fora de ordem com nitidez ${n}`).toBeGreaterThanOrEqual(p[i - 1])
      }
      expect(p[p.length - 1]).toBeLessThanOrEqual(1)
    }
  })

  it('raio inválido não quebra', () => {
    expect(() => pintar({ raio: 0 })).not.toThrow()
    expect(() => pintar({ raio: NaN, alfa: NaN })).not.toThrow()
  })
})
