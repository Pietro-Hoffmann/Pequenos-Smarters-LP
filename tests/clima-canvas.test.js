import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, act, cleanup } from '@testing-library/react'
import ClimaCanvas from '@/components/ClimaCanvas'
import { RECEITA_DESERTO, RECEITA_FOGO } from '@/components/climas/receitas'
import { TONS_BRASA } from '@/lib/brasas'
import fs from 'node:fs'
import path from 'node:path'

// ---------------------------------------------------------------------------
// AS FOLHAS DA ILHA DA NATUREZA (a tela de desenho)
//
// Pintar folha por folha num canvas custa mais do que as camadas de CSS do
// resto dos climas, e foi uma escolha consciente do dono. O preço disso é
// que os freios que o CSS dava de graça agora têm de ser feitos à mão — e é
// exatamente isso que estes testes vigiam:
//
//   • quem pede menos movimento no sistema NÃO vê animação nenhuma
//     (as folhas ficam paradas, como as partículas dos outros climas);
//   • o laço PARA quando a seção sai da tela;
//   • o laço PARA quando a aba vai para segundo plano, senão a página fica
//     queimando bateria atrás de uma aba que ninguém está vendo.
//
// E mais dois cuidados: sair da página não pode deixar quadro agendado, e
// navegador sem canvas não pode derrubar a seção inteira.
// ---------------------------------------------------------------------------

const LARGURA = 900
const ALTURA = 700

let agendados
let proximoId
let contexto
let observadorDeTela
let observadorDeTamanho
let movimentoReduzido

// Roda os quadros que estão na fila, como o navegador faria.
function rodarQuadro(instante) {
  const atuais = [...agendados.values()]
  agendados.clear()
  act(() => atuais.forEach((cb) => cb(instante)))
}

function medirCanvasEm(largura, altura) {
  Object.defineProperty(window.HTMLCanvasElement.prototype, 'clientWidth', {
    configurable: true,
    get: () => largura,
  })
  Object.defineProperty(window.HTMLCanvasElement.prototype, 'clientHeight', {
    configurable: true,
    get: () => altura,
  })
}

beforeEach(() => {
  agendados = new Map()
  proximoId = 1
  movimentoReduzido = false

  vi.stubGlobal('requestAnimationFrame', (cb) => {
    const id = proximoId
    proximoId += 1
    agendados.set(id, cb)
    return id
  })
  vi.stubGlobal('cancelAnimationFrame', (id) => {
    agendados.delete(id)
  })

  // jsdom não tem canvas de verdade: este contexto falso anota o que foi
  // pedido, que é o suficiente para provar que alguma coisa foi pintada
  contexto = {
    pintadas: 0,
    setTransform: vi.fn(),
    scale: vi.fn(),
    clearRect: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    ellipse: vi.fn(),
    arc: vi.fn(),
    // as brasas do Fogo são pintadas com degradê: o duble anota cada
    // parada de cor, que é como se confere que há núcleo E halo
    paradas: [],
    createRadialGradient: vi.fn(() => ({
      addColorStop: (onde, cor) => contexto.paradas.push([onde, cor]),
    })),
    closePath: vi.fn(),
    fill: vi.fn(),
    fillRect: vi.fn(),
    // grava a espessura de cada traço: é como se confere que o rastro do
    // Vento afina para trás, sem precisar de um canvas de verdade
    larguras: [],
    stroke: vi.fn(() => {
      contexto.larguras.push(contexto.lineWidth)
    }),
    drawImage: vi.fn(() => {
      contexto.pintadas += 1
    }),
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    globalAlpha: 1,
    lineCap: 'butt',
    lineJoin: 'miter',
  }
  window.HTMLCanvasElement.prototype.getContext = vi.fn(() => contexto)

  medirCanvasEm(LARGURA, ALTURA)

  observadorDeTela = null
  class IOFalso {
    constructor(cb) {
      this.cb = cb
      observadorDeTela = this
    }
    observe() {}
    disconnect() {}
    dispara(visivel) {
      act(() => this.cb([{ isIntersecting: visivel }]))
    }
  }
  vi.stubGlobal('IntersectionObserver', IOFalso)

  observadorDeTamanho = null
  class ROFalso {
    constructor(cb) {
      this.cb = cb
      observadorDeTamanho = this
    }
    observe() {}
    disconnect() {}
    dispara() {
      act(() => this.cb([{}]))
    }
  }
  vi.stubGlobal('ResizeObserver', ROFalso)

  vi.stubGlobal('matchMedia', (consulta) => ({
    matches: /prefers-reduced-motion/.test(consulta) ? movimentoReduzido : false,
    media: consulta,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
  }))
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  delete window.HTMLCanvasElement.prototype.clientWidth
  delete window.HTMLCanvasElement.prototype.clientHeight
})

