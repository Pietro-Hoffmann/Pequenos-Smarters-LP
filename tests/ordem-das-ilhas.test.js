import { describe, it, expect } from 'vitest'
import { site } from '@/content/site'

// ---------------------------------------------------------------------------
// A ORDEM DAS ILHAS É A DO JOGO, E O SITE INTEIRO TEM DE CONCORDAR
//
// No jogo as ilhas ficam num arco e são percorridas em ordem CRONOLÓGICA:
// a criança só abre a seguinte quando termina a anterior. Duas fontes
// independentes dentro do jogo dizem a mesma coisa — o MapScreen, que
// comenta "ordem cronológica" na própria lista, e o painel dos pais de
// lá, que numera as ilhas de 1 a 6.
//
// Até 2/11 o carrossel do site estava com Fogo e Gelo trocados e Lagos
// antes dos Ventos, ENQUANTO a prévia do Painel dos Pais, no mesmo
// arquivo de conteúdo, já seguia a ordem certa. O site se contradizia, e
// ninguém tinha como perceber sem abrir as duas seções lado a lado.
//
// Estes testes existem para isso não voltar: um trava a ordem contra o
// jogo, o outro trava as duas listas uma contra a outra.
// ---------------------------------------------------------------------------

// A ordem cronológica, copiada do jogo (src/screens/MapScreen.js e
// src/screens/ParentsScreen.js). Mudou lá? Mude aqui junto, de propósito:
// é para a divergência doer.
const ORDEM_DO_JOGO = ['Natureza', 'Deserto', 'Gelo', 'Ventos', 'Fogo', 'Lagos']

const carrossel = () => site.ilhas.lista.map((i) => i.nome)

// A prévia da jornada vive dentro de um dos painéis de acompanhamento.
function jornadaDaPrevia() {
  for (const painel of site.paraOsPais.paineis || []) {
    for (const bloco of (painel.previa && painel.previa.blocos) || []) {
      const itens = bloco.ilhas || bloco.itens
      if (Array.isArray(itens) && itens.some((i) => i && i.estado)) {
        return itens.map((i) => i.nome)
      }
    }
  }
  return null
}

describe('a ordem das ilhas', () => {
  it('o carrossel segue a ordem cronológica do jogo', () => {
    expect(carrossel()).toEqual(ORDEM_DO_JOGO)
  })

  it('a prévia da jornada segue a MESMA ordem do carrossel', () => {
    const previa = jornadaDaPrevia()
    expect(previa, 'a prévia da jornada sumiu do painel de controle').not.toBeNull()
    expect(previa).toEqual(carrossel())
  })

  it('a Natureza é a primeira da fila', () => {
    expect(site.ilhas.lista[0].nome).toBe('Natureza')
  })

  it('AS ILHAS PRONTAS SÃO AS PRIMEIRAS, SEM BURACO NO MEIO', () => {
    // A criança abre uma ilha terminando a anterior: é uma fila, não um
    // menu. Marcar o Fogo como pronto deixando o Gelo trancado seria um
    // estado impossível no jogo — e a página anunciaria uma ilha que
    // ninguém consegue alcançar.
    // Em 3/11 a demo passou a ir da Natureza até o Gelo (três ilhas).
    const prontas = site.ilhas.lista.map((i) => Boolean(i.disponivel))
    const primeiraTrancada = prontas.indexOf(false)
    if (primeiraTrancada !== -1) {
      expect(
        prontas.slice(primeiraTrancada).some(Boolean),
        'há ilha pronta DEPOIS de uma trancada: a fila está furada'
      ).toBe(false)
    }
    expect(prontas[0], 'a primeira ilha tem de estar pronta').toBe(true)
  })

  it('cada ilha aparece uma vez só, com arte e clima próprios', () => {
    const lista = site.ilhas.lista
    expect(new Set(lista.map((i) => i.nome)).size).toBe(lista.length)
    expect(new Set(lista.map((i) => i.arte)).size).toBe(lista.length)
    expect(new Set(lista.map((i) => i.tema)).size).toBe(lista.length)
  })

  it('a ilha dos Ventos tem o nome no plural, como no jogo', () => {
    // o carrossel dizia "Vento" e a prévia dizia "Ventos": a mesma ilha
    // com dois nomes em duas seções da mesma página
    expect(carrossel()).toContain('Ventos')
    expect(carrossel()).not.toContain('Vento')
  })
})
