import estilos from './previa.module.css'

// TRÊS CIFRAS LADO A LADO — a leitura de um segundo da turma.
export default function Cifras({ titulo, itens }) {
  if (!Array.isArray(itens) || itens.length === 0) return null
  return (
    <div className={estilos.bloco}>
      {titulo && <strong className={estilos.blocoTitulo}>{titulo}</strong>}
      <ul className={estilos.cifras}>
        {itens.map((item) => (
          <li key={`${item.valor}-${item.rotulo}`}>
            <strong className={estilos.cifraValor}>{item.valor}</strong>
            <span className={estilos.cifraRotulo}>{item.rotulo}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
