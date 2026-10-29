import { estadoIlhaValido } from '@/lib/medidas'
import estilos from './previa.module.css'

// AS ILHAS EM MINIATURA — concluída, atual, bloqueada. A miniatura é
// decorativa; o nome aparece e o estado vai em texto oculto para o leitor
// de tela (e a cor/borda só reforça).
const RESERVA = { ok: 'concluída', atual: 'atual', bloq: 'bloqueada' }

export default function Jornada({ titulo, ilhas, rotulos = {} }) {
  if (!Array.isArray(ilhas) || ilhas.length === 0) return null
  const rotuloDe = (estado) => (rotulos.estadoIlha && rotulos.estadoIlha[estado]) || RESERVA[estado]

  return (
    <div className={estilos.bloco}>
      {titulo && <strong className={estilos.blocoTitulo}>{titulo}</strong>}
      <ul className={estilos.jornada}>
        {ilhas.map((ilha) => {
          const estado = estadoIlhaValido(ilha.estado)
          return (
            <li key={ilha.nome} className={estilos.ilha} data-estado={estado}>
              <span className={estilos.ilhaMoldura}>
                {ilha.imagem && (
                  <img src={ilha.imagem} alt="" aria-hidden="true" width={40} height={40} loading="lazy" />
                )}
              </span>
              <span className={estilos.ilhaNome}>{ilha.nome}</span>
              <span className="visuallyHidden">{rotuloDe(estado)}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
