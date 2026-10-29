import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render } from '@testing-library/react'
import fs from 'node:fs'
import path from 'node:path'
import Nav from '@/components/Nav'

// ---------------------------------------------------------------------------
// O EFEITO DE CLIMA NÃO PODE VAZAR PARA A BARRA DO TOPO
// Trocar de ilha monta uma camada que varre a TELA (geada, rajada, calor).
// Ela nascia com inset: 0 e z-index 60, contra os 50 da barra — ou seja,
// pintava por cima do cabeçalho durante o segundo da troca (Pietro, 22/10).
//
// Dois cuidados, e os dois importam:
//   • z-index menor que o da barra resolve o caso normal;
//   • começar ABAIXO da barra resolve também durante a View Transition,
//     quando o navegador promove a camada para o overlay dele e o z-index
//     deixa de valer.
// Como a barra muda de altura ao rolar (o padding encolhe), quem diz a
// altura é ela mesma, em --altura-barra. Essa variável é SÓ DE SAÍDA:
// a primeira tentativa publicou em --altura-nav, que o próprio conteúdo
// da barra usa como min-height, e cada medição engordava a barra até
// passar de 10.000px. O último teste daqui existe para pegar isso.
// ---------------------------------------------------------------------------

const leia = (arquivo) => fs.readFileSync(path.join(process.cwd(), arquivo), 'utf8')
const CSS_ILHAS = leia('components/Ilhas.module.css')
const CSS_NAV = leia('components/Nav.module.css')

const bloco = (css, seletor) => {
  const achado = css.match(new RegExp(`\\${seletor}\\s*\\{([^}]*)\\}`))
  return achado ? achado[1] : null
}
const zDe = (texto) => {
  const achado = texto.match(/z-index:\s*(-?\d+)/)
  return achado ? Number(achado[1]) : null
}

const dados = {
  ancoras: [
    { href: '#video', texto: 'Vídeo' },
    { href: '#jogo', texto: 'O jogo' },
  ],
  contato: 'Contato',
  botao: 'Baixar a demo',
}

describe('a camada de efeito das ilhas', () => {
  it('fica abaixo da barra do topo na pilha', () => {
    const camada = bloco(CSS_ILHAS, '.efeito')
    const barra = bloco(CSS_NAV, '.barra')
    expect(camada, 'o bloco .efeito sumiu do CSS').not.toBeNull()
    expect(zDe(camada), 'a camada precisa declarar z-index').not.toBeNull()
    expect(zDe(barra), 'a barra precisa declarar z-index').not.toBeNull()
    expect(
      zDe(camada) < zDe(barra),
      `a camada (${zDe(camada)}) não pode ficar acima da barra (${zDe(barra)})`
    ).toBe(true)
  })

  it('começa abaixo da barra, e não no topo da tela', () => {
    const camada = bloco(CSS_ILHAS, '.efeito')
    // inset: 0 colocaria a camada cobrindo o cabeçalho — foi o defeito
    expect(camada, 'inset: 0 faz a camada cobrir a barra de novo').not.toMatch(/inset:\s*0\s*;/)
    expect(camada, 'a camada precisa começar na altura da barra').toMatch(
      /top:\s*var\(--altura-barra/
    )
  })
})

describe('Nav', () => {
  beforeEach(() => {
    document.documentElement.style.removeProperty('--altura-nav')
  })

  it('publica a própria altura em --altura-barra: é dela que a camada se desvia', () => {
    const { container } = render(<Nav dados={dados} />)
    const barra = container.querySelector('header')
    Object.defineProperty(barra, 'offsetHeight', { value: 88, configurable: true })
    window.dispatchEvent(new Event('resize'))
    expect(document.documentElement.style.getPropertyValue('--altura-barra')).toBe('88px')
  })

  it('altura medida em zero não apaga a reserva do CSS', () => {
    // jsdom (e o primeiro quadro de um navegador) devolvem 0; escrever
    // "0px" ali faria a camada voltar a cobrir a barra inteira
    render(<Nav dados={dados} />)
    expect(document.documentElement.style.getPropertyValue('--altura-barra')).not.toBe('0px')
  })

  it('observa o border-box: o que encolhe ao rolar é o padding, e o content-box não muda', () => {
    const observados = []
    class ResizeObserverFalso {
      constructor(callback) {
        this.callback = callback
      }
      observe(elemento, opcoes) {
        observados.push(opcoes)
      }
      disconnect() {}
    }
    vi.stubGlobal('ResizeObserver', ResizeObserverFalso)
    render(<Nav dados={dados} />)
    vi.unstubAllGlobals()
    expect(observados[0], 'sem box: border-box o aviso nunca chega').toEqual({
      box: 'border-box',
    })
  })

  // O TESTE DO LAÇO.
  // Medir a barra e publicar o valor numa variável que a PRÓPRIA barra
  // consome é realimentação: a barra engorda, é medida de novo, engorda
  // mais. Aconteceu de verdade (chegou a 10.000px de altura em segundos).
  it('não consome no CSS da barra a variável que ela mesma publica', () => {
    expect(
      CSS_NAV,
      'o CSS da barra usa --altura-barra, que é justamente o que ela mede: isso é um laço'
    ).not.toMatch(/var\(\s*--altura-barra/)
  })
})
