import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import Nav from '@/components/Nav'

const dados = {
  ancoras: [
    { href: '#video', texto: 'Vídeo' },
    { href: '#jogo', texto: 'O jogo' },
    { href: '#pais', texto: 'Para os pais' },
    { href: '#escolas', texto: 'Para escolas' },
  ],
  contato: 'Contato',
  botao: 'Baixar a demo',
}

function menu() {
  return within(screen.getByRole('navigation', { name: 'Seções da página' }))
}

describe('Nav', () => {
  it('com contato preenchido, mostra os cinco links incluindo Contato', () => {
    render(<Nav dados={dados} temContato />)
    const links = menu().getAllByRole('link')
    expect(links).toHaveLength(5)
    expect(links.map((a) => a.textContent)).toEqual([
      'Vídeo',
      'O jogo',
      'Para os pais',
      'Para escolas',
      'Contato',
    ])
    expect(menu().getByRole('link', { name: 'Contato' })).toHaveAttribute('href', '#contato')
  })

  it('sem contato, mostra quatro links e nenhum Contato', () => {
    render(<Nav dados={dados} temContato={false} />)
    const links = menu().getAllByRole('link')
    expect(links).toHaveLength(4)
    expect(menu().queryByRole('link', { name: 'Contato' })).toBeNull()
  })

  it('o botão do topo vem do painel de controle e aponta para o download', () => {
    render(<Nav dados={dados} temContato={false} />)
    expect(screen.getByRole('link', { name: 'Baixar a demo' })).toHaveAttribute('href', '#baixar')
  })
})
