import { describe, it, expect } from 'vitest'
import {
  TONS_BRASA,
  quantasBrasas,
  criarBrasa,
  calorDaBrasa,
  tomDoCalor,
  passoDaBrasa,
  desenharBrasa,
} from '@/lib/brasas'
import { PASSO_MAXIMO } from '@/lib/folhas'

// ---------------------------------------------------------------------------
// AS BRASAS DA ILHA DO FOGO
//
// O NÓ DESTE CLIMA: brasa é LUZ, e o céu do clima de Fogo é pêssego CLARO.
// Luz sobre fundo claro não aparece. Numa rodada anterior as brasas foram
// escurecidas para resolver isso, e o resultado foi trocar luz por tinta —
// pontos vermelhos chapados que leem como sujeira na tela.
//
// A saída é desenhar como ilustrador desenha: NÚCLEO CLARO com HALO ESCURO
// em volta. O halo recorta a brasa contra o pêssego, o núcleo devolve o
// brilho.
//
// E o que separa brasa de confete subindo: ela ESFRIA. Escurece, encolhe e
// apaga pelo caminho; a maioria morre antes do topo. Nenhuma atravessa a
// tela inteira acesa.
// ---------------------------------------------------------------------------

function sorteioFixo(valores) {
  let i = 0
  return () => {
    const v = valores[i % valores.length]
    i += 1
    return v
  }
}

describe('quantasBrasas', () => {
  it('acompanha a largura, com piso e teto', () => {
    expect(quantasBrasas(1600)).toBeGreaterThan(quantasBrasas(500))
    expect(quantasBrasas(320)).toBeGreaterThanOrEqual(26)
    expect(quantasBrasas(6000)).toBeLessThanOrEqual(80)
  })

  it('largura inválida não devolve lixo', () => {
    expect(quantasBrasas(NaN)).toBeGreaterThanOrEqual(26)
    expect(quantasBrasas(undefined)).toBeGreaterThanOrEqual(26)
  })
})

describe('criarBrasa', () => {
  it('nasce com os traços que o desenho precisa', () => {
    const b = criarBrasa(800, 600, sorteioFixo([0.5]))
    expect(Number.isFinite(b.x)).toBe(true)
    expect(Number.isFinite(b.y)).toBe(true)
    expect(b.raio).toBeGreaterThan(0)
    expect(b.vy).toBeGreaterThan(0)
    expect(b.vida).toBeGreaterThan(0)
    expect(b.idade).toBeGreaterThanOrEqual(0)
    expect(TONS_BRASA.length).toBeGreaterThan(2)
  })

  it('NASCE EMBAIXO: brasa sai de um lugar, não da tela toda', () => {
    const altura = 600
    let embaixo = 0
    for (let i = 0; i < 300; i += 1) {
      if (criarBrasa(800, altura).y > altura * 0.62) embaixo += 1
    }
    expect(embaixo, `só ${embaixo} de 300 nasceram na faixa de baixo`).toBeGreaterThan(260)
  })

  it('nasce mais ao CENTRO, que é onde está o vulcão', () => {
    const largura = 800
    let centro = 0
    for (let i = 0; i < 400; i += 1) {
      const x = criarBrasa(largura, 600).x
      if (x > largura * 0.25 && x < largura * 0.75) centro += 1
    }
    // num sorteio plano isso daria ~200; concentrado tem de dar bem mais
    expect(centro, `só ${centro} de 400 nasceram no miolo`).toBeGreaterThan(260)
  })

  it('duas brasas não vivem o mesmo tanto nem sobem igual', () => {
    const a = criarBrasa(800, 600, sorteioFixo([0.15]))
    const b = criarBrasa(800, 600, sorteioFixo([0.85]))
    expect(a.vida).not.toBeCloseTo(b.vida, 3)
    expect(a.vy).not.toBeCloseTo(b.vy, 3)
  })
})

describe('calorDaBrasa', () => {
  it('nasce no auge e morre no zero', () => {
    expect(calorDaBrasa({ idade: 0, vida: 2 })).toBeCloseTo(1, 5)
    expect(calorDaBrasa({ idade: 2, vida: 2 })).toBe(0)
  })

  it('esfria sem voltar atrás', () => {
    let anterior = Infinity
    for (let t = 0; t <= 2; t += 0.05) {
      const c = calorDaBrasa({ idade: t, vida: 2 })
      expect(c).toBeLessThanOrEqual(anterior + 1e-9)
      expect(c).toBeGreaterThanOrEqual(0)
      anterior = c
    }
  })

  it('brasa inválida apaga, em vez de quebrar', () => {
    expect(calorDaBrasa({ idade: NaN, vida: 2 })).toBe(0)
    expect(calorDaBrasa({ idade: 1, vida: 0 })).toBe(0)
    expect(calorDaBrasa({})).toBe(0)
  })
})

