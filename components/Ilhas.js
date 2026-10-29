'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal, flushSync } from 'react-dom'
import Sobrancelha from './Sobrancelha'
import { FAIXA_CENTRAL, definirTemaDaIlha, devolverOComando } from '@/lib/tema'
import estilos from './Ilhas.module.css'

// ---------------------------------------------------------------------------
// A SEÇÃO DO JOGO: O CARROSSEL DAS ILHAS
// A ilha não mora mais numa caixa: ela flutua solta no céu da página, grande,
// e quem veste o clima dela é a SEÇÃO INTEIRA — o céu (pelo data-tema que vai
// parar no <html>) e uma camada de partículas da largura toda (folhas, areia,
// brasas, neve, bolhas, vento). Quem manda no clima é o `tema` de cada ilha no
// painel de controle. Nada aqui anda sozinho: o carrossel só se mexe quando a
// pessoa pede.
//
// A ilha escolhida também pinta o céu da PÁGINA inteira, de um jeito bem mais
// suave que as partículas (o texto da página precisa continuar legível). Isso
// só vale enquanto esta seção está em cena: quando a pessoa rola para longe, o
// carrossel devolve o comando e a página volta para o céu de sempre.
//
// TROCAR DE ILHA VARRE A TELA INTEIRA
// A troca passa pela View Transitions API do próprio navegador (zero
// biblioteca, zero quilobyte): a arte da ilha ganha um `view-transition-name`
// e o navegador derrete uma na outra, enquanto uma camada de efeito do clima
// — a geada do Gelo, a onda de calor do Fogo, a rajada de areia do Deserto —
// varre a tela por um segundo.
//
// Onde essa API não existe (uns 6% dos navegadores) a troca é instantânea e
// nada quebra: é o mesmo caminho de quem pediu menos movimento.
//
// A REGRA DE DESEMPENHO que faz isso ser seguro num celular fraco: a camada de
// efeito (que usa filtro de SVG e backdrop-filter, as coisas caras) SÓ EXISTE
// durante o segundo da troca. Ela é montada quando a troca começa e some do
// HTML quando a animação acaba. Em repouso — 99% do tempo — a página não custa
// nada a mais do que custava antes.
//
// A ilha que está pronta mostra também as plaquinhas das atividades dela.
// Ilha sem `atividades` no painel de controle simplesmente não mostra nenhuma.
// ---------------------------------------------------------------------------

// Tamanho real de cada arte, em pixels. Serve só para o navegador reservar o
// espaço certo antes da imagem carregar (evita a página "pular").
// Se uma ilha for trocada por outra de proporção diferente, atualize aqui.
const TAMANHOS = {
  '/images/ilha_natureza.png': [840, 756],
  '/images/ilha_deserto.png': [560, 632],
  '/images/ilha_fogo.png': [560, 487],
  '/images/ilha_gelo.png': [560, 626],
  '/images/ilha_lagos.png': [560, 480],
  '/images/ilha_vento.png': [560, 452],
}
const PADRAO = [560, 520]

// A MINIATURA É OUTRO ARQUIVO, NÃO A ARTE CHEIA ENCOLHIDA PELO CSS.
// A arte de uma ilha tem de 560 a 840px de largura e a miniatura ocupa 68px
// na tela. Mandar a arte cheia para lá é decodificação de imagem que não
// devolve um pixel a mais no visor — e num Android barato isso custa tempo e
// bateria. Estes arquivos são as mesmas seis artes reduzidas para 160px (o
// dobro dos 68px, que é o que uma tela de alta densidade aproveita).
// O palco continua usando a arte cheia: lá ela aparece grande de verdade.
// Ilha com arte fora desta lista cai na arte cheia e nunca fica sem imagem.
const MINIATURAS = {
  '/images/ilha_natureza.png': ['/images/mini/ilha_natureza.png', 160, 144],
  '/images/ilha_deserto.png': ['/images/mini/ilha_deserto.png', 160, 181],
  '/images/ilha_fogo.png': ['/images/mini/ilha_fogo.png', 160, 139],
  '/images/ilha_gelo.png': ['/images/mini/ilha_gelo.png', 160, 179],
  '/images/ilha_lagos.png': ['/images/mini/ilha_lagos.png', 160, 137],
  '/images/ilha_vento.png': ['/images/mini/ilha_vento.png', 160, 129],
}

