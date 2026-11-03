import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Footer from '@/components/Footer'

// O rodapé abria com "Feito com React Native, Expo e Supabase" e com a linha
// do TCC. Era a última coisa que um comprador de escola lia antes de sair da
// página, e lia como portfólio. As duas linhas foram para a seção "Quem fez".
// Aqui ficou o que um fornecedor tem: marca, canal, a linha dos dados e o
// copyright — e o canal obedece à mesma regra de estado vazio do resto da
// página: ou existe de verdade, ou não existe link nenhum.
const dados = {
  dados: 'O jogo pede o cadastro de um responsável e guarda o progresso em servidor.',
  rotuloWhatsapp: 'WhatsApp',
}

const contatoCheio = {
  email: 'oi@exemplo.com',
  whatsapp: '5551999999999',
  assunto: 'Licenciamento',
  mensagem: 'Olá!',
}

const contatoVazio = { email: '', whatsapp: '', assunto: 'Licenciamento', mensagem: 'Olá!' }

describe('Footer', () => {
  it('não anuncia mais a stack técnica nem o TCC', () => {
    const { container } = render(<Footer dados={dados} contato={contatoVazio} />)
    expect(container.textContent).not.toContain('React Native')
    expect(container.textContent).not.toContain('Conclusão de Curso')
  })

  it('mostra a linha honesta sobre os dados da criança', () => {
    render(<Footer dados={dados} contato={contatoVazio} />)
    expect(screen.getByText(dados.dados)).toBeInTheDocument()
  })

  it('mostra o copyright do ano corrente', () => {
    render(<Footer dados={dados} contato={contatoVazio} />)
    const ano = new Date().getFullYear()
    expect(screen.getByText(`© ${ano} Pequenos Smarters`)).toBeInTheDocument()
  })

  it('sem canal de contato, não existe link nenhum no rodapé', () => {
    const { container } = render(<Footer dados={dados} contato={contatoVazio} />)
    expect(container.querySelector('a')).toBeNull()
  })

  it('sem contato nenhum passado, também não quebra nem inventa link', () => {
    const { container } = render(<Footer dados={dados} />)
    expect(container.querySelector('a')).toBeNull()
    expect(screen.getByText(dados.dados)).toBeInTheDocument()
  })

  it('com e-mail, o rodapé ganha o mailto pronto do lib/links', () => {
    render(<Footer dados={dados} contato={{ ...contatoVazio, email: 'oi@exemplo.com' }} />)
    expect(screen.getByRole('link', { name: 'oi@exemplo.com' })).toHaveAttribute(
      'href',
      'mailto:oi@exemplo.com?subject=Licenciamento'
    )
    expect(screen.queryByRole('link', { name: 'WhatsApp' })).toBeNull()
  })

  it('com os dois canais, mostra os dois links', () => {
    render(<Footer dados={dados} contato={contatoCheio} />)
    expect(screen.getByRole('link', { name: 'oi@exemplo.com' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'WhatsApp' }).getAttribute('href')).toContain(
      'https://wa.me/5551999999999?text='
    )
  })

  it('WhatsApp sem o código do país não vira link, igual ao resto da página', () => {
    const { container } = render(
      <Footer dados={dados} contato={{ ...contatoVazio, whatsapp: '51999999999' }} />
    )
    expect(container.querySelector('a')).toBeNull()
  })

  it('sem a linha de dados escrita no painel, o rodapé não mostra parágrafo vazio', () => {
    const { container } = render(<Footer dados={{ rotuloWhatsapp: 'WhatsApp' }} contato={contatoVazio} />)
    expect(container.querySelectorAll('p')).toHaveLength(1) // só o copyright
  })
})

// ---------------------------------------------------------------------------
// OS TELEFONES DA EQUIPE NO RODAPÉ (3/11, a pedido do dono)
// O contato da página passou a ser SÓ e-mail: o botão de WhatsApp saiu do
// cabeçalho e o cartão saiu da seção "Fale com a gente". Os telefones
// ficaram aqui embaixo, com o nome de quem atende — para quem procurar,
// e sem disputar com o canal principal.
// ---------------------------------------------------------------------------
describe('os telefones da equipe no rodapé', () => {
  const equipe = [
    { nome: 'Rafaela', whatsapp: '5551999754680' },
    { nome: 'Estefanie', whatsapp: '5551988887777' },
  ]
  const comEquipe = { ...dados, tituloEquipe: 'Falar direto com a gente', equipe }

  it('mostra cada pessoa com o nome e o link do WhatsApp dela', () => {
    render(<Footer dados={comEquipe} contato={contatoVazio} />)
    for (const pessoa of equipe) {
      const link = screen.getByRole('link', { name: new RegExp(pessoa.nome) })
      expect(link).toHaveAttribute('href', expect.stringContaining(`wa.me/${pessoa.whatsapp}`))
      expect(link).toHaveAttribute('target', '_blank')
      expect(link.getAttribute('rel')).toMatch(/noopener/)
    }
  })

  it('mostra o número escrito, e não só o nome', () => {
    // quem vai ligar precisa ver o número; quem vai tocar usa o link
    render(<Footer dados={comEquipe} contato={contatoVazio} />)
    expect(screen.getByText('(51) 99975-4680')).toBeInTheDocument()
  })

  it('SEM a lista no painel, nada aparece', () => {
    const { container } = render(<Footer dados={dados} contato={contatoVazio} />)
    expect(container.textContent).not.toContain('Falar direto')
  })

  it('pessoa sem número é ignorada em vez de virar link morto', () => {
    const meio = {
      ...comEquipe,
      equipe: [{ nome: 'Rafaela', whatsapp: '5551999754680' }, { nome: 'Alguém', whatsapp: '' }],
    }
    render(<Footer dados={meio} contato={contatoVazio} />)
    expect(screen.getByRole('link', { name: /Rafaela/ })).toBeInTheDocument()
    expect(screen.queryByText(/Alguém/)).toBeNull()
  })

  it('número curto demais para ser real também é ignorado', () => {
    // sem o código do país o wa.me aponta para uma conta que não existe
    const curto = { ...comEquipe, equipe: [{ nome: 'Rafaela', whatsapp: '51999754680' }] }
    render(<Footer dados={curto} contato={contatoVazio} />)
    expect(screen.queryByText(/Rafaela/)).toBeNull()
  })

  it('a lista é uma lista de verdade, para quem usa leitor de tela', () => {
    render(<Footer dados={comEquipe} contato={contatoVazio} />)
    const lista = screen.getByRole('list', { name: 'Falar direto com a gente' })
    expect(lista.querySelectorAll('li')).toHaveLength(2)
  })
})