const tela = () => screen.getByTestId('clima-tela')

describe('ClimaCanvas: a Natureza (folhas)', () => {
  it('é pura decoração: leitor de tela não anuncia nada', () => {
    render(<ClimaCanvas tema="natureza" />)
    expect(tela().tagName).toBe('CANVAS')
    expect(tela()).toHaveAttribute('aria-hidden', 'true')
  })

  it('pinta folhas assim que entra, sem esperar o primeiro quadro', () => {
    // sem isto a seção aparece vazia por um instante antes da primeira folha
    render(<ClimaCanvas tema="natureza" />)
    expect(contexto.pintadas).toBeGreaterThan(0)
  })

  it('a quantidade de folhas acompanha a largura da tela', () => {
    render(<ClimaCanvas tema="natureza" />)
    const numaTelaLarga = contexto.pintadas

    cleanup()
    contexto.pintadas = 0
    medirCanvasEm(360, ALTURA)
    render(<ClimaCanvas tema="natureza" />)
    expect(contexto.pintadas).toBeLessThan(numaTelaLarga)
  })

  it('a tela é preparada na densidade do aparelho, senão a folha sai borrada', () => {
    vi.stubGlobal('devicePixelRatio', 2)
    render(<ClimaCanvas tema="natureza" />)
    expect(tela().width).toBe(LARGURA * 2)
    expect(tela().height).toBe(ALTURA * 2)
  })

  it('anima: cada quadro pede o seguinte', () => {
    render(<ClimaCanvas tema="natureza" />)
    expect(agendados.size, 'o laço precisa começar').toBe(1)
    rodarQuadro(16)
    expect(agendados.size, 'o quadro precisa pedir o próximo').toBe(1)
    rodarQuadro(32)
    expect(agendados.size).toBe(1)
  })

  it('as folhas andam de um quadro para o outro', () => {
    render(<ClimaCanvas tema="natureza" />)
    rodarQuadro(16)
    contexto.translate.mockClear()
    rodarQuadro(32)
    const primeiro = contexto.translate.mock.calls.map((c) => c.join(','))
    contexto.translate.mockClear()
    rodarQuadro(400)
    const segundo = contexto.translate.mock.calls.map((c) => c.join(','))
    expect(segundo.length).toBeGreaterThan(0)
    expect(segundo).not.toEqual(primeiro)
  })

  it('quem pede menos movimento vê as folhas paradas, e nenhum laço roda', () => {
    movimentoReduzido = true
    render(<ClimaCanvas tema="natureza" />)
    expect(contexto.pintadas, 'as folhas continuam desenhadas, só não se mexem').toBeGreaterThan(0)
    expect(agendados.size, 'nenhum quadro pode ser agendado').toBe(0)
  })

  it('para de pintar quando a seção sai da tela, e volta quando ela reaparece', () => {
    render(<ClimaCanvas tema="natureza" />)
    expect(agendados.size).toBe(1)

    observadorDeTela.dispara(false)
    expect(agendados.size, 'fora da tela não se pinta nada').toBe(0)

    observadorDeTela.dispara(true)
    expect(agendados.size, 'voltou à tela, volta a pintar').toBe(1)
  })

  it('para de pintar quando a aba vai para segundo plano', () => {
    render(<ClimaCanvas tema="natureza" />)
    expect(agendados.size).toBe(1)

    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true })
    act(() => document.dispatchEvent(new Event('visibilitychange')))
    expect(agendados.size, 'aba escondida não pode queimar bateria').toBe(0)

    Object.defineProperty(document, 'hidden', { configurable: true, get: () => false })
    act(() => document.dispatchEvent(new Event('visibilitychange')))
    expect(agendados.size, 'a aba voltou: o laço volta junto').toBe(1)
  })

  it('sair da página não deixa quadro agendado para trás', () => {
    const { unmount } = render(<ClimaCanvas tema="natureza" />)
    expect(agendados.size).toBe(1)
    unmount()
    expect(agendados.size).toBe(0)
  })

  it('redimensionar a janela refaz a tela no tamanho novo', () => {
    render(<ClimaCanvas tema="natureza" />)
    expect(tela().width).toBe(LARGURA)

    medirCanvasEm(1400, ALTURA)
    observadorDeTamanho.dispara()
    expect(tela().width).toBe(1400)
  })

  it('navegador sem canvas não derruba a seção', () => {
    window.HTMLCanvasElement.prototype.getContext = vi.fn(() => null)
    expect(() => render(<ClimaCanvas tema="natureza" />)).not.toThrow()
    expect(screen.getByTestId('clima-tela')).toBeInTheDocument()
    expect(agendados.size).toBe(0)
  })

  it('tela sem tamanho não semeia folha nenhuma, e espera a medida chegar', () => {
    medirCanvasEm(0, 0)
    render(<ClimaCanvas tema="natureza" />)
    expect(contexto.pintadas).toBe(0)
    expect(agendados.size).toBe(0)

    medirCanvasEm(LARGURA, ALTURA)
    observadorDeTamanho.dispara()
    expect(contexto.pintadas).toBeGreaterThan(0)
    expect(agendados.size).toBe(1)
  })
})

