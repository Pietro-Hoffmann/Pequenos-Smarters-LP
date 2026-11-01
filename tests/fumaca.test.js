import { describe, it, expect } from 'vitest'
import {
  COR_FUMACA,
  ALFA_MAXIMO,
  quantasBaforadas,
  criarBaforada,
  opacidadeDaBaforada,
  raioDaBaforada,
  passoDaBaforada,
  desenharBaforada,
} from '@/lib/fumaca'
import { PASSO_MAXIMO } from '@/lib/folhas'

// ---------------------------------------------------------------------------
// A FUMAÇA DO VULCÃO DA ILHA DO FOGO
//
// A arte da ilha tem um vulcão soltando fumaça, e o clima não tinha
// nenhuma. São poucas baforadas largas, lentas e muito translúcidas que
// sobem do centro e se abrem enquanto sobem.
//
// DUAS COISAS QUE NÃO PODEM DAR ERRADO:
//   • a cor. Fumaça clara sobre céu pêssego claro tem 1,07:1 de contraste,
//     ou seja, não existe. Medido em 1/11, como já tinha acontecido com as
//     brasas. Esta fumaça puxa para a FULIGEM;
//   • a opacidade. Isto passa POR TRÁS do texto da seção. Por mais bonita
//     que fique, nenhuma baforada pode chegar perto de encobrir a leitura.
// ---------------------------------------------------------------------------

function sorteioFixo(valores) {
  let i = 0
  return () => {
    const v = valores[i % valores.length]
    i += 1
    return v
  }
}

describe('quantasBaforadas', () => {
  it('são poucas: baforada é enorme, não é partícula', () => {
    expect(quantasBaforadas(1440)).toBeLessThan(12)
    expect(quantasBaforadas(1440)).toBeGreaterThan(3)
  })

  it('largura inválida não devolve lixo', () => {
    expect(quantasBaforadas(NaN)).toBeGreaterThanOrEqual(4)
    expect(quantasBaforadas(undefined)).toBeGreaterThanOrEqual(4)
  })
})

describe('a cor da fumaça', () => {
  it('é fuligem, não é fumaça clara', () => {
    // fumaça clara sobre o céu pêssego do Fogo tem 1,07:1 — some.
    // Este teste trava a decisão: a cor precisa ser escura.
    const lum = (hex) => {
      const h = hex.replace('#', '')
      const canal = (i) => {
        const c = parseInt(h.slice(i, i + 2), 16) / 255
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
      }
      return 0.2126 * canal(0) + 0.7152 * canal(2) + 0.0722 * canal(4)
    }
    const CEU = lum('#ffd0a6')
    const fumaca = lum(COR_FUMACA)
    const contraste = (Math.max(CEU, fumaca) + 0.05) / (Math.min(CEU, fumaca) + 0.05)
    expect(contraste, 'a fumaça clareou e vai sumir no céu').toBeGreaterThan(2.5)
  })
})

describe('criarBaforada', () => {
  it('nasce com os traços que o desenho precisa', () => {
    const b = criarBaforada(800, 600, sorteioFixo([0.5]))
    expect(Number.isFinite(b.x)).toBe(true)
    expect(Number.isFinite(b.y)).toBe(true)
    expect(b.raioInicial).toBeGreaterThan(0)
    expect(b.raioFinal).toBeGreaterThan(b.raioInicial)
    expect(b.vy).toBeGreaterThan(0)
    expect(b.vida).toBeGreaterThan(0)
  })

  it('nasce embaixo e ao centro, de onde sai o vulcão', () => {
    const L = 800
    const A = 600
    let certas = 0
    for (let i = 0; i < 300; i += 1) {
      const b = criarBaforada(L, A)
      if (b.y > A * 0.6 && b.x > L * 0.2 && b.x < L * 0.8) certas += 1
    }
    expect(certas, `só ${certas} de 300 saíram de onde deviam`).toBeGreaterThan(230)
  })

  it('sobe DEVAGAR: fumaça não é brasa', () => {
    for (let i = 0; i < 40; i += 1) {
      expect(criarBaforada(800, 600).vy).toBeLessThan(40)
    }
  })
})

