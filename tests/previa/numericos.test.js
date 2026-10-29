import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Anel from '@/components/previa/Anel'
import Cifras from '@/components/previa/Cifras'
import Tempo from '@/components/previa/Tempo'

describe('Anel', () => {
  it('mostra a porcentagem no centro e o texto ao lado; o SVG é decorativo', () => {
    const { container } = render(<Anel titulo="Progresso geral" pct={72} texto="concluiu 7 de 9 fases" />)
    expect(screen.getByText('Progresso geral')).toBeInTheDocument()
    expect(screen.getByText('72%')).toBeInTheDocument()
    expect(screen.getByText('concluiu 7 de 9 fases')).toBeInTheDocument()
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('aria-hidden', 'true')
  })

  it('o traço do círculo segue a porcentagem (limitada)', () => {
    const { container } = render(<Anel pct={250} texto="x" />)
    const traco = container.querySelectorAll('circle')[1]
    expect(screen.getByText('100%')).toBeInTheDocument()
    expect(Number(traco.getAttribute('stroke-dashoffset'))).toBeCloseTo(0, 5)
  })

  it('sem número e sem texto, não desenha nada', () => {
    const { container } = render(<Anel />)
    expect(container.innerHTML).toBe('')
  })
})

describe('Cifras', () => {
  it('mostra cada cifra com o rótulo', () => {
    render(<Cifras titulo="Turma em números" itens={[{ valor: '68%', rotulo: 'média da turma' }, { valor: '15', rotulo: 'na meta' }]} />)
    expect(screen.getByText('Turma em números')).toBeInTheDocument()
    expect(screen.getByText('68%')).toBeInTheDocument()
    expect(screen.getByText('na meta')).toBeInTheDocument()
  })
  it('lista vazia não desenha nada', () => {
    const { container } = render(<Cifras itens={[]} />)
    expect(container.innerHTML).toBe('')
  })
})

describe('Tempo', () => {
  it('mostra o valor, o rótulo e a observação', () => {
    render(<Tempo titulo="Tempo de uso" valor="28 min" rotulo="por dia, em média" texto="Boa consistência." />)
    expect(screen.getByText('Tempo de uso')).toBeInTheDocument()
    expect(screen.getByText('28 min')).toBeInTheDocument()
    expect(screen.getByText('por dia, em média')).toBeInTheDocument()
    expect(screen.getByText('Boa consistência.')).toBeInTheDocument()
  })
  it('sem valor não desenha nada', () => {
    const { container } = render(<Tempo titulo="Tempo de uso" />)
    expect(container.innerHTML).toBe('')
  })
})
