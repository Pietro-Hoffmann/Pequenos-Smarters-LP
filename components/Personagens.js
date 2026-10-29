import Sobrancelha from './Sobrancelha'
import estilos from './Personagens.module.css'

// Tamanho real de cada arquivo de arte, em pixels. Serve só para o navegador
// reservar o espaço certo antes da imagem carregar (evita a página "pular").
// Se uma arte for trocada por outra de proporção diferente, atualize aqui.
const TAMANHOS = {
  '/images/ziggy.png': [440, 448],
  '/images/lina.png': [440, 602],
  '/images/pipo.png': [440, 526],
  '/images/doutor_preguica.png': [440, 438],
}
const PADRAO = [440, 520]

// Cada personagem tem um movimento e um tempo diferentes de propósito: se
// todos se mexessem juntos pareceria um carrossel, não uma cena.
const MOVIMENTOS = [
  { classe: 'aFlutuar', dur: '5.4s', atraso: '0s' },
  { classe: 'aBalancar', dur: '8.2s', atraso: '-2.1s' },
  { classe: 'aCair', dur: '9.6s', atraso: '-4.3s' },
  { classe: 'aBalancar', dur: '11s', atraso: '-5.5s' },
]

// O VILÃO É O QUARTO DA FILEIRA, e isso é de propósito.
// Antes ele era um bloco separado: uma placa escura flutuando à esquerda e a
// arte dele encostada na borda direita, com uns 400px de céu vazio entre as
// duas. Lia como duas sobras largadas, não como uma cena — e a placa escura
// era a única superfície escura da região, então puxava o olho justamente
// para o pedaço mais fraco da página.
// Agora ele recebe o mesmo tratamento dos mascotes (nome, pílula, balão,
// sombra de contato) e só o balão é escuro, que é o que basta para marcar
// quem é o vilão sem bagunçar a composição.
export default function Personagens({ dados }) {
  const vilao = dados.vilao ? [{ ...dados.vilao, ehVilao: true }] : []
  const elenco = [...dados.herois, ...vilao]

  return (
    <section className={`secao ${estilos.secao}`} id="personagens">
      <div className="container">
        <Sobrancelha texto={dados.sobrancelha} />
        <h2 className="tituloSecao" data-revelar>{dados.titulo}</h2>

        <div className={estilos.grade} data-revelar-grupo>
          {elenco.map((p, i) => {
            const [largura, altura] = TAMANHOS[p.arte] ?? PADRAO
            const mov = MOVIMENTOS[i % MOVIMENTOS.length]
            const alt = p.especie ? `${p.nome}, ${p.especie}` : p.nome
            return (
              <article
                key={p.nome}
                className={`${estilos.heroi} ${p.ehVilao ? estilos.ehVilao : ''}`}
                data-revelar
              >
                <h3 className={estilos.nome}>{p.nome}</h3>
                {p.especie && <span className={estilos.especie}>{p.especie}</span>}
                <p className={estilos.balao}>{p.texto}</p>
                {/* O palco guarda a sombra de contato e a altura fixa; quem
                    se mexe é a arte dentro dele. */}
                <span className={estilos.palco}>
                  <img
                    className={`${estilos.figura} ${mov.classe}`}
                    style={{ '--dur': mov.dur, '--atraso': mov.atraso }}
                    src={p.arte}
                    alt={alt}
                    width={largura}
                    height={altura}
                    loading="lazy"
                  />
                </span>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
