import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import BaixarDemo from '@/components/BaixarDemo'

const dados = {
  titulo: 'Baixe a demonstração gratuita',
  itens: [
    'Ilha da Natureza completa',
    '3 atividades',
    'Painel dos Pais',
    'Sem anúncios',
    'Sem compras dentro do app',
  ],
  rodape: 'Gostou? Dentro do jogo tem um botão para solicitar a licença completa.',
  emBreve: 'Em breve',
  textoBotao: 'Baixar a demonstração',
  dados:
    'Para jogar é preciso criar uma conta: o responsável informa os dados dele e o nome e a idade da criança.',
}

describe('BaixarDemo', () => {
  it('sem link, mostra "Em breve" desativado e sem âncora', () => {
    const { container } = render(<BaixarDemo dados={dados} url="" />)
    const botao = screen.getByRole('button', { name: 'Em breve' })
    expect(botao).toBeDisabled()
    expect(container.querySelector('a')).toBeNull()
    expect(container.querySelector('svg')).toBeNull()
  })

  it('com link, vira âncora para o APK', () => {
    const { container } = render(<BaixarDemo dados={dados} url="https://expo.dev/artifacts/abc.apk" />)
    const link = screen.getByRole('link', { name: 'Baixar a demonstração' })
    expect(link).toHaveAttribute('href', 'https://expo.dev/artifacts/abc.apk')
    expect(screen.queryByText('Em breve')).toBeNull()
    // O QR CODE SAIU em 3/11, a pedido do dono, e a dependência que o
    // desenhava saiu junto. Este teste guarda isso: um svg reaparecendo
    // aqui significa que alguém trouxe o QR de volta sem querer.
    expect(container.querySelector('svg'), 'o QR Code voltou').toBeNull()
  })

  it('lista o que vem na demo', () => {
    render(<BaixarDemo dados={dados} url="" />)
    expect(screen.getByText('Ilha da Natureza completa')).toBeInTheDocument()
    expect(screen.getByText('Painel dos Pais')).toBeInTheDocument()
  })

  // -------------------------------------------------------------------
  // A PERGUNTA DO PAI: "POSSO INSTALAR ISSO NO TABLET DO MEU FILHO?"
  // Instalar um APK à mão faz o Android mostrar um aviso vermelho, e o
  // card não dizia nada sobre anúncio, compra dentro do app ou dado da
  // criança. As plaquinhas e a linha de dados respondem isso — e só com
  // o que foi conferido dentro do jogo.
  // -------------------------------------------------------------------

  it('as plaquinhas de confiança aparecem junto com as da demo', () => {
    render(<BaixarDemo dados={dados} url="" />)
    expect(screen.getByText('Sem anúncios')).toBeInTheDocument()
    expect(screen.getByText('Sem compras dentro do app')).toBeInTheDocument()
  })

  it('a linha sobre os dados da criança aparece com ou sem o link do APK', () => {
    const { unmount } = render(<BaixarDemo dados={dados} url="" />)
    expect(screen.getByText(dados.dados)).toBeInTheDocument()
    unmount()

    render(<BaixarDemo dados={dados} url="https://expo.dev/artifacts/abc.apk" />)
    expect(screen.getByText(dados.dados)).toBeInTheDocument()
  })

  it('sem a linha de dados escrita no painel, o card não mostra parágrafo vazio', () => {
    const { container } = render(<BaixarDemo dados={{ ...dados, dados: '' }} url="" />)
    expect(container.textContent).not.toContain('responsável informa')
  })
})

// ---------------------------------------------------------------------------
// O FIM DO CARD DE DOWNLOAD (3/11)
// Duas mudanças pedidas pelo dono, e a segunda corrigia uma AFIRMAÇÃO FALSA:
// a página dizia "dentro do jogo tem um botão para solicitar a licença
// completa", e esse botão não existe mais. Quem quer o jogo completo
// precisa falar com a equipe, e a página tem de dizer isso e levar lá.
// ---------------------------------------------------------------------------
describe('o convite para falar sobre o jogo completo', () => {
  const comConvite = {
    ...dados,
    dados: '',
    rodape: 'Quer o jogo completo na sua escola ou em casa?',
    rodapeLink: 'Fale com a gente',
  }

  it('leva para a seção de contato, em vez de mandar procurar dentro do jogo', () => {
    render(<BaixarDemo dados={comConvite} url="" temContato />)
    const link = screen.getByRole('link', { name: 'Fale com a gente' })
    expect(link).toHaveAttribute('href', '#contato')
  })

  it('NÃO promete mais um botão de licença dentro do jogo', () => {
    // ele não existe: dizer que existe manda a escola procurar o que não há
    const { container } = render(<BaixarDemo dados={comConvite} url="" temContato />)
    expect(container.textContent).not.toMatch(/dentro do jogo/i)
  })

  it('sem canal de contato, o convite vira texto sem link morto', () => {
    render(<BaixarDemo dados={comConvite} url="" temContato={false} />)
    expect(screen.queryByRole('link', { name: 'Fale com a gente' })).toBeNull()
    expect(screen.getByText(/Quer o jogo completo/)).toBeInTheDocument()
  })

  it('o parágrafo de cadastro e internet pode sair pelo painel', () => {
    // a mesma informação continua no rodapé da página, em versão curta
    const { container } = render(<BaixarDemo dados={comConvite} url="" temContato />)
    expect(container.textContent).not.toMatch(/precisa estar na internet/i)
  })
})
