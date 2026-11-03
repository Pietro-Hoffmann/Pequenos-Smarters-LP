import { montarMailto, montarWhatsapp } from '@/lib/links'
import Sobrancelha from './Sobrancelha'
import FormularioContato from './FormularioContato'
import estilos from './Contato.module.css'

export default function Contato({ contato }) {
  const email = montarMailto(contato?.email, contato?.assunto ?? '')
  const whatsapp = montarWhatsapp(contato?.whatsapp, contato?.mensagem ?? '')

  if (!email && !whatsapp) return null

  return (
    <section className={`secao ${estilos.secao}`} id="contato">
      <div className="container">
        <Sobrancelha texto={contato.sobrancelha} />
        <h2 className="tituloSecao" data-revelar>{contato.titulo}</h2>
        <p className={estilos.intro} data-revelar>{contato.intro}</p>

        {/* A CAIXA VEM ANTES DOS CARTÕES: é o caminho principal desde
            2/11. Os dois cartões continuam logo abaixo como atalho para
            quem prefere falar direto, e aparecem mesmo sem a caixa — que
            some sozinha enquanto não houver chave no painel de controle. */}
        <div data-revelar>
          <FormularioContato dados={contato.formulario} assunto={contato.assunto} />
        </div>

        <div className={estilos.grade} data-revelar-grupo>
          {email && (
            <a className={`cartao ${estilos.cartao}`} href={email} data-revelar>
              <span className={estilos.icone} aria-hidden="true">✉</span>
              <h3>{contato.tituloEmail}</h3>
              <span className={estilos.detalhe}>{contato.email}</span>
            </a>
          )}

          {whatsapp && (
            <a className={`cartao ${estilos.cartao}`} href={whatsapp} target="_blank" rel="noreferrer" data-revelar>
              <span className={estilos.icone} aria-hidden="true">✆</span>
              <h3>{contato.tituloWhatsapp}</h3>
              <span className={estilos.detalhe}>{contato.detalheWhatsapp}</span>
            </a>
          )}
        </div>
      </div>
    </section>
  )
}
