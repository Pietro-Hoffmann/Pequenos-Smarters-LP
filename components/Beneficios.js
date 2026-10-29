import estilos from './Beneficios.module.css'

// Os três ícones que abrem a página, cada um numa plaquinha.
const RITMOS = [
  { dur: '5.2s', atraso: '0s' },
  { dur: '6.4s', atraso: '-1.1s' },
  { dur: '5.8s', atraso: '-2.3s' },
]

export default function Beneficios({ titulo, itens }) {
  return (
    <section className={estilos.faixa} id="beneficios">
      <h2 className="visuallyHidden">{titulo}</h2>
      <div className={`container ${estilos.grade}`} data-revelar-grupo>
        {itens.map((item, i) => {
          const ritmo = RITMOS[i % RITMOS.length]
          return (
            <div key={item.titulo} className={`cartao ${estilos.item}`} data-revelar>
              <img
                className="aFlutuar"
                style={{ '--dur': ritmo.dur, '--atraso': ritmo.atraso }}
                src={item.icone}
                alt=""
                aria-hidden="true"
                width={64}
                height={64}
                loading="lazy"
              />
              <h3>{item.titulo}</h3>
              <p>{item.texto}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
