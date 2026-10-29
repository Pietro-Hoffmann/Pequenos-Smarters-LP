import { limitarPct, tracoDoAnel } from '@/lib/medidas'
import estilos from './previa.module.css'

// O ANEL DE PROGRESSO GERAL — o do app, com uma melhoria: o texto ao lado
// diz do quê é a porcentagem ("concluiu 7 de 9 fases..."). O SVG é
// decorativo; o número e o texto carregam a informação.
const RAIO = 40

export default function Anel({ titulo, pct, texto }) {
  const temNumero = pct !== null && pct !== undefined && pct !== '' && Number.isFinite(Number(pct))
  if (!temNumero && !texto) return null
  const valor = limitarPct(pct)
  const { circunferencia, deslocamento } = tracoDoAnel(valor, RAIO)

  return (
    <div className={estilos.bloco}>
      {titulo && <strong className={estilos.blocoTitulo}>{titulo}</strong>}
      <div className={estilos.anelLinha}>
        <span className={estilos.anel}>
          <svg viewBox="0 0 96 96" width="96" height="96" aria-hidden="true" focusable="false">
            <circle cx="48" cy="48" r={RAIO} fill="none" stroke="#e1e8ef" strokeWidth="10" />
            <circle
              cx="48"
              cy="48"
              r={RAIO}
              fill="none"
              stroke="var(--azul-escuro)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circunferencia}
              strokeDashoffset={deslocamento}
              transform="rotate(-90 48 48)"
            />
          </svg>
          <span className={estilos.anelNumero}>{valor}%</span>
        </span>
        {texto && <span className={estilos.anelTexto}>{texto}</span>}
      </div>
    </div>
  )
}
