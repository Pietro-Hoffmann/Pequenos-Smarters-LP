import { describe, it, expect } from 'vitest'
import {
  COR_FLOCO,
  COR_CONTORNO,
  RAIO_DO_CRISTAL,
  quantosFlocos,
  criarFloco,
  brisaNoInstante,
  passoDoFloco,
  desenharCristal,
} from '@/lib/neve'
import { PASSO_MAXIMO } from '@/lib/folhas'

// ---------------------------------------------------------------------------
// A NEVE DA ILHA DO GELO
//
// O DILEMA DESTE CLIMA, e ele não é técnico: neve é BRANCA e o céu do
// Gelo é quase BRANCO. Medido em 1/11, branco puro sobre #dcf0fb dá
// 1,17:1 — invisível. Escurecer a neve resolve a visibilidade e destrói a
// identidade: floco azul-escuro não é neve, é confete. A tentativa
// anterior ("a neve é azulada") escolheu um meio-termo que não é nem uma
// coisa nem outra.
//
// A saída é a mesma do Fogo e das bolhas, invertida: MIOLO BRANCO de
// verdade com CONTORNO AZUL. O contorno dá a visibilidade, o branco por
// dentro mantém a neve sendo neve.
//
// E a segunda saída é a FORMA. Seis braços é uma silhueta tão
// reconhecível que carrega a identidade mesmo com pouco contraste — o
// olho completa o resto.
// ---------------------------------------------------------------------------

function sorteioFixo(valores) {
  let i = 0
  return () => {
    const v = valores[i % valores.length]
    i += 1
    return v
  }
}

