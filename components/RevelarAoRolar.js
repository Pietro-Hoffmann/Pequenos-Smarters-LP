'use client'

import { useEffect } from 'react'

// REVELAR AO ROLAR.
// Não desenha nada. Ao montar, marca html[data-js] (é o que libera o CSS a
// esconder os blocos — sem JavaScript tudo fica visível) e passa a observar
// cada bloco com data-revelar: quando ele encosta na tela, ganha
// data-revelado e o CSS faz o fade. O FADE RESETA: quando o bloco sai
// inteiro da tela (por cima ou por baixo), perde data-revelado, e ao voltar
// faz o fade de novo — pedido do dono. Dois observadores, de propósito:
//   • o de ENTRADA desconta 8% da borda de baixo (não revela o que está só
//     espiando);
//   • o de SAÍDA não tem margem (só esconde quando o bloco saiu por
//     completo — senão ele sumiria ainda visível na faixa dos 8%).
//
// Escada: dentro de um pai com data-revelar-grupo, cada irmão recebe um
// atraso crescente (--atraso) — os três cartões de uma fileira entram um
// atrás do outro.
//
// Quem já está na tela no carregamento TAMBÉM entra em fade (o observador
// avisa no primeiro quadro): a página inteira "surge", como no site de
// referência. O herói fica fora de propósito (não tem data-revelar).
// Movimento reduzido, ou navegador sem IntersectionObserver: revela tudo
// de uma vez (data-imediato, sem transição) e não observa nada.
const ESCADA_MS = 90

export default function RevelarAoRolar() {
  useEffect(() => {
    const raiz = document.documentElement
    raiz.dataset.js = '1'

    const blocos = Array.from(document.querySelectorAll('[data-revelar]'))
    if (blocos.length === 0) return undefined

    // a escada dos irmãos
    document.querySelectorAll('[data-revelar-grupo]').forEach((grupo) => {
      Array.from(grupo.children)
        .filter((el) => el.hasAttribute('data-revelar'))
        .forEach((el, i) => el.style.setProperty('--atraso', `${i * ESCADA_MS}ms`))
    })

    const revelar = (el, imediato) => {
      el.setAttribute('data-revelado', '1')
      if (imediato) el.setAttribute('data-imediato', '1')
    }

    const reduzido =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduzido || typeof IntersectionObserver !== 'function') {
      blocos.forEach((el) => revelar(el, true))
      return undefined
    }

    const entrada = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((e) => {
          if (e.isIntersecting) revelar(e.target, false)
        })
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0 }
    )
    const saida = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((e) => {
          if (!e.isIntersecting) e.target.removeAttribute('data-revelado')
        })
      },
      { threshold: 0 }
    )
    blocos.forEach((el) => {
      entrada.observe(el)
      saida.observe(el)
    })

    return () => {
      entrada.disconnect()
      saida.disconnect()
    }
  }, [])

  return null
}
