import { Baloo_2, Nunito } from 'next/font/google'
import './globals.css'

const titulo = Baloo_2({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--fonte-titulo',
  display: 'swap',
})

// O CORPO DA PÁGINA
// Nunito: uma fonte de TEXTO de verdade, com pesos reais (400 para o corpo,
// 600/700 para destacar uma palavra dentro do parágrafo). A Concert One, que
// estava aqui antes, é um display de peso único — boa para cartaz, ruim para
// ler parágrafo: aberturas fechadas, sem negrito e sem itálico.
// Os títulos continuam na Baloo 2, logo acima: a voz da marca não muda.
const texto = Nunito({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--fonte-texto',
  display: 'swap',
})

export const metadata = {
  // VERCEL_PROJECT_PRODUCTION_URL e o endereco fixo do site publicado.
  // VERCEL_URL muda a cada deploy, entao so serve de reserva.
  metadataBase: new URL(
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000'
  ),
  title: 'Pequenos Smarters — jogo de alfabetização para crianças de 6 a 8 anos',
  description:
    'Baixe a demo gratuita e jogue a Ilha da Natureza inteira. O jogo completo é licenciado para escolas e redes de ensino.',
  openGraph: {
    title: 'Pequenos Smarters',
    description: 'Seu filho aprende a ler brincando. Demo gratuita disponível.',
    images: ['/images/logo_com_personagem.png'],
    type: 'website',
  },
}

export default function RootLayout({ children }) {
  // data-tema="ceu" é o clima de abertura do céu do fundo. Ele já vem escrito
  // no HTML, antes de qualquer JavaScript: se o JS não rodar, a página fica no
  // céu de sempre e tudo continua legível.
  return (
    // suppressHydrationWarning: o script inline do <body> escreve data-js no
    // <html> ANTES da hidratação (para o fade dos blocos não piscar), e o
    // React compararia o atributo com o HTML do servidor e reclamaria. É o
    // mesmo truque dos scripts de tema claro/escuro; vale só para a raiz.
    <html
      lang="pt-BR"
      data-tema="ceu"
      className={`${titulo.variable} ${texto.variable}`}
      suppressHydrationWarning
    >
      <body>
        {/* Marca html[data-js] antes da primeira pintura: assim os blocos
            que vão aparecer em fade já nascem escondidos, em vez de
            piscar (visível → escondido → fade). Sem JS, a linha não roda
            e tudo fica visível. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.dataset.js='1'" }} />
        {children}
      </body>
    </html>
  )
}