function miniaturaDe(arte, largura, altura) {
  return MINIATURAS[arte] || [arte, largura, altura]
}

// Tamanho real da arte de cada atividade. Mesma ideia da lista acima.
const TAMANHOS_ATIVIDADE = {
  '/images/fundo_floresta.png': [760, 427],
  '/images/fundo_lago.png': [760, 351],
  '/images/fundo_nuvenscampo.png': [760, 352],
}
const PADRAO_ATIVIDADE = [760, 380]

// Cada ilha flutua num ritmo diferente, senão todas sobem e descem igual.
// A sombra de contato usa a MESMA duração, senão ela descola da ilha.
const RITMOS = ['6s', '7.4s', '8.2s', '6.8s', '9s', '7.8s']

// Ritmos diferentes para as plaquinhas de atividade não balançarem juntas.
const RITMOS_ESTRELA = [
  { dur: '6.2s', atraso: '0s' },
  { dur: '7.6s', atraso: '-1.8s' },
  { dur: '6.8s', atraso: '-3.2s' },
]

// Quanto o dedo precisa andar de lado para contar como um arrasto, em pixels.
// Abaixo disso é toque parado (ou a pessoa está só rolando a página).
const ARRASTO_MINIMO = 45

// O QUANTO A ILHA SE INCLINA ATRÁS DO PONTEIRO.
// Valores em "unidades de ponteiro": o CSS recebe --aponta-x e --aponta-y
// entre -1 e 1 (a borda esquerda/topo da seção é -1, a direita/base é 1) e
// multiplica pelos graus e pixels escritos no Ilhas.module.css. Ficar no
// CSS é de propósito: ajustar a intensidade não passa por JavaScript.
// Só vale para MOUSE. No dedo, qualquer toque jogaria a ilha para um lado.

// Quanto dura o efeito de clima que varre a tela, em milissegundos.
// É o MESMO número que está no CSS (a variável --dur da camada .efeito).
// Mexeu num, mexa no outro — é esse relógio que TIRA a camada cara do HTML.
const DURACAO_EFEITO = 1200

// Uma folga pequena para a animação terminar de pintar antes de a camada sair.
const FOLGA_EFEITO = 140

// Quem pediu menos movimento no sistema operacional não vê efeito nenhum.
// Isto precisa existir em JavaScript (e não só no CSS): a regra do CSS apaga
// animação, mas não impediria a chamada do startViewTransition.
function querMenosMovimento() {
  if (typeof window === 'undefined') return false
  if (typeof window.matchMedia !== 'function') return false
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch (erro) {
    // navegador antigo que engasga na consulta: segue o caminho normal
    return false
  }
}

// O navegador sabe fazer a travessia? Chrome 111+, Edge, Firefox 133+ e
// Safari 18+ sabem. Os outros caem no caminho simples.
function sabeFazerTravessia() {
  return (
    typeof document !== 'undefined' &&
    typeof document.startViewTransition === 'function'
  )
}

