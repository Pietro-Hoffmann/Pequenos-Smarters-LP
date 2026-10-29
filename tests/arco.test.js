import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import Pagina from '@/app/page'
import { ARCO_DO_DIA, TEMA_POR_SECAO, momentoDoArco } from '@/lib/tema'

// ---------------------------------------------------------------------------
// O ARCO DO DIA
// O céu da página é um CICLO CURTO: sai do azul do jogo, esquenta só no bloco
// de download e volta para o azul no rodapé. Este arquivo não repete o mapa
// (isso não provaria nada): ele confere as coisas que podem quebrar de
// verdade quando alguém mexer na página depois.
//
//   1. toda parte da página tem um momento do arco — seção nova sem entrada
//      no mapa passaria batido e ficaria no céu de abertura;
//   2. descendo a página o arco nunca pula para trás;
//   3. o ciclo fecha: a página começa e termina no azul, e o único ponto
//      quente é o bloco de download;
//   4. todo momento do mapa existe mesmo no CSS e é legível: o texto da
//      página precisa de 4,5:1 contra o ponto mais escuro do degradê.
// ---------------------------------------------------------------------------

const TEXTO = '#2C3E50'
const CSS = readFileSync(path.join(process.cwd(), 'app', 'globals.css'), 'utf8')

function canalLinear(valor) {
  const c = valor / 255
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}

function luminancia(hex) {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return 0.2126 * canalLinear(r) + 0.7152 * canalLinear(g) + 0.0722 * canalLinear(b)
}

function contraste(a, b) {
  const [claro, escuro] = [luminancia(a), luminancia(b)].sort((x, y) => y - x)
  return (claro + 0.05) / (escuro + 0.05)
}

// As três cores de um clima, lidas do CSS de verdade.
function coresDoClima(tema) {
  const bloco = CSS.match(new RegExp(`\\[data-tema='${tema}'\\][^{]*\\{([^}]*)\\}`))
  if (!bloco) return null
  return ['--paginaA', '--paginaB', '--paginaC'].map((nome) => {
    const achado = bloco[1].match(new RegExp(`${nome}:\\s*(#[0-9a-fA-F]{6})`))
    return achado ? achado[1] : null
  })
}

function partesDaPagina(container) {
  const secoes = Array.from(container.querySelectorAll('main > section'))
  const rodape = container.querySelector('footer')
  return [...secoes, rodape]
}

