import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ParaEscolas from '@/components/ParaEscolas'

const dados = {
  titulo: 'Para escolas e redes de ensino',
  texto: 'O Pequenos Smarters é licenciado para instituições.',
  itens: [
    'Alfabetização de 6 a 8 anos em três atividades',
    'Roda nos celulares e tablets Android que a escola já tem',
  ],
  cta: 'Falar sobre licenciamento',
  ctaEmBreve: 'Canal para escolas em breve',
}

describe('ParaEscolas', () => {
  it('com contato preenchido, o botão leva para a seção de contato', () => {
    render(<ParaEscolas dados={dados} temContato />)
    expect(screen.getByRole('link', { name: 'Falar sobre licenciamento' })).toHaveAttribute(
      'href',
      '#contato'
    )
  })

  // ESTE É O TESTE DO DEFEITO QUE ESTA SEÇÃO EXISTE PARA CORRIGIR.
  // O botão apontava para `#baixar` quando não havia canal nenhum: ele
  // prometia "falar sobre licenciamento" e despejava o comprador de escola
  // no card do APK do pai, que termina num botão cinza desativado. Sem
  // canal, o certo é não ter link nenhum — e dizer isso.
  it('sem contato nenhum, não há botão: aparece a linha honesta no lugar', () => {
    render(<ParaEscolas dados={dados} temContato={false} />)

    expect(screen.getByText('Canal para escolas em breve')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Falar sobre licenciamento' })).toBeNull()
  })

  it('sem contato nenhum, a seção não leva a lugar nenhum — nem para o download', () => {
    const { container } = render(<ParaEscolas dados={dados} temContato={false} />)
    const links = Array.from(container.querySelectorAll('a'))

    expect(links).toHaveLength(0)
    // e, em especial, nada apontando para o card do APK
    expect(container.querySelector('a[href="#baixar"]')).toBeNull()
    expect(container.querySelector('a[href="#contato"]')).toBeNull()
  })

  it('sem a prop, assume que não há contato', () => {
    const { container } = render(<ParaEscolas dados={dados} />)
    expect(screen.getByText('Canal para escolas em breve')).toBeInTheDocument()
    expect(container.querySelector('a')).toBeNull()
  })

  it('sem contato e sem a linha escrita no painel, não sobra nem botão nem texto solto', () => {
    const semLinha = { ...dados, ctaEmBreve: '' }
    const { container } = render(<ParaEscolas dados={semLinha} temContato={false} />)

    expect(container.querySelector('a')).toBeNull()
    expect(screen.queryByText('Falar sobre licenciamento')).toBeNull()
  })

  it('a linha de espera some assim que existe um canal de contato', () => {
    render(<ParaEscolas dados={dados} temContato />)
    expect(screen.queryByText('Canal para escolas em breve')).toBeNull()
  })

  // COMO SE PAGA — o modelo de receita do pitch, com o preço sob controle
  // do painel: vazio mostra a linha "sob consulta", preenchido mostra o
  // número. Sem o bloco, nada é desenhado.
  describe('modelo de receita', () => {
    const modelo = {
      titulo: 'Como funciona o licenciamento',
      portas: [
        { etiqueta: 'Foco principal', nome: 'Escolas e prefeituras', plano: 'Licença anual por aluno', preco: '', precoVazio: 'Valor sob consulta', itens: ['Painel do Professor'] },
        { etiqueta: 'Porta de entrada', nome: 'Famílias', plano: 'Assinatura mensal', preco: 'R$ 19,90/mês', precoVazio: 'Valor em breve', itens: ['Painel dos Pais completo'] },
      ],
      parcerias: 'Parcerias e editais.',
    }

    it('mostra as duas portas, com "sob consulta" onde o preço está vazio e o número onde está preenchido', () => {
      render(<ParaEscolas dados={{ ...dados, modelo }} temContato />)
      expect(screen.getByText('Escolas e prefeituras')).toBeInTheDocument()
      expect(screen.getByText('Licença anual por aluno')).toBeInTheDocument()
      expect(screen.getByText('Valor sob consulta')).toBeInTheDocument()
      expect(screen.getByText('R$ 19,90/mês')).toBeInTheDocument()
      expect(screen.queryByText('Valor em breve')).toBeNull()
      expect(screen.getByText('Painel do Professor')).toBeInTheDocument()
      expect(screen.getByText('Parcerias e editais.')).toBeInTheDocument()
    })

    it('mostra a faixa de números do mercado quando o painel traz números', () => {
      render(<ParaEscolas dados={{ ...dados, modelo: { ...modelo, numeros: [{ valor: '103 mil', rotulo: 'escolas' }], fonte: 'Inep 2024' } }} temContato />)
      expect(screen.getByText('103 mil')).toBeInTheDocument()
      expect(screen.getByText('Inep 2024')).toBeInTheDocument()
    })

    it('o bloco não cria link nenhum: quem quer o valor usa o botão de contato', () => {
      const { container } = render(<ParaEscolas dados={{ ...dados, modelo }} temContato={false} />)
      expect(container.querySelectorAll('a')).toHaveLength(0)
    })

    it('sem o bloco no painel, ou com a lista de portas vazia, nada é desenhado', () => {
      const { container, rerender } = render(<ParaEscolas dados={dados} temContato />)
      expect(container.querySelector('[data-testid="modelo"]')).toBeNull()
      rerender(<ParaEscolas dados={{ ...dados, modelo: { ...modelo, portas: [] } }} temContato />)
      expect(container.querySelector('[data-testid="modelo"]')).toBeNull()
    })
  })

  it('com mostrarItens: false, os cartões de argumentos saem e só o modelo fica', () => {
    const { container } = render(
      <ParaEscolas dados={{ ...dados, mostrarItens: false, modelo: { portas: [{ nome: 'Escolas', precoVazio: 'Sob consulta' }] } }} temContato />
    )
    expect(screen.queryByText('Roda nos celulares e tablets Android que a escola já tem')).toBeNull()
    expect(container.querySelector('[data-testid="modelo"]')).not.toBeNull()
  })

  it('lista os argumentos de venda para a escola', () => {
    render(<ParaEscolas dados={dados} temContato />)
    expect(
      screen.getByText('Roda nos celulares e tablets Android que a escola já tem')
    ).toBeInTheDocument()
  })
})
