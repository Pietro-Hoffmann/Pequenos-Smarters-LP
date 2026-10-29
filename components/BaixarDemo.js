import { QRCodeSVG } from 'qrcode.react'
import Sobrancelha from './Sobrancelha'
import estilos from './BaixarDemo.module.css'

// O download não é mais uma faixa amarela de ponta a ponta: virou uma placa
// amarela grande, pregada no céu.
export default function BaixarDemo({ dados, url }) {
  return (
    <section className={`secao ${estilos.secao}`} id="baixar">
      <div className="container">
        <Sobrancelha texto={dados.sobrancelha} />
        {/* Um dos DOIS títulos da página com o contorno da voz do jogo (o outro é
            o H1 do herói): este é o clímax, o pedido principal. */}
        <h2 className="tituloJogo">{dados.titulo}</h2>

        <div className={estilos.placa} data-revelar>
          <ul className={estilos.itens}>
            {dados.itens.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          {dados.plataforma && <p className={estilos.plataforma}>{dados.plataforma}</p>}

          {/* A pergunta que trava o pai não é "que formato é esse": é "posso
              instalar isso no tablet do meu filho?". Instalar um APK à mão
              faz o próprio Android mostrar um aviso vermelho, e até aqui a
              página não dizia uma palavra sobre anúncio, compra dentro do
              app ou dado da criança. As plaquinhas acima respondem as duas
              primeiras; esta linha responde a terceira, e responde a
              verdade — inclusive a parte chata, que é precisar de internet. */}
          {dados.dados && <p className={estilos.dados}>{dados.dados}</p>}

          {/* O pulsinho só existe quando o link do APK já está no ar:
              botão desativado não pode ficar chamando atenção. */}
          <div className={`${estilos.acao} ${url ? 'aPulsar' : ''}`}>
            {url ? (
              <a className={`botao ${estilos.grande} ${estilos.ativo}`} href={url}>{dados.textoBotao}</a>
            ) : (
              <button type="button" className={`botao botaoDesativado ${estilos.grande}`} disabled>
                {dados.emBreve}
              </button>
            )}
          </div>

          {url && (
            <div className={estilos.qr}>
              <QRCodeSVG value={url} size={132} bgColor="#ffffff" fgColor="#11212d" level="M" />
              <span>{dados.qrLegenda}</span>
            </div>
          )}

          <p className={estilos.rodape}>{dados.rodape}</p>
        </div>
      </div>
    </section>
  )
}
