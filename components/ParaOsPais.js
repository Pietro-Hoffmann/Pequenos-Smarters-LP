import Sobrancelha from './Sobrancelha'
import Previa from './previa/Previa'
import estilos from './ParaOsPais.module.css'

// ACOMPANHAMENTO: O QUE PAIS E PROFESSORES VEEM.
// Dois painéis lado a lado — Painel dos Pais e Painel do Professor — cada
// um com etiqueta, ícone, título, uma frase, a PRÉVIA (desenhada em HTML
// pela pasta components/previa, a partir dos blocos do painel de
// controle) e uma lista curta do que o painel oferece. Embaixo, as fichas
// pequenas (estrelas, daltonismo, som).
//
// Esta seção não desenha prévia nenhuma: só compõe. Quem desenha é
// components/previa/Previa.js, bloco a bloco.
//
// Compatibilidade: se o painel de controle só tiver `itens` (o formato
// antigo), eles viram as fichas pequenas — nada quebra.
const RITMOS = [
  { dur: '5.4s', atraso: '0s' },
  { dur: '6.2s', atraso: '-1.4s' },
  { dur: '5.8s', atraso: '-2.6s' },
]

export default function ParaOsPais({ dados }) {
  const paineis = Array.isArray(dados.paineis) ? dados.paineis : []
  const extras = Array.isArray(dados.extras) ? dados.extras : Array.isArray(dados.itens) ? dados.itens : []
  const rotulos = dados.rotulos || {}

  return (
    <section className={`secao ${estilos.secao}`} id="pais">
      <div className="container">
        <Sobrancelha texto={dados.sobrancelha} />
        <h2 className="tituloSecao" data-revelar>{dados.titulo}</h2>
        {dados.texto && <p className={estilos.intro} data-revelar>{dados.texto}</p>}

        {paineis.length > 0 && (
          <ul className={estilos.paineis} data-revelar-grupo>
            {paineis.map((painel) => (
              <li key={painel.titulo} className={`cartao ${estilos.painel}`} data-testid="painel" data-revelar>
                {painel.mascote && (
                  <img
                    className={`${estilos.mascote} aFlutuar`}
                    style={{ '--dur': '6s' }}
                    src={painel.mascote}
                    alt=""
                    aria-hidden="true"
                    width={440}
                    height={448}
                    loading="lazy"
                  />
                )}
                {/* etiqueta e título na mesma linha: cabeçalho baixo, para a
                    seção caber numa tela */}
                <div className={estilos.topo}>
                  <h3 className={estilos.painelTitulo}>
                    {painel.icone && (
                      <img src={painel.icone} alt="" aria-hidden="true" width={44} height={44} loading="lazy" />
                    )}
                    {painel.titulo}
                  </h3>
                  {painel.etiqueta && <span className={estilos.etiqueta}>{painel.etiqueta}</span>}
                </div>
                {painel.texto && <p className={estilos.painelTexto}>{painel.texto}</p>}

                <Previa previa={painel.previa} rotulos={rotulos} />

                {Array.isArray(painel.itens) && painel.itens.length > 0 && (
                  <ul className={estilos.inclui}>
                    {painel.itens.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}

        {extras.length > 0 && (
          <ul className={estilos.extras}>
            {extras.map((item, i) => {
              const ritmo = RITMOS[i % RITMOS.length]
              return (
                <li key={item.titulo} className={`cartao ${estilos.extra}`}>
                  {item.icone && (
                    <img
                      className={`${estilos.icone} aFlutuar`}
                      style={{ '--dur': ritmo.dur, '--atraso': ritmo.atraso }}
                      src={item.icone}
                      alt=""
                      aria-hidden="true"
                      width={48}
                      height={48}
                      loading="lazy"
                    />
                  )}
                  <strong>{item.titulo}</strong>
                  <span>{item.texto}</span>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}
