'use client'

import { useEffect, useRef } from 'react'

// ---------------------------------------------------------------------------
// O LAÇO DE DESENHO DOS CLIMAS, E OS TRÊS FREIOS
//
// Isto nasceu dentro do FolhasCanvas.js, quando só a Natureza era pintada
// numa tela de desenho. Saiu para cá quando o Deserto entrou: o laço, a
// medição e os freios são os mesmos para qualquer clima — o que muda de um
// para outro é só a RECEITA (como a partícula nasce, como anda, como é
// desenhada).
//
// OS TRÊS FREIOS, que o CSS dava de graça e o canvas não dá:
//   1. quem pede menos movimento no sistema nunca liga o laço: o clima é
//      pintado uma vez e fica parado, igual às camadas de CSS dos climas que
//      ainda não migraram, que também congelam nesse caso;
//   2. seção fora da tela desliga o laço;
//   3. aba em segundo plano desliga o laço — sem isso a página fica
//      queimando bateria atrás de uma aba que ninguém vê.
//
// A RECEITA é um objeto com três funções e nenhum estado próprio:
//   preparar(ctx, largura, altura, densidade) -> o estado daquele clima
//   andar(estado, dt, relogio, largura, altura)
//   pintar(ctx, estado, largura, altura)
// Guardar o estado fora da receita é o que deixa o mesmo objeto servir a
// várias telas sem uma pisar na outra.
// ---------------------------------------------------------------------------

// Teto da densidade de tela. Numa tela 3x, pintar na densidade cheia
// triplicaria os pixels sem diferença visível numa partícula de 30px.
const DENSIDADE_MAXIMA = 2

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

export default function usarTelaDeClima(receita) {
  const telaRef = useRef(null)

  useEffect(() => {
    const tela = telaRef.current
    if (!tela || !receita || typeof tela.getContext !== 'function') return undefined
    const ctx = tela.getContext('2d')
    // navegador sem canvas 2d: o clima fica sem partículas e nada quebra
    if (!ctx) return undefined

    const parado = querMenosMovimento()

    let estado = null
    let largura = 0
    let altura = 0
    let quadro = 0
    let ultimo = 0
    let relogio = 0 // segundos acumulados, para o vento e a lufada
    let naTela = true
    let abaVisivel = typeof document === 'undefined' || !document.hidden

    function medir() {
      const L = tela.clientWidth
      const A = tela.clientHeight
      if (!L || !A) {
        // a seção ainda não tem tamanho (primeiro quadro, aba oculta ao
        // abrir): não adianta semear, o ResizeObserver avisa quando der
        largura = 0
        altura = 0
        estado = null
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
      estado = receita.preparar(ctx, L, A, densidade)
      return true
    }

    function pintar() {
      if (!estado) return
      ctx.clearRect(0, 0, largura, altura)
      receita.pintar(ctx, estado, largura, altura)
      ctx.globalAlpha = 1
    }

    function agendar() {
      if (quadro || parado || !naTela || !abaVisivel || !estado) return
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
      // o relógio anda com o MESMO passo travado das partículas, senão uma
      // aba que voltou do segundo plano dá um tranco de rajada
      relogio += Math.min(Math.max(dt, 0), 0.05)
      receita.andar(estado, dt, relogio, largura, altura)
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
  }, [receita])

  return telaRef
}
