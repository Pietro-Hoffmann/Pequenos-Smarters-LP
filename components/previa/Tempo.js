import estilos from './previa.module.css'

// TEMPO DE USO — uma linha: o valor grande, o rótulo ao lado, a observação
// curta embaixo. Mantém o que o app mostra sem roubar espaço das áreas.
export default function Tempo({ titulo, valor, rotulo, texto }) {
  if (!valor) return null
  return (
    <div className={estilos.bloco}>
      {titulo && <strong className={estilos.blocoTitulo}>{titulo}</strong>}
      <div className={estilos.tempo}>
        <strong className={estilos.tempoValor}>{valor}</strong>
        {rotulo && <span className={estilos.tempoRotulo}>{rotulo}</span>}
      </div>
      {texto && <span className={estilos.tempoTexto}>{texto}</span>}
    </div>
  )
}
