import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Contato from '@/components/Contato'

const base = {
  assunto: 'Licenciamento — Pequenos Smarters',
  mensagem: 'Olá! Quero saber mais.',
  titulo: 'Fale com a gente',
  intro: 'Dúvidas sobre licenciamento, implantação na escola ou sobre o jogo? É só chamar.',
  tituloEmail: 'Mandar um e-mail',
  tituloWhatsapp: 'Chamar no WhatsApp',
  detalheWhatsapp: 'Resposta em horário comercial',
}

describe('Contato', () => {
  it('não renderiza nada quando os dois canais estão vazios', () => {
    const { container } = render(<Contato contato={{ ...base, email: '', whatsapp: '' }} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('mostra só o cartão de e-mail quando não há WhatsApp', () => {
    render(<Contato contato={{ ...base, email: 'oi@exemplo.com', whatsapp: '' }} />)
    expect(screen.getByRole('link', { name: /e-mail/i })).toHaveAttribute(
      'href',
      'mailto:oi@exemplo.com?subject=Licenciamento%20%E2%80%94%20Pequenos%20Smarters'
    )
    expect(screen.queryByRole('link', { name: /whatsapp/i })).toBeNull()
  })

  it('mostra só o cartão de WhatsApp quando não há e-mail', () => {
    render(<Contato contato={{ ...base, email: '', whatsapp: '5551999999999' }} />)
    const link = screen.getByRole('link', { name: /whatsapp/i })
    expect(link.getAttribute('href')).toContain('https://wa.me/5551999999999?text=')
    expect(screen.queryByRole('link', { name: /e-mail/i })).toBeNull()
  })

  it('mostra os dois cartões quando os dois canais estão preenchidos', () => {
    render(<Contato contato={{ ...base, email: 'oi@exemplo.com', whatsapp: '5551999999999' }} />)

    expect(screen.getByRole('link', { name: /e-mail/i })).toHaveAttribute(
      'href',
      'mailto:oi@exemplo.com?subject=Licenciamento%20%E2%80%94%20Pequenos%20Smarters'
    )
    expect(screen.getByRole('link', { name: /whatsapp/i }).getAttribute('href')).toContain(
      'https://wa.me/5551999999999?text='
    )
    expect(screen.getByText('Fale com a gente')).toBeInTheDocument()
  })

  it('some quando o WhatsApp está sem o código do país e não há e-mail', () => {
    const { container } = render(<Contato contato={{ ...base, email: '', whatsapp: '51999999999' }} />)
    expect(container).toBeEmptyDOMElement()
  })
})

// ---------------------------------------------------------------------------
// OS CARTÕES DE CANAL, DESLIGADOS (3/11)
// Com a caixa de mensagem na seção, o cartão de e-mail virou um segundo
// caminho para a mesma coisa — e o endereço ainda reaparecia no rodapé
// logo abaixo. O dono mandou tirar.
// O CUIDADO QUE ESTE BLOCO GUARDA: desligar os cartões NÃO pode ser feito
// apagando o e-mail do painel. É ele que mantém a seção inteira existindo
// (sem e-mail nem WhatsApp ela some, e leva a caixa de mensagem junto) e
// é ele que alimenta o rodapé.
// ---------------------------------------------------------------------------
describe('os cartões de canal desligados', () => {
  const comCaixa = {
    ...base,
    email: 'oi@exemplo.com',
    whatsapp: '',
    mostrarCartoes: false,
    formulario: { chave: 'k', botao: 'Enviar', rotuloNome: 'Nome', rotuloEmail: 'E-mail', rotuloMensagem: 'Mensagem' },
  }

  it('o cartão de e-mail não aparece', () => {
    render(<Contato contato={comCaixa} />)
    expect(screen.queryByText(/Mandar um e-mail/i)).toBeNull()
  })

  it('MAS a seção continua existindo, com a caixa de mensagem', () => {
    // é o ponto que importa: esconder o cartão não pode derrubar a seção
    const { container } = render(<Contato contato={comCaixa} />)
    expect(container.querySelector('section#contato')).not.toBeNull()
    expect(screen.getByTestId('formulario-contato')).toBeInTheDocument()
  })

  it('ligando de volta no painel, o cartão retorna', () => {
    render(<Contato contato={{ ...comCaixa, mostrarCartoes: true }} />)
    expect(screen.getByText(/Mandar um e-mail/i)).toBeInTheDocument()
  })

  it('sem a chave no painel, os cartões aparecem como antes', () => {
    const semChave = { ...comCaixa }
    delete semChave.mostrarCartoes
    render(<Contato contato={semChave} />)
    expect(screen.getByText(/Mandar um e-mail/i)).toBeInTheDocument()
  })
})
