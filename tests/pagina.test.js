import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

// A página inteira, montada como ela é de verdade, mas com o painel de
// controle TODO preenchido. É o único teste que percorre a fiação de
// app/page.js: se o link do APK deixar de chegar no botão de download
// (por exemplo, se a chave `demo.url` for trocada por engano), a dona
// publicaria a página com "Em breve" sem nenhum teste reclamar.
const APK = 'https://expo.dev/artifacts/eas/demo.apk'

vi.mock('@/content/site', () => ({
  site: {
    demo: { url: 'https://expo.dev/artifacts/eas/demo.apk' },
    video: {
      src: '/video/gameplay.mp4',
      poster: '/images/ilha_natureza.png',
      titulo: 'Veja o jogo em ação',
      emBreve: 'Gameplay em breve',
    },
    contato: {
      email: 'oi@exemplo.com',
      whatsapp: '5551999999999',
      assunto: 'Licenciamento',
      mensagem: 'Olá!',
      titulo: 'Fale com a gente',
      intro: 'É só chamar.',
      tituloEmail: 'Mandar um e-mail',
      tituloWhatsapp: 'Chamar no WhatsApp',
      detalheWhatsapp: 'Resposta em horário comercial',
    },
    nav: {
      ancoras: [
        { href: '#video', texto: 'Vídeo' },
        { href: '#jogo', texto: 'O jogo' },
        { href: '#pais', texto: 'Para os pais' },
        { href: '#escolas', texto: 'Para escolas' },
      ],
      contato: 'Contato',
      botao: 'Baixar a demo',
    },
    hero: {
      titulo: 'Seu filho aprende a ler brincando',
      subtitulo: 'Um jogo de alfabetização.',
      selo: 'Projeto de TCC · 2026',
      botaoPrincipal: 'Baixar a demo',
      botaoSecundario: 'Ver o gameplay',
    },
    beneficiosTitulo: 'Por que o Pequenos Smarters',
    beneficios: [
      { icone: '/images/estrelas.png', titulo: 'Feito para 6 a 8 anos', texto: 'Conteúdo de alfabetização.' },
      { icone: '/images/icone_painel.png', titulo: 'Acompanhe o progresso', texto: 'O Painel dos Pais.' },
      { icone: '/images/som_azul.png', titulo: 'Pensado para acessibilidade', texto: 'Modo daltonismo.' },
    ],
    ilhas: {
      sobrancelha: 'O mapa',
      titulo: 'Seis ilhas para explorar',
      texto: 'A criança começa pela Ilha da Natureza.',
      rotuloDisponivel: 'Disponível',
      rotuloEmBreve: 'Em breve',
      rotuloAnterior: 'Ver a ilha anterior',
      rotuloProxima: 'Ver a próxima ilha',
      rotuloMiniaturas: 'As seis ilhas do jogo',
      rodape: 'Cada atividade vale até 3 estrelas.',
      futura: { texto: 'Esta ilha ainda está sendo construída.', botao: 'Baixar a demo' },
      lista: [
        {
          nome: 'Natureza',
          descricao: 'A criança explora a floresta.',
          arte: '/images/ilha_natureza.png',
          disponivel: true,
          tema: 'natureza',
          atividades: [
            { nome: 'Floresta das Vogais', texto: 'Vogais.', arte: '/images/fundo_floresta.png', cor: 'var(--carta-azul)' },
          ],
        },
        {
          nome: 'Deserto',
          descricao: 'Um dia a criança vai cavar a areia.',
          arte: '/images/ilha_deserto.png',
          disponivel: false,
          tema: 'deserto',
        },
      ],
    },
    personagens: {
      titulo: 'Quem acompanha a criança',
      herois: [{ nome: 'Ziggy', especie: 'o leão', arte: '/images/ziggy.png', texto: 'O guia corajoso.' }],
      vilao: { nome: 'Doutor Preguiça', arte: '/images/doutor_preguica.png', texto: 'O vilão.' },
    },
    paraOsPais: {
      titulo: 'Para quem cuida',
      itens: [{ titulo: 'Painel dos Pais', texto: 'Progresso da criança.' }],
    },
    paraEscolas: {
      titulo: 'Para escolas e redes de ensino',
      texto: 'Licenciado para instituições.',
      itens: ['Roda em celular ou tablet Android, sem infraestrutura nova'],
      cta: 'Falar sobre licenciamento',
      ctaEmBreve: 'Canal para escolas em breve',
    },
    baixar: {
      titulo: 'Baixe a demo gratuita',
      itens: ['Ilha da Natureza completa'],
      rodape: 'Gostou?',
      emBreve: 'Em breve',
      textoBotao: 'Baixar a demo (Android)',
      plataforma: 'A demo é um aplicativo Android (APK). No iPhone não é possível instalar.',
      qrLegenda: 'Aponte a câmera para baixar',
    },
    rodape: {
      dados: 'O jogo pede o cadastro de um responsável e guarda o progresso em servidor.',
      rotuloWhatsapp: 'WhatsApp',
    },
  },
}))

const { default: Pagina } = await import('@/app/page')

