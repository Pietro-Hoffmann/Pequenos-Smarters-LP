import estilos from './previa.module.css'

// QUEM PRECISA DE REFORÇO — a lista que transforma o relatório em ação
// para o professor. Nomes fictícios vêm do painel de controle.
export default function Reforco({ titulo, alunos }) {
  if (!Array.isArray(alunos) || alunos.length === 0) return null
  return (
    <div className={estilos.bloco}>
      {titulo && <strong className={estilos.blocoTitulo}>{titulo}</strong>}
      <ul className={estilos.reforco}>
        {alunos.map((aluno) => (
          <li key={`${aluno.nome}-${aluno.area}`}>
            <strong className={estilos.reforcoNome}>{aluno.nome}</strong>
            <span className={estilos.reforcoOnde}>{[aluno.area, aluno.atividade].filter(Boolean).join(' · ')}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
