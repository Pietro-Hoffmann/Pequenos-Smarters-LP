import { limitarPct, statusValido, tendenciaValida, SETAS } from '@/lib/medidas'
import estilos from './previa.module.css'

// A TABELA POR ÁREA DE APRENDIZADO — o coração das duas prévias.
// Família: área | barra com % | tendência (seta + palavra) | situação.
// Turma:   área | barra com % | "N alunos em atenção"       | situação.
// A variante é decidida pelos dados: se alguma linha traz `atencao`, é turma.
// Situação e tendência são TEXTO; a cor (pelo data-status) só reforça.
const RESERVA = {
  cabecalho: { area: 'Área', dominio: 'Domínio', tendencia: 'Tendência', alunos: 'Alunos', status: 'Situação' },
  status: { bem: 'Indo bem', evolucao: 'Em evolução', atencao: 'Precisa de atenção' },
  tendencia: { sobe: 'melhorando', estavel: 'estável', desce: 'piorando' },
  alunosEmAtencao: 'alunos em atenção',
}

const r = (rotulos, grupo, chave) =>
  (rotulos && rotulos[grupo] && rotulos[grupo][chave]) || RESERVA[grupo][chave]

export default function Areas({ titulo, linhas, rotulos = {} }) {
  if (!Array.isArray(linhas) || linhas.length === 0) return null
  const ehTurma = linhas.some((l) => l && 'atencao' in l)
  const alunosEmAtencao = rotulos.alunosEmAtencao || RESERVA.alunosEmAtencao

  return (
    <div className={estilos.bloco}>
      {titulo && <strong className={estilos.blocoTitulo}>{titulo}</strong>}
      <div className={estilos.cabecalho} aria-hidden="true">
        <span>{r(rotulos, 'cabecalho', 'area')}</span>
        <span>{r(rotulos, 'cabecalho', 'dominio')}</span>
        <span>{ehTurma ? r(rotulos, 'cabecalho', 'alunos') : r(rotulos, 'cabecalho', 'tendencia')}</span>
        <span>{r(rotulos, 'cabecalho', 'status')}</span>
      </div>
      <ul className={estilos.linhas}>
        {linhas.map((linha) => {
          const status = statusValido(linha.status)
          const pct = limitarPct(linha.pct)
          const tendencia = tendenciaValida(linha.tendencia)
          return (
            <li key={linha.area} className={estilos.linha} data-status={status}>
              <span className={estilos.area}>{linha.area}</span>
              <span className={estilos.medida} aria-label={`${pct}%`}>
                <span className={estilos.barra} aria-hidden="true">
                  <span className={estilos.barraCheia} style={{ width: `${pct}%` }} />
                </span>
                <span className={estilos.numero} aria-hidden="true">{pct}%</span>
              </span>
              {ehTurma ? (
                <span className={estilos.alunos}>
                  <strong>{Math.max(0, Math.round(Number(linha.atencao)) || 0)}</strong> {alunosEmAtencao}
                </span>
              ) : (
                <span className={estilos.tendencia}>
                  {tendencia && <span aria-hidden="true">{SETAS[tendencia]}</span>}
                  {tendencia && <span className={estilos.tendenciaTexto}>{r(rotulos, 'tendencia', tendencia)}</span>}
                </span>
              )}
              <span className={estilos.status}>{r(rotulos, 'status', status)}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