// ---------------------------------------------------------------------------
// A CAMADA DE EFEITO
// Enfeite puro: não recebe clique, não é lida por leitor de tela e vive ~1s.
// Cada clima acende as suas três faixas (quem decide é o data-clima e o CSS).
// Só o Gelo carrega um SVG junto: é o `feTurbulence` que desenha o cristal da
// geada. Ele é caro, e é exatamente por isso que esta camada é desmontada
// assim que a animação acaba.
// ---------------------------------------------------------------------------
function CamadaDeClima({ clima }) {
  return (
    <div className={estilos.efeito} data-clima={clima} aria-hidden="true">
      <span className={`${estilos.sopro} ${estilos.sopro1}`} />
      <span className={`${estilos.sopro} ${estilos.sopro2}`} />
      <span className={`${estilos.sopro} ${estilos.sopro3}`} />
      {/* O VÉU: uma lavada da cor do clima que atravessa a tela junto com
          os sopros. É o que dá o "baque" da troca — os sopros sozinhos
          eram discretos demais. A cor vem do data-clima, no CSS. */}
      <span className={estilos.veu} />

      {clima === 'gelo' && (
        <span className={estilos.geada}>
          {/* O CRISTAL DA GEADA
              O ruído fractal vira pena de gelo por dois ajustes:
                • baseFrequency com os eixos DESIGUAIS (0.03 na horizontal,
                  0.42 na vertical) estica o ruído e ele deixa de ser areia
                  para virar aquele desenho penugento do vidro congelado;
                • a matriz de cor pinta tudo de branco azulado nas três
                  primeiras linhas e, na quarta (o alfa), só deixa passar as
                  partes CLARAS do ruído (alfa = 2,3 × vermelho − 0,8). É esse
                  corte que separa o cristal do fundo, em vez de deixar uma
                  névoa chapada.
              color-interpolation-filters em sRGB porque no espaço linear
              (o padrão) o corte do alfa cai num lugar diferente do que a
              gente vê, e o cristal sumia. */}
          <svg
            className={estilos.geadaSvg}
            aria-hidden="true"
            focusable="false"
            xmlns="http://www.w3.org/2000/svg"
          >
            <filter
              id="psGeada"
              x="0"
              y="0"
              width="100%"
              height="100%"
              colorInterpolationFilters="sRGB"
            >
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.03 0.42"
                numOctaves="3"
                seed="7"
                stitchTiles="stitch"
              />
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0.88  0 0 0 0 0.96  0 0 0 0 1  2.3 0 0 0 -0.8"
              />
            </filter>
            <rect width="100%" height="100%" filter="url(#psGeada)" />
          </svg>
        </span>
      )}
    </div>
  )
}

