import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'

// ---------------------------------------------------------------------------
// A PÁGINA COMO ELA ESTÁ PUBLICADA HOJE: SEM E-MAIL, SEM WHATSAPP, SEM APK.
//
// O irmão deste arquivo (pagina.test.js) monta a página com o painel de
// controle TODO preenchido. Este monta o estado vazio, que é o estado real
// enquanto não houver e-mail — e é nele que morava o defeito
// mais caro do projeto: o botão "Falar sobre licenciamento" apontava para
// `#baixar` e despejava o comprador de escola no card do APK do pai.
//
// A regra que este arquivo guarda é uma só: NENHUM link da página pode
// apontar para um contato que não existe, e nenhum pode fingir ser um.
// ---------------------------------------------------------------------------
vi.mock('@/content/site', () => ({
  site: {
    demo: { url: '' },
    video: { src: '', poster: '/images/ilha_natureza.png', titulo: 'Veja o jogo em ação', emBreve: 'Gameplay em breve' },
    contato: {
      email: '',
      whatsapp: '',
      assunto: 'Licenciamento — Pequenos Smarters',
      mensagem: 'Olá!',
      titulo: 'Fale com a gente',
      intro: 'É só chamar.',
      tituloEmail: 'Mandar um e-mail',
      tituloWhatsapp: 'Chamar no WhatsApp',
      detalheWhatsapp: 'Resposta em horário comercial',
    },
    nav: {
      ancoras: [
        { href: '#jogo', texto: 'O jogo' },
        { href: '#video', texto: 'Vídeo' },
        { href: '#pais', texto: 'Para os pais' },
        { href: '#escolas', texto: 'Para escolas' },
      ],
      contato: 'Contato',
      botao: 'Baixar a demo',
    },
    hero: {
      titulo: 'Seu filho aprende a ler brincando',
      subtitulo: 'Um jogo de alfabetização para crianças de 6 a 8 anos.',
      selo: '',
      botaoPrincipal: 'Baixar a demo',
      botaoSecundario: 'Ver o gameplay',
    },
    beneficiosTitulo: 'Por que o Pequenos Smarters',
    beneficios: [
      { icone: '/images/estrelas.png', titulo: 'Feito para 6 a 8 anos', texto: 'Conteúdo de alfabetização.' },
    ],
    ilhas: {
      titulo: 'A Ilha da Natureza está pronta. Mais cinco estão a caminho.',
      texto: 'A criança desembarca na Ilha da Natureza.',
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
        { nome: 'Deserto', descricao: 'Um dia a criança vai cavar a areia.', arte: '/images/ilha_deserto.png', disponivel: false, tema: 'deserto' },
      ],
    },
    personagens: {
      titulo: 'Quem acompanha a criança',
      herois: [{ nome: 'Ziggy', especie: 'o leão', arte: '/images/ziggy.png', texto: 'O guia corajoso.' }],
      vilao: { nome: 'Doutor Preguiça', arte: '/images/doutor_preguica.png', texto: 'O vilão.' },
    },
    paraOsPais: { titulo: 'Para quem cuida', itens: [{ titulo: 'Painel dos Pais', texto: 'Progresso da criança.' }] },
    paraEscolas: {
      titulo: 'Para escolas e redes de ensino',
      texto: 'Licenciado para instituições.',
      itens: ['Roda nos celulares e tablets Android que a escola já tem'],
      cta: 'Falar sobre licenciamento',
      ctaEmBreve: 'Canal para escolas em breve',
    },
    baixar: {
      titulo: 'Baixe a demo gratuita',
      itens: ['Ilha da Natureza completa', 'Sem anúncios', 'Sem compras dentro do app'],
      rodape: 'Gostou?',
      emBreve: 'Em breve',
      textoBotao: 'Baixar a demo (Android)',
      plataforma: 'A demo é um aplicativo Android (APK). No iPhone não é possível instalar.',
      dados: 'Para jogar é preciso criar uma conta: o responsável informa os dados dele e o nome e a idade da criança.',
      qrLegenda: 'Aponte a câmera para baixar',
    },
    rodape: {
      dados: 'O jogo pede o cadastro de um responsável e guarda o progresso em servidor.',
      rotuloWhatsapp: 'WhatsApp',
    },
  },
}))

const { default: Pagina } = await import('@/app/page')

describe('página no estado vazio (sem e-mail, sem WhatsApp, sem APK)', () => {
  it('nenhum link da página aponta para um contato que não existe', () => {
    const { container } = render(<Pagina />)

    expect(container.querySelector('a[href="#contato"]')).toBeNull()
    expect(container.querySelector('a[href^="mailto:"]')).toBeNull()
    expect(container.querySelector('a[href^="https://wa.me/"]')).toBeNull()
  })

  it('a seção de contato não existe, em vez de aparecer vazia', () => {
    const { container } = render(<Pagina />)
    expect(container.querySelector('#contato')).toBeNull()
    expect(screen.queryByText('Fale com a gente')).toBeNull()
  })

  it('a seção das escolas diz a verdade em vez de mandar o diretor para o APK', () => {
    const { container } = render(<Pagina />)
    const escolas = within(container.querySelector('#escolas'))

    expect(escolas.getByText('Canal para escolas em breve')).toBeInTheDocument()
    expect(escolas.queryByRole('link', { name: 'Falar sobre licenciamento' })).toBeNull()
    // o defeito original, em uma linha: nenhum link daqui vai para o download
    expect(container.querySelector('#escolas a')).toBeNull()
  })

  it('o menu não mostra o link Contato', () => {
    render(<Pagina />)
    expect(screen.queryByRole('link', { name: 'Contato' })).toBeNull()
  })

  it('o rodapé fica sem canal, mas mantém a linha de dados e o copyright', () => {
    const { container } = render(<Pagina />)
    const rodape = container.querySelector('footer')

    expect(rodape.querySelector('a')).toBeNull()
    expect(rodape.textContent).toContain('guarda o progresso em servidor')
    expect(rodape.textContent).toContain('Pequenos Smarters')
  })

  it('o download continua com o "Em breve" desativado, que é o estado honesto', () => {
    render(<Pagina />)
    expect(screen.getByRole('button', { name: 'Em breve' })).toBeDisabled()
  })

  it('as plaquinhas de confiança do card aparecem mesmo sem o link do APK', () => {
    render(<Pagina />)
    expect(screen.getByText('Sem anúncios')).toBeInTheDocument()
    expect(screen.getByText('Sem compras dentro do app')).toBeInTheDocument()
    expect(screen.getByText(/o responsável informa os dados dele/)).toBeInTheDocument()
  })
})
