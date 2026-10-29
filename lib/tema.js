// ---------------------------------------------------------------------------
// O CLIMA DA PÁGINA INTEIRA
// O céu do fundo (o <Cenario />) muda de clima conforme o que está na tela.
// Quem decide o clima é o atributo data-tema lá no topo do documento (<html>);
// o CSS do globals.css faz o resto. Nada aqui desenha nada.
//
// Duas peças querem escrever esse atributo ao mesmo tempo:
//   1. <TemaPorSecao /> — olha as seções e diz o clima da que está em cena.
//   2. O carrossel das ilhas — enquanto a seção dele está em cena, quem manda
//      é a ilha escolhida.
//
// Para elas nunca brigarem, NINGUÉM escreve o atributo direto: cada uma fala
// pelo seu canal, e este arquivo decide. A regra é uma só e está em
// `aplicar()`: se o carrossel tem algo a dizer, é ele; senão, vale a rolagem;
// se nenhum dos dois falou, é o céu de sempre.
//
// É aqui também que mora O ARCO DO DIA: a lista que diz qual momento do arco
// cada parte da página veste. O mapa fica neste arquivo, e só neste arquivo —
// nenhum componente sabe o nome do seu clima, ele só se identifica com um id.
// ---------------------------------------------------------------------------

// O clima de abertura. É o que a página mostra antes de qualquer JavaScript
// rodar (ele já vem escrito no <html> pelo app/layout.js) e é para onde ela
// sempre volta.
export const TEMA_PADRAO = 'ceu'

// A faixa fininha no meio da tela que decide "o que está em cena".
// -45% em cima e -45% embaixo sobra uma tira de 10% da altura da janela,
// bem no centro. A seção que cruza essa tira é a seção em cena.
// As DUAS peças usam exatamente esta mesma faixa — é isso que garante que
// elas sempre concordem sobre onde a pessoa está olhando.
export const FAIXA_CENTRAL = '-45% 0px -45% 0px'

// O rodapé tem régua própria. Ele é baixinho e fica colado no fim da página:
// quando a pessoa chega lá embaixo, ele NUNCA alcança a faixa central (ela
// fica no meio da tela). Então para ele basta
// aparecer na tela — subiu uns 10% acima da borda de baixo, o céu entra no
// último passo do arco (o azul de volta, que fecha o ciclo).
export const FAIXA_RODAPE = '0px 0px -10% 0px'

// ---------------------------------------------------------------------------
// O ARCO DO DIA — UM CICLO, NÃO UMA DESCIDA
// A página caminha por esta lista de cima para baixo. Ela NÃO é mais um
// entardecer inteiro: é um ciclo curto que sai do azul do jogo, esquenta só
// no bloco de download e volta para o azul no rodapé.
//
// Por que mudou: o arco antigo (azul → creme → âmbar → laranja → lilás)
// tirava saturação justamente das três seções que vendem — pais, escolas e
// download — e terminava num lilás que não existe em lugar nenhum do jogo,
// cortado seco pelo azul chapado do rodapé.
//
// REGRA DO ARCO: descendo a página, o clima só pode ANDAR PARA FRENTE nesta
// lista; ele nunca pula para trás. Quem garante isso é o teste
// tests/arco.test.js, que lê o mapa abaixo na ordem em que as seções estão
// na página de verdade. O arco NÃO volta ao ponto de partida: ele sai do
// azul do jogo e termina quente, no dourado do download, que vale até o
// rodapé. Quem fecha a página é o azul-escuro do rodapé, não o céu.
//
// Os seis climas das ilhas (natureza, deserto, fogo, gelo, lagos, vento) NÃO
// entram aqui: eles não são momento do arco, são o clima da ilha escolhida,
// e valem só enquanto a seção do carrossel está em cena.
// ---------------------------------------------------------------------------
export const ARCO_DO_DIA = [
  'ceu', // o azul do próprio jogo — a abertura
  'manha', // o vídeo, logo abaixo da abertura: a prova do produto ainda no azul da marca
  'tarde', // os benefícios: o azul um passo adiante
  'tarde-alta', // o azul um passo mais fundo
  'pre-dourado', // azul com o dourado só insinuado no horizonte: a rampa
  'dourado', // o clímax: curto, saturado e único ponto quente da página
  // O MESMO DOURADO DO DOWNLOAD, MAS COM O DEGRADÊ ENCURTADO.
  // Ele existe por um motivo só: no fim da página o rodapé cobre a faixa
  // de baixo da tela, então o degradê precisa terminar ACIMA dele para o
  // laranja aparecer. As cores são idênticas às do 'dourado'; o que muda
  // são as paradas (ver globals.css).
  'dourado-fim',
]

