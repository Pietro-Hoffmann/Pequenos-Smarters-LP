import { montarMailto, montarWhatsapp, formatarWhatsapp } from '@/lib/links'
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
// ELES FICAM LADO A LADO, E NÃO EMPILHADOS (3/11, a pedido do dono). Em
// cinco faixas empilhadas a altura do rodapé era a SOMA de todas elas;
// em três colunas ela passa a ser a da coluna mais alta. Nada de
// informação saiu — só o empilhamento. No celular as colunas voltam a
// empilhar, porque três não cabem em 390px.
//
// O canal usa o MESMO montarMailto/montarWhatsapp do lib/links.js que a
// seção de contato usa — se o painel de controle estiver vazio, não há link
// nenhum aqui embaixo, e não um link morto.
export default function Footer({ dados, contato }) {
  const email = montarMailto(contato?.email, contato?.assunto ?? '')
  const whatsapp = montarWhatsapp(contato?.whatsapp, contato?.mensagem ?? '')

  // OS TELEFONES DA EQUIPE.
  // O contato da página é por e-mail: o botão de WhatsApp saiu do
  // cabeçalho e o cartão saiu da seção "Fale com a gente" (decisão do
  // dono, 3/11). Os telefones ficaram aqui embaixo, com o nome de quem
  // atende — para quem procurar, sem disputar com o canal principal.
  // Quem não tiver número utilizável some da lista em vez de virar um
  // link morto, que é a regra de estado vazio do site inteiro.
  const equipe = (dados.equipe || [])
    .map((pessoa) => ({
      nome: pessoa.nome,
      link: montarWhatsapp(pessoa.whatsapp, dados.mensagemEquipe ?? ''),
      numero: formatarWhatsapp(pessoa.whatsapp),
    }))
    .filter((pessoa) => pessoa.nome && pessoa.link && pessoa.numero)

  return (
    <footer className={estilos.rodape} id="rodape">
      <div className={`container ${estilos.conteudo}`}>
        {/* A FAIXA DAS TRÊS COLUNAS: marca à esquerda, equipe no meio,
            letra miúda à direita. Cada coluna continua sumindo sozinha
            quando o campo dela está vazio no painel — e as que ficam se
            reorganizam, porque quem as espalha é o space-between. */}
        <div className={estilos.faixa}>
          <div className={estilos.marca}>
            {/* mesma versão de 320px do cabeçalho: aqui ela aparece menor */}
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
          </div>

          {equipe.length > 0 && (
            <div className={estilos.equipe}>
              {dados.tituloEquipe && (
                <h2 className={estilos.tituloEquipe} id="rodape-equipe">
                  {dados.tituloEquipe}
                </h2>
              )}
              <ul aria-labelledby={dados.tituloEquipe ? 'rodape-equipe' : undefined}
                  aria-label={dados.tituloEquipe ? undefined : 'Telefones da equipe'}>
                {equipe.map((pessoa) => (
                  <li key={pessoa.nome}>
                    <a href={pessoa.link} target="_blank" rel="noopener noreferrer">
                      <span className={estilos.nome}>{pessoa.nome}</span>
                      {/* o número ESCRITO, e não só o nome: quem vai anotar
                          num papel ou ligar de outro aparelho precisa vê-lo */}
                      <span className={estilos.numero}>{pessoa.numero}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {dados.dados && <p className={estilos.dados}>{dados.dados}</p>}
        </div>

        <p className={estilos.ano}>© {new Date().getFullYear()} Pequenos Smarters</p>
      </div>
    </footer>
  )
}