describe('ClimaCanvas: o Deserto (areia)', () => {
  it('pinta a areia assim que entra', () => {
    render(<ClimaCanvas tema="deserto" />)
    expect(tela()).toHaveAttribute('data-clima-tela', 'deserto')
    expect(contexto.fill.mock.calls.length, 'nenhum grão foi pintado').toBeGreaterThan(0)
  })

  it('a areia é desenhada deitada: risco, não bolinha', () => {
    render(<ClimaCanvas tema="deserto" />)
    const elipses = contexto.ellipse.mock.calls
    expect(elipses.length).toBeGreaterThan(0)
    // ellipse(x, y, raioX, raioY, ...)
    for (const e of elipses) expect(e[2]).toBeGreaterThan(e[3])
  })

  it('a areia é bem mais densa que as folhas', () => {
    render(<ClimaCanvas tema="deserto" />)
    const graosDeAreia = contexto.ellipse.mock.calls.length
    cleanup()
    contexto.drawImage.mockClear()
    render(<ClimaCanvas tema="natureza" />)
    expect(graosDeAreia).toBeGreaterThan(contexto.drawImage.mock.calls.length)
  })

  it('os mesmos três freios valem para a areia', () => {
    render(<ClimaCanvas tema="deserto" />)
    expect(agendados.size).toBe(1)

    observadorDeTela.dispara(false)
    expect(agendados.size, 'fora da tela o laço da areia também para').toBe(0)
    observadorDeTela.dispara(true)

    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true })
    act(() => document.dispatchEvent(new Event('visibilitychange')))
    expect(agendados.size, 'aba escondida também para a areia').toBe(0)
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => false })
  })

  it('quem pede menos movimento vê a areia parada, sem laço', () => {
    movimentoReduzido = true
    render(<ClimaCanvas tema="deserto" />)
    expect(contexto.fill.mock.calls.length).toBeGreaterThan(0)
    expect(agendados.size).toBe(0)
  })

  it('o risco se estica na lufada e encolhe no vale', () => {
    // é o esticar que faz a rajada ser SENTIDA, e não só medida
    const grao = { x: 10, y: 10, comprimento: 10, espessura: 2, inclinacao: 0, opacidade: 1, tom: 0 }
    const medir = (rajada) => {
      contexto.ellipse.mockClear()
      RECEITA_DESERTO.pintar(contexto, { graos: [grao], rajada })
      return contexto.ellipse.mock.calls[0][2]
    }
    expect(medir(1)).toBeGreaterThan(medir(0.2))
  })
})