export default function Ilhas({ dados }) {
  const [atual, setAtual] = useState(0)
  // Onde o dedo (ou o mouse) encostou. Fica em ref porque mudar isso não
  // precisa redesenhar nada na tela.
  const toque = useRef(null)
  const secaoRef = useRef(null)
  // Esta seção está cruzando a faixa central da tela? É isso que decide se o
  // carrossel manda ou não no céu da página.
  const [emCena, setEmCena] = useState(false)
  // A camada de efeito que está no ar agora: { clima, id } ou nada.
  // É o `null` aqui que TIRA a camada cara do HTML.
  const [efeito, setEfeito] = useState(null)
  // Conta as trocas feitas SEM a travessia do navegador. Serve de chave da
  // cena, para a ilha nova entrar com o fundidinho de sempre nesse caminho.
  const [passoSimples, setPassoSimples] = useState(0)
  const contadorDeEfeito = useRef(0)

  const lista = Array.isArray(dados && dados.lista) ? dados.lista : []
  const total = lista.length
  const indice = total > 0 ? Math.min(atual, total - 1) : 0
  const ilha = lista[indice] || {}
  const tema = ilha.tema || 'natureza'
  const atividades = Array.isArray(ilha.atividades) ? ilha.atividades : []
  // O painel de controle decide se as plaquinhas aparecem. Sem a chave,
  // aparecem (é o comportamento antigo); com `mostrarAtividades: false`,
  // a seção é só a ilha e as miniaturas.
  const mostrarAtividades = dados.mostrarAtividades !== false

  // Olha a própria seção com a MESMA faixa central que o <TemaPorSecao /> usa.
  // Mesma régua para os dois = os dois sempre concordam sobre quem está em
  // cena, então a troca de comando nunca fica no meio do caminho.
  useEffect(() => {
    const alvo = secaoRef.current
    if (!alvo || typeof IntersectionObserver === 'undefined') return undefined

    const observador = new IntersectionObserver(
      (entradas) => {
        const ultima = entradas[entradas.length - 1]
        if (ultima) setEmCena(ultima.isIntersecting)
      },
      { rootMargin: FAIXA_CENTRAL, threshold: 0 }
    )
    observador.observe(alvo)

    return () => {
      observador.disconnect()
      devolverOComando()
    }
  }, [])

  // Em cena, o céu da página é o da ilha escolhida. Fora de cena, o carrossel
  // devolve o comando e quem volta a mandar é a rolagem.
  useEffect(() => {
    if (emCena) definirTemaDaIlha(tema)
    else devolverOComando()
  }, [emCena, tema])

  // O RELÓGIO QUE DESMONTA O EFEITO
  // Passou o segundo, a camada sai do HTML — com ela saem o filtro de SVG, o
  // backdrop-filter e as faixas grandes. Nada caro fica ligado em repouso.
  // Se o componente sair da tela antes, o `clearTimeout` da limpeza resolve.
  useEffect(() => {
    if (!efeito) return undefined
    const relogio = setTimeout(() => {
      setEfeito((anterior) => (anterior && anterior.id === efeito.id ? null : anterior))
    }, DURACAO_EFEITO + FOLGA_EFEITO)
    return () => clearTimeout(relogio)
  }, [efeito])

  // Sem a lista no painel de controle, a seção inteira não aparece.
  if (total === 0) return null

  // Dá a volta: depois da última vem a primeira, antes da primeira vem a última.
  function irPara(i) {
    const alvo = ((i % total) + total) % total
    if (alvo === indice) return

    // CAMINHO SIMPLES — navegador sem a API, ou quem pediu menos movimento.
    // A ilha troca na hora: sem travessia, sem camada de efeito, sem nada caro.
    if (querMenosMovimento() || !sabeFazerTravessia()) {
      setPassoSimples((n) => n + 1)
      setAtual(alvo)
      return
    }

    // CAMINHO COM TRAVESSIA — o navegador derrete uma ilha na outra e a camada
    // de clima varre a tela. As duas mudanças precisam entrar no MESMO quadro
    // (por isso o flushSync), senão o navegador tira a foto antes da troca.
    contadorDeEfeito.current += 1
    const id = contadorDeEfeito.current
    const climaNovo = (lista[alvo] && lista[alvo].tema) || 'natureza'

    document.startViewTransition(() => {
      flushSync(() => {
        setAtual(alvo)
        setEfeito({ clima: climaNovo, id })
      })
    })
  }

  const anterior = () => irPara(indice - 1)
  const proxima = () => irPara(indice + 1)

  const [largura, altura] = TAMANHOS[ilha.arte] || PADRAO
  const ritmo = RITMOS[indice % RITMOS.length]
  const rotulo = ilha.disponivel ? dados.rotuloDisponivel : dados.rotuloEmBreve

  // Setas do teclado só andam quando o foco está dentro do carrossel:
  // o evento sobe dos botões até aqui e não atrapalha o resto da página.
  // O PONTEIRO INCLINA A ILHA E EMPURRA O CLIMA AO CONTRÁRIO.
  // Escreve duas variáveis na seção inteira: a cena usa para inclinar e
  // deslocar, as camadas de clima usam para andar no sentido oposto (é o
  // contrário que cria a sensação de profundidade). Um quadro por vez,
  // via requestAnimationFrame: pointermove dispara dezenas de vezes por
  // segundo e escrever direto seria desperdício.
  const quadroPendente = useRef(0)
  const alvoDoPonteiro = useRef({ x: 0, y: 0 })

  function escreverPonteiro() {
    quadroPendente.current = 0
    const alvo = secaoRef.current
    if (!alvo) return
    const { x, y } = alvoDoPonteiro.current
    alvo.style.setProperty('--aponta-x', x.toFixed(3))
    alvo.style.setProperty('--aponta-y', y.toFixed(3))
  }

  function pedirQuadro() {
    if (quadroPendente.current) return
    // marca ANTES de agendar, e não com o número que o agendador devolve:
    // assim a guarda funciona mesmo se o quadro rodar na mesma hora (é o
    // que acontece nos testes, e o que um navegador pode fazer se o
    // requestAnimationFrame estiver faltando)
    quadroPendente.current = 1
    if (typeof requestAnimationFrame !== 'function') {
      escreverPonteiro()
      return
    }
    requestAnimationFrame(escreverPonteiro)
  }

  function aoMoverPonteiro(evento) {
    // dedo e caneta ficam de fora: lá o toque é para arrastar a ilha
    if (evento.pointerType && evento.pointerType !== 'mouse') return
    if (querMenosMovimento()) return
    const alvo = secaoRef.current
    if (!alvo) return
    const caixa = alvo.getBoundingClientRect()
    if (!caixa.width || !caixa.height) return
    const dentro = (v) => Math.max(-1, Math.min(1, v))
    alvoDoPonteiro.current = {
      x: dentro(((evento.clientX - caixa.left) / caixa.width - 0.5) * 2),
      y: dentro(((evento.clientY - caixa.top) / caixa.height - 0.5) * 2),
    }
    pedirQuadro()
  }

  function aoSairComPonteiro() {
    alvoDoPonteiro.current = { x: 0, y: 0 }
    pedirQuadro()
  }

  function aoTeclar(evento) {
    if (evento.key === 'ArrowLeft') {
      evento.preventDefault()
      anterior()
    } else if (evento.key === 'ArrowRight') {
      evento.preventDefault()
      proxima()
    }
  }

  function aoEncostar(evento) {
    toque.current = { x: evento.clientX, y: evento.clientY }
    // Segura o ponteiro para o "soltar" chegar aqui mesmo se o dedo sair do palco.
    const alvo = evento.currentTarget
    if (alvo && typeof alvo.setPointerCapture === 'function') {
      try {
        alvo.setPointerCapture(evento.pointerId)
      } catch (erro) {
        // navegador que não deixa capturar: o arrasto ainda vale dentro do palco
      }
    }
  }

  function aoSoltar(evento) {
    const inicio = toque.current
    toque.current = null
    if (!inicio) return
    const andouX = evento.clientX - inicio.x
    const andouY = evento.clientY - inicio.y
    // Movimento mais vertical que horizontal é rolagem da página, não arrasto.
    if (Math.abs(andouX) < ARRASTO_MINIMO || Math.abs(andouX) <= Math.abs(andouY)) return
    if (andouX < 0) proxima()
    else anterior()
  }

  function aoCancelar() {
    toque.current = null
  }

  return (
    <section
      onPointerMove={aoMoverPonteiro}
      onPointerLeave={aoSairComPonteiro}
      className={`secao ${estilos.secao}`}
      id="jogo"
      ref={secaoRef}
      // Marca que esta seção tem dono: o clima dela é o carrossel quem escolhe,
      // não a rolagem. Quem lê isso é o <TemaPorSecao />.
      data-tema-do-carrossel="1"
    >
      {/* O CLIMA DA SEÇÃO INTEIRA
          Saiu de dentro da caixa: agora é uma camada da largura toda, atrás de
          tudo, cortada pelo overflow da seção. Puro enfeite: não recebe clique
          e não é lida por leitor de tela. As quatro faixas são as mesmas de
          antes (duas de partícula e duas de "extra"), no mesmo número — isto
          não custa um centavo a mais do que custava dentro da caixa. */}
      <span className={estilos.climaSecao} data-tema={tema} aria-hidden="true">
        <span className={`${estilos.camada} ${estilos.p1}`} />
        <span className={`${estilos.camada} ${estilos.extraA}`} />
        <span className={`${estilos.camada} ${estilos.p2}`} />
        <span className={`${estilos.camada} ${estilos.extraB}`} />
      </span>

      <div className={`container ${estilos.conteudo}`}>
        <Sobrancelha texto={dados.sobrancelha} />
        <h2 className="tituloSecao" data-revelar>{dados.titulo}</h2>
        {dados.texto && <p className={estilos.intro} data-revelar>{dados.texto}</p>}

        {/* A SEÇÃO CABE NUMA TELA. Por pedido do dono, ninguém precisa rolar
            para ver a ilha E as atividades: em telas largas (≥ 1100 px) a
            ilha com as miniaturas fica à esquerda e as três plaquinhas,
            empilhadas e compactas, à direita. Em telas menores os dois blocos
            voltam a ficar um embaixo do outro, como antes. Os dois embrulhos
            abaixo (colunaIlha e colunaAtividades) existem só para isso. */}
        <div className={`${estilos.duasColunas} ${mostrarAtividades ? estilos.comAtividades : ''}`}>
        <div className={estilos.colunaIlha}>
        <div className={estilos.carrossel} onKeyDown={aoTeclar} data-revelar>
          {/* O palco perdeu a placa (contorno, degrau de sombra e fundo): a
              ilha flutua solta no céu da página. O que sobrou aqui é o lugar
              onde o dedo arrasta e o aviso de qual clima está em cena. */}
          <div
            className={estilos.palco}
            data-tema={tema}
            data-testid="palco"
            onPointerDown={aoEncostar}
            onPointerUp={aoSoltar}
            onPointerCancel={aoCancelar}
          >
            {/* A ilha flutua e a sombra embaixo encolhe junto, no mesmo ritmo.
                É a sombra que faz a ilha parecer no ar, mais do que a subida.
                A altura é FIXA: as seis artes têm proporções diferentes e sem
                isso a página pulava a cada troca.
                A chave muda só no caminho simples (sem travessia): é ela que
                faz a ilha nova entrar com o fundidinho nesse caso. Com
                travessia, quem faz a entrada é o navegador. */}
            <div
              className={`${estilos.cena} ${passoSimples > 0 ? estilos.entrando : ''}`}
              key={passoSimples}
            >
              {/* O HALO DO CLIMA.
                  Fica ATRÁS da ilha e respira devagar, na cor daquele
                  clima (quem define a cor é o .palco[data-tema] no CSS).
                  É ele que tira a sensação de objeto recortado parado no
                  meio da tela. Puro radial-gradient com opacity animada:
                  não custa layout nem pintura cara. */}
              <span className={estilos.halo} aria-hidden="true" />
              <span
                className={`${estilos.sombra} aSombra`}
                style={{ '--dur': ritmo }}
                aria-hidden="true"
              />
              {/* alt vazio de propósito: o nome da ilha vem logo abaixo, em
                  texto de verdade. Repetir aqui só faria o leitor de tela
                  falar o mesmo nome duas vezes seguidas. */}
              <img
                className={`${estilos.arte} aFlutuar`}
                style={{ '--dur': ritmo }}
                src={ilha.arte}
                alt=""
                aria-hidden="true"
                width={largura}
                height={altura}
                loading="lazy"
                draggable="false"
              />
            </div>

            {/* Navy sólido, não a voz do jogo: o contorno branco agora vale
                só na abertura (o H1) e no clímax (o bloco de download). Um
                nome de ilha com o mesmo peso do H1 achatava a hierarquia da
                página inteira. O navy segura 5,67:1 contra o céu mais fundo. */}
            <h3 className={`tituloSecao ${estilos.nome}`}>{ilha.nome}</h3>
            {ilha.descricao && <p className={estilos.descricao}>{ilha.descricao}</p>}
            <span className={`${estilos.selo} ${ilha.disponivel ? estilos.pronta : ''}`}>
              {rotulo}
            </span>
          </div>

          <button
            type="button"
            className={`${estilos.seta} ${estilos.setaEsquerda}`}
            onClick={anterior}
            aria-label={dados.rotuloAnterior}
          >
            <span className={estilos.bico} aria-hidden="true" />
          </button>
          <button
            type="button"
            className={`${estilos.seta} ${estilos.setaDireita}`}
            onClick={proxima}
            aria-label={dados.rotuloProxima}
          >
            <span className={estilos.bico} aria-hidden="true" />
          </button>

          {/* Quem usa leitor de tela não vê a ilha trocar: este aviso conta,
              sem interromper o que estiver sendo lido. */}
          <p className="visuallyHidden" aria-live="polite">
            {ilha.nome}
            {rotulo ? `, ${rotulo}` : ''}
          </p>
        </div>

        {/* A fileira de miniaturas é a navegação E o mapa das seis ilhas:
            todas aparecem aqui ao mesmo tempo, mesmo as que ainda vêm. */}
        <ul className={estilos.miniaturas} aria-label={dados.rotuloMiniaturas} data-revelar>
          {lista.map((item, i) => {
            const [w, h] = TAMANHOS[item.arte] || PADRAO
            const [arteMini, miniW, miniH] = miniaturaDe(item.arte, w, h)
            return (
              <li key={item.nome || i}>
                <button
                  type="button"
                  className={`${estilos.miniatura} ${i === indice ? estilos.ativa : ''}`}
                  data-tema={item.tema || 'natureza'}
                  onClick={() => irPara(i)}
                  // Dois avisos, e os dois precisam existir:
                  //   aria-pressed diz o estado das SEIS (pressionada ou
                  //     não), então quem usa leitor de tela sabe que a ilha
                  //     não escolhida também é escolhível;
                  //   aria-current marca a que está em cena, que é a
                  //     informação que o resto da seção está mostrando.
                  // Sem eles a fileira era seis botões iguais e o leitor de
                  // tela não tinha como dizer qual ilha estava selecionada.
                  aria-pressed={i === indice}
                  aria-current={i === indice ? 'true' : undefined}
                  aria-label={item.nome}
                >
                  <img
                    src={arteMini}
                    alt=""
                    aria-hidden="true"
                    width={miniW}
                    height={miniH}
                    loading="lazy"
                  />
                </button>
              </li>
            )
          })}
        </ul>
        </div>

        {mostrarAtividades && (
        <div className={estilos.colunaAtividades}>
        {/* As atividades da ilha escolhida. Elas vêm DEPOIS das miniaturas de
            propósito: assim o palco e a navegação ficam sempre no mesmo lugar,
            e trocar de ilha nunca puxa o botão de baixo do dedo da pessoa.

            ILHA SEM ATIVIDADES NÃO DEIXA MAIS BURACO. Antes, clicar numa das
            cinco ilhas futuras fazia as três plaquinhas sumirem e sobrava
            meio milhar de pixels de campo colorido vazio: a pessoa interagia
            e a recompensa era MENOS página. Agora esse lugar recebe a
            plaquinha do `futura` — uma linha honesta ("a arte já existe, as
            atividades ainda não") e o mesmo convite do resto da página. Sem
            o bloco `futura` no painel de controle, volta a não aparecer nada
            e nada quebra. */}
        {atividades.length === 0 && dados.futura && (
          <div className={estilos.futura} data-testid="ilha-futura">
            <p>{dados.futura.texto}</p>
            {dados.futura.botao && (
              <a className="botao botaoSecundario" href="#baixar">{dados.futura.botao}</a>
            )}
          </div>
        )}

        {atividades.length > 0 && (
          <>
            <div className={estilos.grade} data-testid="atividades">
              {atividades.map((atv, i) => {
                const estrela = RITMOS_ESTRELA[i % RITMOS_ESTRELA.length]
                const [larguraArte, alturaArte] =
                  TAMANHOS_ATIVIDADE[atv.arte] || PADRAO_ATIVIDADE
                return (
                  <article key={atv.nome} className={`cartao ${estilos.cartao}`}>
                    <span className={estilos.moldura}>
                      <img
                        className={estilos.arteAtividade}
                        src={atv.arte}
                        alt=""
                        aria-hidden="true"
                        width={larguraArte}
                        height={alturaArte}
                        loading="lazy"
                      />
                    </span>
                    <span className={estilos.fita} style={{ background: atv.cor }} aria-hidden="true" />
                    <h3>{atv.nome}</h3>
                    <p>{atv.texto}</p>
                    <img
                      className={`${estilos.estrela} aFlutuar`}
                      style={{ '--dur': estrela.dur, '--atraso': estrela.atraso }}
                      src="/images/estrelas.png"
                      alt=""
                      aria-hidden="true"
                      width={480}
                      height={223}
                      loading="lazy"
                    />
                  </article>
                )
              })}
            </div>

            {dados.rodape && <p className={estilos.rodape}>{dados.rodape}</p>}
          </>
        )}
        </div>
        )}
        </div>
      </div>

      {/* A camada de efeito vai para o fim do <body>, não para dentro da
          seção: assim nenhum ancestral com transform consegue prender o
          `position: fixed` dela num pedaço da página. Ela só existe durante o
          segundo da troca. */}
      {efeito && typeof document !== 'undefined'
        ? createPortal(
            <CamadaDeClima key={efeito.id} clima={efeito.clima} />,
            document.body
          )
        : null}
    </section>
  )
}
