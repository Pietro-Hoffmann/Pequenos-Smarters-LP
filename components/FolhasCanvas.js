'use client'

import { useEffect, useRef } from 'react'
import {
  TONS,
  PASSO_MAXIMO,
  quantasFolhas,
  criarFolha,
  ventoNoInstante,
  passoDaFolha,
  desenharContornoDeFolha,
} from '@/lib/folhas'
import estilos from './FolhasCanvas.module.css'

// ---------------------------------------------------------------------------
// AS FOLHAS CAINDO NA ILHA DA NATUREZA
//
// Os outros cinco climas da seção são camadas de CSS: um padrão de pontinhos
// que desce em bloco. Barato, e suficiente para areia, neve e brasa. Para
// FOLHA não era: folha não cai em linha reta nem anda colada nas vizinhas.
// Por decisão do dono (31/10), a Natureza passou a ser pintada folha a folha
// numa tela de desenho, cada uma com a sua queda, o seu balanço e o seu giro.
//
// O QUE ISSO CUSTA, E COMO O CUSTO É CONTIDO. Um laço de desenho roda o
// tempo todo enquanto está ligado — é o preço do canvas. Então ele tem três
// freios, e os três importam:
//   1. quem pede menos movimento no sistema nunca liga o laço: as folhas são
//      pintadas uma vez e ficam paradas, igual às partículas dos outros
//      climas, que também congelam nesse caso;
//   2. seção fora da tela desliga o laço (IntersectionObserver);
//   3. aba em segundo plano desliga o laço (visibilitychange) — sem isso a
//      página fica queimando bateria atrás de uma aba que ninguém vê.
//
// O DESENHO DA FOLHA é feito UMA vez, fora da tela, num sprite por tom de
// verde. A cada quadro o canvas só reposiciona, gira e achata esse sprite
// pronto. Redesenhar o contorno quarenta vezes por quadro custaria muito
// mais e não mudaria um pixel do resultado.
//
// As contas de para onde cada folha vai moram no lib/folhas.js, sem DOM:
// é lá que elas são conferidas pelos testes.
// ---------------------------------------------------------------------------

// Lado do sprite, em pixels de tela. A maior folha tem 34px, então sobra
// folga: reduzir um desenho grande fica bom, ampliar um pequeno não fica.
const LADO_SPRITE = 56

// Teto da densidade de tela. Numa tela 3x, pintar na densidade cheia
// triplicaria os pixels sem diferença visível numa folha de 30px.
const DENSIDADE_MAXIMA = 2

// Quanto a folha chega a afinar quando fica "de perfil". Zero faria ela
// sumir por completo e piscar; 0,22 deixa ela virar um fiapo e voltar.
const PERFIL_MINIMO = 0.22

// Quem pediu menos movimento no sistema operacional não vê o laço rodar.
// Precisa existir em JavaScript: uma regra de CSS apagaria a animação, mas
// não impediria o canvas de repintar sessenta vezes por segundo.
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

