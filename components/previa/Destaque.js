import estilos from './previa.module.css'

// A CAIXA DE LEITURA — "onde precisa de mais atenção" na família,
// "prioridade da turma" na escola. É o painel interpretando os números.
export default function Destaque({ titulo, texto }) {
  if (!texto) return null
  return (
    <div className={`${estilos.bloco} ${estilos.destaque}`}>
      {titulo && <strong className={estilos.destaqueTitulo}>{titulo}</strong>}
      <span>{texto}</span>
    </div>
  )
}
