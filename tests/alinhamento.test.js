import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

/* ---------------------------------------------------------------------------
   O ALINHAMENTO DOS TEXTOS DA PÁGINA

   Decisão da Rafaela (2026-11-03): todo texto de PROSA da página é
   centralizado. Antes vários blocos eram alinhados à esquerda, por uma
   regra de legibilidade — bloco longo centralizado faz o olho perder a
   volta na troca de linha. A decisão de quem é dona da página venceu a
   regra, e estes testes guardam a decisão para ninguém desfazer sem querer.

   O LIMITE da decisão, e é por isso que ele tem teste próprio: as PRÉVIAS
   dos dois painéis não são prosa, são TABELA (Área / Domínio / Tendência em
   colunas). Centralizar ali faz cada linha começar num lugar diferente e o
   painel deixa de se ler como relatório. A prévia continua à esquerda.

   Estes testes leem o CSS como texto, igual ao teste do botão laranja em
   tests/nav.test.js: o jsdom não resolve CSS Modules, então o arquivo é a
   única fonte de verdade disponível aqui. A conferência de como fica na
   tela foi feita no navegador, com captura.
--------------------------------------------------------------------------- */

const raiz = process.cwd()
const ler = (arquivo) => fs.readFileSync(path.join(raiz, arquivo), 'utf8')

const CSS = {
  hero: ler('components/Hero.module.css'),
  beneficios: ler('components/Beneficios.module.css'),
  personagens: ler('components/Personagens.module.css'),
  escolas: ler('components/ParaEscolas.module.css'),
  pais: ler('components/ParaOsPais.module.css'),
  ilhas: ler('components/Ilhas.module.css'),
  formulario: ler('components/FormularioContato.module.css'),
  previa: ler('components/previa/previa.module.css'),
}

/* Devolve o corpo de UMA regra pelo seletor exato. Sem isto o teste leria o
   arquivo inteiro e passaria por causa de um `center` de outro bloco.

   Os COMENTÁRIOS saem do corpo antes de devolver, e isso não é detalhe: este
   CSS é muito comentado, e os comentários destes blocos falam justamente do
   alinhamento que o teste procura. Sem tirá-los, uma frase como "era
   `margin: 0 110px 4px 0`" reprovaria uma regra já corrigida — foi o que
   aconteceu na primeira versão deste arquivo. Teste tem que ler CSS, não
   prosa sobre CSS. */