// Cada parte da página e o momento do arco dela. A chave é o id que a seção
// escreve no HTML — por isso o id virou obrigatório nas dez seções e no
// rodapé. Escolhi id (e não um data-atributo passado pelo app/page.js) por
// dois motivos: o id já existia em seis das dez seções por causa do menu, e
// assim o mapa inteiro cabe neste arquivo, sem precisar enfiar uma prop nova
// em dez componentes só para carregar o nome de um clima.
//
// Repare que várias seções vestem o MESMO momento: isso é de propósito. O
// arco curto vale mais do que um degrau por seção — o que o visitante
// precisa perceber é o dourado do download, e ele só se destaca porque tudo
// à volta continua azul.
//
// A seção do carrossel (#jogo) não está aqui de propósito: o clima dela é a
// ilha escolhida, e quem escreve é o próprio carrossel.
export const TEMA_POR_SECAO = {
  topo: 'ceu', // o hero no céu do jogo
  video: 'manha', // o vídeo subiu para logo abaixo do hero
  beneficios: 'tarde', // azul até aqui, sem exceção
  personagens: 'tarde-alta',
  pais: 'tarde-alta',
  escolas: 'pre-dourado', // a rampa de entrada do dourado
  baixar: 'dourado', // o pedido principal da página, no único ponto quente
  contato: 'dourado', // o calor do download continua
  // O CÉU TERMINA DOURADO. NÃO VOLTA AO AZUL.
  // Esta parte já errou três vezes, então fica o histórico:
  //   • o rodapé vestia 'azul-fundo', um azul quase idêntico ao da
  //     abertura — descer até o fim apagava o calor do download e o céu
  //     "voltava a cor padrão";
  //   • trocar para 'volta' (dourado saindo, azul voltando) não resolveu:
  //     a parte visível acima do rodapé continuava azul;
  //   • encurtar o degradê do 'volta' só deixou esse azul MAIS forte.
  // A decisão do dono (22/10) é simples: o quente do download vale até o
  // rodapé, e quem fecha a página é o azul-escuro do próprio rodapé, que
  // tem fundo sólido — o céu não esfria mais no caminho.
  rodape: 'dourado-fim',
}

// O clima de uma parte da página. Id desconhecido cai no céu de sempre, que é
// sempre legível — nunca apaga a página.
export function temaDaSecao(id) {
  return TEMA_POR_SECAO[id] || TEMA_PADRAO
}

// Onde este clima está no arco. -1 = não é momento do arco (climas das ilhas).
export function momentoDoArco(tema) {
  return ARCO_DO_DIA.indexOf(tema)
}

// O que cada canal falou por último.
let temaDaRolagem = TEMA_PADRAO
let temaDaIlha = null

function aplicar() {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute(
    'data-tema',
    temaDaIlha || temaDaRolagem || TEMA_PADRAO
  )
}

// Canal 1: a seção que está em cena. Prioridade baixa.
export function definirTemaDeRolagem(tema) {
  temaDaRolagem = tema || TEMA_PADRAO
  aplicar()
}

// Canal 2: a ilha escolhida no carrossel. Prioridade alta — enquanto houver
// valor aqui, é ele que pinta a página.
export function definirTemaDaIlha(tema) {
  temaDaIlha = tema || null
  aplicar()
}

// O carrossel devolve o comando quando a seção dele sai de cena (e também
// quando ele é desmontado). Chamar isto duas vezes não faz mal nenhum.
export function devolverOComando() {
  if (temaDaIlha === null) return
  temaDaIlha = null
  aplicar()
}
