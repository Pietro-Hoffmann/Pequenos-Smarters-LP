import Sobrancelha from './Sobrancelha'
import estilos from './Video.module.css'

// O vídeo não é mais uma faixa escura de ponta a ponta: virou um telão
// com moldura, flutuando no céu.
//
// O TELÃO TEM DOIS ESTADOS, E ELES NÃO SE PARECEM DE PROPÓSITO:
//   • com vídeo, ele é escuro. Moldura escura em volta de vídeo é certo:
//     ajuda a ver a imagem e é o que todo player faz.
//   • sem vídeo, ele é claro. Enquanto o arquivo não chega, o azul-marinho
//     era a ÚNICA superfície escura de uma página inteira feita de céu
//     claro: o olho ia direto nele e o que encontrava era um aviso de
//     ausência. Em branco com borda tracejada, ele vira o que de fato é —
//     um espaço reservado — e para de roubar o foco do que já funciona.
export default function Video({ video }) {
  return (
    <section className={`secao ${estilos.secao}`} id="video">
      <div className="container">
        <Sobrancelha texto={video.sobrancelha} />
        <h2 className="tituloSecao" data-revelar>{video.titulo}</h2>

        <div className={`${estilos.telao} ${video.src ? '' : estilos.telaoVazio}`} data-revelar>
          {video.src ? (
            <video className={estilos.player} src={video.src} poster={video.poster} controls preload="metadata" />
          ) : (
            <div className={estilos.espera}>
              <img src={video.poster} alt="" aria-hidden="true" width={840} height={756} loading="lazy" />
              <span className={estilos.play} aria-hidden="true">▶</span>
              <p>{video.emBreve}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