describe('o arco do dia', () => {
  it('toda parte da página sabe que horas são (ou é o território do carrossel)', () => {
    const { container } = render(<Pagina />)
    const partes = partesDaPagina(container)
    // a seção de contato só existe se o painel de controle tiver e-mail ou
    // WhatsApp preenchido, então o número de partes varia: o que não varia é
    // que todas elas têm um momento do dia.
    expect(partes.length).toBeGreaterThanOrEqual(9)
    expect(container.querySelector('footer'), 'o rodapé é o fim do arco').not.toBeNull()

    const semMomento = partes.filter((parte) => {
      if (parte.dataset.temaDoCarrossel === '1') return false
      return !parte.id || !TEMA_POR_SECAO[parte.id]
    })

    expect(
      semMomento.map((p) => p.id || p.tagName),
      'parte da página sem entrada no mapa do lib/tema.js'
    ).toEqual([])
  })

  it('a seção das ilhas fica de fora do mapa: quem pinta ali é o carrossel', () => {
    const { container } = render(<Pagina />)
    const ilhas = container.querySelector('[data-tema-do-carrossel="1"]')
    expect(ilhas).not.toBeNull()
    expect(ilhas.id).toBe('jogo')
    expect(TEMA_POR_SECAO[ilhas.id]).toBeUndefined()
  })

  it('descendo a página o arco só anda para frente, nunca pula para trás', () => {
    const { container } = render(<Pagina />)
    const momentos = partesDaPagina(container)
      .filter((parte) => parte.dataset.temaDoCarrossel !== '1')
      .map((parte) => ({ id: parte.id, passo: momentoDoArco(TEMA_POR_SECAO[parte.id]) }))

    // nenhum deles pode estar fora do arco
    expect(momentos.filter((m) => m.passo < 0)).toEqual([])

    for (let i = 1; i < momentos.length; i += 1) {
      expect(
        momentos[i].passo,
        `${momentos[i].id} vem depois de ${momentos[i - 1].id} e não pode pular para trás no arco`
      ).toBeGreaterThanOrEqual(momentos[i - 1].passo)
    }

    // a página começa no céu do jogo e termina no último passo do arco
    expect(momentos[0].passo).toBe(0)
    expect(momentos[momentos.length - 1].passo).toBe(ARCO_DO_DIA.length - 1)
  })

  it('o arco abre no azul do jogo, esquenta na reta final e nunca esfria de volta', () => {
    // "azul" e "quente" aqui são medidos na cor, não no nome: num tom azul o
    // canal azul manda; num tom dourado quem manda é o vermelho. É assim que
    // este teste pega alguém trocando o dourado por um lilás de novo.
    const azul = (cor) => {
      const h = cor.replace('#', '')
      return parseInt(h.slice(4, 6), 16) > parseInt(h.slice(0, 2), 16)
    }

    const primeiro = ARCO_DO_DIA[0]
    const ultimo = ARCO_DO_DIA[ARCO_DO_DIA.length - 1]
    expect(coresDoClima(primeiro).every(azul), 'o arco abre no azul do jogo').toBe(true)

    // O ARCO TERMINA QUENTE, E NÃO DE VOLTA NO AZUL.
    // Ele fechava num azul quase igual ao da abertura, e descer até o fim
    // apagava o calor do download: "o degradê desaparece e volta a cor
    // padrão" (Pietro, 22/10). Duas tentativas de meio-termo (um clima
    // morno com azul na base, e depois o mesmo clima com o degradê
    // encurtado) não resolveram, porque a parte visível acima do rodapé
    // continuava azul. Agora o céu termina no mesmo dourado do download e
    // quem fecha a página é o azul-escuro do rodapé, que tem fundo sólido.
    // Se alguém puser uma ponta azul no último clima, este teste cai.
    const fim = coresDoClima(ultimo)
    expect(fim.some(azul), 'o último clima não pode ter ponta azul: o céu termina quente').toBe(false)
    expect(fim).toEqual(coresDoClima('dourado'))

    // do topo até o vídeo o céu continua azul: é onde a página mostra o jogo
    for (const id of ['topo', 'beneficios', 'video']) {
      expect(
        coresDoClima(TEMA_POR_SECAO[id]).every(azul),
        `${id} precisa continuar no azul do jogo`
      ).toBe(true)
    }

    // O QUENTE SÓ COMEÇA NA RETA FINAL. Ele vai de 'escolas' até o rodapé
    // e não encosta em nenhuma seção de cima: é isso que mantém o calor
    // como destino da página, e não como clima geral.
    const quentes = Object.entries(TEMA_POR_SECAO)
      .filter(([, tema]) => !azul(coresDoClima(tema)[2]))
      .map(([id]) => id)
    expect(quentes.sort()).toEqual(['baixar', 'contato', 'escolas', 'rodape'])
    for (const id of ['topo', 'video', 'beneficios', 'personagens', 'pais']) {
      expect(quentes, `${id} não pode entrar no trecho quente`).not.toContain(id)
    }
    expect(coresDoClima(TEMA_POR_SECAO.baixar).some(azul), 'o download é o pico quente').toBe(false)
  })

  it('todo momento do arco existe no CSS, com as três pontas do degradê e o brilho do sol', () => {
    for (const tema of ARCO_DO_DIA) {
      const cores = coresDoClima(tema)
      expect(cores, `o clima ${tema} não tem bloco no globals.css`).not.toBeNull()
      expect(cores.filter(Boolean).length, `o clima ${tema} está sem alguma ponta`).toBe(3)

      // Antes aqui se exigia --sol-y, que dizia QUANTO o sol tinha descido.
      // O sol não desce mais: ele fica parado no canto e o que muda com a
      // hora é só o brilho quente atrás dele. A cobertura continua a mesma —
      // todo clima tem de dizer como o sol se comporta —, só mudou qual
      // propriedade carrega isso.
      const bloco = CSS.match(new RegExp(`\\[data-tema='${tema}'\\][^{]*\\{([^}]*)\\}`))[1]
      expect(bloco, `o clima ${tema} não diz o brilho do sol`).toMatch(/--sol-halo:/)
    }
  })

  it('nenhum clima tenta mover o sol: ele fica parado', () => {
    expect(CSS, 'voltou a existir deslocamento do sol no arco').not.toMatch(/--sol-y:/)
    expect(CSS, 'voltou a existir escala do sol no arco').not.toMatch(/--sol-escala:/)
  })

  it('nenhum momento do arco deixa o texto da página abaixo de 4,5:1', () => {
    const reprovados = []
    for (const tema of ARCO_DO_DIA) {
      for (const cor of coresDoClima(tema)) {
        const medida = contraste(cor, TEXTO)
        if (medida < 4.5) reprovados.push(`${tema} ${cor} = ${medida.toFixed(2)}:1`)
      }
    }
    expect(reprovados).toEqual([])
  })
})
