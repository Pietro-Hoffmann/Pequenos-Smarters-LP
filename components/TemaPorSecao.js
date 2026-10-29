'use client'

import { useEffect } from 'react'
import {
  TEMA_PADRAO,
  FAIXA_CENTRAL,
  FAIXA_RODAPE,
  temaDaSecao,
  definirTemaDeRolagem,
  devolverOComando,
} from '@/lib/tema'

// ---------------------------------------------------------------------------
// O CLIMA SEGUE A ROLAGEM
// Este componente não desenha nada: ele só olha as seções da página e avisa
// qual está em cena, para o céu do fundo vestir o clima dela.
//
// Quem diz o clima de cada seção é o mapa do arco do dia, no lib/tema.js — a
// seção só precisa se identificar com um id. Seção sem id (ou com um id que
// não está no mapa) fica no céu de sempre; nada quebra.
//
// Duas exceções, cada uma com a régua dela:
//   • a seção das ilhas (marcada com data-tema-do-carrossel) é do carrossel:
//     aqui a gente nem opina. Quando a seção em cena NÃO é a dela, este
//     componente devolve o comando, caso o carrossel ainda estivesse segurando.
//   • o rodapé é baixo demais para alcançar a faixa central, então ele tem um
//     observador próprio: apareceu na tela, o céu vai para o fim do arco.
//
// Se o JavaScript não rodar (ou o navegador for velho demais para o
// IntersectionObserver), nada acontece: a página fica no céu de abertura, que
// já vem escrito no HTML. Nenhum texto depende disto para aparecer.
// ---------------------------------------------------------------------------

export default function TemaPorSecao() {
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined

    const secoes = Array.from(document.querySelectorAll('main > section'))
    const rodape = document.querySelector('body > footer')
    if (secoes.length === 0) return undefined

    // Na troca de uma seção para a outra, as duas cruzam a faixa central por
    // um instante. Nesse empate ganha a que vem primeiro na página — assim a
    // decisão é sempre a mesma, nunca depende da ordem dos avisos.
    const emCena = new Set()

    // Um único lugar decide, não importa qual observador avisou.
    function decidir() {
      const secao = secoes.find((item) => emCena.has(item))

      // Território do carrossel: ele é quem fala pela seção das ilhas, e nem
      // o rodapé passa por cima disso. Esta checagem vem primeiro de
      // propósito: nesta página as duas coisas nunca acontecem juntas, mas se
      // um dia acontecerem, quem não pode perder o comando é o carrossel.
      if (secao && secao.dataset.temaDoCarrossel === '1') return

      // Fim da página: o rodapé ganha de quem estiver na faixa central,
      // porque ele é o último degrau do arco e nunca chega à faixa sozinho.
      if (rodape && emCena.has(rodape)) {
        definirTemaDeRolagem(temaDaSecao(rodape.id))
        devolverOComando()
        return
      }

      // Nenhuma seção na faixa: fica como estava.
      if (!secao) return

      definirTemaDeRolagem(temaDaSecao(secao.id))
      devolverOComando()
    }

    function anotar(entradas) {
      for (const entrada of entradas) {
        if (entrada.isIntersecting) emCena.add(entrada.target)
        else emCena.delete(entrada.target)
      }
      decidir()
    }

    const observador = new IntersectionObserver(anotar, {
      rootMargin: FAIXA_CENTRAL,
      threshold: 0,
    })
    secoes.forEach((secao) => observador.observe(secao))

    const observadorDoRodape = rodape
      ? new IntersectionObserver(anotar, { rootMargin: FAIXA_RODAPE, threshold: 0 })
      : null
    if (observadorDoRodape) observadorDoRodape.observe(rodape)

    return () => {
      observador.disconnect()
      if (observadorDoRodape) observadorDoRodape.disconnect()
      definirTemaDeRolagem(TEMA_PADRAO)
      devolverOComando()
    }
  }, [])

  return null
}
