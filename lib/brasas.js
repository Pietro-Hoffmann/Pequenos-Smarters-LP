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
    // A CINTILAÇÃO é própria de cada brasa: fase e ritmo sorteados, senão
    // todas pulsam juntas e a seção inteira pisca.
    faseCintila: s() * Math.PI * 2,
    ritmoCintila: entre(0.7, 1.5, s()),
    // 0 = ao fundo (desenhada difusa), 1 = à frente (nítida). Guardar o
    // vigor aqui é o que permite o desfoque de profundidade sem filtro.
    nitidez: vigor,
  }
}

// A CINTILAÇÃO, um multiplicador de brilho entre ~0,6 e ~1,15.
// Duas ondas rápidas de períodos que não casam: o resultado parece
// irregular sem precisar de sorteio a cada quadro, que seria caro e
// daria chuvisco em vez de pulso.
export function cintilarNoInstante(brasa, segundos) {
  const t = Number(segundos)
  if (!Number.isFinite(t)) return 1
  const fase = Number(brasa && brasa.faseCintila) || 0
  const ritmo = Number(brasa && brasa.ritmoCintila) || 1
  const onda =
    Math.sin(t * 7.3 * ritmo + fase) * 0.62 + Math.sin(t * 11.9 * ritmo + fase * 2.3) * 0.38
  return 0.87 + onda * 0.25
}

// O ALONGAMENTO pela velocidade: brasa subindo depressa estica na
// vertical, como rastro; a que está morrendo volta a ser redonda.
// O TETO É BAIXO de propósito. A primeira tentativa ia até 1,85x e, num
// disco de 5px, aquilo deixava de ser brasa esticada e virava cápsula —
// visto na tela em 1/11. A 1,4x o rastro é sentido sem se impor.
export function alongamentoDaBrasa(brasa) {
  const vy = Number(brasa && brasa.vy)
  if (!Number.isFinite(vy) || vy <= 0) return 1
  return 1 + Math.max(0, Math.min(0.4, (vy - 26) / 170))
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
export function desenharBrasa(ctx, raio, corDoNucleo, corDoHalo, forca, nitidez = 1) {
  const R = Number(raio) > 0 ? Number(raio) : 1
  const f = Number.isFinite(Number(forca)) ? Number(forca) : 1
  // o halo é bem maior que o núcleo: é a área escura dele que recorta a
  // brasa contra o céu claro
  const total = R * 2.6

  // O DESFOQUE DE PROFUNDIDADE, SEM FILTRO DE DESFOQUE.
  // Não é preciso borrar nada: a brasa já é pintada com um degradê, então
  // basta mudar a FORMA do degradê. A da frente tem núcleo largo e
  // transição curta (borda definida); a do fundo tem núcleo pequeno e
  // transição longa, e o olho lê isso como fora de foco. Mesma conta,
  // números diferentes, custo zero — que era a condição do dono.
  const nit = Number.isFinite(Number(nitidez)) ? Math.max(0, Math.min(1, Number(nitidez))) : 1
  // O piso de 0,18 não é enfeite: abaixo disso a brasa do fundo perde o
  // núcleo por completo e vira uma mancha sem forma, o que não é desfoque,
  // é sumiço. Visto na tela em 1/11 e recuado.
  const fimDoNucleo = 0.18 + 0.28 * nit
  // O HALO É UMA FAIXA ESTREITA, não meia brasa. Na primeira versão ele
  // ocupava daqui até a borda e o resultado era um ANEL grosso, que lê
  // como contorno desenhado em vez de brilho. Estreitando o pico escuro e
  // deixando a queda para o transparente bem longa, o mesmo halo passa a
  // ler como luz se espalhando.
  const fimDoHalo = Math.min(0.9, fimDoNucleo + 0.1 + 0.08 * nit)

  const degrade = ctx.createRadialGradient(0, 0, 0, 0, 0, total)
  degrade.addColorStop(0, corDoNucleo)
  degrade.addColorStop(fimDoNucleo, corDoNucleo)
  degrade.addColorStop(fimDoHalo, corDoHalo)
  degrade.addColorStop(1, 'rgba(92, 22, 0, 0)')

  ctx.globalAlpha = f
  ctx.fillStyle = degrade
  ctx.beginPath()
  ctx.arc(0, 0, total, 0, Math.PI * 2)
  ctx.fill()
}
