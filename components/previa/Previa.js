import Anel from './Anel'
import Areas from './Areas'
import Destaque from './Destaque'
import Tempo from './Tempo'
import Jornada from './Jornada'
import Cifras from './Cifras'
import Reforco from './Reforco'
import estilos from './previa.module.css'

// A PRÉVIA DE UM PAINEL — a "tela" desenhada em HTML.
// Recebe a lista `blocos` do painel de controle e desenha cada um pelo
// `tipo`, na ordem em que estão. Tipo que não existe é ignorado: um erro
// de digitação no site.js tira um bloco, nunca derruba a página.
const BLOCOS = {
  anel: Anel,
  areas: Areas,
  destaque: Destaque,
  tempo: Tempo,
  jornada: Jornada,
  cifras: Cifras,
  reforco: Reforco,
}

export default function Previa({ previa, rotulos = {} }) {
  if (!previa || !Array.isArray(previa.blocos)) return null
  const blocos = previa.blocos.filter((b) => b && BLOCOS[b.tipo])
  if (blocos.length === 0) return null

  return (
    <div className={estilos.previa} data-testid="previa">
      {previa.titulo && <strong className={estilos.previaTitulo}>{previa.titulo}</strong>}
      {blocos.map((bloco, i) => {
        const Bloco = BLOCOS[bloco.tipo]
        const { tipo, ...props } = bloco
        // a célula leva o tipo: é por ele que o CSS monta o "dashboardzinho"
        // (tabela por área à esquerda, blocos curtos à direita, faixas
        // largas embaixo) em telas largas
        return (
          <div key={`${tipo}-${i}`} className={estilos.celula} data-tipo={tipo}>
            <Bloco {...props} rotulos={rotulos} />
          </div>
        )
      })}
      {previa.exemplo && <span className={estilos.exemplo}>{previa.exemplo}</span>}
    </div>
  )
}
