import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, act, cleanup } from '@testing-library/react'
import FolhasCanvas from '@/components/FolhasCanvas'

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
    closePath: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
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

const tela = () => screen.getByTestId('folhas')

describe('FolhasCanvas', () => {
  it('é pura decoração: leitor de tela não anuncia nada', () => {
    render(<FolhasCanvas />)
    expect(tela().tagName).toBe('CANVAS')
    expect(tela()).toHaveAttribute('aria-hidden', 'true')
  })

  it('pinta folhas assim que entra, sem esperar o primeiro quadro', () => {
    // sem isto a seção aparece vazia por um instante antes da primeira folha
    render(<FolhasCanvas />)
    expect(contexto.pintadas).toBeGreaterThan(0)
  })

  it('a quantidade de folhas acompanha a largura da tela', () => {
    render(<FolhasCanvas />)
    const numaTelaLarga = contexto.pintadas

    cleanup()
    contexto.pintadas = 0
    medirCanvasEm(360, ALTURA)
    render(<FolhasCanvas />)
    expect(contexto.pintadas).toBeLessThan(numaTelaLarga)
  })

  it('a tela é preparada na densidade do aparelho, senão a folha sai borrada', () => {
    vi.stubGlobal('devicePixelRatio', 2)
    render(<FolhasCanvas />)
    expect(tela().width).toBe(LARGURA * 2)
    expect(tela().height).toBe(ALTURA * 2)
  })

  it('anima: cada quadro pede o seguinte', () => {
    render(<FolhasCanvas />)
    expect(agendados.size, 'o laço precisa começar').toBe(1)
    rodarQuadro(16)
    expect(agendados.size, 'o quadro precisa pedir o próximo').toBe(1)
    rodarQuadro(32)
    expect(agendados.size).toBe(1)
  })

  it('as folhas andam de um quadro para o outro', () => {
    render(<FolhasCanvas />)
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
    render(<FolhasCanvas />)
    expect(contexto.pintadas, 'as folhas continuam desenhadas, só não se mexem').toBeGreaterThan(0)
    expect(agendados.size, 'nenhum quadro pode ser agendado').toBe(0)
  })

  it('para de pintar quando a seção sai da tela, e volta quando ela reaparece', () => {
    render(<FolhasCanvas />)
    expect(agendados.size).toBe(1)

    observadorDeTela.dispara(false)
    expect(agendados.size, 'fora da tela não se pinta nada').toBe(0)

    observadorDeTela.dispara(true)
    expect(agendados.size, 'voltou à tela, volta a pintar').toBe(1)
  })

  it('para de pintar quando a aba vai para segundo plano', () => {
    render(<FolhasCanvas />)
    expect(agendados.size).toBe(1)

    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true })
    act(() => document.dispatchEvent(new Event('visibilitychange')))
    expect(agendados.size, 'aba escondida não pode queimar bateria').toBe(0)

    Object.defineProperty(document, 'hidden', { configurable: true, get: () => false })
    act(() => document.dispatchEvent(new Event('visibilitychange')))
    expect(agendados.size, 'a aba voltou: o laço volta junto').toBe(1)
  })

  it('sair da página não deixa quadro agendado para trás', () => {
    const { unmount } = render(<FolhasCanvas />)
    expect(agendados.size).toBe(1)
    unmount()
    expect(agendados.size).toBe(0)
  })

  it('redimensionar a janela refaz a tela no tamanho novo', () => {
    render(<FolhasCanvas />)
    expect(tela().width).toBe(LARGURA)

    medirCanvasEm(1400, ALTURA)
    observadorDeTamanho.dispara()
    expect(tela().width).toBe(1400)
  })

  it('navegador sem canvas não derruba a seção', () => {
    window.HTMLCanvasElement.prototype.getContext = vi.fn(() => null)
    expect(() => render(<FolhasCanvas />)).not.toThrow()
    expect(screen.getByTestId('folhas')).toBeInTheDocument()
    expect(agendados.size).toBe(0)
  })

  it('tela sem tamanho não semeia folha nenhuma, e espera a medida chegar', () => {
    medirCanvasEm(0, 0)
    render(<FolhasCanvas />)
    expect(contexto.pintadas).toBe(0)
    expect(agendados.size).toBe(0)

    medirCanvasEm(LARGURA, ALTURA)
    observadorDeTamanho.dispara()
    expect(contexto.pintadas).toBeGreaterThan(0)
    expect(agendados.size).toBe(1)
  })
})