describe('página completa, com o painel de controle preenchido', () => {
  it('o link do APK chega no botão de download, ativo e com o href certo', () => {
    render(<Pagina />)
    const botao = screen.getByRole('link', { name: 'Baixar a demo (Android)' })
    expect(botao).toHaveAttribute('href', APK)
    // nada de botão desativado quando o link existe
    expect(screen.queryByRole('button', { name: 'Em breve' })).toBeNull()
  })

  it('o aviso de Android aparece junto do botão', () => {
    render(<Pagina />)
    expect(
      screen.getByText('A demo é um aplicativo Android (APK). No iPhone não é possível instalar.')
    ).toBeInTheDocument()
  })

  it('com contato preenchido, o menu ganha o link Contato e o CTA das escolas aponta para lá', () => {
    render(<Pagina />)
    expect(screen.getByRole('link', { name: 'Contato' })).toHaveAttribute('href', '#contato')
    expect(screen.getByRole('link', { name: 'Falar sobre licenciamento' })).toHaveAttribute(
      'href',
      '#contato'
    )
  })

  it('com contato preenchido, o rodapé também ganha o canal', () => {
    const { container } = render(<Pagina />)
    const rodape = container.querySelector('footer')
    expect(rodape.querySelector('a[href^="mailto:oi@exemplo.com"]')).not.toBeNull()
    expect(rodape.querySelector('a[href^="https://wa.me/"]')).not.toBeNull()
  })

  it('a stack técnica e o TCC não aparecem em lugar nenhum da página', () => {
    const { container } = render(<Pagina />)
    const rodape = container.querySelector('footer')

    // Esta verificação já foi "saiu do rodapé e foi para a seção Quem fez".
    // A seção Quem fez foi removida por decisão do dono, então agora a regra
    // é mais forte: stack e TCC não existem em canto nenhum. Para um
    // comprador de escola, as duas coisas liam como "trabalho de faculdade".
    expect(container.textContent).not.toContain('React Native')
    expect(container.textContent).not.toContain('Supabase')
    expect(container.textContent).not.toContain('Conclusão de Curso')
    expect(container.querySelector('#autoras'), 'a seção Quem fez foi removida').toBeNull()
    // e o rodapé continua com a linha honesta sobre dados e o copyright
    expect(rodape.textContent).toContain('guarda o progresso em servidor')
    expect(rodape.textContent).toContain('Pequenos Smarters')
  })

  it('o herói tem UM parágrafo só, não dois dizendo a mesma coisa', () => {
    const { container } = render(<Pagina />)
    expect(container.querySelectorAll('#topo p')).toHaveLength(1)
  })

  it('Nav e Footer ficam fora do <main>, e as nove seções dentro', () => {
    const { container } = render(<Pagina />)
    expect(container.querySelector('main > header')).toBeNull()
    expect(container.querySelector('main > footer')).toBeNull()
    // nove: eram onze; a antiga "Como funciona" foi absorvida pelo carrossel
    // das ilhas (que herdou a âncora #jogo do menu) e a seção "Quem fez" foi
    // removida por decisão do dono.
    expect(container.querySelectorAll('main > section')).toHaveLength(9)
  })

  it('a âncora #jogo do menu continua existindo, agora na seção das ilhas', () => {
    const { container } = render(<Pagina />)
    expect(screen.getByRole('link', { name: 'O jogo' })).toHaveAttribute('href', '#jogo')
    const alvo = container.querySelector('#jogo')
    expect(alvo).not.toBeNull()
    expect(alvo.tagName).toBe('SECTION')
    // é mesmo a seção do carrossel
    expect(alvo.querySelector('[data-testid="palco"]')).not.toBeNull()
  })

  it('a antiga seção #ilhas não existe mais: ela virou a #jogo', () => {
    const { container } = render(<Pagina />)
    expect(container.querySelector('#ilhas')).toBeNull()
  })

  // -------------------------------------------------------------------
  // HIERARQUIA DE TÍTULOS
  // A página inteira usava o mesmo título branco-com-contorno no H1, nos
  // H2 e no nome da ilha: sete momentos de igual intensidade e nenhum
  // clímax. O tratamento forte vale em DOIS lugares, e só nesses dois.
  // -------------------------------------------------------------------
  it('só dois títulos usam a voz do jogo: a abertura e o clímax', () => {
    const { container } = render(<Pagina />)
    const fortes = Array.from(container.querySelectorAll('.tituloJogo'))

    expect(fortes.map((t) => t.tagName)).toEqual(['H1', 'H2'])
    expect(fortes[0].textContent).toBe('Seu filho aprende a ler brincando')
    expect(fortes[1].textContent).toBe('Baixe a demo gratuita')
    // e o da abertura é mesmo o H1 do herói
    expect(container.querySelector('#topo h1')).toBe(fortes[0])
    // ...enquanto o do clímax mora no bloco de download
    expect(container.querySelector('#baixar h2')).toBe(fortes[1])
  })

  it('todos os outros títulos de seção são o navy sólido, sem contorno', () => {
    const { container } = render(<Pagina />)
    const outros = Array.from(container.querySelectorAll('.tituloSecao'))

    // sobram vários: vídeo, personagens, pais, escolas, contato e o
    // nome da ilha em cena
    expect(outros.length).toBeGreaterThanOrEqual(6)
    expect(outros.filter((t) => t.classList.contains('tituloJogo'))).toEqual([])
  })
})

// REVELAR AO ROLAR: o herói é a primeira dobra (e o LCP) — nunca entra em
// fade. As outras seções têm pelo menos um bloco que entra.
describe('revelar ao rolar', () => {
  it('o herói não tem bloco com data-revelar; as outras seções têm', () => {
    const { container } = render(<Pagina />)
    expect(container.querySelector('#topo [data-revelar]')).toBeNull()
    expect(container.querySelector('#topo[data-revelar]')).toBeNull()
    for (const id of ['video', 'beneficios', 'jogo', 'pais', 'escolas', 'baixar']) {
      expect(container.querySelector(`#${id} [data-revelar]`), `#${id} precisa de um bloco que revela`).not.toBeNull()
    }
  })
})