describe('ClimaCanvas: clima sem receita', () => {
  it('tema que ainda não migrou não monta canvas nem liga laço', () => {
    const { container } = render(<ClimaCanvas tema="gelo" />)
    expect(container.innerHTML).toBe('')
    expect(agendados.size).toBe(0)
  })

  it('sem tema nenhum, nada quebra', () => {
    const { container } = render(<ClimaCanvas />)
    expect(container.innerHTML).toBe('')
  })
})

describe('ClimaCanvas: o Vento (correntes de ar)', () => {
  it('pinta as correntes assim que entra', () => {
    render(<ClimaCanvas tema="vento" />)
    expect(tela()).toHaveAttribute('data-clima-tela', 'vento')
    expect(contexto.stroke.mock.calls.length, 'nenhum traço foi feito').toBeGreaterThan(0)
  })

  it('a corrente é um TRAÇO que segue o arco, não um retângulo', () => {
    render(<ClimaCanvas tema="vento" />)
    expect(contexto.lineTo.mock.calls.length).toBeGreaterThan(0)
    expect(contexto.fillRect).not.toHaveBeenCalled()
  })

  it('o rastro afina para trás: a espessura cresce da cauda para a cabeça', () => {
    // sem isso a corrente vira um fio de espessura única, que é um RISCO —
    // e risco de espessura única repetido é o defeito que estamos consertando
    render(<ClimaCanvas tema="vento" />)
    const larguras = contexto.larguras
    expect(larguras.length).toBeGreaterThan(4)
    expect(Math.max(...larguras)).toBeGreaterThan(Math.min(...larguras) * 1.5)
  })

  it('os mesmos três freios valem para o vento', () => {
    render(<ClimaCanvas tema="vento" />)
    expect(agendados.size).toBe(1)

    observadorDeTela.dispara(false)
    expect(agendados.size).toBe(0)
    observadorDeTela.dispara(true)

    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true })
    act(() => document.dispatchEvent(new Event('visibilitychange')))
    expect(agendados.size).toBe(0)
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => false })
  })

  it('quem pede menos movimento vê as correntes paradas, sem laço', () => {
    movimentoReduzido = true
    render(<ClimaCanvas tema="vento" />)
    expect(contexto.stroke.mock.calls.length).toBeGreaterThan(0)
    expect(agendados.size).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// A GUARDA CONTRA A REINCIDÊNCIA DO VENTO
// O Vento já foi "consertado" uma vez ajustando ângulo e opacidade das
// listras, e voltou a parecer defeito de renderização. A causa é a técnica,
// não o número: linear-gradient só sabe fazer RETA, e reta paralela
// igualmente espaçada repetindo em padrão é a assinatura de artefato de
// compressão. Este teste existe para que ninguém volte a resolver isso
// mexendo no ângulo.
// ---------------------------------------------------------------------------
describe('o Vento não pode voltar a ser listra', () => {
  const CSS = fs.readFileSync(
    path.join(process.cwd(), 'components/Ilhas.module.css'),
    'utf8'
  )

  const regrasDoVento = () => {
    const achados = []
    const re = /([^{}]*vento[^{}]*)\{([^}]*)\}/gi
    let m = re.exec(CSS)
    while (m) {
      achados.push({ seletor: m[1].trim(), corpo: m[2] })
      m = re.exec(CSS)
    }
    return achados
  }

  it('nenhuma regra de Vento usa linear-gradient', () => {
    const culpadas = regrasDoVento().filter((r) => /linear-gradient/.test(r.corpo))
    expect(
      culpadas.map((r) => r.seletor),
      'listra reta no Vento é o defeito que já voltou uma vez'
    ).toEqual([])
  })

  it('as camadas de partícula do clima de Vento não existem mais no CSS', () => {
    // elas ficam no opacity: 0 da classe .camada; quem pinta é o canvas
    expect(CSS).not.toMatch(/\.climaSecao\[data-tema='vento'\]\s*\.p[12]\s*\{/)
  })

  it('todo caminho da varredura do Vento é CURVO, nenhum é reta', () => {
    const JS = fs.readFileSync(path.join(process.cwd(), 'components/Ilhas.js'), 'utf8')
    const caminhos = [...JS.matchAll(/<path d="([^"]+)"/g)].map((m) => m[1])
    expect(caminhos.length, 'os caminhos do Vento sumiram').toBeGreaterThanOrEqual(4)
    for (const d of caminhos) {
      expect(d, `"${d}" é uma reta: o Vento volta a parecer defeito`).toMatch(/[QCSqcs]/)
    }
  })

  it('o tracejado não volta junto com o non-scaling-stroke', () => {
    // A ARMADILHA, medida em 1/11: vector-effect: non-scaling-stroke leva o
    // cálculo do tracejado para o espaço da TELA, onde o pathLength não
    // vale. O resultado foi cada curva virar um pontilhado de uns doze
    // traços iguais — exatamente a regularidade que este conserto elimina.
    // Os dois juntos, nunca mais.
    const bloco = CSS.match(/\.correnteArSvg path\s*\{([^}]*)\}/)
    expect(bloco, 'o bloco do caminho do Vento sumiu do CSS').not.toBeNull()
    const temDash = /stroke-dasharray/.test(bloco[1])
    const temNonScaling = /non-scaling-stroke/.test(bloco[1])
    expect(
      temDash && temNonScaling,
      'stroke-dasharray + non-scaling-stroke = pontilhado regular'
    ).toBe(false)
  })
})

describe('ClimaCanvas: o Fogo (brasas)', () => {
  it('pinta as brasas assim que entra', () => {
    render(<ClimaCanvas tema="fogo" />)
    expect(tela()).toHaveAttribute('data-clima-tela', 'fogo')
    expect(contexto.arc.mock.calls.length, 'nenhuma brasa foi pintada').toBeGreaterThan(0)
  })

  it('cada brasa tem NÚCLEO claro e HALO escuro', () => {
    // é esta dupla que resolve o nó do clima: brasa é luz, e o céu do Fogo
    // é pêssego claro. Só claro some; só escuro vira tinta.
    render(<ClimaCanvas tema="fogo" />)
    expect(contexto.createRadialGradient).toHaveBeenCalled()
    const cores = contexto.paradas.map((p) => String(p[1]).toLowerCase())
    const claras = cores.filter((c) => /^#(f|e)/.test(c))
    const escuras = cores.filter((c) => /^#(7|a|8)/.test(c))
    expect(claras.length, 'faltou o núcleo claro').toBeGreaterThan(0)
    expect(escuras.length, 'faltou o halo escuro').toBeGreaterThan(0)
  })

  it('brasa fria é desenhada mais escura que brasa quente', () => {
    const quente = { x: 0, y: 0, raio: 4, brilho: 1, idade: 0, vida: 4 }
    const fria = { x: 0, y: 0, raio: 4, brilho: 1, idade: 3.6, vida: 4 }
    const nucleoDe = (brasa) => {
      contexto.paradas.length = 0
      RECEITA_FOGO.pintar(contexto, { brasas: [brasa] })
      return contexto.paradas[0] && contexto.paradas[0][1]
    }
    expect(nucleoDe(quente)).not.toBe(nucleoDe(fria))
    expect(TONS_BRASA.indexOf(nucleoDe(fria))).toBeGreaterThan(
      TONS_BRASA.indexOf(nucleoDe(quente))
    )
  })

  it('brasa apagada não é desenhada', () => {
    contexto.arc.mockClear()
    RECEITA_FOGO.pintar(contexto, {
      brasas: [{ x: 0, y: 0, raio: 4, brilho: 1, idade: 10, vida: 4 }],
    })
    expect(contexto.arc).not.toHaveBeenCalled()
  })

  it('os mesmos três freios valem para o fogo', () => {
    render(<ClimaCanvas tema="fogo" />)
    expect(agendados.size).toBe(1)

    observadorDeTela.dispara(false)
    expect(agendados.size).toBe(0)
    observadorDeTela.dispara(true)

    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true })
    act(() => document.dispatchEvent(new Event('visibilitychange')))
    expect(agendados.size).toBe(0)
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => false })
  })

  it('quem pede menos movimento vê as brasas paradas, sem laço', () => {
    movimentoReduzido = true
    render(<ClimaCanvas tema="fogo" />)
    expect(contexto.arc.mock.calls.length).toBeGreaterThan(0)
    expect(agendados.size).toBe(0)
  })
})
