import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import fs from 'node:fs'
import path from 'node:path'
import Nav from '@/components/Nav'

const contato = {
  whatsapp: '5551999754680',
  mensagem: 'Olá! Quero saber mais.',
}

const dados = {
  ancoras: [
    { href: '#video', texto: 'Vídeo' },
    { href: '#jogo', texto: 'O jogo' },
    { href: '#pais', texto: 'Para os pais' },
    { href: '#escolas', texto: 'Para escolas' },
  ],
  contato: 'Contato',
  botao: 'Baixar a demonstração',
  botaoContato: 'Falar no WhatsApp',
  botaoContatoCurto: 'WhatsApp',
}

function menu() {
  return within(screen.getByRole('navigation', { name: 'Seções da página' }))
}

describe('Nav', () => {
  it('com contato preenchido, mostra os cinco links incluindo Contato', () => {
    render(<Nav dados={dados} temContato />)
    const links = menu().getAllByRole('link')
    expect(links).toHaveLength(5)
    expect(links.map((a) => a.textContent)).toEqual([
      'Vídeo',
      'O jogo',
      'Para os pais',
      'Para escolas',
      'Contato',
    ])
    expect(menu().getByRole('link', { name: 'Contato' })).toHaveAttribute('href', '#contato')
  })

  it('sem contato, mostra quatro links e nenhum Contato', () => {
    render(<Nav dados={dados} temContato={false} />)
    const links = menu().getAllByRole('link')
    expect(links).toHaveLength(4)
    expect(menu().queryByRole('link', { name: 'Contato' })).toBeNull()
  })

  it('o botão do topo vem do painel de controle e aponta para o download', () => {
    render(<Nav dados={dados} temContato={false} />)
    expect(screen.getByRole('link', { name: 'Baixar a demonstração' })).toHaveAttribute('href', '#baixar')
  })
})

// ---------------------------------------------------------------------------
// O BOTÃO DE WHATSAPP DO CABEÇALHO (2/11, a pedido do dono)
// Ele lê o número do PAINEL DE CONTROLE, como todo o resto do site: trocar
// de número é mexer num campo só, nunca em componente.
// ---------------------------------------------------------------------------
describe('o botão de WhatsApp do cabeçalho', () => {
  const botao = () => screen.getByRole('link', { name: 'Falar no WhatsApp' })

  it('leva ao WhatsApp com o número e a mensagem do painel de controle', () => {
    render(<Nav dados={dados} contato={contato} temContato />)
    expect(botao()).toHaveAttribute(
      'href',
      'https://wa.me/5551999754680?text=' + encodeURIComponent(contato.mensagem)
    )
  })

  it('abre em aba nova, e com rel seguro', () => {
    // sem o noopener a página aberta ganha acesso a esta pelo window.opener
    render(<Nav dados={dados} contato={contato} temContato />)
    expect(botao()).toHaveAttribute('target', '_blank')
    expect(botao().getAttribute('rel')).toMatch(/noopener/)
    expect(botao().getAttribute('rel')).toMatch(/noreferrer/)
  })

  it('SOME se o número for apagado do painel de controle', () => {
    // mesma regra de honestidade do resto da página: nada de botão que não
    // leva a lugar nenhum
    render(<Nav dados={dados} contato={{ whatsapp: '' }} temContato={false} />)
    expect(screen.queryByRole('link', { name: 'Falar no WhatsApp' })).toBeNull()
  })

  it('some também se o número estiver curto demais para ser real', () => {
    // sem o código do país o wa.me aponta para uma conta que não existe
    render(<Nav dados={dados} contato={{ whatsapp: '51999754680' }} temContato />)
    expect(screen.queryByRole('link', { name: 'Falar no WhatsApp' })).toBeNull()
  })

  it('sem o bloco de contato, o cabeçalho não quebra', () => {
    render(<Nav dados={dados} />)
    expect(screen.getByRole('link', { name: 'Baixar a demonstração' })).toBeInTheDocument()
  })

  it('o botão de baixar continua sendo a ação principal', () => {
    render(<Nav dados={dados} contato={contato} temContato />)
    expect(screen.getByRole('link', { name: 'Baixar a demonstração' }).className).toMatch(/botaoPrincipal/)
    expect(botao().className).not.toMatch(/botaoPrincipal/)
  })
})

