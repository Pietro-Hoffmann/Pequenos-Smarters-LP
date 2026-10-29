import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Destaque from '@/components/previa/Destaque'
import Jornada from '@/components/previa/Jornada'
import Reforco from '@/components/previa/Reforco'

describe('Destaque', () => {
  it('mostra o título e o texto', () => {
    render(<Destaque titulo="Onde precisa de mais atenção" texto="Memória: errou 6 de 10." />)
    expect(screen.getByText('Onde precisa de mais atenção')).toBeInTheDocument()
    expect(screen.getByText('Memória: errou 6 de 10.')).toBeInTheDocument()
  })
  it('sem texto não desenha nada', () => {
    const { container } = render(<Destaque titulo="Só título" />)
    expect(container.innerHTML).toBe('')
  })
})

describe('Jornada', () => {
  const ilhas = [
    { nome: 'Natureza', imagem: '/images/ilha_natureza.png', estado: 'ok' },
    { nome: 'Deserto', imagem: '/images/ilha_deserto.png', estado: 'atual' },
    { nome: 'Gelo', imagem: '/images/ilha_gelo.png', estado: 'qualquer' },
  ]
  const rotulos = { estadoIlha: { ok: 'concluída', atual: 'atual', bloq: 'bloqueada' } }

  it('desenha cada ilha com o estado em texto e a miniatura decorativa', () => {
    const { container } = render(<Jornada titulo="Ilhas e fases" ilhas={ilhas} rotulos={rotulos} />)
    expect(screen.getByText('Ilhas e fases')).toBeInTheDocument()
    expect(screen.getByText('Natureza')).toBeInTheDocument()
    expect(screen.getByText('concluída')).toBeInTheDocument()
    expect(screen.getByText('atual')).toBeInTheDocument()
    expect(screen.getByText('bloqueada')).toBeInTheDocument()
    const itens = container.querySelectorAll('li')
    expect(itens[0]).toHaveAttribute('data-estado', 'ok')
    expect(itens[2]).toHaveAttribute('data-estado', 'bloq')
    for (const img of container.querySelectorAll('img')) {
      expect(img).toHaveAttribute('alt', '')
      expect(img).toHaveAttribute('aria-hidden', 'true')
    }
  })

  it('sem rótulos usa as palavras de reserva', () => {
    render(<Jornada ilhas={ilhas} />)
    expect(screen.getByText('concluída')).toBeInTheDocument()
  })

  it('lista vazia não desenha nada', () => {
    const { container } = render(<Jornada ilhas={[]} />)
    expect(container.innerHTML).toBe('')
  })
})

describe('Reforco', () => {
  const alunos = [
    { nome: 'Miguel', area: 'Memória', atividade: 'Lago das Letras' },
    { nome: 'Sofia', area: 'Escrita', atividade: 'Campo das Letras' },
  ]
  it('lista cada aluno com área e atividade', () => {
    render(<Reforco titulo="Quem precisa de reforço" alunos={alunos} />)
    expect(screen.getByText('Quem precisa de reforço')).toBeInTheDocument()
    expect(screen.getByText('Miguel')).toBeInTheDocument()
    expect(screen.getByText('Memória · Lago das Letras')).toBeInTheDocument()
    expect(screen.getByText('Sofia')).toBeInTheDocument()
  })
  it('lista vazia não desenha nada', () => {
    const { container } = render(<Reforco alunos={[]} />)
    expect(container.innerHTML).toBe('')
  })
  it('não cria link nenhum', () => {
    const { container } = render(<Reforco alunos={alunos} />)
    expect(container.querySelector('a')).toBeNull()
  })
})