const lum = (hex) => {
  const h = hex.replace('#', '')
  const canal = (i) => {
    const c = parseInt(h.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * canal(0) + 0.7152 * canal(2) + 0.0722 * canal(4)
}
const contra = (a, b) => {
  const la = lum(a)
  const lb = lum(b)
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

describe('as cores da neve', () => {
  // O PIOR CASO, e não o tom nominal. O céu desta seção é um degradê: em
  // cima ele é #e8f5fd, mas lá embaixo chega a #b9e0f3. Medir contra o
  // claro foi o que deixou passar um contorno de 2,34:1, que na tela ficou
  // "quase do mesmo tom" do fundo.
  const CEU = '#b9e0f3'

  it('O MIOLO CONTINUA BRANCO: neve escurecida deixa de ser neve', () => {
    expect(lum(COR_FLOCO), 'o floco escureceu e virou confete').toBeGreaterThan(lum('#eef6ff'))
  })

  it('o CONTORNO é escuro o bastante para o floco existir no céu quase branco', () => {
    // é ele que faz todo o trabalho de visibilidade; branco puro dá 1,17:1
    // 3:1 é o mínimo para elemento gráfico. O valor antigo passava no
    // teste frouxo e falhava no olho.
    expect(contra(COR_CONTORNO, CEU), 'o contorno clareou e o floco vai sumir').toBeGreaterThan(3)
  })
})

describe('quantosFlocos', () => {
  it('acompanha a largura, com piso e teto', () => {
    expect(quantosFlocos(1600)).toBeGreaterThan(quantosFlocos(500))
    expect(quantosFlocos(320)).toBeGreaterThanOrEqual(24)
    expect(quantosFlocos(6000)).toBeLessThanOrEqual(70)
  })

  it('largura inválida não devolve lixo', () => {
    expect(quantosFlocos(NaN)).toBeGreaterThanOrEqual(24)
    expect(quantosFlocos(undefined)).toBeGreaterThanOrEqual(24)
  })
})

describe('criarFloco', () => {
  it('nasce com os traços que o desenho precisa', () => {
    const f = criarFloco(800, 600, sorteioFixo([0.5]))
    expect(Number.isFinite(f.x)).toBe(true)
    expect(Number.isFinite(f.y)).toBe(true)
    expect(f.raio).toBeGreaterThan(0)
    expect(f.vy).toBeGreaterThan(0)
    expect(f.nitidez).toBeGreaterThanOrEqual(0)
    expect(f.nitidez).toBeLessThanOrEqual(1)
  })

  it('CAI DEVAGAR: neve flutua para baixo, não despenca', () => {
    // para comparar: folha cai de 22 a 62 px/s, areia atravessa a 380
    for (let i = 0; i < 60; i += 1) {
      expect(criarFloco(800, 600).vy).toBeLessThan(46)
    }
  })

  it('há flocos GRAÚDOS com seis braços e MIÚDOS que são só ponto', () => {
    // no tamanho dos miúdos a forma não se veria, e só custaria desenho
    const tipos = new Set()
    for (let i = 0; i < 300; i += 1) tipos.add(criarFloco(800, 600).cristal)
    expect(tipos.has(true), 'faltam os cristais graúdos').toBe(true)
    expect(tipos.has(false), 'faltam os pontinhos').toBe(true)
  })

  it('o floco graúdo é sempre maior que o limiar do cristal', () => {
    for (let i = 0; i < 200; i += 1) {
      const f = criarFloco(800, 600)
      if (f.cristal) expect(f.raio).toBeGreaterThanOrEqual(RAIO_DO_CRISTAL)
      else expect(f.raio).toBeLessThan(RAIO_DO_CRISTAL)
    }
  })
})

describe('brisaNoInstante', () => {
  it('desloca o conjunto para os dois lados', () => {
    const amostras = []
    for (let t = 0; t < 200; t += 0.5) amostras.push(brisaNoInstante(t))
    expect(Math.min(...amostras)).toBeLessThan(0)
    expect(Math.max(...amostras)).toBeGreaterThan(0)
  })

  it('é uma BRISA, não um vendaval: neve é leve, mas não voa', () => {
    for (let t = 0; t < 400; t += 0.3) {
      expect(Math.abs(brisaNoInstante(t))).toBeLessThan(26)
    }
  })

  it('tempo inválido não quebra', () => {
    expect(Number.isFinite(brisaNoInstante(NaN))).toBe(true)
    expect(Number.isFinite(brisaNoInstante(undefined))).toBe(true)
  })
})

describe('passoDoFloco', () => {
  const novo = () => criarFloco(800, 600, sorteioFixo([0.5]))

  it('o floco cai', () => {
    const f = novo()
    const y0 = f.y
    passoDoFloco(f, 0.1, 0, 800, 600)
    expect(f.y).toBeGreaterThan(y0)
  })

  it('VAGUEIA para os dois lados: neve não cai em linha reta', () => {
    const f = novo()
    const passos = []
    for (let i = 0; i < 600; i += 1) {
      const antes = f.x
      passoDoFloco(f, 1 / 60, 0, 800, 600)
      passos.push(f.x - antes)
    }
    expect(Math.min(...passos)).toBeLessThan(0)
    expect(Math.max(...passos)).toBeGreaterThan(0)
  })

  it('a brisa empurra o conjunto', () => {
    const paraDireita = novo()
    const paraEsquerda = { ...paraDireita }
    passoDoFloco(paraDireita, 0.016, 60, 800, 600)
    passoDoFloco(paraEsquerda, 0.016, -60, 800, 600)
    expect(paraDireita.x).toBeGreaterThan(paraEsquerda.x)
  })

  it('o floco gira devagar enquanto cai', () => {
    const f = novo()
    const antes = f.giro
    passoDoFloco(f, 0.2, 0, 800, 600)
    expect(f.giro).not.toBeCloseTo(antes, 5)
  })

  it('floco que sai por baixo volta por cima', () => {
    const f = novo()
    f.y = 10000
    passoDoFloco(f, 0.016, 0, 800, 600)
    expect(f.y).toBeLessThan(0)
  })

  it('floco que sai pela lateral reaparece do outro lado', () => {
    const f = novo()
    f.x = 100000
    passoDoFloco(f, 0.016, 0, 800, 600)
    expect(f.x).toBeLessThan(0)

    f.x = -100000
    passoDoFloco(f, 0.016, 0, 800, 600)
    expect(f.x).toBeGreaterThan(800)
  })

  it('um salto grande de tempo não teleporta o floco', () => {
    const f = novo()
    const y0 = f.y
    passoDoFloco(f, 30, 0, 800, 600)
    expect(f.y - y0).toBeLessThanOrEqual(f.vy * PASSO_MAXIMO + 0.001)
  })

  it('tempo inválido não estraga o floco', () => {
    const f = novo()
    passoDoFloco(f, NaN, 0, 800, 600)
    passoDoFloco(f, undefined, NaN, 800, 600)
    expect(Number.isFinite(f.x)).toBe(true)
    expect(Number.isFinite(f.y)).toBe(true)
  })
})

describe('desenharCristal', () => {
  const pintar = () => {
    const chamadas = []
    const ctx = new Proxy(
      {},
      {
        get: (_, nome) => (...args) => chamadas.push([String(nome), ...args]),
        set: () => true,
      }
    )
    desenharCristal(ctx, 10)
    return chamadas
  }

  it('TEM SEIS BRAÇOS: é a silhueta que carrega a identidade da neve', () => {
    const chamadas = pintar()
    const idas = chamadas.filter((c) => c[0] === 'moveTo').length
    expect(idas, 'um floco de neve tem seis braços').toBeGreaterThanOrEqual(6)
    expect(chamadas.map((c) => c[0])).toContain('stroke')
  })

  it('não é um círculo: cristal desenhado como disco é a volta do defeito', () => {
    expect(pintar().map((c) => c[0])).not.toContain('arc')
  })

  it('raio inválido não quebra', () => {
    const ctx = new Proxy({}, { get: () => () => {}, set: () => true })
    expect(() => desenharCristal(ctx, 0)).not.toThrow()
    expect(() => desenharCristal(ctx, NaN)).not.toThrow()
  })
})
