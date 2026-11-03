import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import fs from 'node:fs'
import path from 'node:path'
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

// ---------------------------------------------------------------------------
// O RODAPÉ EM TRÊS COLUNAS (3/11, a pedido do dono: "distribua as infos
// horizontalmente para diminuir ele", colunas nas BORDAS)
//
// Medido antes e depois, em 17 larguras de 320 a 1440: nenhuma piorou, a
// pior rendeu 30px e o computador rendeu 130px (331px → 201px). O ganho
// vem de a altura passar a ser a da COLUNA MAIS ALTA em vez da SOMA das
// cinco faixas empilhadas — por isso o que estes testes guardam é o
// empilhamento, e não a altura (que depende de fonte e de largura).
// ---------------------------------------------------------------------------
describe('o rodapé distribui as informações na horizontal', () => {
  const CSS = fs.readFileSync(
    path.join(process.cwd(), 'components/Footer.module.css'),
    'utf8',
  )
  // sem expressao regular: o seletor e procurado como texto e o corpo vai
  // ate a chave de fechar. Barra invertida dentro de RegExp escrita aqui ja
  // custou um teste que passava por engano.
  const regra = (seletor) => {
    const i = CSS.indexOf(seletor + ' {')
    return i < 0 ? null : CSS.slice(i, CSS.indexOf('}', i))
  }
  const faixaDe = (largura) => {
    const i = CSS.indexOf('@media (max-width: ' + largura + 'px)')
    if (i < 0) return ''
    const j = CSS.indexOf('@media', i + 6)
    return CSS.slice(i, j < 0 ? CSS.length : j)
  }
  // PROCURAR O VALOR NO BLOCO INTEIRO NAO SERVE, e isto foi pego por
  // reversao: apagar o `flex-direction: column` do .faixa dentro da faixa
  // de 860px deixava o teste VERDE, porque o mesmo valor aparece ali na
  // regra .equipe a, de outro assunto. A regra tem de ser isolada antes.
  const regraEm = (bloco, seletor) => {
    const i = bloco.indexOf(seletor + ' {')
    return i < 0 ? null : bloco.slice(i, bloco.indexOf('}', i))
  }

  const completo = {
    dados: 'O jogo pede o cadastro de um responsável.',
    rotuloWhatsapp: 'WhatsApp',
    tituloEquipe: 'Falar direto com a gente',
    equipe: [{ nome: 'Rafaela', whatsapp: '5551999000251' }],
  }

  it('a marca, a equipe e a letra miúda são IRMÃS numa faixa só', () => {
    // é isto que troca a soma das alturas pela maior delas; empilhadas de
    // novo, o rodapé volta aos 331px
    const { container } = render(<Footer dados={completo} contato={contatoCheio} />)
    const faixa = container.querySelector('[class*=faixa]')
    expect(faixa, 'a faixa das três colunas sumiu').not.toBeNull()
    expect(faixa.children, 'as três colunas deixaram de ser irmãs').toHaveLength(3)
  })

  it('as colunas vão para as BORDAS, e não para o centro', () => {
    // o pedido foi "bordas". Com justify-content: center elas se juntariam
    // no meio e a faixa pareceria um bloco só.
    expect(regra('.faixa'), 'o bloco .faixa sumiu do CSS').not.toBeNull()
    expect(regra('.faixa')).toContain('justify-content: space-between')
    expect(regra('.faixa')).toContain('display: flex')
  })

  it('a logo continua em cima do e-mail, as duas na coluna da marca', () => {
    const { container } = render(<Footer dados={completo} contato={contatoCheio} />)
    const marca = container.querySelector('[class*=marca]')
    expect(marca.querySelector('img')).not.toBeNull()
    expect(marca.querySelector('a[href^="mailto:"]')).not.toBeNull()
  })

  it('EM TELA ESTREITA a faixa volta a empilhar', () => {
    // três colunas em 390px dariam 110px cada. Sem esta faixa o rodapé em
    // 768px ia a 373px — PIOR que os 331px de antes de tudo, porque três
    // colunas que não cabem viram três linhas.
    const faixa = regraEm(faixaDe(860), '.faixa')
    expect(faixa, 'sumiu o .faixa da faixa de 860px').not.toBeNull()
    expect(faixa, 'as colunas não desempilham mais em tela estreita').toContain(
      'flex-direction: column',
    )
  })

  it('uma coluna vazia não deixa buraco: as que sobram se reorganizam', () => {
    // sem letra miúda e sem equipe no painel, sobra a marca sozinha — e
    // ela não pode ficar jogada no meio de uma faixa de três
    const { container } = render(
      <Footer dados={{ rotuloWhatsapp: 'WhatsApp' }} contato={contatoCheio} />,
    )
    const faixa = container.querySelector('[class*=faixa]')
    expect(faixa.children).toHaveLength(1)
    expect(faixa.querySelector('[class*=marca]')).not.toBeNull()
  })

  it('o filete do copyright existe no desenho largo e some no empilhado', () => {
    // ele fecha a faixa das três colunas; empilhado vira só mais uma linha
    // horizontal no meio de outras, e custava 25px para não dizer nada
    expect(regra('.ano'), 'o filete sumiu do desenho largo').toContain('border-top: 1px')
    const ano = regraEm(faixaDe(860), '.ano')
    expect(ano, 'sumiu o .ano da faixa de 860px').not.toBeNull()
    expect(ano, 'o filete não é mais removido no empilhado').toContain('border-top: 0')
  })
})
