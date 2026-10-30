import Cenario from '@/components/Cenario'
import TemaPorSecao from '@/components/TemaPorSecao'
import RevelarAoRolar from '@/components/RevelarAoRolar'
import Trilha from '@/components/Trilha'
import Nav from '@/components/Nav'
import Hero from '@/components/Hero'
import Beneficios from '@/components/Beneficios'
import Ilhas from '@/components/Ilhas'
import Video from '@/components/Video'
import Personagens from '@/components/Personagens'
import ParaOsPais from '@/components/ParaOsPais'
import ParaEscolas from '@/components/ParaEscolas'
import BaixarDemo from '@/components/BaixarDemo'
import Contato from '@/components/Contato'
import Footer from '@/components/Footer'
import { site } from '@/content/site'
import { temContato } from '@/lib/links'

export default function Pagina() {
  const comContato = temContato(site.contato)

  return (
    <>
      <Cenario />
      {/* Não desenha nada: só avisa o céu do fundo qual seção está em cena. */}
      <TemaPorSecao />
      {/* Não desenha nada: faz os blocos marcados com data-revelar
          aparecerem em fade conforme a página desce. */}
      <RevelarAoRolar />
      <Nav dados={site.nav} temContato={comContato} />
      <main>
        <Hero hero={site.hero} />
        {/* O vídeo demonstrativo vem logo depois da abertura, por pedido do
            dono: quem chega vê o jogo rodando antes de ler qualquer
            argumento. Enquanto não houver arquivo em content/site.js
            (video.src), o telão mostra "Gameplay em breve". */}
        <Video video={site.video} />
        <Beneficios titulo={site.beneficiosTitulo} itens={site.beneficios} />
        <Ilhas dados={site.ilhas} />
        <Personagens dados={site.personagens} />
        <ParaOsPais dados={site.paraOsPais} />
        <ParaEscolas dados={site.paraEscolas} temContato={comContato} />
        <BaixarDemo dados={site.baixar} url={site.demo.url} />
        <Contato contato={site.contato} />
      </main>
      {/* O rodapé recebe o contato para montar o canal com o MESMO
          montarMailto/montarWhatsapp da seção de contato: ou os dois
          aparecem, ou nenhum dos dois — nunca um link morto aqui embaixo. */}
      <Footer dados={site.rodape} contato={site.contato} />
      {/* O controle da música do jogo, fixo no canto inferior direito.
          Fica fora do <main> de propósito: é controle da página, não
          conteúdo dela. */}
      <Trilha dados={site.trilha} />
    </>
  )
}
