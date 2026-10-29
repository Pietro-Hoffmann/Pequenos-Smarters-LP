import { montarMailto, montarWhatsapp } from '@/lib/links'
import estilos from './Footer.module.css'

// O RODAPÉ DE FORNECEDOR, NÃO DE PORTFÓLIO.
//
// Ele abria com "Feito com React Native, Expo e Supabase" e seguia com a
// linha do TCC. Para a banca isso é crédito; para um secretário de educação
// que rolou a página inteira, é a última coisa que ele lê antes de sair — e
// ele lê "tecnologia que não conheço → trabalho de faculdade → copyright".
// As duas linhas foram para a seção "Quem fez", onde contam a favor.
//
// Aqui ficou o que um fornecedor tem: a marca, o canal de contato, uma linha
// honesta sobre os dados da criança e o copyright.
//
// O canal usa o MESMO montarMailto/montarWhatsapp do lib/links.js que a
// seção de contato usa — se o painel de controle estiver vazio, não há link
// nenhum aqui embaixo, e não um link morto.
export default function Footer({ dados, contato }) {
  const email = montarMailto(contato?.email, contato?.assunto ?? '')
  const whatsapp = montarWhatsapp(contato?.whatsapp, contato?.mensagem ?? '')

  return (
    <footer className={estilos.rodape} id="rodape">
      <div className={`container ${estilos.conteudo}`}>
        {/* mesma versão de 320px do cabeçalho: aqui ela aparece com 160px */}
        <img src="/images/logo_cabecalho.png" alt="Pequenos Smarters" width={320} height={163} loading="lazy" />

        {(email || whatsapp) && (
          <p className={estilos.canais}>
            {email && <a href={email}>{contato.email}</a>}
            {whatsapp && (
              <a href={whatsapp} target="_blank" rel="noreferrer">
                {dados.rotuloWhatsapp}
              </a>
            )}
          </p>
        )}

        {dados.dados && <p className={estilos.dados}>{dados.dados}</p>}

        <p className={estilos.ano}>© {new Date().getFullYear()} Pequenos Smarters</p>
      </div>
    </footer>
  )
}