describe('o cabeçalho em tela estreita', () => {
  const CSS = fs.readFileSync(path.join(process.cwd(), 'components/Nav.module.css'), 'utf8')
  const CSS_GLOBAL = fs.readFileSync(path.join(process.cwd(), 'app/globals.css'), 'utf8')

  it('o nome acessível é o texto CHEIO, mesmo onde a tela mostra o curto', () => {
    // as duas versões convivem no HTML e quem escolhe é a largura. Sem o
    // aria-label e o aria-hidden, o leitor de tela leria as duas seguidas:
    // "Falar no WhatsApp WhatsApp"
    render(<Nav dados={dados} contato={contato} temContato />)
    const alvo = screen.getByRole('link', { name: 'Falar no WhatsApp' })
    expect(alvo).toHaveAttribute('aria-label', 'Falar no WhatsApp')
    expect(
      alvo.querySelectorAll('[aria-hidden="true"]').length,
      'as duas versões do texto têm de ser aria-hidden'
    ).toBe(2)
  })

  it('sem o texto curto no painel, cai no texto cheio em vez de ficar vazio', () => {
    const semCurto = { ...dados, botaoContatoCurto: undefined }
    render(<Nav dados={semCurto} contato={contato} temContato />)
    expect(
      screen.getByRole('link', { name: 'Falar no WhatsApp' }).textContent
    ).toContain('Falar no WhatsApp')
  })

  it('a logo é travada contra ser espremida pelos botões', () => {
    // medido em 2/11: sem flex none, a caixa da logo encolhia junto com o
    // espaço e a imagem ia atrás (o globals.css dá max-width: 100% em toda
    // imagem). No celular a logo tinha virado um carimbo de 30px.
    const bloco = CSS.match(/\.logo\s*\{([^}]*)\}/)
    expect(bloco, 'o bloco .logo sumiu do CSS').not.toBeNull()
    expect(bloco[1], 'a logo voltou a poder encolher').toMatch(/flex:\s*none/)
  })

  it('em tela estreita quem troca é a PALAVRA, não o tamanho da letra laranja', () => {
    expect(CSS, 'falta a regra que troca o texto por largura').toMatch(
      /@media[^{]*max-width:\s*420px[\s\S]*?\.textoCurto\s*\{\s*display:\s*inline/
    )
  })

  it('o botão laranja NUNCA desce de 19px, em largura nenhuma', () => {
    // o navy sobre o laranja do jogo dá 4,20:1, que pela WCAG só vale para
    // TEXTO GRANDE. Encolher a letra desse botão quebra a acessibilidade —
    // e foi por isso que o laranja escurecido ("amarronzado") foi rejeitado
    // em 21/10: a saída de lá foi texto grande, não fundo escuro.
    const tamanhos = [...CSS.matchAll(/\.cta[^{]*\{[^}]*font-size:\s*([\d.]+)px/g)].map((m) =>
      Number(m[1])
    )
    for (const t of tamanhos) expect(t).toBeGreaterThanOrEqual(19)
    expect(CSS_GLOBAL).toMatch(/\.botaoPrincipal\s*\{[^}]*font-size:\s*19px/)
  })

  it('o número do WhatsApp não está escrito à mão em componente nenhum', () => {
    // fonte única: só o content/site.js conhece o número
    const componentes = fs
      .readdirSync(path.join(process.cwd(), 'components'))
      .filter((f) => f.endsWith('.js'))
    for (const arquivo of componentes) {
      const texto = fs.readFileSync(path.join(process.cwd(), 'components', arquivo), 'utf8')
      expect(texto, `${arquivo} tem um link de WhatsApp escrito à mão`).not.toMatch(/wa\.me\//)
      expect(texto, `${arquivo} tem o número escrito à mão`).not.toMatch(/5551999754680/)
    }
  })
})
