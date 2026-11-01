// lib/brasas.js
// ---------------------------------------------------------------------------
// AS BRASAS DA ILHA DO FOGO
//
// Contas puras, sem tela e sem navegador — mesma divisão de folhas.js,
// areia.js e vento.js.
//
// O NÓ DESTE CLIMA: brasa é LUZ, e o céu do clima de Fogo é pêssego CLARO.
// Luz sobre fundo claro simplesmente não aparece. Numa rodada anterior as
// brasas foram escurecidas para contornar isso (está escrito no comentário
// antigo do CSS), e aí a brasa deixou de ser luz e virou TINTA: pontos
// vermelhos chapados espalhados pela tela, que leem como sujeira.
//
// A saída não é escolher entre claro e escuro, é usar os dois: NÚCLEO
// CLARO com HALO ESCURO em volta. O halo recorta a brasa contra o pêssego
// e garante que ela seja vista; o núcleo claro dentro devolve o brilho.
// É o mesmo princípio do contorno que salvou as folhas, um passo adiante.
//
// E O QUE SEPARA BRASA DE CONFETE SUBINDO: ela ESFRIA. A cor cai do
// amarelo ao vermelho profundo, o tamanho encolhe, e ela apaga pelo
// caminho. Nenhuma atravessa a tela inteira acesa.
// ---------------------------------------------------------------------------

import { PASSO_MAXIMO } from './folhas'

// Do mais quente (recém-saída) ao mais frio (prestes a apagar).
//
// ESTA PALETA FOI ESCOLHIDA POR MEDIÇÃO, não a olho, depois de duas
// tentativas falharem pelo mesmo motivo. O céu deste clima é pêssego
// (#ffd0a6 no fundo do degradê), e sobre ele:
//   • o branco-amarelo da 1ª versão sumia por completo;
//   • o âmbar claro da 2ª (#ffc145) tinha 1,14x de contraste — ou seja,
//     também sumia, e só se via o anel escuro do halo em volta. A brasa
//     lia como uma bolha vazia.
// Sobre fundo claro quem dá a sensação de calor é a SATURAÇÃO, não o
// brilho. Os tons abaixo vão de 1,9x a 7,5x de contraste contra esse céu.
export const TONS_BRASA = ['#f87b14', '#e65a0b', '#c93f07', '#a22c04', '#781c02']

// A cor do halo é fixa e bem escura (9,4x de contraste contra o céu): é
// ela que recorta a brasa contra o pêssego. Sem ela, nada disso aparece.
export const HALO_BRASA = '#5c1600'

const MINIMO_DE_BRASAS = 26
const MAXIMO_DE_BRASAS = 80
const PIXELS_POR_BRASA = 26

export function quantasBrasas(largura) {
  const n = Number(largura)
  if (!Number.isFinite(n) || n <= 0) return MINIMO_DE_BRASAS
  return Math.max(MINIMO_DE_BRASAS, Math.min(MAXIMO_DE_BRASAS, Math.round(n / PIXELS_POR_BRASA)))
}

const entre = (a, b, t) => a + (b - a) * t

// Onde a brasa nasce: só na faixa de baixo da seção. Brasa sai de um
// lugar — no caso, do vulcão — e não aparece no meio do céu.
const FAIXA_DE_NASCIMENTO = 0.3

// Puxa o sorteio horizontal para o CENTRO, que é onde a ilha (e o vulcão)
// ficam. Média de três sorteios é um jeito barato de concentrar no meio
// sem recortar as bordas de vez: ainda nasce brasa nos cantos, só que bem
// mais raramente.
function perotoDoCentro(s) {
  return (s() + s() + s()) / 3
}

export function criarBrasa(largura, altura, sorteio = Math.random) {
  const s = typeof sorteio === 'function' ? sorteio : Math.random
  const L = Number.isFinite(Number(largura)) && largura > 0 ? Number(largura) : 1
  const A = Number.isFinite(Number(altura)) && altura > 0 ? Number(altura) : 1

  const vigor = s()

  return {
    x: perotoDoCentro(s) * L,
    y: A * (1 - FAIXA_DE_NASCIMENTO * s()),
    raio: entre(2.6, 7, vigor),
    // velocidade inicial de subida, em pixels por segundo
    vy: entre(26, 74, vigor),
    // o serpenteio: ar quente é turbulento, brasa não sobe em linha reta
    fase: s() * Math.PI * 2,
    velFase: entre(1.6, 3.8, s()),
    bamboleio: entre(7, 26, s()),
    // Quanto tempo ela vive, em segundos, e quanto já viveu.
    // O TETO NÃO É SOLTO: ele é escolhido para que nem a brasa mais rápida
    // (74 px/s mais o empuxo) alcance a borda de cima antes de apagar,
    // mesmo nascendo no ponto mais alto da faixa de nascimento. Brasa que
    // escapa pelo topo só é recolhida pela rede de segurança lá embaixo, e
    // aí ela não APAGOU — sumiu, que é outra coisa e se vê na tela.
    vida: entre(1.3, 3, s()),
    idade: s() * 1.2,
    brilho: entre(0.55, 1, s()),
  }
}

