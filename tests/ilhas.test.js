import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import Ilhas from '@/components/Ilhas'

// Três ilhas bastam para provar o carrossel: a primeira pronta, as outras
// duas em breve, cada uma com o seu clima.
const dados = {
  sobrancelha: 'O mapa',
  titulo: 'Seis ilhas para explorar',
  texto: 'A criança começa pela Ilha da Natureza.',
  rotuloDisponivel: 'Disponível',
  rotuloEmBreve: 'Em breve',
  rotuloAnterior: 'Ver a ilha anterior',
  rotuloProxima: 'Ver a próxima ilha',
  rotuloMiniaturas: 'As seis ilhas do jogo',
  rodape: 'Cada atividade vale até 3 estrelas.',
  futura: {
    texto: 'Esta ilha ainda está sendo construída.',
    botao: 'Baixar a demo',
  },
  lista: [
    {
      nome: 'Natureza',
      descricao: 'A criança caça as vogais entre as árvores.',
      arte: '/images/ilha_natureza.png',
      disponivel: true,
      tema: 'natureza',
      atividades: [
        { nome: 'Floresta das Vogais', texto: 'Vogais entre as árvores.', arte: '/images/fundo_floresta.png', cor: 'var(--carta-azul)' },
        { nome: 'Lago das Letras', texto: 'Consoantes que boiam.', arte: '/images/fundo_lago.png', cor: 'var(--carta-laranja)' },
        { nome: 'Campo das Letras', texto: 'Com qual letra começa.', arte: '/images/fundo_nuvenscampo.png', cor: 'var(--verde-botao)' },
      ],
    },
    {
      nome: 'Deserto',
      descricao: 'Um dia a criança vai cavar a areia quente.',
      arte: '/images/ilha_deserto.png',
      disponivel: false,
      tema: 'deserto',
    },
    {
      nome: 'Gelo',
      descricao: 'Logo mais a criança vai soltar as palavras congeladas.',
      arte: '/images/ilha_gelo.png',
      disponivel: false,
      tema: 'gelo',
    },
  ],
}

const palco = () => screen.getByTestId('palco')

// A camada de clima da seção é o único filho DIRETO da seção que carrega um
// data-tema (o palco carrega o dele lá dentro, dois níveis abaixo).
const climaDaSecao = (container) => container.querySelector('section > [data-tema]')

// A camada de efeito que varre a tela vai parar no fim do <body>, fora da
// seção: é por isso que ela se procura no documento inteiro.
const camadaDeEfeito = () => document.querySelector('[data-clima]')

// Um dublê do startViewTransition do navegador: roda a troca na hora e
// devolve as promessas que a API de verdade devolve.
function fingirTravessia() {
  const chamadas = []
  document.startViewTransition = (callback) => {
    chamadas.push(callback)
    callback()
    return {
      ready: Promise.resolve(),
      finished: Promise.resolve(),
      updateCallbackDone: Promise.resolve(),
      skipTransition() {},
    }
  }
  return chamadas
}

// Quem pediu menos movimento no sistema operacional. O jsdom não tem
// matchMedia nenhum, então aqui a gente coloca um.
function fingirMenosMovimento(querMenos) {
  window.matchMedia = (consulta) => ({
    matches: querMenos,
    media: consulta,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent() { return false },
  })
}

afterEach(() => {
  delete document.startViewTransition
  delete window.matchMedia
  vi.useRealTimers()
})

