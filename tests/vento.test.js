import { describe, it, expect } from 'vitest'
import {
  TONS_VENTO,
  envelopeDaCorrente,
  quantasCorrentes,
  criarCorrente,
  pontoNoArco,
  segmentosDoRastro,
  passoDaCorrente,
} from '@/lib/vento'
import { PASSO_MAXIMO } from '@/lib/folhas'

// ---------------------------------------------------------------------------
// AS CORRENTES DE AR DA ILHA DO VENTO
//
// O defeito do Vento nunca foi o ângulo nem a cor — isso já tinha sido
// mexido uma vez, e continuou parecendo defeito de renderização. O defeito
// era a RETA: faixas retas, paralelas, igualmente espaçadas e repetindo em
// padrão são a assinatura de artefato de compressão de vídeo. O olho
// reconhece a REGULARIDADE, não o tom, e nenhum ajuste de cor conserta isso.
//
// Vento, na linguagem do próprio jogo, é curva: a arte da ilha é feita de
// espirais turquesa. Por isso cada corrente aqui é um ARCO sorteado, com
// rastro que afina para trás. Duas correntes nunca saem paralelas.
//
// E as sementes saem de graça: uma corrente de rastro muito curto e traço
// mais grosso vira um pontinho deslizando pelo arco. Mesma física, dois
// visuais, um só tipo de objeto.
// ---------------------------------------------------------------------------

function sorteioFixo(valores) {
  let i = 0
  return () => {
    const v = valores[i % valores.length]
    i += 1
    return v
  }
}

describe('quantasCorrentes', () => {
  it('são poucas: corrente é objeto grande, não partícula', () => {
    expect(quantasCorrentes(1440)).toBeLessThan(25)
    expect(quantasCorrentes(1440)).toBeGreaterThan(6)
  })

  it('acompanha a largura, com piso e teto', () => {
    expect(quantasCorrentes(1800)).toBeGreaterThan(quantasCorrentes(500))
    expect(quantasCorrentes(320)).toBeGreaterThanOrEqual(7)
    expect(quantasCorrentes(6000)).toBeLessThanOrEqual(16)
  })

  it('largura inválida não devolve lixo', () => {
    expect(quantasCorrentes(NaN)).toBeGreaterThanOrEqual(7)
    expect(quantasCorrentes(undefined)).toBeGreaterThanOrEqual(7)
  })
})

describe('criarCorrente', () => {
  it('nasce com um caminho completo e os traços do desenho', () => {
    const c = criarCorrente(800, 600, sorteioFixo([0.5]))
    for (const campo of ['x0', 'y0', 'cx', 'cy', 'x1', 'y1']) {
      expect(Number.isFinite(c[campo]), `${campo} inválido`).toBe(true)
    }
    expect(c.cauda).toBeGreaterThan(0)
    expect(c.velocidade).toBeGreaterThan(0)
    expect(c.espessura).toBeGreaterThan(0)
    expect(TONS_VENTO[c.tom]).toBeTruthy()
  })

  it('o arco NÃO atravessa a tela inteira', () => {
    // esta foi a correção do primeiro desenho: a corrente ia de ponta a
    // ponta e o rastro mostrava só um pedacinho dela — e um pedacinho de um
    // arco enorme é indistinguível de um segmento de reta
    for (let i = 0; i < 40; i += 1) {
      const c = criarCorrente(800, 600)
      expect(c.x1 - c.x0).toBeLessThan(800 * 0.75)
    }
  })

  it('o rastro cobre um bom pedaço do arco, senão a curva não aparece', () => {
    const longos = []
    for (let i = 0; i < 300; i += 1) {
      const c = criarCorrente(800, 600)
      if (!c.semente) longos.push(c.cauda)
    }
    expect(Math.min(...longos), 'rastro curto num arco vira reta').toBeGreaterThan(0.25)
  })

  it('O ARCO É CURVO DE VERDADE: o meio não cai na reta entre as pontas', () => {
    // este é O teste do Vento. Se um dia o arco virar reta, a seção volta a
    // parecer faixa de compressão, que é o defeito que estamos consertando.
    for (let i = 0; i < 60; i += 1) {
      const c = criarCorrente(800, 600)
      const meio = pontoNoArco(c, 0.5)
      const naReta = (c.y0 + c.y1) / 2
      // o desvio é medido contra o COMPRIMENTO do arco, que é como a
      // curvatura é definida: assim o teste vale para arco curto e longo
      const extensao = c.x1 - c.x0
      expect(
        Math.abs(meio.y - naReta) / extensao,
        'o arco ficou reto: o Vento volta a parecer defeito de renderização'
      ).toBeGreaterThan(0.07)
    }
  })

  it('curva para cima e para baixo, não sempre para o mesmo lado', () => {
    let cima = 0
    let baixo = 0
    for (let i = 0; i < 200; i += 1) {
      const c = criarCorrente(800, 600)
      if (pontoNoArco(c, 0.5).y < (c.y0 + c.y1) / 2) cima += 1
      else baixo += 1
    }
    expect(cima).toBeGreaterThan(40)
    expect(baixo).toBeGreaterThan(40)
  })

  it('há correntes de rastro longo e sementes de rastro curto', () => {
    const caudas = []
    for (let i = 0; i < 300; i += 1) caudas.push(criarCorrente(800, 600).cauda)
    expect(caudas.some((c) => c < 0.05), 'faltam as sementes').toBe(true)
    expect(caudas.some((c) => c > 0.1), 'faltam os rastros longos').toBe(true)
  })

  it('nasce espalhada no tempo: não entram todas de uma vez', () => {
    const progressos = new Set()
    for (let i = 0; i < 60; i += 1) progressos.add(criarCorrente(800, 600).progresso.toFixed(2))
    expect(progressos.size).toBeGreaterThan(20)
  })
})

