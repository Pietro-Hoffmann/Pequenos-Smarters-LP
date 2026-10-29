import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Previa from '@/components/previa/Previa'

const previa = {
  titulo: 'Relatório de Ana · últimas 2 semanas',
  blocos: [
    { tipo: 'anel', titulo: 'Progresso geral', pct: 72, texto: 'concluiu 7 de 9 fases' },
    { tipo: 'areas', titulo: 'Desempenho por área', linhas: [{ area: 'Leitura', pct: 82, tendencia: 'sobe', status: 'bem' }] },
    { tipo: 'nave-espacial', titulo: 'não existe' },
    { tipo: 'destaque', titulo: 'Onde precisa de mais atenção', texto: 'Memória.' },
    { tipo: 'tempo', titulo: 'Tempo de uso', valor: '28 min', rotulo: 'por dia' },
    { tipo: 'jornada', titulo: 'Ilhas e fases', ilhas: [{ nome: 'Natureza', imagem: '/images/ilha_natureza.png', estado: 'ok' }] },
    { tipo: 'cifras', titulo: 'Turma em números', itens: [{ valor: '68%', rotulo: 'média' }] },
    { tipo: 'reforco', titulo: 'Quem precisa de reforço', alunos: [{ nome: 'Miguel', area: 'Memória', atividade: 'Lago' }] },
  ],
  exemplo: 'Prévia ilustrativa, com números de exemplo',
}

describe('Previa', () => {
  it('desenha o título, os blocos na ordem e a linha de exemplo', () => {
    const { container } = render(<Previa previa={previa} />)
    expect(screen.getByText('Relatório de Ana · últimas 2 semanas')).toBeInTheDocument()
    const titulos = Array.from(container.querySelectorAll('[class*="blocoTitulo"], [class*="destaqueTitulo"]')).map((e) => e.textContent)
    expect(titulos).toEqual([
      'Progresso geral',
      'Desempenho por área',
      'Onde precisa de mais atenção',
      'Tempo de uso',
      'Ilhas e fases',
      'Turma em números',
      'Quem precisa de reforço',
    ])
    expect(screen.getByText('Prévia ilustrativa, com números de exemplo')).toBeInTheDocument()
    expect(screen.getByTestId('previa')).toBeInTheDocument()
  })

  it('ignora tipo desconhecido sem quebrar', () => {
    render(<Previa previa={previa} />)
    expect(screen.queryByText('não existe')).toBeNull()
  })

  it('sem prévia, ou só com blocos desconhecidos, não desenha nada', () => {
    const { container, rerender } = render(<Previa />)
    expect(container.innerHTML).toBe('')
    rerender(<Previa previa={{ titulo: 'x', blocos: [{ tipo: 'zzz' }] }} />)
    expect(container.innerHTML).toBe('')
  })

  it('passa os rótulos para os blocos', () => {
    const rotulos = { status: { bem: 'Tudo certo' } }
    render(<Previa previa={previa} rotulos={rotulos} />)
    expect(screen.getByText('Tudo certo')).toBeInTheDocument()
  })

  it('cada bloco desenhado carrega o seu tipo em data-tipo (é o gancho da grade do CSS)', () => {
    const { container } = render(<Previa previa={previa} />)
    const tipos = Array.from(container.querySelectorAll('[data-tipo]')).map((e) => e.getAttribute('data-tipo'))
    expect(tipos).toEqual(['anel', 'areas', 'destaque', 'tempo', 'jornada', 'cifras', 'reforco'])
  })

  it('não cria link nenhum', () => {
    const { container } = render(<Previa previa={previa} />)
    expect(container.querySelector('a')).toBeNull()
  })
})
