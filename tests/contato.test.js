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
