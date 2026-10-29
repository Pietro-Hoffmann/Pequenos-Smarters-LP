import Sobrancelha from './Sobrancelha'
import estilos from './ParaEscolas.module.css'

// A SEÇÃO QUE FALA COM QUEM PAGA.
//
// O botão daqui era o defeito mais caro da página: ele dizia "Falar sobre
// licenciamento" e, quando não havia canal de contato nenhum, apontava para
// `#baixar` — ou seja, levava o diretor de escola para o card do APK do pai,
// que termina num botão cinza desativado. A promessa era de um canal e a
// entrega era a tela de outro público.
//
// A regra agora tem dois estados, e os dois são honestos:
//   • COM canal (e-mail ou WhatsApp preenchidos no painel de controle):
//     o botão existe e leva para `#contato`, a seção que nesse caso aparece;
//   • SEM canal: não há botão nenhum. No lugar fica uma linha dizendo que o
//     canal vem aí. Nada de link, nada de âncora, nada de redirecionar o
//     visitante para um lugar que não é o dele.
//
// Quem decide é a prop `temContato`, que vem do app/page.js e é calculada
// pelo mesmo `temContato()` do lib/links.js que decide se a seção de contato
// e o link do menu aparecem. Uma fonte só para os três.
export default function ParaEscolas({ dados, temContato = false }) {
  return (
    <section className={`secao ${estilos.secao}`} id="escolas">
      <div className="container">
        <Sobrancelha texto={dados.sobrancelha} />
        <h2 className="tituloSecao" data-revelar>{dados.titulo}</h2>
        <p className={estilos.intro} data-revelar>{dados.texto}</p>

        {/* Os cartões de "o que o jogo faz hoje" só aparecem se o painel
            de controle pedir (mostrarItens). Por padrão — decisão do dono
            em 21/10 — o que ocupa este lugar é o bloco de licenciamento. */}
        {dados.mostrarItens !== false && Array.isArray(dados.itens) && dados.itens.length > 0 && (
          <ul className={estilos.lista}>
            {dados.itens.map((item) => (
              <li key={item} className={`cartao ${estilos.reta}`}>{item}</li>
            ))}
          </ul>
        )}

        {/* COMO SE PAGA. As duas portas do modelo de receita (escolas e
            famílias), cada uma com o plano, o preço e o que inclui. O preço
            vem do painel de controle; enquanto estiver vazio, aparece a
            linha `precoVazio` ("Valor sob consulta") — nunca um número
            inventado e nunca um espaço em branco. Sem o bloco `modelo`, ou
            com `portas` vazio, nada disto é desenhado. Não há link aqui:
            quem quer o valor usa o botão de contato logo abaixo. */}
        {dados.modelo && Array.isArray(dados.modelo.portas) && dados.modelo.portas.length > 0 && (
          <div className={estilos.modelo} data-testid="modelo" data-revelar>
            {dados.modelo.sobrancelha && <Sobrancelha texto={dados.modelo.sobrancelha} />}
            {dados.modelo.titulo && <h3 className={`tituloSecao ${estilos.modeloTitulo}`}>{dados.modelo.titulo}</h3>}
            {dados.modelo.texto && <p className={estilos.modeloTexto}>{dados.modelo.texto}</p>}

            {/* A FAIXA DOS NÚMEROS: o tamanho do problema e do mercado, em
                números grandes, como no pitch. */}
            {Array.isArray(dados.modelo.numeros) && dados.modelo.numeros.length > 0 && (
              <ul className={estilos.numeros} aria-label="Números do mercado">
                {dados.modelo.numeros.map((n) => (
                  <li key={n.valor + n.rotulo}>
                    <strong className={estilos.valor}>{n.valor}</strong>
                    <span className={estilos.rotulo}>{n.rotulo}</span>
                  </li>
                ))}
              </ul>
            )}

            <ul className={estilos.portas} data-revelar-grupo>
              {dados.modelo.portas.map((porta) => (
                <li
                  key={porta.nome}
                  className={`cartao ${estilos.reta} ${estilos.porta} ${porta.destaque ? estilos.destaque : ''}`}
                  data-revelar
                >
                  {porta.etiqueta && <span className={estilos.etiqueta}>{porta.etiqueta}</span>}
                  {porta.mascote && (
                    <img
                      className={`${estilos.mascote} aFlutuar`}
                      style={{ '--dur': porta.destaque ? '5.6s' : '6.4s' }}
                      src={porta.mascote}
                      alt=""
                      aria-hidden="true"
                      width={440}
                      height={448}
                      loading="lazy"
                    />
                  )}
                  <h4 className={estilos.portaNome}>{porta.nome}</h4>
                  {porta.plano && <p className={estilos.plano}>{porta.plano}</p>}
                  <p className={porta.preco ? estilos.preco : estilos.precoVazio}>
                    {porta.preco || porta.precoVazio}
                  </p>
                  {Array.isArray(porta.itens) && porta.itens.length > 0 && (
                    <ul className={estilos.inclui}>
                      {porta.itens.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  )}
                </li>
              ))}
            </ul>

            {dados.modelo.parcerias && <p className={estilos.parcerias}>{dados.modelo.parcerias}</p>}
            {dados.modelo.fonte && <p className={estilos.fonte}>{dados.modelo.fonte}</p>}
          </div>
        )}

        <div className={estilos.acao} data-revelar>
          {temContato ? (
            <a className="botao botaoPrincipal" href="#contato">{dados.cta}</a>
          ) : (
            dados.ctaEmBreve && <p className={estilos.aguardando}>{dados.ctaEmBreve}</p>
          )}
        </div>
      </div>

      <img
        className={`${estilos.aviao} aFlutuar`}
        style={{ '--dur': '7.2s' }}
        src="/images/aviao.png"
        alt=""
        aria-hidden="true"
        width={280}
        height={213}
        loading="lazy"
      />
    </section>
  )
}