describe('opacidadeDaBaforada', () => {
  it('nasce invisível, aparece e some de novo', () => {
    expect(opacidadeDaBaforada({ idade: 0, vida: 4, alfa: 0.14 })).toBe(0)
    expect(opacidadeDaBaforada({ idade: 4, vida: 4, alfa: 0.14 })).toBe(0)
    expect(opacidadeDaBaforada({ idade: 1.6, vida: 4, alfa: 0.14 })).toBeGreaterThan(0)
  })

  it('NUNCA chega perto de encobrir o texto que passa por trás', () => {
    // esta é a guarda que importa: a fumaça é enfeite de fundo
    for (let v = 0.5; v <= 6; v += 0.25) {
      for (let t = 0; t <= v; t += v / 40) {
        const a = opacidadeDaBaforada({ idade: t, vida: v, alfa: ALFA_MAXIMO })
        expect(a).toBeLessThanOrEqual(ALFA_MAXIMO + 1e-9)
      }
    }
    expect(ALFA_MAXIMO, 'o teto de opacidade da fumaça subiu demais').toBeLessThanOrEqual(0.2)
  })

  it('valor inválido apaga, em vez de quebrar', () => {
    expect(opacidadeDaBaforada({ idade: NaN, vida: 4, alfa: 0.1 })).toBe(0)
    expect(opacidadeDaBaforada({ idade: 1, vida: 0, alfa: 0.1 })).toBe(0)
    expect(opacidadeDaBaforada({})).toBe(0)
  })
})

describe('raioDaBaforada', () => {
  it('A BAFORADA SE ABRE enquanto sobe', () => {
    const b = { idade: 0, vida: 4, raioInicial: 20, raioFinal: 90 }
    const inicio = raioDaBaforada(b)
    const meio = raioDaBaforada({ ...b, idade: 2 })
    const fim = raioDaBaforada({ ...b, idade: 4 })
    expect(meio).toBeGreaterThan(inicio)
    expect(fim).toBeGreaterThan(meio)
    expect(inicio).toBeCloseTo(20, 4)
    expect(fim).toBeCloseTo(90, 4)
  })

  it('valor inválido devolve um raio utilizável', () => {
    expect(raioDaBaforada({})).toBeGreaterThan(0)
    expect(raioDaBaforada({ idade: NaN, vida: 2, raioInicial: 10, raioFinal: 40 })).toBeGreaterThan(0)
  })
})

describe('passoDaBaforada', () => {
  const nova = () => criarBaforada(800, 600, sorteioFixo([0.5]))

  it('sobe e envelhece', () => {
    const b = nova()
    const y0 = b.y
    passoDaBaforada(b, 0.1, 800, 600)
    expect(b.y).toBeLessThan(y0)
    expect(b.idade).toBeGreaterThan(0)
  })

  it('a baforada que acabou volta a sair lá de baixo', () => {
    const b = nova()
    b.idade = b.vida + 1
    passoDaBaforada(b, 1 / 60, 800, 600)
    expect(b.idade).toBeLessThan(0.1)
    expect(b.y).toBeGreaterThan(600 * 0.55)
  })

  it('um salto grande de tempo não teleporta a fumaça', () => {
    const b = nova()
    const y0 = b.y
    passoDaBaforada(b, 30, 800, 600)
    expect(y0 - b.y).toBeLessThanOrEqual(b.vy * PASSO_MAXIMO + 0.001)
  })

  it('tempo inválido não estraga a baforada', () => {
    const b = nova()
    passoDaBaforada(b, NaN, 800, 600)
    passoDaBaforada(b, undefined, 800, 600)
    expect(Number.isFinite(b.x)).toBe(true)
    expect(Number.isFinite(b.y)).toBe(true)
  })
})

describe('desenharBaforada', () => {
  it('é uma mancha com degradê, não um disco de borda dura', () => {
    const chamadas = []
    const ctx = new Proxy(
      {},
      {
        get: (_, nome) => {
          if (nome === 'createRadialGradient') {
            return () => ({ addColorStop: (...s) => chamadas.push(['stop', ...s]) })
          }
          return (...args) => chamadas.push([String(nome), ...args])
        },
        set: () => true,
      }
    )
    desenharBaforada(ctx, 60, 0.12)
    const nomes = chamadas.map((c) => c[0])
    expect(nomes).toContain('arc')
    expect(nomes).toContain('fill')
    // a última parada tem de ser transparente, senão a fumaça vira bola
    const paradas = chamadas.filter((c) => c[0] === 'stop')
    expect(paradas.length).toBeGreaterThanOrEqual(3)
    expect(String(paradas[paradas.length - 1][2])).toMatch(/,\s*0\)|rgba\([^)]*0\)/)
  })

  it('raio inválido não quebra', () => {
    const ctx = new Proxy(
      {},
      {
        get: (_, nome) =>
          nome === 'createRadialGradient' ? () => ({ addColorStop: () => {} }) : () => {},
        set: () => true,
      }
    )
    expect(() => desenharBaforada(ctx, 0, 0.1)).not.toThrow()
    expect(() => desenharBaforada(ctx, NaN, NaN)).not.toThrow()
  })
})