// O CALOR, de 1 (recém-saída do fogo) a 0 (apagada).
// O expoente deixa a brasa passar mais tempo quente e apagar depressa no
// fim, que é como brasa de verdade se comporta: ela não desbota devagar a
// viagem toda, ela brilha e some.
export function calorDaBrasa(brasa) {
  const idade = Number(brasa && brasa.idade)
  const vida = Number(brasa && brasa.vida)
  if (!Number.isFinite(idade) || !Number.isFinite(vida) || vida <= 0) return 0
  const andado = idade / vida
  if (andado >= 1) return 0
  if (andado <= 0) return 1
  return Math.pow(1 - andado, 1.6)
}

// A COR DO NÚCLEO conforme a brasa esfria: começa no quase-branco e
// termina no vermelho profundo. Degrau e não mistura contínua de propósito
// — com cinco tons e brasas de poucos pixels, o degrau não se vê, e trocar
// de tom sai muito mais barato que interpolar cor a cada quadro.
export function tomDoCalor(calor) {
  const c = Number(calor)
  if (!Number.isFinite(c)) return TONS_BRASA[TONS_BRASA.length - 1]
  const preso = Math.max(0, Math.min(1, c))
  const i = Math.round((1 - preso) * (TONS_BRASA.length - 1))
  return TONS_BRASA[i]
}

// Quanto a brasa acelera enquanto sobe, por segundo. Ar quente ganha
// velocidade: sem isto a subida fica mecânica, com todas no mesmo ritmo.
const EMPUXO = 34

export function passoDaBrasa(brasa, dt, largura, altura, sorteio = Math.random) {
  const bruto = Number(dt)
  const passo = Number.isFinite(bruto) && bruto > 0 ? Math.min(bruto, PASSO_MAXIMO) : 0
  const L = Number.isFinite(Number(largura)) && largura > 0 ? Number(largura) : 1
  const A = Number.isFinite(Number(altura)) && altura > 0 ? Number(altura) : 1

  brasa.idade += passo
  brasa.vy += EMPUXO * passo
  brasa.y -= brasa.vy * passo
  brasa.fase += brasa.velFase * passo
  brasa.x += Math.sin(brasa.fase) * brasa.bamboleio * passo

  // APAGOU: a brasa volta a sair lá de baixo, nova. Também recolhe a que
  // por algum motivo escapou pelo topo — nenhuma deve chegar lá acesa, e
  // esta é a rede de segurança para isso.
  if (brasa.idade >= brasa.vida || brasa.y < -brasa.raio * 4) {
    Object.assign(brasa, criarBrasa(L, A, sorteio))
    brasa.idade = 0
  }

  return brasa
}

// O DESENHO: um disco pintado com um degradê que vai do núcleo claro ao
// halo escuro. Vai direto no contexto, sem sprite, porque a cor muda a
// cada quadro conforme a brasa esfria — um sprite por cor teria de ser
// refeito o tempo todo, e aí não economizaria nada.
export function desenharBrasa(ctx, raio, corDoNucleo, corDoHalo, forca) {
  const R = Number(raio) > 0 ? Number(raio) : 1
  const f = Number.isFinite(Number(forca)) ? Number(forca) : 1
  // o halo é bem maior que o núcleo: é a área escura dele que recorta a
  // brasa contra o céu claro
  const total = R * 2.6

  const degrade = ctx.createRadialGradient(0, 0, 0, 0, 0, total)
  degrade.addColorStop(0, corDoNucleo)
  degrade.addColorStop(0.42, corDoNucleo)
  degrade.addColorStop(0.68, corDoHalo)
  degrade.addColorStop(1, 'rgba(92, 22, 0, 0)')

  ctx.globalAlpha = f
  ctx.fillStyle = degrade
  ctx.beginPath()
  ctx.arc(0, 0, total, 0, Math.PI * 2)
  ctx.fill()
}