function corpoDaRegra(css, seletor) {
  const escapado = seletor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const re = new RegExp(`(?:^|[,{}\\s])${escapado}\\s*\\{([^}]*)\\}`, 'm')
  const achou = css.match(re)
  if (!achou) throw new Error(`regra "${seletor}" não existe mais no CSS`)
  return achou[1].replace(/\/\*[\s\S]*?\*\//g, '')
}

/* Os blocos de PROSA da página: arquivo, seletor e o que a pessoa vê ali.
   O nome do que se vê entra na mensagem de falha de propósito — quem quebrar
   isso daqui a seis meses precisa saber QUAL pedaço da tela está em jogo. */
const BLOCOS_DE_PROSA = [
  ['hero', '.subtitulo', 'o parágrafo de abertura, embaixo do título'],
  ['beneficios', '.item', 'os três cartões de benefício'],
  ['personagens', '.balao', 'as falas dos mascotes'],
  ['escolas', '.intro', 'o parágrafo de argumento das escolas'],
  ['escolas', '.lista', 'os itens do que o jogo faz hoje (desligado)'],
  ['escolas', '.portas', 'as duas placas de licenciamento'],
  ['pais', '.paineis', 'os dois painéis de acompanhamento'],
  ['pais', '.extras', 'as fichas pequenas dos pais (desligado)'],
  ['ilhas', '.grade', 'as plaquinhas de atividade da ilha (desligado)'],
  ['formulario', '.caixa', 'a caixa de mensagem do contato'],
]

describe('o texto de prosa da página é centralizado', () => {
  for (const [arquivo, seletor, oQueE] of BLOCOS_DE_PROSA) {
    it(`${seletor} — ${oQueE}`, () => {
      const corpo = corpoDaRegra(CSS[arquivo], seletor)
      expect(corpo, `${seletor} voltou a ser alinhado à esquerda`).not.toMatch(
        /text-align:\s*left/,
      )
      expect(corpo, `${seletor} precisa dizer text-align: center`).toMatch(
        /text-align:\s*center/,
      )
    })
  }
})

describe('a prévia dos painéis NÃO é centralizada junto', () => {
  it('a prévia trava o alinhamento à esquerda por conta própria', () => {
    /* A prévia vive dentro da grade .paineis. Enquanto a grade era `left` ela
       herdava e estava tudo bem. Agora que a grade é `center`, a prévia PRECISA
       declarar o seu `left` — senão a herança centraliza as colunas. */
    expect(
      CSS.pais,
      'sem esta regra a prévia herda o center da grade e as colunas se desalinham',
    ).toMatch(/\[data-testid=['"]previa['"]\][^{]*\{[^}]*text-align:\s*left/)
  })

  it('as colunas de número da prévia continuam alinhadas à direita', () => {
    expect(corpoDaRegra(CSS.previa, '.numero')).toMatch(/text-align:\s*right/)
    expect(corpoDaRegra(CSS.previa, '.reforcoOnde')).toMatch(/text-align:\s*right/)
  })
})

/* ---------------------------------------------------------------------------
   OS SEIS LUGARES ONDE `text-align: center` NÃO BASTA

   Centralizar texto não centraliza: item de flex com `align-self`, caixa que
   é ela própria `display: flex`, marcador posicionado em absolute, imagem
   `display: block`, nem caixa com margem assimétrica. Cada um destes testes
   guarda um lugar onde a troca sozinha deixaria o bloco meio centralizado e
   meio não — que é pior do que não ter mexido.
--------------------------------------------------------------------------- */
describe('o que text-align sozinho não centraliza', () => {
  it('as pílulas das placas de licenciamento não ficam presas à esquerda', () => {
    /* `align-self: flex-start` num filho de flex column ignora o text-align
       do pai: a pílula ficaria encostada na borda esquerda da placa com o
       resto do texto no meio. Vale para "Foco principal" e "Valor sob
       consulta". */
    for (const seletor of ['.etiqueta', '.precoVazio']) {
      const corpo = corpoDaRegra(CSS.escolas, seletor)
      expect(corpo, `${seletor} ficaria preso à esquerda da placa`).not.toMatch(
        /align-self:\s*flex-start/,
      )
      expect(corpo, `${seletor} precisa de align-self: center`).toMatch(
        /align-self:\s*center/,
      )
    }
  })

  it('o título e o topo do painel, que são flex, centralizam o conteúdo', () => {
    /* `.topo` e `.painelTitulo` são `display: flex`. Flex não olha para
       text-align — quem posiciona no eixo principal é justify-content. */
    for (const seletor of ['.topo', '.painelTitulo']) {
      expect(
        corpoDaRegra(CSS.pais, seletor),
        `${seletor} é flex e precisa de justify-content: center`,
      ).toMatch(/justify-content:\s*center/)
    }
  })

  it('as estrelas das listas andam junto com o texto, não grudadas na borda', () => {
    /* A estrela era `position: absolute; left: 0` com o texto recuado por
       padding-left. Com o texto no meio, a estrela ficaria largada na borda
       esquerda apontando para o nada. Ela precisa virar marcador inline. */
    for (const [nome, css] of [['escolas', CSS.escolas], ['pais', CSS.pais]]) {
      const corpo = corpoDaRegra(css, '.inclui li::before')
      expect(corpo, `a estrela de ${nome} ficaria largada na borda`).not.toMatch(
        /position:\s*absolute/,
      )
    }
  })

  it('o ícone do cartão de benefício fica no meio junto com o texto', () => {
    /* <img> é display:block aqui (de propósito: inline deixava folga embaixo).
       Bloco não acompanha text-align — precisa de margem automática. */
    expect(
      corpoDaRegra(CSS.beneficios, '.item img'),
      'o ícone ficaria na esquerda com o texto no meio',
    ).toMatch(/margin-inline:\s*auto|margin:[^;]*\bauto\b/)
  })

  it('os campos do formulário continuam alinhados à esquerda', () => {
    /* input e textarea herdam o text-align da caixa. Escrever num campo que
       centraliza o texto letra a letra é desconfortável; o rótulo centraliza,
       o campo não. */
    const regra = CSS.formulario.match(
      /\.campo input,\s*\n\s*\.campo textarea\s*\{([^}]*)\}/,
    )
    expect(regra, 'a regra dos campos sumiu do CSS').not.toBeNull()
    expect(regra[1], 'o texto digitado sairia centralizado').toMatch(
      /text-align:\s*left/,
    )
  })

  it('o botão de enviar fica no meio da caixa de mensagem', () => {
    /* Pego na tela, não pelos testes: a linha do botão é `display: flex`
       (text-align não a alcança) E o parágrafo de desfecho, do lado, tem
       flex-basis. Vazio — que é o estado normal, antes de enviar — ele
       continua ocupando o espaço e empurra o botão para a esquerda, com o
       resto da caixa centralizado. Precisa das duas coisas: centralizar a
       linha e o desfecho não esticar quando não há mensagem nenhuma. */
    const rodape = corpoDaRegra(CSS.formulario, '.rodape')
    expect(rodape, 'a linha do botão é flex e precisa de justify-content').toMatch(
      /justify-content:\s*center/,
    )
    expect(
      corpoDaRegra(CSS.formulario, '.desfecho'),
      'com flex-basis o desfecho vazio empurra o botão para a esquerda',
    ).not.toMatch(/flex:\s*1\s+1\s+\d/)
  })

  it('o nome da placa de licenciamento não tem margem torta', () => {
    /* Tinha `margin-right: 110px` para abrir espaço ao mascote. Centralizar
       dentro de uma caixa com 110px a menos de um lado joga o título para a
       esquerda do centro — fica torto sem motivo visível. */
    expect(
      corpoDaRegra(CSS.escolas, '.portaNome'),
      'a margem reservada ao mascote desloca o título do centro',
    ).not.toMatch(/110px/)
  })
})
