import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Areas from '@/components/previa/Areas'

const rotulos = {
  cabecalho: { area: 'Área', dominio: 'Domínio', tendencia: 'Tendência', alunos: 'Alunos', status: 'Situação' },
  status: { bem: 'Indo bem', evolucao: 'Em evolução', atencao: 'Precisa de atenção' },
  tendencia: { sobe: 'melhorando', estavel: 'estável', desce: 'piorando' },
  alunosEmAtencao: 'alunos em atenção',
}

const familia = [
  { area: 'Leitura', pct: 82, tendencia: 'sobe', status: 'bem' },
  { area: 'Memória', pct: 45, tendencia: 'desce', status: 'atencao' },
]

const turma = [
  { area: 'Escrita', pct: 58, atencao: 9, status: 'evolucao' },
]

describe('Areas (família)', () => {
  it('desenha a barra na porcentagem, com o número ao lado e leitura acessível', () => {
    const { container } = render(<Areas titulo="Desempenho por área" linhas={familia} rotulos={rotulos} />)
    expect(screen.getByText('Desempenho por área')).toBeInTheDocument()
    expect(screen.getByLabelText('82%')).toBeInTheDocument()
    expect(screen.getByLabelText('45%')).toBeInTheDocument()
    const barras = container.querySelectorAll('[class*="barraCheia"]')
    expect(barras[0].style.width).toBe('82%')
    expect(barras[1].style.width).toBe('45%')
  })

  it('tendência e situação são texto, e a linha é marcada por dado', () => {
    const { container } = render(<Areas linhas={familia} rotulos={rotulos} />)
    expect(screen.getByText('melhorando')).toBeInTheDocument()
    expect(screen.getByText('piorando')).toBeInTheDocument()
    expect(screen.getByText('Indo bem')).toBeInTheDocument()
    expect(screen.getByText('Precisa de atenção')).toBeInTheDocument()
    const atencao = container.querySelector('[data-status="atencao"]')
    expect(atencao.textContent).toContain('Memória')
    expect(container.querySelector('[data-status="bem"]').textContent).toContain('Leitura')
  })

  it('mostra o cabeçalho com a coluna de tendência', () => {
    render(<Areas linhas={familia} rotulos={rotulos} />)
    expect(screen.getByText('Tendência')).toBeInTheDocument()
    expect(screen.queryByText('Alunos')).toBeNull()
  })
})

describe('Areas (turma)', () => {
  it('troca a tendência por "N alunos em atenção" e o cabeçalho por "Alunos"', () => {
    render(<Areas linhas={turma} rotulos={rotulos} />)
    expect(screen.getByText('9')).toBeInTheDocument()
    expect(screen.getByText(/alunos em atenção/)).toBeInTheDocument()
    expect(screen.getByText('Alunos')).toBeInTheDocument()
    expect(screen.queryByText('Tendência')).toBeNull()
    expect(screen.getByText('Em evolução')).toBeInTheDocument()
  })
})

describe('Areas (robustez)', () => {
  it('valores fora da faixa, status e tendência desconhecidos não quebram', () => {
    const torto = [
      { area: 'x', pct: 140, tendencia: 'lateral', status: 'zzz' },
      { area: 'y', pct: -5, atencao: -3, status: 'atencao' },
    ]
    const { container } = render(<Areas linhas={torto} rotulos={rotulos} />)
    const barras = container.querySelectorAll('[class*="barraCheia"]')
    expect(barras[0].style.width).toBe('100%')
    expect(barras[1].style.width).toBe('0%')
    expect(container.querySelector('[data-status="bem"]')).not.toBeNull()
    expect(screen.queryByText('lateral')).toBeNull()
    // a linha com atencao negativa mostra 0 alunos (e, como a tabela virou
    // modo turma, a linha sem `atencao` também mostra 0 — por isso a busca
    // é pela linha, não pelo texto solto)
    expect(container.querySelector('[data-status="atencao"] strong').textContent).toBe('0')
  })

  it('sem rótulos, usa palavras de reserva em português', () => {
    render(<Areas linhas={familia} />)
    expect(screen.getByText('Indo bem')).toBeInTheDocument()
    expect(screen.getByText('melhorando')).toBeInTheDocument()
    expect(screen.getByText('Situação')).toBeInTheDocument()
  })

  it('lista vazia não desenha nada', () => {
    const { container } = render(<Areas linhas={[]} rotulos={rotulos} />)
    expect(container.innerHTML).toBe('')
  })
})