describe('passoDaBrasa', () => {
  const nova = () => criarBrasa(800, 600, sorteioFixo([0.5]))

  it('a brasa SOBE, e nunca desce', () => {
    const b = nova()
    const antes = b.y
    passoDaBrasa(b, 0.1, 800, 600)
    expect(b.y).toBeLessThan(antes)
  })

  it('acelera na subida: o segundo trecho anda mais que o primeiro', () => {
    const b = nova()
    const y0 = b.y
    for (let i = 0; i < 20; i += 1) passoDaBrasa(b, 1 / 60, 800, 600)
    const primeiro = y0 - b.y
    const y1 = b.y
    for (let i = 0; i < 20; i += 1) passoDaBrasa(b, 1 / 60, 800, 600)
    expect(y1 - b.y).toBeGreaterThan(primeiro)
  })

  it('serpenteia para os dois lados: ar quente não sobe em linha reta', () => {
    const b = nova()
    b.vida = 999
    const passos = []
    for (let i = 0; i < 400; i += 1) {
      const antes = b.x
      passoDaBrasa(b, 1 / 60, 800, 600)
      passos.push(b.x - antes)
    }
    expect(Math.min(...passos)).toBeLessThan(0)
    expect(Math.max(...passos)).toBeGreaterThan(0)
  })

  it('a brasa envelhece e renasce embaixo quando apaga', () => {
    const b = nova()
    b.idade = b.vida + 1
    passoDaBrasa(b, 1 / 60, 800, 600)
    expect(b.idade).toBeLessThan(0.1)
    expect(b.y).toBeGreaterThan(600 * 0.6)
  })

  it('a brasa APAGA por esfriar, nunca escapa pela borda de cima', () => {
    // É isto que separa brasa de confete subindo. E a distinção importa na
    // tela: brasa que apaga some devagar, encolhendo e escurecendo; brasa
    // que escapa pelo topo é recolhida de repente pela rede de segurança, e
    // o corte se vê.
    // O teste força idade 0 para cada brasa viver o tempo CHEIO dela — é o
    // pior caso, e é ele que precisa caber dentro da tela.
    for (let n = 0; n < 80; n += 1) {
      const b = criarBrasa(800, 600)
      b.idade = 0
      let maisAlto = b.y
      for (let i = 0; i < 600; i += 1) {
        const idadeAntes = b.idade
        passoDaBrasa(b, 1 / 60, 800, 600)
        if (b.idade < idadeAntes) break // apagou e renasceu
        maisAlto = Math.min(maisAlto, b.y)
      }
      expect(maisAlto, 'a brasa saiu pelo topo em vez de apagar').toBeGreaterThan(0)
    }
  })

  it('um salto grande de tempo não teleporta a brasa', () => {
    const b = nova()
    const y0 = b.y
    passoDaBrasa(b, 30, 800, 600)
    expect(y0 - b.y).toBeLessThan(b.vy * PASSO_MAXIMO * 3)
  })

  it('tempo inválido não estraga a brasa', () => {
    const b = nova()
    passoDaBrasa(b, NaN, 800, 600)
    passoDaBrasa(b, undefined, 800, 600)
    expect(Number.isFinite(b.x)).toBe(true)
    expect(Number.isFinite(b.y)).toBe(true)
  })
})

describe('desenharBrasa', () => {
  it('tem NÚCLEO e HALO, não um disco chapado', () => {
    // sem o halo escuro a brasa some no céu pêssego; sem o núcleo claro ela
    // vira tinta em vez de luz. Os dois, sempre.
    const chamadas = []
    const ctx = new Proxy(
      {},
      {
        get: (_, nome) => {
          if (nome === 'createRadialGradient') {
            return (...args) => {
              chamadas.push(['createRadialGradient', ...args])
              return { addColorStop: (...s) => chamadas.push(['stop', ...s]) }
            }
          }
          return (...args) => chamadas.push([String(nome), ...args])
        },
        set: () => true,
      }
    )
    desenharBrasa(ctx, 10, '#ffd27a', '#7a1f00', 1)
    const nomes = chamadas.map((c) => c[0])
    expect(nomes).toContain('createRadialGradient')
    expect(nomes).toContain('arc')
    expect(nomes).toContain('fill')
    const paradas = chamadas.filter((c) => c[0] === 'stop')
    expect(paradas.length, 'o degradê do núcleo ao halo precisa de paradas').toBeGreaterThanOrEqual(3)
  })

  it('raio inválido não quebra', () => {
    const ctx = new Proxy(
      {},
      {
        get: (_, nome) =>
          nome === 'createRadialGradient'
            ? () => ({ addColorStop: () => {} })
            : () => {},
        set: () => true,
      }
    )
    expect(() => desenharBrasa(ctx, 0, '#fff', '#000', 1)).not.toThrow()
    expect(() => desenharBrasa(ctx, NaN, '#fff', '#000', 1)).not.toThrow()
  })
})

describe('tomDoCalor', () => {
  it('a brasa quente é clara e a fria é escura', () => {
    expect(tomDoCalor(1)).toBe(TONS_BRASA[0])
    expect(tomDoCalor(0)).toBe(TONS_BRASA[TONS_BRASA.length - 1])
  })

  it('escurece sem pular de volta para o claro', () => {
    const vistos = []
    for (let c = 1; c >= 0; c -= 0.05) {
      const i = TONS_BRASA.indexOf(tomDoCalor(c))
      expect(i).toBeGreaterThanOrEqual(0)
      if (vistos.length) expect(i).toBeGreaterThanOrEqual(vistos[vistos.length - 1])
      vistos.push(i)
    }
  })

  it('valor inválido devolve o tom mais frio, não quebra', () => {
    expect(tomDoCalor(NaN)).toBe(TONS_BRASA[TONS_BRASA.length - 1])
    expect(tomDoCalor(undefined)).toBe(TONS_BRASA[TONS_BRASA.length - 1])
  })
})
