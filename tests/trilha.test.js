import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import Trilha from '@/components/Trilha'
import fs from 'node:fs'
import path from 'node:path'

// ---------------------------------------------------------------------------
// A TRILHA DO JOGO NO SITE
// Navegador nenhum deixa áudio com som começar sozinho: só depois de o
// visitante interagir com a página. Por isso o componente fica ARMADO e
// entra no primeiro toque, com o volume subindo de zero — decisão do dono
// em 30/10, com o fade para não assustar.
//
// O que estes testes protegem:
//   • a música NÃO é baixada antes de alguém ligar o som;
//   • o primeiro toque liga uma vez só;
//   • quem desligou não é importunado de novo na próxima visita;
//   • o controle é operável e anuncia o estado em que está.
// ---------------------------------------------------------------------------

const dados = {
  ativo: true,
  arquivo: '/sons/musica_fundo.mp3',
  rotuloLigar: 'Ligar a música',
  rotuloDesligar: 'Desligar a música',
  rotuloVolume: 'Volume da música',
  volumeInicial: 0.35,
}

const CHAVE = 'ps-trilha'
const audio = () => document.querySelector('audio')
const botao = () => screen.getByRole('button')
const faixa = () => screen.getByRole('slider')

let tocou

beforeEach(() => {
  localStorage.clear()
  tocou = 0
  // jsdom não implementa play(): sem isto o componente estoura
  window.HTMLMediaElement.prototype.play = vi.fn(() => {
    tocou += 1
    return Promise.resolve()
  })
  window.HTMLMediaElement.prototype.pause = vi.fn()
  // o fade sobe o volume quadro a quadro; aqui cada quadro roda na hora
  vi.stubGlobal('requestAnimationFrame', (cb) => {
    cb(performance.now() + 10000) // tempo suficiente para o fade terminar
    return 1
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('Trilha', () => {
  it('não baixa a música antes de alguém ligar o som', () => {
    render(<Trilha dados={dados} />)
    const el = audio()
    expect(el).not.toBeNull()
    expect(el.getAttribute('preload'), 'preload precisa ser none').toBe('none')
    expect(
      el.getAttribute('src'),
      'com src definido o navegador já começa a buscar o arquivo inteiro'
    ).toBeNull()
    expect(tocou).toBe(0)
  })

  it('o primeiro toque na página liga a música, e só uma vez', () => {
    render(<Trilha dados={dados} />)

    fireEvent.pointerDown(document.body)
    expect(audio().getAttribute('src')).toBe('/sons/musica_fundo.mp3')
    expect(tocou).toBe(1)

    // o segundo toque não redispara
    fireEvent.pointerDown(document.body)
    expect(tocou).toBe(1)
  })

  it('a música entra subindo o volume: silêncio, metade, alvo', () => {
    // aqui os quadros são avançados à mão, para flagrar o MEIO do fade —
    // é o que prova que a música não entra no volume cheio de uma vez
    let quadros = []
    vi.stubGlobal('requestAnimationFrame', (cb) => {
      quadros.push(cb)
      return quadros.length
    })
    const t0 = 1000
    vi.spyOn(performance, 'now').mockReturnValue(t0)
    const rodarAte = (ms) => {
      const pendentes = quadros
      quadros = []
      act(() => pendentes.forEach((cb) => cb(t0 + ms)))
    }

    render(<Trilha dados={dados} />)
    fireEvent.pointerDown(document.body)
    expect(audio().volume, 'o fade precisa começar no silêncio').toBe(0)

    rodarAte(750) // metade de 1500ms
    expect(audio().volume).toBeCloseTo(0.175, 2)

    rodarAte(1500)
    expect(audio().volume).toBeCloseTo(0.35, 2)
  })

  it('o botão desliga, e a escolha fica guardada', () => {
    render(<Trilha dados={dados} />)
    fireEvent.pointerDown(document.body)
    expect(botao()).toHaveAccessibleName('Desligar a música')

    fireEvent.click(botao())
    expect(botao()).toHaveAccessibleName('Ligar a música')
    expect(JSON.parse(localStorage.getItem(CHAVE)).ligado).toBe(false)
  })

  it('quem já desligou não leva música de novo na próxima visita', () => {
    localStorage.setItem(CHAVE, JSON.stringify({ ligado: false, volume: 0.35 }))
    render(<Trilha dados={dados} />)

    fireEvent.pointerDown(document.body)
    expect(tocou, 'o primeiro toque não pode armar para quem desligou').toBe(0)
    expect(audio().getAttribute('src')).toBeNull()
    expect(botao()).toHaveAccessibleName('Ligar a música')
  })

  it('ligar pelo botão toca na hora: o clique já é a interação que o navegador pede', () => {
    localStorage.setItem(CHAVE, JSON.stringify({ ligado: false, volume: 0.35 }))
    render(<Trilha dados={dados} />)

    fireEvent.click(botao())
    expect(tocou).toBe(1)
    expect(audio().getAttribute('src')).toBe('/sons/musica_fundo.mp3')
    expect(JSON.parse(localStorage.getItem(CHAVE)).ligado).toBe(true)
  })

  it('o volume muda o áudio e fica guardado', () => {
    render(<Trilha dados={dados} />)
    fireEvent.pointerDown(document.body)

    fireEvent.change(faixa(), { target: { value: '0.8' } })
    expect(audio().volume).toBeCloseTo(0.8, 2)
    expect(JSON.parse(localStorage.getItem(CHAVE)).volume).toBeCloseTo(0.8, 2)
  })

  it('o volume guardado vale na visita seguinte', () => {
    localStorage.setItem(CHAVE, JSON.stringify({ ligado: true, volume: 0.6 }))
    render(<Trilha dados={dados} />)
    expect(faixa()).toHaveValue('0.6')

    fireEvent.pointerDown(document.body)
    expect(audio().volume).toBeCloseTo(0.6, 2)
  })

  it('a música toca em laço, como no jogo', () => {
    render(<Trilha dados={dados} />)
    expect(audio().loop).toBe(true)
  })

  it('o controle tem nome acessível e a faixa é operável por teclado', () => {
    render(<Trilha dados={dados} />)
    expect(botao()).toHaveAccessibleName('Ligar a música')
    expect(faixa()).toHaveAccessibleName('Volume da música')
    expect(faixa()).toHaveAttribute('type', 'range')
  })

  it('tem identificador estável: em produção o nome da classe é embaralhado', () => {
    render(<Trilha dados={dados} />)
    expect(screen.getByTestId('trilha')).toBeInTheDocument()
  })

  it('desligado no painel de controle, o componente não existe na página', () => {
    const { container } = render(<Trilha dados={{ ...dados, ativo: false }} />)
    expect(container.innerHTML).toBe('')
  })

  it('sem o bloco no painel de controle, nada quebra', () => {
    const { container } = render(<Trilha />)
    expect(container.innerHTML).toBe('')
  })

  it('preferência corrompida no navegador não derruba a página', () => {
    localStorage.setItem(CHAVE, 'isto não é json')
    const { container } = render(<Trilha dados={dados} />)
    expect(container.querySelector('audio')).not.toBeNull()
    expect(botao()).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// O TAMANHO DO CONTROLE NO CELULAR
// Em 2/11 o dono apontou que ele estava grande demais no celular — medido,
// ocupava 39,5% da largura num aparelho de 390px. O que encolheu foi a
// FAIXA de volume; o botão ficou onde estava, porque ele é o alvo de toque.
// Este teste existe para a próxima redução não cair no botão.
// ---------------------------------------------------------------------------
describe('o tamanho do controle da trilha', () => {
  const CSS = fs.readFileSync(
    path.join(process.cwd(), 'components/Trilha.module.css'),
    'utf8'
  )

  it('o botão NUNCA desce de 44px: é o alvo de toque', () => {
    const medidas = [...CSS.matchAll(/\.botao[^{]*\{[^}]*?(?:width|height):\s*([\d.]+)px/g)].map(
      (m) => Number(m[1])
    )
    expect(medidas.length, 'o .botao perdeu as medidas explícitas').toBeGreaterThan(0)
    for (const px of medidas) {
      expect(px, 'encolher o botão tira acessibilidade de quem tem menos precisão').toBeGreaterThanOrEqual(44)
    }
  })

  it('a faixa de volume continua existindo no celular, só menor', () => {
    // ela não pode ser escondida: sem "passar o mouse" no dedo, uma faixa
    // recolhida vira um controle inalcançável
    const semMouse = CSS.slice(CSS.indexOf('@media (hover: none)'))
    expect(semMouse.length, 'sumiu a regra de quem não tem mouse').toBeGreaterThan(0)
    expect(semMouse.slice(0, 200)).toMatch(/opacity:\s*1/)

    const larguras = [...CSS.matchAll(/\.faixa\s*\{[^}]*width:\s*([\d.]+)px/g)]
      .map((m) => Number(m[1]))
      .filter((n) => n > 0)
    expect(larguras.length).toBeGreaterThan(0)
    for (const px of larguras) {
      expect(px, 'faixa estreita demais deixa de ser ajustável no dedo').toBeGreaterThanOrEqual(40)
    }
  })
})