describe('pontoNoArco', () => {
  it('começa no início e termina no fim', () => {
    const c = criarCorrente(800, 600, sorteioFixo([0.5]))
    const ini = pontoNoArco(c, 0)
    const fim = pontoNoArco(c, 1)
    expect(ini.x).toBeCloseTo(c.x0, 5)
    expect(ini.y).toBeCloseTo(c.y0, 5)
    expect(fim.x).toBeCloseTo(c.x1, 5)
    expect(fim.y).toBeCloseTo(c.y1, 5)
  })

  it('anda sempre para a direita ao longo do caminho', () => {
    const c = criarCorrente(800, 600)
    let anterior = -Infinity
    for (let t = 0; t <= 1; t += 0.05) {
      const p = pontoNoArco(c, t)
      expect(p.x).toBeGreaterThan(anterior)
      anterior = p.x
    }
  })
})

describe('segmentosDoRastro', () => {
  const noMeio = () => {
    const c = criarCorrente(800, 600, sorteioFixo([0.5]))
    c.progresso = 0.5
    c.cauda = 0.2
    return c
  }

  it('o rastro é mais forte na frente e some atrás', () => {
    // é o afinamento que dá direção à corrente sem precisar de seta
    const pontos = segmentosDoRastro(noMeio(), 10)
    expect(pontos.length).toBeGreaterThan(5)
    for (let i = 1; i < pontos.length; i += 1) {
      expect(pontos[i].forca).toBeGreaterThan(pontos[i - 1].forca)
    }
    expect(pontos[pontos.length - 1].forca).toBeCloseTo(1, 5)
  })

  it('a cabeça do rastro fica no progresso atual', () => {
    const c = noMeio()
    const pontos = segmentosDoRastro(c, 10)
    const cabeca = pontos[pontos.length - 1]
    const esperado = pontoNoArco(c, c.progresso)
    expect(cabeca.x).toBeCloseTo(esperado.x, 4)
    expect(cabeca.y).toBeCloseTo(esperado.y, 4)
  })

  it('corrente entrando mostra só o pedaço que já entrou', () => {
    // sem este corte, a cauda apareceria presa fora do começo do caminho
    const c = noMeio()
    c.progresso = 0.05
    c.cauda = 0.3
    const pontos = segmentosDoRastro(c, 10)
    expect(pontos.length).toBeGreaterThan(0)
    expect(pontos.length).toBeLessThan(11)
  })

  it('corrente que já saiu inteira não devolve ponto nenhum', () => {
    const c = noMeio()
    c.progresso = 1.6
    c.cauda = 0.2
    expect(segmentosDoRastro(c, 10)).toHaveLength(0)
  })
})

describe('passoDaCorrente', () => {
  const nova = () => criarCorrente(800, 600, sorteioFixo([0.5]))

  it('a corrente avança pelo caminho', () => {
    const c = nova()
    const antes = c.progresso
    passoDaCorrente(c, 0.1, 800, 600)
    expect(c.progresso).toBeGreaterThan(antes)
  })

  it('corrente que chegou ao fim renasce com OUTRO caminho', () => {
    const c = nova()
    const caminhoAntigo = `${c.cy}|${c.y0}|${c.y1}`
    c.progresso = 5
    passoDaCorrente(c, 0.016, 800, 600)
    expect(c.progresso).toBeLessThan(0.2)
    expect(`${c.cy}|${c.y0}|${c.y1}`).not.toBe(caminhoAntigo)
  })

  it('um salto grande de tempo não teleporta a corrente', () => {
    const c = nova()
    c.progresso = 0
    passoDaCorrente(c, 30, 800, 600)
    expect(c.progresso).toBeLessThanOrEqual(c.velocidade * PASSO_MAXIMO + 0.001)
  })

  it('tempo inválido não estraga a corrente', () => {
    const c = nova()
    passoDaCorrente(c, NaN, 800, 600)
    passoDaCorrente(c, undefined, 800, 600)
    expect(Number.isFinite(c.progresso)).toBe(true)
  })
})

describe('envelopeDaCorrente', () => {
  it('a corrente acende ao entrar e apaga ao sair', () => {
    // o arco não atravessa a tela, então sem o envelope ele apareceria e
    // sumiria do nada no meio do céu
    expect(envelopeDaCorrente(0)).toBe(0)
    expect(envelopeDaCorrente(1)).toBe(0)
    expect(envelopeDaCorrente(0.5)).toBeCloseTo(1, 5)
    expect(envelopeDaCorrente(0.05)).toBeGreaterThan(0)
    expect(envelopeDaCorrente(0.05)).toBeLessThan(1)
    expect(envelopeDaCorrente(0.95)).toBeGreaterThan(0)
    expect(envelopeDaCorrente(0.95)).toBeLessThan(1)
  })

  it('sobe e desce sem degrau, e nunca passa de 1', () => {
    let anterior = 0
    for (let t = 0; t <= 0.2; t += 0.01) {
      const v = envelopeDaCorrente(t)
      expect(v).toBeGreaterThanOrEqual(anterior - 1e-9)
      expect(v).toBeLessThanOrEqual(1)
      anterior = v
    }
  })

  it('valor inválido apaga, em vez de quebrar', () => {
    expect(envelopeDaCorrente(NaN)).toBe(0)
    expect(envelopeDaCorrente(undefined)).toBe(0)
    expect(envelopeDaCorrente(-3)).toBe(0)
  })
})
