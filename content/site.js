// ---------------------------------------------------------------------------
// PAINEL DE CONTROLE DA PÁGINA
// Todo o texto e todos os links do site estão aqui. Você pode editar este
// arquivo sem saber programar: troque o que está entre aspas e salve.
// Campo vazio ('') não quebra nada — o pedaço some ou vira "em breve".
// ---------------------------------------------------------------------------

// Quase toda seção tem uma "sobrancelha": a etiqueta curtinha que aparece
// logo acima do título, dentro de uma pilulinha. Deixe vazia ('') e a
// etiqueta simplesmente não aparece.

export const site = {
  demo: {
    // Cole aqui o link do APK que o comando `eas build` devolve.
    // Enquanto estiver vazio, o botão aparece como "Em breve", desativado.
    url: '',
  },

  video: {
    // Coloque o arquivo em public/video/ e escreva o caminho aqui.
    // Exemplo: '/video/gameplay.mp4'
    // Vazio = aparece "Gameplay em breve" no lugar do vídeo.
    src: '',
    poster: '/images/ilha_natureza.png',
    sobrancelha: 'Gameplay',
    titulo: 'Veja o jogo em ação',
    emBreve: 'Gameplay em breve',
  },

  contato: {
    // ESTE É O CAMPO MAIS IMPORTANTE DA PÁGINA HOJE.
    // Enquanto ele (e o WhatsApp abaixo) estiverem vazios, a página NÃO TEM
    // como receber um contato de escola: a seção de contato some inteira, o
    // link "Contato" do menu não aparece, o rodapé fica sem canal e o botão
    // "Falar sobre licenciamento" da seção das escolas vira só uma linha
    // escrita "Canal para escolas em breve" (ver paraEscolas.ctaEmBreve).
    // Basta escrever um e-mail aqui dentro das aspas e TUDO ISSO acende de
    // uma vez, sem mexer em mais nada.
    // Vazio = o cartão correspondente não aparece.
    // Se os dois ficarem vazios, a seção inteira de contato some.
    email: '',
    // Só números, COM o código do país (55). Ex.: '5551999999999'.
    // Sem o código do país o número fica curto demais e o cartão não aparece.
    whatsapp: '',
    assunto: 'Licenciamento — Pequenos Smarters',
    mensagem: 'Olá! Vi a página do Pequenos Smarters e quero saber mais sobre o licenciamento.',
    // Textos da seção de contato.
    sobrancelha: 'Contato',
    titulo: 'Fale com a gente',
    intro: 'Dúvidas sobre licenciamento, implantação na escola ou sobre o jogo? É só chamar.',
    // ATENÇÃO: os testes automáticos procuram os cartões pelas palavras
    // "e-mail" e "whatsapp". Se trocar estes dois títulos, mantenha essas
    // palavras no texto, senão os testes passam a falhar.
    tituloEmail: 'Mandar um e-mail',
    tituloWhatsapp: 'Chamar no WhatsApp',
    detalheWhatsapp: 'Resposta em horário comercial',
  },

  // ---------------------------------------------------------------------------
  // A TRILHA SONORA DO JOGO TOCANDO NO SITE
  // Um controle de som fica fixo no canto inferior direito.
  //
  // COMO ELA COMEÇA: nenhum navegador deixa música começar sozinha — todos
  // exigem que o visitante interaja com a página antes. Por isso ela fica
  // armada e entra no PRIMEIRO clique ou toque em qualquer lugar, com o
  // volume subindo do silêncio para não assustar ninguém.
  //
  // `ativo: false` tira o controle da página inteira, e aí o arquivo de
  // música nunca é baixado por ninguém.
  // O arquivo tem 1,6 MB e só é buscado quando alguém liga o som, nunca no
  // carregamento da página. Ele é a música do jogo recomprimida de 256 para
  // 96 kbps (de 4,3 MB para 1,6 MB): em música de fundo a 35% de volume a
  // diferença não se ouve, e medimos que o volume continua o mesmo.
  // SE FOR TROCAR A MÚSICA: recomprima antes, senão a página fica pesada.
  trilha: {
    ativo: true,
    arquivo: '/sons/musica_fundo.mp3',
    rotuloLigar: 'Ligar a música do jogo',
    rotuloDesligar: 'Desligar a música',
    rotuloVolume: 'Volume da música',
    // de 0 a 1. 0.35 é um fundo presente sem atrapalhar quem está lendo.
    volumeInicial: 0.35,
  },

  // Menu do topo da página.
  nav: {
    ancoras: [
      { href: '#video', texto: 'Vídeo' },
      { href: '#jogo', texto: 'O jogo' },
      { href: '#pais', texto: 'Para os pais' },
      { href: '#escolas', texto: 'Para escolas' },
    ],
    // Este link só aparece quando há e-mail ou WhatsApp preenchido acima.
    contato: 'Contato',
    botao: 'Baixar a demo',
  },

  hero: {
    titulo: 'Seu filho aprende a ler brincando',
    // UM parágrafo só, e é de propósito. Antes eram dois, e eles diziam a
    // mesma coisa duas vezes — o que empurrava os botões para fora da tela
    // num notebook comum. Este aqui precisa carregar quatro informações e
    // nada mais: o que é, para que idade, que a DEMO é grátis e como se
    // chega ao jogo COMPLETO (licença para escolas ou assinatura da família,
    // as duas portas do pitch). Se for reescrever, não deixe parecer que o
    // jogo inteiro é gratuito — não é.
    subtitulo:
      'Um jogo de alfabetização para crianças de 6 a 8 anos. A demo da Ilha da Natureza é gratuita; o jogo completo vem por licença para escolas ou por assinatura para a família.',
    // Etiqueta pequena acima da logo. Vazia = não aparece nada.
    // Se um dia quiser de volta, escreva aqui dentro das aspas.
    selo: '',
    botaoPrincipal: 'Baixar a demo',
    botaoSecundario: 'Ver o gameplay',
  },

  // Título da faixa de benefícios. Ele não aparece na tela: existe só para
  // leitores de tela e para a página ter a ordem de títulos correta.
  beneficiosTitulo: 'Por que o Pequenos Smarters',

  beneficios: [
    {
      icone: '/images/estrelas.png',
      titulo: 'Feito para 6 a 8 anos',
      texto: 'Conteúdo de alfabetização e uma interface colorida, pensada para mãos pequenas.',
    },
    {
      icone: '/images/icone_painel.png',
      titulo: 'Acompanhe o progresso',
      texto: 'O Painel dos Pais mostra o desempenho da criança em cada atividade.',
    },
    {
      icone: '/images/som_azul.png',
      titulo: 'Pensado para acessibilidade',
      texto: 'Modo daltonismo, som e voz ajustáveis, para mais crianças conseguirem jogar.',
    },
  ],

  // A SEÇÃO DO JOGO: as seis ilhas, uma de cada vez, no carrossel.
  // Esta é a seção do menu "O jogo". Ela conta o jogo inteiro: mostra as seis
  // ilhas e, na Ilha da Natureza (a única pronta), as três atividades que a
  // criança enfrenta na demo.
  //
  // Só a Natureza está pronta; as outras cinco aparecem inteiras e coloridas,
  // com a etiqueta "Em breve". Quando uma ficar pronta, troque o disponivel
  // dela de false para true e pronto.
  //
  // Cada ilha tem:
  //   nome       — o que aparece grande no palco e embaixo da miniatura
  //   descricao  — uma linha contando o que a criança faz naquela ilha
  //   arte       — o desenho, que já está em public/images/
  //   disponivel — true = "Disponível", false = "Em breve"
  //   tema       — o clima do palco (fundo, partículas e cor de destaque) E
  //                também o clima do céu da página inteira enquanto aquela
  //                ilha estiver escolhida.
  //                Vale um destes seis, escrito exatamente assim:
  //                natureza, deserto, fogo, gelo, lagos, vento.
  //                Trocar o tema de uma ilha troca o clima dela na hora.
  //   atividades — OPCIONAL. As plaquinhas que aparecem embaixo do carrossel
  //                quando aquela ilha está escolhida. Hoje só a Natureza tem,
  //                porque só ela está pronta. Uma ilha SEM atividades mostra,
  //                no lugar das plaquinhas, a plaquinha de "ilha a caminho"
  //                (o bloco `futura`, logo abaixo) — assim a seção não
  //                encolhe e não sobra campo vazio quando alguém clica numa
  //                ilha que ainda não existe. Quando outra ilha ficar pronta,
  //                copie o bloco `atividades` para dentro dela.
  ilhas: {
    sobrancelha: 'O jogo',
    // O título conta a verdade na ordem certa: primeiro o que JÁ EXISTE,
    // depois o que vem. "Seis ilhas para explorar" prometia seis e entregava
    // uma — para um comprador de escola isso lia como "estou licenciando um
    // sexto de um produto". Dito assim, a mesma informação vira roteiro.
    titulo: 'A Ilha da Natureza está pronta. Mais cinco estão a caminho.',
    texto:
      'A criança desembarca na Ilha da Natureza, que vem inteira na demo, e enfrenta as três atividades no ritmo dela, com os mascotes por perto. As outras cinco ainda estão sendo feitas: clique em cada uma para ver o que vem por aí.',
    rodape: 'Cada atividade vale até 3 estrelas — errou pouco, brilhou mais.',
    // O QUE APARECE QUANDO A ILHA ESCOLHIDA AINDA NÃO EXISTE.
    // Antes, clicar numa das cinco ilhas futuras fazia as plaquinhas sumirem
    // e deixava um campo vazio enorme embaixo: a pessoa interagia e ganhava
    // MENOS página. Esta plaquinha ocupa esse lugar com algo honesto e com o
    // mesmo convite de sempre. Apague o bloco inteiro e volta a não aparecer
    // nada (nada quebra, a seção só encolhe de novo).
    futura: {
      texto:
        'Esta ilha ainda está sendo construída — a arte já existe, as atividades ainda não. Quem já dá para jogar inteira, hoje, é a Ilha da Natureza.',
      // É o mesmo convite do resto da página, e leva para o mesmo lugar: o
      // bloco de download. Enquanto o link do APK não existir, lá está o
      // "Em breve" desativado — que é o estado honesto, não um defeito.
      botao: 'Baixar a demo',
    },
    rotuloDisponivel: 'Disponível',
    rotuloEmBreve: 'Em breve',
    // Textos que só os leitores de tela e quem navega pelo teclado escutam.
    // Eles nomeiam as setas e a fileira de miniaturas embaixo do palco.
    rotuloAnterior: 'Ver a ilha anterior',
    rotuloProxima: 'Ver a próxima ilha',
    rotuloMiniaturas: 'As seis ilhas do jogo',
    // MOSTRAR AS ATIVIDADES (FASES) DA ILHA ESCOLHIDA?
    // false = a seção mostra só a ilha e as seis miniaturas (decisão do dono
    // em 21/10: a seção cabe numa tela e não repete o que o jogo mostra).
    // true = voltam as três plaquinhas de atividade ao lado da ilha, e o
    // quadro "em breve" quando a ilha escolhida ainda não tem atividades.
    // Os textos das atividades continuam guardados abaixo, em cada ilha.
    mostrarAtividades: false,
    lista: [
      {
        nome: 'Natureza',
        descricao: 'A criança explora a floresta e caça as vogais escondidas entre as árvores.',
        arte: '/images/ilha_natureza.png',
        disponivel: true,
        tema: 'natureza',
        // As três atividades da demo. Só esta ilha tem.
        atividades: [
          {
            nome: 'Floresta das Vogais',
            texto: 'Encontrar as vogais escondidas entre as árvores.',
            arte: '/images/fundo_floresta.png',
            cor: 'var(--carta-azul)',
          },
          {
            nome: 'Lago das Letras',
            texto: 'Identificar as consoantes que boiam no lago.',
            arte: '/images/fundo_lago.png',
            cor: 'var(--carta-laranja)',
          },
          {
            nome: 'Campo das Letras',
            texto: 'Descobrir com qual letra a palavra começa.',
            arte: '/images/fundo_nuvenscampo.png',
            cor: 'var(--verde-botao)',
          },
        ],
      },
      {
        nome: 'Deserto',
        descricao: 'Um dia a criança vai cavar a areia quente atrás das sílabas perdidas.',
        arte: '/images/ilha_deserto.png',
        disponivel: false,
        tema: 'deserto',
      },
      {
        nome: 'Fogo',
        descricao: 'Em breve a criança vai atravessar o vulcão juntando as letras que saem das brasas.',
        arte: '/images/ilha_fogo.png',
        disponivel: false,
        tema: 'fogo',
      },
      {
        nome: 'Gelo',
        descricao: 'Logo mais a criança vai derreter o gelo para soltar as palavras congeladas.',
        arte: '/images/ilha_gelo.png',
        disponivel: false,
        tema: 'gelo',
      },
      {
        nome: 'Lagos',
        descricao: 'Em breve a criança vai mergulhar fundo para pescar as palavras que boiam.',
        arte: '/images/ilha_lagos.png',
        disponivel: false,
        tema: 'lagos',
      },
      {
        nome: 'Vento',
        descricao: 'Um dia a criança vai subir com as pipas e agarrar as letras que voam no céu.',
        arte: '/images/ilha_vento.png',
        disponivel: false,
        tema: 'vento',
      },
    ],
  },

  personagens: {
    sobrancelha: 'A turma',
    titulo: 'Quem acompanha a criança',
    herois: [
      // Cada mascote acompanha UMA atividade da Ilha da Natureza — é assim
      // dentro do jogo, não é invenção da página:
      // Ziggy na Floresta das Vogais, Pipo no Lago das Letras e Lina no
      // Campo das Letras. Se as fases mudarem no jogo, mude aqui também.
      { nome: 'Ziggy', especie: 'o leão', arte: '/images/ziggy.png', texto: 'Guia a criança na Floresta das Vogais e encara o Doutor Preguiça junto com ela.' },
      { nome: 'Lina', especie: 'a elefanta', arte: '/images/lina.png', texto: 'Espera no Campo das Letras para descobrir com qual letra cada palavra começa.' },
      { nome: 'Pipo', especie: 'o macaco', arte: '/images/pipo.png', texto: 'Chama a criança para o Lago das Letras, atrás das consoantes que boiam.' },
    ],
    // O vilão entra como o QUARTO da fileira, do lado dos três mascotes, e
    // não mais num bloco separado. Só o balão dele é escuro — é o que marca
    // quem é o vilão. Apagar este bloco inteiro faz a fileira voltar a ter
    // três personagens, sem quebrar nada.
    vilao: {
      nome: 'Doutor Preguiça',
      especie: 'o vilão',
      arte: '/images/doutor_preguica.png',
      texto: 'Quer apagar todas as letras do mundo. Vai deixar?',
    },
  },

  // ---------------------------------------------------------------------------
  // ACOMPANHAMENTO — o que pais e professores veem.
  // Dois painéis, cada um com uma PRÉVIA desenhada em HTML pelo site (não é
  // captura de tela do app). A prévia é uma lista de BLOCOS; a ordem aqui é
  // a ordem na tela, e apagar um bloco da lista é tirá-lo da prévia.
  // Tipos de bloco: anel · areas · destaque · tempo · jornada · cifras · reforco.
  // Os números e os nomes de alunos são DE EXEMPLO, e cada prévia diz isso
  // na linha `exemplo`. Nomes fictícios: nunca use o de uma pessoa real.
  // ---------------------------------------------------------------------------
  paraOsPais: {
    sobrancelha: 'Acompanhamento',
    titulo: 'Pais e professores acompanham cada passo',
    texto:
      'O progresso fica registrado criança a criança, atividade por atividade. A família vê no Painel dos Pais; a escola vê a turma inteira no Painel do Professor.',

    // AS PALAVRAS FIXAS DAS PRÉVIAS. Situação e tendência são texto de
    // propósito (quem não distingue verde de laranja lê a palavra).
    rotulos: {
      cabecalho: { area: 'Área', dominio: 'Domínio', tendencia: 'Tendência', alunos: 'Alunos', status: 'Situação' },
      status: { bem: 'Indo bem', evolucao: 'Em evolução', atencao: 'Precisa de atenção' },
      tendencia: { sobe: 'melhorando', estavel: 'estável', desce: 'piorando' },
      estadoIlha: { ok: 'concluída', atual: 'atual', bloq: 'bloqueada' },
      alunosEmAtencao: 'alunos em atenção',
    },

    paineis: [
      {
        etiqueta: 'Para a família',
        titulo: 'Painel dos Pais',
        icone: '/images/icone_painel.png',
        // mascote no canto do painel: DESLIGADO em 21/10 (repetia o que as
        // outras seções já fazem). Para voltar: '/images/ziggy.png'
        mascote: '',
        texto: 'Em que a criança vai melhor, em que vai pior e onde precisa de mais atenção.',
        // A LISTA DE ESTRELINHAS embaixo da prévia foi DESLIGADA em 21/10
        // (repetia o que a prévia mostra e custava altura). [] = some.
        // Para voltar: 'Acertos, erros e estrelas de cada tentativa',
        // 'Evolução por área: leitura, escrita, lógica e memória',
        // 'Histórico completo, atividade por atividade'
        itens: [],
        previa: {
          titulo: 'Relatório de Ana · últimas 2 semanas',
          blocos: [
            // tendencia: sobe | estavel | desce · status: bem | evolucao | atencao
            {
              tipo: 'areas',
              titulo: 'Desempenho por área',
              linhas: [
                { area: 'Leitura', pct: 82, tendencia: 'sobe', status: 'bem' },
                { area: 'Escrita', pct: 64, tendencia: 'sobe', status: 'evolucao' },
                { area: 'Lógica', pct: 71, tendencia: 'estavel', status: 'bem' },
                { area: 'Memória', pct: 45, tendencia: 'desce', status: 'atencao' },
              ],
            },
            // pct: 0 a 100 · texto: do que é a porcentagem
            { tipo: 'anel', titulo: 'Progresso geral', pct: 72, texto: 'concluiu 7 de 9 fases da Ilha da Natureza' },
            {
              tipo: 'destaque',
              titulo: 'Onde precisa de mais atenção',
              texto:
                'Memória: errou 6 de 10 no Lago das Letras. Sugestão: repetir a atividade com a narração ligada.',
            },
            { tipo: 'tempo', titulo: 'Tempo de uso', valor: '28 min', rotulo: 'por dia, em média', texto: 'Boa consistência.' },
            // estado: ok (concluída) | atual | bloq (bloqueada)
            {
              tipo: 'jornada',
              titulo: 'Ilhas e fases',
              ilhas: [
                { nome: 'Natureza', imagem: '/images/ilha_natureza.png', estado: 'ok' },
                { nome: 'Deserto', imagem: '/images/ilha_deserto.png', estado: 'atual' },
                { nome: 'Gelo', imagem: '/images/ilha_gelo.png', estado: 'bloq' },
                { nome: 'Ventos', imagem: '/images/ilha_vento.png', estado: 'bloq' },
                { nome: 'Fogo', imagem: '/images/ilha_fogo.png', estado: 'bloq' },
                { nome: 'Lagos', imagem: '/images/ilha_lagos.png', estado: 'bloq' },
              ],
            },
          ],
          exemplo: 'Prévia ilustrativa, com números de exemplo',
        },
      },
      {
        etiqueta: 'Para a escola',
        titulo: 'Painel do Professor',
        icone: '/images/icone_painel.png',
        // idem; para voltar: '/images/lina.png'
        mascote: '',
        texto: 'Média por área, quem está abaixo da meta e quem precisa de reforço.',
        // Lista desligada em 21/10 (veja o painel acima). Para voltar:
        // 'Login por turma', 'Relatório de alfabetização da turma',
        // 'Quem precisa de reforço, por área e por atividade'
        itens: [],
        previa: {
          titulo: '1º ano A · 24 alunos · relatório de alfabetização',
          blocos: [
            {
              tipo: 'cifras',
              titulo: 'Turma em números',
              itens: [
                { valor: '64%', rotulo: 'média da turma' },
                { valor: '13', rotulo: 'alunos na meta' },
                { valor: '11', rotulo: 'precisam de reforço' },
              ],
            },
            // atencao: quantos alunos precisam de atenção naquela área
            {
              tipo: 'areas',
              titulo: 'Desempenho da turma por área',
              linhas: [
                { area: 'Leitura', pct: 76, atencao: 3, status: 'bem' },
                { area: 'Escrita', pct: 58, atencao: 9, status: 'evolucao' },
                { area: 'Lógica', pct: 70, atencao: 4, status: 'bem' },
                { area: 'Memória', pct: 52, atencao: 11, status: 'atencao' },
              ],
            },
            // nomes FICTÍCIOS, só o primeiro nome
            {
              tipo: 'reforco',
              titulo: 'Quem precisa de reforço',
              alunos: [
                { nome: 'Miguel', area: 'Memória', atividade: 'Lago das Letras' },
                { nome: 'Sofia', area: 'Escrita', atividade: 'Campo das Letras' },
                { nome: 'Davi', area: 'Memória', atividade: 'Lago das Letras' },
                { nome: 'Helena', area: 'Escrita', atividade: 'Floresta das Vogais' },
              ],
            },
            {
              tipo: 'destaque',
              titulo: 'Prioridade da turma',
              texto:
                'Memória e Escrita: 11 e 9 alunos abaixo da meta. O relatório lista quem são, atividade por atividade.',
            },
          ],
          exemplo: 'Prévia ilustrativa, com números e nomes de exemplo',
        },
      },
    ],

    // AS FICHAS PEQUENAS embaixo dos painéis — DESLIGADAS pelo Pietro em
    // 21/10 (a seção é só os dois painéis). Lista vazia ([]) = somem.
    // Para trazer de volta, preencha assim:
    //   { icone: '/images/estrelas.png', titulo: 'Estrelas', texto: 'Feedback imediato de acerto e erro, sem punir quem errou.' },
    //   { icone: '/images/botao_config.png', titulo: 'Modo daltonismo', texto: 'As cores do jogo se adaptam para quem enxerga diferente.' },
    //   { icone: '/images/som_azul.png', titulo: 'Som e voz ajustáveis', texto: 'Música, efeitos e narração ligam e desligam na hora.' },
    extras: [],
  },

  // PARA ESCOLAS E REDES DE ENSINO
  // Esta é a seção do único visitante que paga. Ela não pode repetir a faixa
  // de benefícios do topo: cada um dos quatro itens abaixo é uma coisa que o
  // coordenador consegue levar para uma reunião e conferir no aplicativo.
  //
  // O QUE NÃO PODE ENTRAR AQUI enquanto não for verdade: preço, licença por
  // turma, projeto piloto, painel do professor, alinhamento com a BNCC e
  // escola de referência. Nada disso está definido, e um item desses escrito
  // antes da hora vira promessa quebrada na primeira reunião.
  //
  // O que DEIXARIA esta lista mais forte são números que ainda não temos:
  // quantas palavras e letras as três atividades cobrem, quantos minutos
  // dura uma sessão e quantos megabytes o aplicativo ocupa no tablet.
  // Quando esses números existirem, eles valem mais que os quatro itens.
  paraEscolas: {
    sobrancelha: 'Escolas',
    titulo: 'Para escolas e redes de ensino',
    texto:
      'O Pequenos Smarters é licenciado para instituições e roda nos celulares e tablets Android que a escola já tem, sem servidor local nem equipamento novo. Sobre dados: quem faz o cadastro é o responsável pela criança, informando nome e idade dela, e o progresso fica guardado em servidor — é essa a parte que a rede precisa olhar na avaliação de LGPD.',
    // OS QUATRO CARTÕES DE "O QUE O JOGO FAZ HOJE" SAÍRAM DA TELA em
    // 21/10/2026: o Pietro pediu que o bloco de licenciamento (abaixo)
    // ficasse NO LUGAR deles. Os textos continuam aqui; `mostrarItens: true`
    // traz os cartões de volta, acima do licenciamento.
    mostrarItens: false,
    itens: [
      'O progresso fica registrado criança a criança, atividade por atividade, com os acertos e as estrelas de cada tentativa — quem abre esse acompanhamento é o responsável, pelo Painel dos Pais',
      'Modo daltonismo, narração em voz, música e efeitos sonoros ligam e desligam nas configurações do próprio jogo',
      'Roda nos celulares e tablets Android que a escola já tem: instala o aplicativo e usa a internet da escola, sem servidor local, sem laboratório e sem equipamento novo',
      'Alfabetização de 6 a 8 anos em três atividades: caçar as vogais, identificar as consoantes e descobrir com qual letra a palavra começa',
    ],
    // COMO SE PAGA — o modelo de receita do pitch (Rafa, 21/10/2026):
    // duas portas de entrada. Os valores do pitch estavam em branco; por
    // isso cada porta tem `preco` vazio e uma linha `precoVazio` que
    // aparece no lugar. PREENCHEU O PREÇO, ELE APARECE SOZINHO.
    // Exemplo: preco: 'R$ 00,00 por aluno/ano'  ·  preco: 'R$ 00,00/mês'.
    // Apague o bloco `modelo` inteiro (ou deixe `portas: []`) e a seção
    // volta a não falar de dinheiro.
    modelo: {
      sobrancelha: 'Modelo de negócio',
      titulo: 'Como funciona o licenciamento',
      texto:
        'Duas portas de entrada: a escola licencia por aluno, e a família pode assinar por conta própria.',
      // OS NÚMEROS DO MERCADO (páginas 2 e 4 do pitch) — DESLIGADOS pelo
      // Pietro em 21/10 ("meio inúteis aqui"). Lista vazia = a faixa some.
      // Para trazer de volta, preencha assim (e a `fonte` logo abaixo):
      //   { valor: '8,7 mi', rotulo: 'crianças de 6 a 8 anos, do 1º ao 3º ano' },
      //   { valor: '103 mil', rotulo: 'escolas com anos iniciais — 68% delas municipais' },
      //   { valor: '40,8%', rotulo: 'das crianças da rede pública terminaram o 2º ano sem estar alfabetizadas' },
      numeros: [],
      fonte: '',
      portas: [
        {
          etiqueta: 'Foco principal',
          // destaque: true = a placa ganha a moldura dourada e fica maior.
          destaque: true,
          // o mascote que espia no canto da placa ('' = nenhum)
          mascote: '/images/lina.png',
          nome: 'Escolas e prefeituras',
          plano: 'Licença anual por aluno',
          preco: '',
          precoVazio: 'Valor sob consulta',
          itens: [
            'Login por turma e Painel do Professor',
            'Relatório de alfabetização da turma',
            'Todas as ilhas e atividades para cada aluno',
          ],
        },
        {
          etiqueta: 'Porta de entrada',
          destaque: false,
          mascote: '/images/pipo.png',
          nome: 'Famílias',
          plano: 'Assinatura mensal',
          preco: '',
          precoVazio: 'Valor em breve',
          itens: [
            'Ilha da Natureza grátis para experimentar',
            'A assinatura libera todas as ilhas',
            'Painel dos Pais completo',
          ],
        },
      ],
      // Linha de fecho. Vazia ('') = some.
      parcerias:
        'Além das licenças: parcerias com instituições de ensino e editais de educação (ODS 4 e 17).',
    },
    cta: 'Falar sobre licenciamento',
    // O QUE APARECE NO LUGAR DO BOTÃO ENQUANTO NÃO HÁ CONTATO NENHUM.
    // Com e-mail ou WhatsApp preenchidos lá em cima, aqui fica o botão
    // "Falar sobre licenciamento", que leva para a seção de contato.
    // Sem nenhum dos dois, aparece só esta linha. Ela existe porque o botão
    // antes mandava o diretor para o card de download do APK — ou seja,
    // prometia um canal que não existe e entregava a tela do pai.
    ctaEmBreve: 'Canal para escolas em breve',
  },

  baixar: {
    sobrancelha: 'Grátis',
    titulo: 'Baixe a demo gratuita',
    // AS PLAQUINHAS DO CARD.
    // As três primeiras dizem o que vem na demo; as duas últimas respondem a
    // pergunta que trava o pai na hora de instalar um APK à mão (o Android
    // mostra um aviso vermelho nessa hora). Só escreva aqui o que for
    // verdade conferida dentro do jogo: "sem anúncios" foi verificado no
    // código. A plaquinha "sem compras dentro do app" SAIU em 21/10/2026,
    // quando o modelo de receita passou a ter assinatura para a família —
    // ela contradizia a seção das escolas.
    // NÃO escreva "funciona offline": o jogo precisa de internet para
    // entrar, salvar as configurações e guardar o progresso.
    itens: [
      'Ilha da Natureza completa',
      '3 atividades',
      'Painel dos Pais',
      'Sem anúncios',
    ],
    rodape: 'Gostou? Dentro do jogo tem um botão para solicitar a licença completa.',
    emBreve: 'Em breve',
    textoBotao: 'Baixar a demo (Android)',
    // Aviso de plataforma: a demo é um APK e não instala em iPhone.
    // Aparece sempre, com ou sem o link preenchido.
    plataforma: 'A demo é um aplicativo Android (APK). No iPhone não é possível instalar.',
    // A LINHA DOS DADOS, em português de pai, não de advogado. Ela está no
    // card porque é ali que a pessoa decide instalar. Mantenha honesta: o
    // jogo pede cadastro, guarda o progresso em servidor e precisa de
    // internet. Vazia ('') = a linha some.
    dados:
      'Para jogar é preciso criar uma conta: o responsável informa os dados dele e o nome e a idade da criança. O progresso fica guardado no servidor do jogo, por isso o tablet precisa estar na internet.',
    // Legenda embaixo do QR Code (o QR só aparece quando demo.url está preenchido).
    qrLegenda: 'Aponte a câmera para baixar',
  },

  // O RODAPÉ.
  // A linha "Feito com React Native, Expo e Supabase" e a linha do TCC não
  // existem mais em lugar nenhum da página: a seção "Quem fez" foi removida
  // por decisão do dono. Aqui embaixo elas faziam mal — para um secretário
  // de educação, a última coisa que ele lia antes de fechar a página era
  // "trabalho de faculdade". O rodapé tem o que um fornecedor tem: logo,
  // canal de contato (quando existir), uma linha sobre dados e o copyright.
  rodape: {
    // Vale para pai e para escola: é a versão curta da linha de dados do
    // card de download. Vazia ('') = a linha some.
    dados:
      'O jogo pede o cadastro de um responsável, com o nome e a idade da criança, e guarda o progresso em servidor. Não há anúncios nem compras dentro do aplicativo.',
    // Rótulo do link de WhatsApp do rodapé. O e-mail aparece escrito por
    // extenso; o WhatsApp, por este rótulo. Os dois só aparecem quando os
    // campos lá de cima, em `contato`, estiverem preenchidos.
    rotuloWhatsapp: 'WhatsApp',
  },
}
