import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render } from '@testing-library/react'
import RevelarAoRolar from '@/components/RevelarAoRolar'

// ---------------------------------------------------------------------------
// REVELAR AO ROLAR
// Os blocos marcados com data-revelar aparecem em fade quando entram na
// tela. O componente não desenha nada: observa os blocos e marca
// data-revelado uma vez só. Sem JavaScript tudo fica visível (o CSS só
// esconde depois de html[data-js]); com movimento reduzido nada anima.
// ---------------------------------------------------------------------------

let observadores
class IOFalso {
  constructor(cb, opcoes) {
    this.cb = cb
    this.opcoes = opcoes
    this.alvos = new Set()
    observadores.push(this)
  }
  observe(el) { this.alvos.add(el) }
  unobserve(el) { this.alvos.delete(el) }
  disconnect() { this.alvos.clear() }
  // simula o navegador avisando que `el` entrou (ou não) na tela
  dispara(el, isIntersecting = true) {
    this.cb([{ target: el, isIntersecting }], this)
  }
}

function monta(html) {
  document.body.innerHTML = html
}

beforeEach(() => {
  observadores = []
  vi.stubGlobal('IntersectionObserver', IOFalso)
  delete document.documentElement.dataset.js
  window.matchMedia = vi.fn().mockReturnValue({ matches: false })
})

afterEach(() => {
  vi.unstubAllGlobals()
  document.body.innerHTML = ''
})

describe('RevelarAoRolar', () => {
  it('marca html[data-js] (é o que libera o CSS a esconder os blocos)', () => {
    monta('<section><div data-revelar>a</div></section>')
    render(<RevelarAoRolar />)
    expect(document.documentElement.dataset.js).toBe('1')
  })

  it('marca data-revelado quando o bloco entra na tela e continua observando', () => {
    monta('<section><div id="a" data-revelar>a</div><div id="b" data-revelar>b</div></section>')
    render(<RevelarAoRolar />)
    const entra = observadores[0]
    const a = document.getElementById('a')
    const b = document.getElementById('b')
    expect(entra.alvos.has(a)).toBe(true)
    expect(entra.alvos.has(b)).toBe(true)

    entra.dispara(a, false)
    expect(a.hasAttribute('data-revelado')).toBe(false)

    entra.dispara(a, true)
    expect(a.getAttribute('data-revelado')).toBe('1')
    expect(b.hasAttribute('data-revelado')).toBe(false)
    // continua observado: o fade reseta quando ele sair da tela
    expect(entra.alvos.has(a)).toBe(true)
  })

  it('o fade RESETA: quando o bloco sai inteiro da tela, perde data-revelado e refaz o fade ao voltar', () => {
    monta('<div id="a" data-revelar>a</div>')
    render(<RevelarAoRolar />)
    const entra = observadores[0]
    const sai = observadores[1]
    const a = document.getElementById('a')
    // dois observadores: o de entrada (8% de margem) e o de saída (sem margem,
    // para só esconder quando o bloco saiu por completo)
    expect(entra.opcoes).toEqual({ rootMargin: '0px 0px -8% 0px', threshold: 0 })
    expect(sai.opcoes).toEqual({ threshold: 0 })
    expect(sai.alvos.has(a)).toBe(true)

    entra.dispara(a, true)
    expect(a.getAttribute('data-revelado')).toBe('1')

    // o observador de saída avisando "ainda intersecta" não esconde nada
    sai.dispara(a, true)
    expect(a.getAttribute('data-revelado')).toBe('1')

    // saiu inteiro da tela: some
    sai.dispara(a, false)
    expect(a.hasAttribute('data-revelado')).toBe(false)

    // voltou: fade de novo
    entra.dispara(a, true)
    expect(a.getAttribute('data-revelado')).toBe('1')
  })

  it('irmãos num grupo entram em escada: cada um ganha um atraso maior', () => {
    monta('<ul data-revelar-grupo><li data-revelar>1</li><li data-revelar>2</li><li data-revelar>3</li></ul>')
    render(<RevelarAoRolar />)
    const itens = document.querySelectorAll('[data-revelar]')
    expect(itens[0].style.getPropertyValue('--atraso')).toBe('0ms')
    expect(itens[1].style.getPropertyValue('--atraso')).toBe('90ms')
    expect(itens[2].style.getPropertyValue('--atraso')).toBe('180ms')
  })

  it('bloco que já está na tela ao carregar também entra em fade: é observado como os outros', () => {
    monta('<div id="a" data-revelar>a</div>')
    const a = document.getElementById('a')
    a.getBoundingClientRect = () => ({ top: 100, bottom: 200 })
    render(<RevelarAoRolar />)
    const io = observadores[0]
    expect(io.alvos.has(a)).toBe(true)
    expect(a.hasAttribute('data-revelado')).toBe(false)
    expect(io.opcoes).toEqual({ rootMargin: '0px 0px -8% 0px', threshold: 0 })
    io.dispara(a, true)
    expect(a.getAttribute('data-revelado')).toBe('1')
    expect(a.hasAttribute('data-imediato')).toBe(false)
  })

  it('com movimento reduzido, revela tudo na hora e não observa nada', () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true })
    monta('<div id="a" data-revelar>a</div>')
    render(<RevelarAoRolar />)
    expect(document.getElementById('a').getAttribute('data-revelado')).toBe('1')
    expect(observadores).toHaveLength(0)
  })

  it('sem IntersectionObserver no navegador, revela tudo na hora', () => {
    vi.stubGlobal('IntersectionObserver', undefined)
    monta('<div id="a" data-revelar>a</div>')
    render(<RevelarAoRolar />)
    expect(document.getElementById('a').getAttribute('data-revelado')).toBe('1')
  })

  it('não desenha nada no HTML', () => {
    const { container } = render(<RevelarAoRolar />)
    expect(container.innerHTML).toBe('')
  })
})
