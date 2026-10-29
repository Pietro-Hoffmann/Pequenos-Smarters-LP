import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import BaixarDemo from '@/components/BaixarDemo'

const dados = {
  titulo: 'Baixe a demo gratuita',
  itens: [
    'Ilha da Natureza completa',
    '3 atividades',
    'Painel dos Pais',
    'Sem anúncios',
    'Sem compras dentro do app',
  ],
  rodape: 'Gostou? Dentro do jogo tem um botão para solicitar a licença completa.',
  emBreve: 'Em breve',
  textoBotao: 'Baixar a demo',
  dados:
    'Para jogar é preciso criar uma conta: o responsável informa os dados dele e o nome e a idade da criança.',
}

describe('BaixarDemo', () => {
  it('sem link, mostra "Em breve" desativado, sem âncora e sem QR Code', () => {
    const { container } = render(<BaixarDemo dados={dados} url="" />)
    const botao = screen.getByRole('button', { name: 'Em breve' })
    expect(botao).toBeDisabled()
    expect(container.querySelector('a')).toBeNull()
    expect(container.querySelector('svg')).toBeNull()
  })

  it('com link, vira âncora para o APK e mostra o QR Code', () => {
    const { container } = render(<BaixarDemo dados={dados} url="https://expo.dev/artifacts/abc.apk" />)
    const link = screen.getByRole('link', { name: 'Baixar a demo' })
    expect(link).toHaveAttribute('href', 'https://expo.dev/artifacts/abc.apk')
    expect(screen.queryByText('Em breve')).toBeNull()
    expect(container.querySelector('svg')).not.toBeNull()
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
