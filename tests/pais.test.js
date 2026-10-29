import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ParaOsPais from '@/components/ParaOsPais'

// ---------------------------------------------------------------------------
// ACOMPANHAMENTO — PAINEL DOS PAIS E PAINEL DO PROFESSOR
// A seção compõe os dois painéis (cada um com a prévia da pasta
// components/previa) e as três fichas pequenas. O que estes testes
// protegem: a composição, o formato antigo do painel de controle, toda
// imagem decorativa, a linha "prévia ilustrativa" nos dois, e nenhum link.
// ---------------------------------------------------------------------------

const dados = {
  sobrancelha: 'Acompanhamento',
  titulo: 'Pais e professores acompanham cada passo',
  texto: 'O progresso fica registrado.',
  rotulos: { status: { bem: 'Indo bem', evolucao: 'Em evolução', atencao: 'Precisa de atenção' } },
  paineis: [
    {
      etiqueta: 'Para a família',
      titulo: 'Painel dos Pais',
      icone: '/images/icone_painel.png',
      mascote: '/images/ziggy.png',
      texto: 'Em que a criança vai melhor.',
      itens: ['Histórico completo'],
      previa: {
        titulo: 'Relatório de Ana',
        blocos: [{ tipo: 'areas', linhas: [{ area: 'Leitura', pct: 82, tendencia: 'sobe', status: 'bem' }] }],
        exemplo: 'Prévia ilustrativa, com números de exemplo',
      },
    },
    {
      etiqueta: 'Para a escola',
      titulo: 'Painel do Professor',
      mascote: '/images/lina.png',
      texto: 'A turma inteira.',
      itens: ['Login por turma'],
      previa: {
        titulo: '1º ano A · 24 alunos',
        blocos: [{ tipo: 'cifras', itens: [{ valor: '68%', rotulo: 'média da turma' }] }],
        exemplo: 'Prévia ilustrativa, com números e nomes de exemplo',
      },
    },
  ],
  extras: [{ icone: '/images/estrelas.png', titulo: 'Estrelas', texto: 'Feedback imediato.' }],
}

describe('ParaOsPais (acompanhamento)', () => {
  it('monta a seção #pais com título, os dois painéis e as fichas', () => {
    const { container } = render(<ParaOsPais dados={dados} />)
    expect(container.querySelector('section#pais')).not.toBeNull()
    expect(screen.getByRole('heading', { level: 2, name: 'Pais e professores acompanham cada passo' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Painel dos Pais' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Painel do Professor' })).toBeInTheDocument()
    expect(screen.getByText('Para a família')).toBeInTheDocument()
    expect(screen.getByText('Para a escola')).toBeInTheDocument()
    expect(screen.getByText('Login por turma')).toBeInTheDocument()
    expect(screen.getByText('Estrelas')).toBeInTheDocument()
    expect(container.querySelectorAll('[data-testid="painel"]')).toHaveLength(2)
  })

  it('cada painel traz a sua prévia, com a linha de "prévia ilustrativa"', () => {
    render(<ParaOsPais dados={dados} />)
    expect(screen.getAllByTestId('previa')).toHaveLength(2)
    expect(screen.getByText('Relatório de Ana')).toBeInTheDocument()
    expect(screen.getByText('Indo bem')).toBeInTheDocument()
    expect(screen.getByText('68%')).toBeInTheDocument()
    expect(screen.getByText('Prévia ilustrativa, com números de exemplo')).toBeInTheDocument()
    expect(screen.getByText('Prévia ilustrativa, com números e nomes de exemplo')).toBeInTheDocument()
  })

  it('toda imagem da seção é decorativa', () => {
    const { container } = render(<ParaOsPais dados={dados} />)
    const imgs = container.querySelectorAll('img')
    expect(imgs.length).toBeGreaterThan(0)
    for (const img of imgs) {
      expect(img).toHaveAttribute('aria-hidden', 'true')
      expect(img).toHaveAttribute('alt', '')
    }
  })

  it('a seção não cria link nenhum', () => {
    const { container } = render(<ParaOsPais dados={dados} />)
    expect(container.querySelector('a')).toBeNull()
  })

  it('painel sem prévia mostra só texto e lista, sem buraco', () => {
    const semPrevia = { ...dados, paineis: [{ titulo: 'Painel dos Pais', texto: 'Só texto.', itens: ['Um item'] }] }
    const { container } = render(<ParaOsPais dados={semPrevia} />)
    expect(container.querySelectorAll('[data-testid="previa"]')).toHaveLength(0)
    expect(screen.getByText('Só texto.')).toBeInTheDocument()
  })

  it('o formato antigo do painel de controle (só itens) vira as fichas, sem painéis', () => {
    const antigo = { titulo: 'Para quem cuida', itens: [{ titulo: 'Painel dos Pais', texto: 'Progresso da criança.' }] }
    const { container } = render(<ParaOsPais dados={antigo} />)
    expect(container.querySelectorAll('[data-testid="painel"]')).toHaveLength(0)
    expect(screen.getByText('Painel dos Pais')).toBeInTheDocument()
    expect(screen.getByText('Progresso da criança.')).toBeInTheDocument()
  })

  it('sem fichas e sem painéis, sobra só o título — nada quebra', () => {
    const { container } = render(<ParaOsPais dados={{ titulo: 'Só título' }} />)
    expect(container.querySelector('section#pais')).not.toBeNull()
    expect(container.querySelectorAll('ul')).toHaveLength(0)
  })

  it('o título não usa a voz do jogo: o contorno é só da abertura e do clímax', () => {
    render(<ParaOsPais dados={dados} />)
    const titulo = screen.getByRole('heading', { level: 2 })
    expect(titulo).toHaveClass('tituloSecao')
    expect(titulo).not.toHaveClass('tituloJogo')
  })
})
