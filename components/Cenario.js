import estilos from './Cenario.module.css'

// ---------------------------------------------------------------------------
// O CENÁRIO
// É o céu da página inteira: fica fixo atrás de tudo, não recebe clique e não
// é lido por leitor de tela. Tudo aqui é enfeite.
// Nada aqui tem texto: se quiser mexer, mexa nos números das listas abaixo.
// Só mexem transform e opacity, que é o que celular fraco aguenta.
// ---------------------------------------------------------------------------

// Três camadas de nuvem. A "profundidade" vem só da velocidade e do tamanho:
// a nuvem pequena e clara atravessa devagar (parece longe), a grande atravessa
// mais rápido (parece perto). Nenhum JavaScript olha a rolagem.
// A opacidade de cada nuvem vira --op (e não opacity direto) porque o clima
// da página multiplica todas por --nuvem-fator: no trecho dourado elas
// afinam juntas e o céu quente passa por elas.
const NUVENS = [
  { topo: '6%', largura: 120, opacidade: 0.5, dur: '96s', atraso: '-20s' },
  { topo: '26%', largura: 190, opacidade: 0.65, dur: '70s', atraso: '-45s' },
  { topo: '62%', largura: 260, opacidade: 0.8, dur: '52s', atraso: '-12s' },
]

// As letras do alfabeto soltas no céu, como confete. É o tema da
// alfabetização aparecendo no cenário.
const LETRAS = [
  { arte: '/images/letra_a.png', w: 345, h: 423, topo: '12%', esq: '8%', largura: 46, opacidade: 0.22, dur: '11s', atraso: '0s' },
  { arte: '/images/letra_b.png', w: 345, h: 423, topo: '30%', esq: '88%', largura: 38, opacidade: 0.18, dur: '14s', atraso: '-3s' },
  { arte: '/images/letra_c.png', w: 345, h: 423, topo: '58%', esq: '4%', largura: 42, opacidade: 0.2, dur: '13s', atraso: '-6s' },
  { arte: '/images/letra_e.png', w: 115, h: 141, topo: '78%', esq: '80%', largura: 34, opacidade: 0.2, dur: '10s', atraso: '-2s' },
  { arte: '/images/letra_m.png', w: 345, h: 423, topo: '44%', esq: '70%', largura: 50, opacidade: 0.22, dur: '16s', atraso: '-8s' },
  { arte: '/images/letra_o.png', w: 345, h: 423, topo: '86%', esq: '18%', largura: 40, opacidade: 0.2, dur: '12s', atraso: '-5s' },
  { arte: '/images/letra_p.png', w: 345, h: 423, topo: '20%', esq: '52%', largura: 36, opacidade: 0.2, dur: '15s', atraso: '-9s' },
  { arte: '/images/letra_t.png', w: 345, h: 423, topo: '68%', esq: '40%', largura: 32, opacidade: 0.2, dur: '13s', atraso: '-11s' },
  { arte: '/images/letra_v.png', w: 345, h: 423, topo: '50%', esq: '24%', largura: 44, opacidade: 0.18, dur: '17s', atraso: '-4s' },
]

// Ilhas ao longe, só de paisagem. Pequenas e apagadas de propósito, para não
// brigar com as seis ilhas de verdade que a página mostra mais abaixo.
//
// A do canto de baixo era a ilha de GELO, e ela estava errada aqui: o céu da
// primeira dobra é de manhã e de natureza, e aquele cristal pálido era a
// única peça de gelo à vista, sem relação com nada ao redor (ainda por cima
// colada no mascote que entrava pela borda). Trocada pela ilha da Natureza:
// mesma posição, mesmo tamanho, mesma opacidade e mesmo movimento — o céu
// não perde nenhum elemento, só para de falar de gelo de manhã.
//
// As miniaturas de 160px são o bastante aqui: estas ilhas nunca passam de
// 120px na tela, e a arte cheia tem 560–840px.
const ILHAS = [
  { arte: '/images/mini/ilha_vento.png', w: 160, h: 129, topo: '31%', esq: '72%', largura: 120, opacidade: 0.22, dur: '9s', atraso: '0s' },
  { arte: '/images/mini/ilha_natureza.png', w: 160, h: 144, topo: '70%', esq: '6%', largura: 100, opacidade: 0.25, dur: '11s', atraso: '-4s' },
  { arte: '/images/mini/ilha_vento.png', w: 160, h: 129, topo: '40%', esq: '46%', largura: 78, opacidade: 0.18, dur: '13s', atraso: '-7s' },
]

// Brilhinhos. São bolinhas de CSS, não imagem: não pesam nada.
const BRILHOS = [
  { topo: '14%', esq: '30%', tam: 10, dur: '4s', atraso: '0s' },
  { topo: '36%', esq: '92%', tam: 8, dur: '5.5s', atraso: '-1.5s' },
  { topo: '64%', esq: '60%', tam: 12, dur: '4.8s', atraso: '-3s' },
  { topo: '88%', esq: '34%', tam: 8, dur: '6s', atraso: '-2s' },
]

export default function Cenario() {
  return (
    <div className={estilos.cenario} aria-hidden="true">
      <div className={estilos.ceu} />

      {/* O SOL DO DIA INTEIRO
          Ele mora dentro de um suporte, e cada um faz uma coisa só: o suporte
          desce ao longo do dia (é ele que carrega o transform do clima) e o
          sol gira no lugar, como sempre girou. Se os dois estivessem no mesmo
          elemento, a animação do giro apagaria a descida — animação ganha de
          transform escrito no CSS, e o sol ficaria travado no topo.
          O brilho quente atrás dele acende sozinho no fim da tarde: é só
          opacidade, nada de filtro de cor. */}
      <span className={estilos.orbita}>
        <span className={estilos.halo} />
        <img
          className={`${estilos.sol} aGirarLento`}
          style={{ '--dur': '120s' }}
          src="/images/sol.png"
          alt=""
          aria-hidden="true"
          width={260}
          height={324}
        />
      </span>

      {NUVENS.map((n, i) => (
        <img
          key={`nuvem-${i}`}
          className={`${estilos.nuvem} aDeriva`}
          style={{ top: n.topo, width: n.largura, '--op': n.opacidade, '--dur': n.dur, '--atraso': n.atraso }}
          src="/images/nuvem.png"
          alt=""
          aria-hidden="true"
          width={520}
          height={267}
        />
      ))}

      {ILHAS.map((ilha, i) => (
        <img
          key={`ilha-${i}`}
          className={`${estilos.ilha} aFlutuar`}
          style={{
            top: ilha.topo,
            left: ilha.esq,
            width: ilha.largura,
            opacity: ilha.opacidade,
            '--dur': ilha.dur,
            '--atraso': ilha.atraso,
          }}
          src={ilha.arte}
          alt=""
          aria-hidden="true"
          width={ilha.w}
          height={ilha.h}
        />
      ))}

      {LETRAS.map((l) => (
        <img
          key={l.arte}
          className={`${estilos.letra} aCair`}
          style={{
            top: l.topo,
            left: l.esq,
            width: l.largura,
            opacity: l.opacidade,
            '--dur': l.dur,
            '--atraso': l.atraso,
          }}
          src={l.arte}
          alt=""
          aria-hidden="true"
          width={l.w}
          height={l.h}
        />
      ))}

      {BRILHOS.map((b, i) => (
        <span
          key={`brilho-${i}`}
          className={`${estilos.brilho} aCintilar`}
          style={{ top: b.topo, left: b.esq, width: b.tam, height: b.tam, '--dur': b.dur, '--atraso': b.atraso }}
        />
      ))}
    </div>
  )
}