describe('Ilhas (carrossel)', () => {
  it('abre na primeira ilha, com o nome, a descrição e a etiqueta dela', () => {
    render(<Ilhas dados={dados} />)
    expect(screen.getByRole('heading', { level: 3, name: 'Natureza' })).toBeInTheDocument()
    expect(screen.getByText('A criança caça as vogais entre as árvores.')).toBeInTheDocument()
    expect(screen.getByText('Disponível')).toBeInTheDocument()
    // a segunda ilha ainda não está em cena
    expect(screen.queryByRole('heading', { level: 3, name: 'Deserto' })).toBeNull()
  })

  it('a seta de avançar leva para a segunda ilha e o clima do palco troca junto', () => {
    render(<Ilhas dados={dados} />)
    expect(palco()).toHaveAttribute('data-tema', 'natureza')

    fireEvent.click(screen.getByRole('button', { name: 'Ver a próxima ilha' }))

    expect(screen.getByRole('heading', { level: 3, name: 'Deserto' })).toBeInTheDocument()
    expect(palco()).toHaveAttribute('data-tema', 'deserto')
  })

  it('a seta de voltar dá a volta e vai parar na última ilha', () => {
    render(<Ilhas dados={dados} />)
    fireEvent.click(screen.getByRole('button', { name: 'Ver a ilha anterior' }))
    expect(screen.getByRole('heading', { level: 3, name: 'Gelo' })).toBeInTheDocument()
    expect(palco()).toHaveAttribute('data-tema', 'gelo')
  })

  it('clicar numa miniatura pula direto para aquela ilha', () => {
    render(<Ilhas dados={dados} />)
    fireEvent.click(screen.getByRole('button', { name: 'Gelo' }))
    expect(screen.getByRole('heading', { level: 3, name: 'Gelo' })).toBeInTheDocument()
    expect(palco()).toHaveAttribute('data-tema', 'gelo')
  })

  it('a miniatura da ilha em cena é a única marcada como atual', () => {
    render(<Ilhas dados={dados} />)
    expect(screen.getByRole('button', { name: 'Natureza' })).toHaveAttribute('aria-current', 'true')
    expect(screen.getByRole('button', { name: 'Deserto' })).not.toHaveAttribute('aria-current')

    fireEvent.click(screen.getByRole('button', { name: 'Deserto' }))

    expect(screen.getByRole('button', { name: 'Deserto' })).toHaveAttribute('aria-current', 'true')
    expect(screen.getByRole('button', { name: 'Natureza' })).not.toHaveAttribute('aria-current')
  })

  it('as seis miniaturas dizem ao leitor de tela se estão pressionadas', () => {
    // aria-current marca só a atual; aria-pressed existe nas SEIS, então
    // quem não enxerga sabe que as outras cinco também são escolhíveis.
    render(<Ilhas dados={dados} />)
    const miniatura = (nome) => screen.getByRole('button', { name: nome })

    expect(miniatura('Natureza')).toHaveAttribute('aria-pressed', 'true')
    expect(miniatura('Deserto')).toHaveAttribute('aria-pressed', 'false')
    expect(miniatura('Gelo')).toHaveAttribute('aria-pressed', 'false')

    fireEvent.click(miniatura('Gelo'))

    expect(miniatura('Gelo')).toHaveAttribute('aria-pressed', 'true')
    expect(miniatura('Natureza')).toHaveAttribute('aria-pressed', 'false')
  })

  it('a primeira ilha diz "Disponível" e a seguinte diz "Em breve"', () => {
    render(<Ilhas dados={dados} />)
    expect(screen.getByText('Disponível')).toBeInTheDocument()
    expect(screen.queryByText('Em breve')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Ver a próxima ilha' }))

    expect(screen.getByText('Em breve')).toBeInTheDocument()
    expect(screen.queryByText('Disponível')).toBeNull()
  })

  it('as setas do teclado andam de ilha quando o foco está dentro do carrossel', () => {
    render(<Ilhas dados={dados} />)
    const seta = screen.getByRole('button', { name: 'Ver a próxima ilha' })

    fireEvent.keyDown(seta, { key: 'ArrowRight' })
    expect(palco()).toHaveAttribute('data-tema', 'deserto')

    fireEvent.keyDown(seta, { key: 'ArrowLeft' })
    expect(palco()).toHaveAttribute('data-tema', 'natureza')
  })

  it('as seis miniaturas ficam sempre à vista, como mapa das ilhas', () => {
    render(<Ilhas dados={dados} />)
    const fileira = screen.getByRole('list', { name: 'As seis ilhas do jogo' })
    expect(fileira.querySelectorAll('button')).toHaveLength(3)
  })

  it('campo faltando no painel de controle não derruba a seção', () => {
    const incompleto = {
      titulo: 'Seis ilhas',
      rotuloDisponivel: 'Disponível',
      rotuloEmBreve: 'Em breve',
      lista: [{ nome: 'Natureza', arte: '/images/ilha_natureza.png', disponivel: true }],
    }
    render(<Ilhas dados={incompleto} />)
    expect(screen.getByRole('heading', { level: 3, name: 'Natureza' })).toBeInTheDocument()
    // sem tema escrito, o palco cai no clima de abertura em vez de ficar sem nada
    expect(palco()).toHaveAttribute('data-tema', 'natureza')
  })

  it('sem lista nenhuma, a seção inteira some em vez de aparecer vazia', () => {
    const { container } = render(<Ilhas dados={{ titulo: 'Seis ilhas', lista: [] }} />)
    expect(container.querySelector('section')).toBeNull()
  })

  // ---------------------------------------------------------------------
  // A ANTIGA SEÇÃO "COMO FUNCIONA", AGORA DENTRO DO CARROSSEL
  // As três atividades são da Ilha da Natureza, então elas só aparecem
  // quando a Natureza está em cena.
  // ---------------------------------------------------------------------

  it('a seção leva a âncora #jogo do menu', () => {
    const { container } = render(<Ilhas dados={dados} />)
    const secao = container.querySelector('section')
    expect(secao).toHaveAttribute('id', 'jogo')
  })

  it('a Natureza mostra as três plaquinhas de atividade, com arte e texto', () => {
    render(<Ilhas dados={dados} />)
    expect(screen.getByRole('heading', { level: 3, name: 'Floresta das Vogais' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Lago das Letras' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Campo das Letras' })).toBeInTheDocument()
    expect(screen.getByText('Consoantes que boiam.')).toBeInTheDocument()
    expect(screen.getByTestId('atividades').querySelectorAll('article')).toHaveLength(3)
  })

  it('a arte das atividades carrega com preguiça e tem tamanho declarado', () => {
    render(<Ilhas dados={dados} />)
    const arte = screen
      .getByTestId('atividades')
      .querySelector('img[src="/images/fundo_floresta.png"]')
    expect(arte).toHaveAttribute('loading', 'lazy')
    expect(arte).toHaveAttribute('width', '760')
    expect(arte).toHaveAttribute('height', '427')
  })

  it('o rodapé das estrelas acompanha as atividades', () => {
    render(<Ilhas dados={dados} />)
    expect(screen.getByText('Cada atividade vale até 3 estrelas.')).toBeInTheDocument()
  })

  it('ilha sem atividades não mostra plaquinha nenhuma, nem o rodapé', () => {
    render(<Ilhas dados={dados} />)
    fireEvent.click(screen.getByRole('button', { name: 'Deserto' }))

    expect(screen.queryByTestId('atividades')).toBeNull()
    expect(screen.queryByRole('heading', { level: 3, name: 'Floresta das Vogais' })).toBeNull()
    expect(screen.queryByText('Cada atividade vale até 3 estrelas.')).toBeNull()
    // e a ilha em si continua inteira
    expect(screen.getByRole('heading', { level: 3, name: 'Deserto' })).toBeInTheDocument()
  })

  // ---------------------------------------------------------------------
  // AS CINCO ILHAS QUE AINDA VÊM
  // Clicar numa delas apagava as três plaquinhas e deixava um campo
  // colorido vazio no lugar: a pessoa interagia e ganhava MENOS página.
  // O lugar das plaquinhas passa a receber a linha honesta e o mesmo
  // convite do resto da página.
  // ---------------------------------------------------------------------

  it('ilha que ainda não existe mostra a linha honesta no lugar das plaquinhas', () => {
    render(<Ilhas dados={dados} />)
    fireEvent.click(screen.getByRole('button', { name: 'Deserto' }))

    const faixa = screen.getByTestId('ilha-futura')
    expect(faixa).toBeInTheDocument()
    expect(faixa.textContent).toContain('Esta ilha ainda está sendo construída.')
    // o convite é o mesmo do resto da página e leva para o download
    expect(screen.getByRole('link', { name: 'Baixar a demo' })).toHaveAttribute('href', '#baixar')
  })

  it('na ilha pronta aparecem as plaquinhas, e não a faixa das ilhas futuras', () => {
    render(<Ilhas dados={dados} />)

    expect(screen.getByTestId('atividades')).toBeInTheDocument()
    expect(screen.queryByTestId('ilha-futura')).toBeNull()
  })

  it('voltar da ilha futura para a Natureza troca a faixa pelas plaquinhas', () => {
    render(<Ilhas dados={dados} />)
    fireEvent.click(screen.getByRole('button', { name: 'Gelo' }))
    expect(screen.getByTestId('ilha-futura')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Natureza' }))
    expect(screen.queryByTestId('ilha-futura')).toBeNull()
    expect(screen.getByTestId('atividades')).toBeInTheDocument()
  })

  it('sem o bloco `futura` no painel de controle, a ilha vazia volta a não mostrar nada', () => {
    const semFaixa = { ...dados, futura: undefined }
    render(<Ilhas dados={semFaixa} />)
    fireEvent.click(screen.getByRole('button', { name: 'Deserto' }))

    expect(screen.queryByTestId('ilha-futura')).toBeNull()
    expect(screen.queryByTestId('atividades')).toBeNull()
    // e a seção continua de pé
    expect(screen.getByRole('heading', { level: 3, name: 'Deserto' })).toBeInTheDocument()
  })

  it('voltar para a Natureza traz as plaquinhas de volta', () => {
    render(<Ilhas dados={dados} />)
    fireEvent.click(screen.getByRole('button', { name: 'Gelo' }))
    expect(screen.queryByTestId('atividades')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Natureza' }))
    expect(screen.getByTestId('atividades').querySelectorAll('article')).toHaveLength(3)
  })

  // ---------------------------------------------------------------------
  // A ILHA FORA DA CAIXA
  // O palco deixou de ser uma placa: a ilha flutua solta e o clima virou
  // uma camada da seção inteira. O que não pode mudar é o COMPORTAMENTO —
  // o palco continua sendo quem diz qual clima está em cena.
  // ---------------------------------------------------------------------

  it('o clima virou uma camada da seção inteira, fora do carrossel', () => {
    const { container } = render(<Ilhas dados={dados} />)
    const clima = climaDaSecao(container)

    expect(clima).not.toBeNull()
    expect(clima).toHaveAttribute('data-tema', 'natureza')
    // enfeite: o leitor de tela nem sabe que ela existe
    expect(clima).toHaveAttribute('aria-hidden', 'true')
    // e ela não mora mais dentro do palco
    expect(palco().contains(clima)).toBe(false)
  })

  it('a camada de clima da seção troca junto com a ilha', () => {
    const { container } = render(<Ilhas dados={dados} />)
    fireEvent.click(screen.getByRole('button', { name: 'Gelo' }))

    expect(climaDaSecao(container)).toHaveAttribute('data-tema', 'gelo')
    expect(palco()).toHaveAttribute('data-tema', 'gelo')
  })

  it('o nome da ilha é título de seção, não o título-clímax da página', () => {
    // Ele continua se apoiando direto no céu (sem placa atrás), então
    // continua precisando de um tratamento de título global — mas é o navy
    // sólido do .tituloSecao, e não o branco-com-contorno do .tituloJogo:
    // esse ficou reservado para a abertura (H1) e o clímax (download).
    render(<Ilhas dados={dados} />)
    const nome = screen.getByRole('heading', { level: 3, name: 'Natureza' })
    expect(nome).toHaveClass('tituloSecao')
    expect(nome).not.toHaveClass('tituloJogo')
  })

  // ---------------------------------------------------------------------
  // A TRAVESSIA DE UMA ILHA PARA A OUTRA
  // Dois caminhos: o do navegador que tem a View Transitions API e o
  // caminho simples, de quem não tem (uns 6%) e de quem pediu menos
  // movimento. O jsdom não tem a API, então o caminho simples é o padrão
  // de todos os testes acima.
  // ---------------------------------------------------------------------

  it('sem a API do navegador, a troca acontece na hora e nenhuma camada cara entra no HTML', () => {
    expect(document.startViewTransition).toBeUndefined()
    render(<Ilhas dados={dados} />)

    fireEvent.click(screen.getByRole('button', { name: 'Ver a próxima ilha' }))

    expect(screen.getByRole('heading', { level: 3, name: 'Deserto' })).toBeInTheDocument()
    expect(camadaDeEfeito()).toBeNull()
  })

  it('com a API do navegador, a troca passa por ela e o efeito do clima novo entra', () => {
    const chamadas = fingirTravessia()
    render(<Ilhas dados={dados} />)

    fireEvent.click(screen.getByRole('button', { name: 'Gelo' }))

    expect(chamadas).toHaveLength(1)
    expect(screen.getByRole('heading', { level: 3, name: 'Gelo' })).toBeInTheDocument()

    const camada = camadaDeEfeito()
    expect(camada).not.toBeNull()
    expect(camada).toHaveAttribute('data-clima', 'gelo')
    // enfeite puro: não é lida por leitor de tela
    expect(camada).toHaveAttribute('aria-hidden', 'true')
    // e ela não fica presa dentro da seção, para nenhum ancestral com
    // transform conseguir prender o position: fixed dela num pedaço da página
    expect(camada.parentElement).toBe(document.body)
  })

  // -------------------------------------------------------------------------
  // O UPGRADE DE 22/10: vida em repouso e uma troca que se faz notar.
  // -------------------------------------------------------------------------
  describe('a ilha reage ao ponteiro', () => {
    function prepara() {
      // o rAF vira síncrono: o componente agenda a escrita das variáveis
      // num quadro, e o teste não tem quadro nenhum
      vi.stubGlobal('requestAnimationFrame', (cb) => {
        cb()
        return 1
      })
      const { container } = render(<Ilhas dados={dados} />)
      const secao = container.querySelector('#jogo')
      // jsdom não faz layout: sem um retângulo, o componente desiste e sai
      secao.getBoundingClientRect = () => ({ left: 0, top: 0, width: 1000, height: 800 })
      return secao
    }

    it('o mouse à direita inclina para um lado; à esquerda, para o outro', () => {
      const secao = prepara()
      fireEvent.pointerMove(secao, { pointerType: 'mouse', clientX: 900, clientY: 400 })
      expect(secao.style.getPropertyValue('--aponta-x')).toBe('0.800')
      expect(secao.style.getPropertyValue('--aponta-y')).toBe('0.000')

      fireEvent.pointerMove(secao, { pointerType: 'mouse', clientX: 100, clientY: 400 })
      expect(secao.style.getPropertyValue('--aponta-x')).toBe('-0.800')
    })

    it('o dedo não inclina nada: no toque, quem manda é o arrasto', () => {
      const secao = prepara()
      fireEvent.pointerMove(secao, { pointerType: 'mouse', clientX: 900, clientY: 400 })
      expect(secao.style.getPropertyValue('--aponta-x')).toBe('0.800')

      fireEvent.pointerMove(secao, { pointerType: 'touch', clientX: 100, clientY: 100 })
      expect(secao.style.getPropertyValue('--aponta-x'), 'o toque mexeu na inclinação').toBe('0.800')
    })

    it('tirar o ponteiro devolve a ilha ao lugar', () => {
      const secao = prepara()
      fireEvent.pointerMove(secao, { pointerType: 'mouse', clientX: 900, clientY: 700 })
      expect(secao.style.getPropertyValue('--aponta-x')).toBe('0.800')

      fireEvent.pointerLeave(secao)
      expect(secao.style.getPropertyValue('--aponta-x')).toBe('0.000')
      expect(secao.style.getPropertyValue('--aponta-y')).toBe('0.000')
    })

    it('quem pediu menos movimento no sistema não vê a ilha inclinar', () => {
      window.matchMedia = vi.fn().mockReturnValue({ matches: true })
      const secao = prepara()
      fireEvent.pointerMove(secao, { pointerType: 'mouse', clientX: 900, clientY: 400 })
      expect(secao.style.getPropertyValue('--aponta-x')).toBe('')
    })
  })

  it('a ilha tem um halo de clima atrás, e ele é decoração', () => {
    const { container } = render(<Ilhas dados={dados} />)
    const halo = container.querySelector('[class*="halo"]')
    expect(halo, 'o halo do clima sumiu').not.toBeNull()
    expect(halo).toHaveAttribute('aria-hidden', 'true')
    expect(halo.textContent, 'o halo não pode carregar texto').toBe('')
  })

  it('a camada da troca leva o véu de cor junto dos sopros', () => {
    fingirTravessia()
    render(<Ilhas dados={dados} />)
    fireEvent.click(screen.getByRole('button', { name: 'Gelo' }))
    const camada = camadaDeEfeito()
    expect(camada.querySelector('[class*="veu"]'), 'o véu da troca sumiu').not.toBeNull()
  })

  it('a camada de efeito SAI do HTML quando a animação acaba', () => {
    vi.useFakeTimers()
    fingirTravessia()
    render(<Ilhas dados={dados} />)

    fireEvent.click(screen.getByRole('button', { name: 'Gelo' }))
    expect(camadaDeEfeito()).not.toBeNull()

    // o relógio do carrossel: a animação (1,2s desde o upgrade de 22/10)
    // mais a folga do Ilhas.js. Se a duração mudar lá, muda aqui.
    act(() => {
      vi.advanceTimersByTime(1400)
    })

    expect(camadaDeEfeito()).toBeNull()
    // e a ilha continua inteira depois que o efeito some
    expect(screen.getByRole('heading', { level: 3, name: 'Gelo' })).toBeInTheDocument()
  })

  it('quem pediu menos movimento não passa pela travessia nem vê camada de efeito', () => {
    fingirMenosMovimento(true)
    const chamadas = fingirTravessia()
    render(<Ilhas dados={dados} />)

    fireEvent.click(screen.getByRole('button', { name: 'Gelo' }))

    // a troca aconteceu...
    expect(screen.getByRole('heading', { level: 3, name: 'Gelo' })).toBeInTheDocument()
    expect(palco()).toHaveAttribute('data-tema', 'gelo')
    // ...mas sem travessia e sem nada caro no HTML
    expect(chamadas).toHaveLength(0)
    expect(camadaDeEfeito()).toBeNull()
  })

  it('clicar na miniatura da ilha que já está em cena não dispara efeito nenhum', () => {
    const chamadas = fingirTravessia()
    render(<Ilhas dados={dados} />)

    fireEvent.click(screen.getByRole('button', { name: 'Natureza' }))

    expect(chamadas).toHaveLength(0)
    expect(camadaDeEfeito()).toBeNull()
  })

  it('a camada de efeito sai do HTML também quando a seção é desmontada', () => {
    vi.useFakeTimers()
    fingirTravessia()
    const { unmount } = render(<Ilhas dados={dados} />)

    fireEvent.click(screen.getByRole('button', { name: 'Gelo' }))
    expect(camadaDeEfeito()).not.toBeNull()

    unmount()
    expect(camadaDeEfeito()).toBeNull()
  })
})