export default function FolhasCanvas() {
  const telaRef = useRef(null)

  useEffect(() => {
    const tela = telaRef.current
    if (!tela || typeof tela.getContext !== 'function') return undefined
    const ctx = tela.getContext('2d')
    // navegador sem canvas 2d: a Natureza fica sem folhas e nada quebra
    if (!ctx) return undefined

    const parado = querMenosMovimento()

    let folhas = []
    let sprites = []
    let largura = 0
    let altura = 0
    let quadro = 0
    let ultimo = 0
    let relogio = 0 // segundos acumulados, só para o vento
    let naTela = true
    let abaVisivel = typeof document === 'undefined' || !document.hidden

    // ---- o desenho da folha, feito uma vez por tom -------------------------
    function montarSprites(densidade) {
      const lado = Math.round(LADO_SPRITE * densidade)
      return TONS.map((cor) => {
        const sprite = document.createElement('canvas')
        sprite.width = lado
        sprite.height = lado
        const pincel = typeof sprite.getContext === 'function' ? sprite.getContext('2d') : null
        if (!pincel) return null
        pincel.setTransform(densidade, 0, 0, densidade, 0, 0)
        pincel.translate(LADO_SPRITE / 2, LADO_SPRITE / 2)
        pincel.fillStyle = cor
        pincel.strokeStyle = 'rgba(18, 48, 16, 0.55)'
        pincel.lineWidth = 1.3
        pincel.lineJoin = 'round'
        pincel.lineCap = 'round'
        desenharContornoDeFolha(pincel, LADO_SPRITE * 0.86)
        return sprite
      })
    }

    // ---- medir a tela e semear as folhas -----------------------------------
    function medir() {
      const L = tela.clientWidth
      const A = tela.clientHeight
      if (!L || !A) {
        // a seção ainda não tem tamanho (primeiro quadro, aba oculta ao
        // abrir): não adianta semear, o ResizeObserver avisa quando der
        largura = 0
        altura = 0
        folhas = []
        return false
      }
      const densidade = Math.min(
        DENSIDADE_MAXIMA,
        (typeof window !== 'undefined' && window.devicePixelRatio) || 1
      )
      largura = L
      altura = A
      tela.width = Math.round(L * densidade)
      tela.height = Math.round(A * densidade)
      // a partir daqui o desenho fala em pixels de TELA, não de aparelho
      ctx.setTransform(densidade, 0, 0, densidade, 0, 0)
      sprites = montarSprites(densidade)

      const quantas = quantasFolhas(L)
      folhas = []
      for (let i = 0; i < quantas; i += 1) folhas.push(criarFolha(L, A))
      return true
    }

    function pintar() {
      ctx.clearRect(0, 0, largura, altura)
      for (let i = 0; i < folhas.length; i += 1) {
        const folha = folhas[i]
        const sprite = sprites[folha.tom]
        if (!sprite) continue
        // O VIRAR DE PERFIL: a largura da folha encolhe e volta conforme ela
        // gira no eixo de pé. É este achatamento, mais que a rotação, que dá
        // a sensação de que a folha tem frente e verso.
        const perfil = PERFIL_MINIMO + (1 - PERFIL_MINIMO) * Math.abs(Math.cos(folha.fase3d))
        const lado = folha.tamanho
        ctx.save()
        ctx.globalAlpha = folha.opacidade
        ctx.translate(folha.x, folha.y)
        ctx.rotate(folha.giro)
        ctx.scale(perfil, 1)
        ctx.drawImage(sprite, -lado / 2, -lado / 2, lado, lado)
        ctx.restore()
      }
      ctx.globalAlpha = 1
    }

    // ---- o laço ------------------------------------------------------------
    function agendar() {
      if (quadro || parado || !naTela || !abaVisivel || folhas.length === 0) return
      if (typeof requestAnimationFrame !== 'function') return
      quadro = requestAnimationFrame(passo)
    }

    function parar() {
      if (!quadro) return
      if (typeof cancelAnimationFrame === 'function') cancelAnimationFrame(quadro)
      quadro = 0
    }

    function passo(instante) {
      quadro = 0
      if (!ultimo) ultimo = instante
      const dt = (instante - ultimo) / 1000
      ultimo = instante
      // o relógio do vento anda com o MESMO passo travado das folhas, senão
      // uma aba que voltou do segundo plano dá um tranco de rajada
      relogio += Math.min(Math.max(dt, 0), PASSO_MAXIMO)
      const vento = ventoNoInstante(relogio)
      for (let i = 0; i < folhas.length; i += 1) {
        passoDaFolha(folhas[i], dt, vento, largura, altura)
      }
      pintar()
      agendar()
    }

    // Religa do zero: sem zerar o relógio, o primeiro quadro depois de uma
    // pausa longa chegaria com um salto de tempo enorme.
    function religar() {
      ultimo = 0
      agendar()
    }

    if (medir()) {
      // pinta já, senão a seção aparece vazia até o primeiro quadro chegar
      pintar()
      agendar()
    }

    // ---- freio 2: seção fora da tela ---------------------------------------
    let olho = null
    if (typeof IntersectionObserver !== 'undefined') {
      olho = new IntersectionObserver(
        (entradas) => {
          const ultima = entradas[entradas.length - 1]
          if (!ultima) return
          naTela = ultima.isIntersecting
          if (naTela) religar()
          else parar()
        },
        { rootMargin: '120px' }
      )
      olho.observe(tela)
    }

    // ---- freio 3: aba em segundo plano -------------------------------------
    function aoTrocarDeAba() {
      abaVisivel = !document.hidden
      if (abaVisivel) religar()
      else parar()
    }
    document.addEventListener('visibilitychange', aoTrocarDeAba)

    // ---- a tela mudou de tamanho -------------------------------------------
    let regua = null
    if (typeof ResizeObserver !== 'undefined') {
      regua = new ResizeObserver(() => {
        parar()
        if (medir()) {
          pintar()
          religar()
        }
      })
      regua.observe(tela)
    }

    return () => {
      parar()
      if (olho) olho.disconnect()
      if (regua) regua.disconnect()
      document.removeEventListener('visibilitychange', aoTrocarDeAba)
    }
  }, [])

  return <canvas ref={telaRef} className={estilos.tela} data-testid="folhas" aria-hidden="true" />
}
