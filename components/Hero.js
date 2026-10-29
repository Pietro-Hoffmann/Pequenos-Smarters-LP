import estilos from './Hero.module.css'

// O hero não pinta céu nenhum: o céu de verdade é o <Cenario />, que corre
// atrás da página inteira. Aqui só ficam a logo, o texto, os botões e a pipa.
//
// O Pipo que entrava pela borda esquerda SAIU daqui de propósito: o lockup
// da logo já traz os três mascotes (Ziggy, Lina e Pipo), então ele aparecia
// duas vezes na mesma dobra — e a segunda vez cortado pela esquerda E pela
// base, virando uma mancha marrom no canto em 1366px. Ou o lockup com os
// três, ou mascote vazando pela borda; os dois ao mesmo tempo diluem os dois.
export default function Hero({ hero }) {
  return (
    <section className={estilos.hero} id="topo">
      <img
        className={`${estilos.pipa} aBalancar`}
        style={{ '--dur': '6.5s', '--atraso': '-1.5s' }}
        src="/images/pipa.png"
        alt=""
        aria-hidden="true"
        width={300}
        height={471}
      />

      <div className={`container ${estilos.conteudo}`}>
        {hero.selo && <span className={estilos.selo}>{hero.selo}</span>}
        <img
          className={estilos.logo}
          src="/images/logo_com_personagem.png"
          alt="Pequenos Smarters — Ziggy, Lina e Pipo"
          width={1100}
          height={562}
        />
        <h1 className="tituloJogo">{hero.titulo}</h1>
        {/* UM parágrafo, não dois. Os dois antigos diziam a mesma coisa
            duas vezes ("um jogo de alfabetização de 6 a 8 anos…" e depois
            "baixe a demo gratuita…"), e cinco linhas de texto repetido eram
            o que empurrava os botões para fora da tela em 1366×660. O texto
            que ficou carrega as quatro informações que importam: o que é,
            para que idade, que a demo é grátis e que o completo é
            licenciado para escolas. */}
        <p className={estilos.subtitulo}>{hero.subtitulo}</p>
        <div className={estilos.botoes}>
          <a className="botao botaoPrincipal" href="#baixar">{hero.botaoPrincipal}</a>
          <a className="botao botaoSecundario" href="#video">{hero.botaoSecundario}</a>
        </div>
      </div>
    </section>
  )
}
