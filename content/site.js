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
    // O link do APK. Enquanto estiver vazio, o botão aparece como
    //
    // POR QUE É O LINK DE /view DO DRIVE, E NÃO UM DOWNLOAD DIRETO:
    // o arquivo tem 156 MB, e acima de ~100 MB o Google Drive não
    // consegue verificar vírus e intercepta qualquer download direto com
    // uma tela de aviso. Ou seja, o atalho "uc?export=download" não
    // entrega o arquivo — entrega uma página de HTML. O /view leva a
    // pessoa à tela do Drive, onde ela clica em baixar e funciona sempre.
    url: 'https://drive.google.com/file/d/1OLH7Yu-J2UJDB9wiz0ZTOJqS24bWr-v9/view',
  },

  video: {
    // Coloque o arquivo em public/video/ e escreva o caminho aqui.
    // Vazio = aparece "Gameplay em breve" no lugar do vídeo, e o telão
    // fica claro em vez de escuro.
    //
    // O ARQUIVO DE HOJE (3/11) é a gravação de tela do jogo, de 7min50s.
    // O original tinha 830 MB porque o celular gravou a 90 quadros por
    // segundo; ele foi reduzido para 1280 de largura e 30 quadros antes
    // de entrar aqui. PARA TROCAR O VÍDEO: um arquivo de celular não
    // pode ser copiado direto para esta pasta — acima de 100 MB o GitHub
    // recusa, e quem abrir a página pelo celular paga o download. Peça
    // para reduzir antes.
    src: '/video/gameplay.mp4',
    // A capa que aparece ANTES de a pessoa apertar o play. Hoje é a arte
    // da ilha, e não um quadro do próprio vídeo — se um dia quiser um
    // quadro do jogo, é só trocar o caminho.
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
    email: 'pequenossmarters@gmail.com',
    // O CONTATO DA PÁGINA É SÓ POR E-MAIL (decisão do dono, 3/11).
    // Este campo ficou VAZIO de propósito, e é isso que tira o botão
    // verde do cabeçalho E o cartão "Chamar no WhatsApp" da seção de
    // contato, sem precisar mexer em código nenhum: os dois só existem
    // quando há número aqui.
    // Os telefones da equipe foram para o RODAPÉ, lá embaixo em
    // `rodape.equipe`. Escrever um número aqui traz o botão e o cartão de
    // volta, se um dia quiserem.
    whatsapp: '',
    assunto: 'Pequenos Smarters',
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

    // OS CARTÕES DE CANAL (e-mail e WhatsApp) ESTÃO DESLIGADOS desde 3/11.
    // Com a caixa de mensagem logo acima, o cartão de e-mail virava um
    // segundo caminho para a mesma coisa — e o endereço ainda aparecia de
    // novo no rodapé, três vezes na mesma rolagem.
    // true = os cartões voltam, para os canais que estiverem preenchidos.
    mostrarCartoes: false,

    // -----------------------------------------------------------------
    // A CAIXA DE MENSAGEM
    // Enquanto a `chave` estiver vazia, a caixa NÃO APARECE na página e
    // ficam só os dois cartões. É de propósito: uma caixa sem chave
    // engoliria a mensagem da pessoa sem avisar, e isso é pior do que
    // não ter caixa.
    //
    // COMO CONSEGUIR A CHAVE, em dois minutos e de graça:
    //   1. entre em web3forms.com
    //   2. digite pequenossmarters@gmail.com e peça a chave
    //   3. ela chega nesse mesmo e-mail; cole aqui dentro das aspas
    // O plano gratuito aceita 250 mensagens por mês. As mensagens passam
    // pelo servidor do Web3Forms antes de chegar no Gmail.
    // -----------------------------------------------------------------
    formulario: {
      chave: '890f9be0-f336-4447-9081-a878aacad4e1',
      titulo: 'Escreva para a gente',
      rotuloNome: 'Seu nome',
      rotuloEmail: 'Seu e-mail',
      rotuloMensagem: 'Sua mensagem',
      dicaMensagem: 'Conte de qual escola você fala, quantas turmas, o que quer saber.',
      botao: 'Enviar mensagem',
      botaoEnviando: 'Enviando…',
      // O que a pessoa lê quando dá certo e quando dá errado.
      sucesso: 'Mensagem enviada! A gente responde no seu e-mail.',
      falha: 'Não deu para enviar agora. Sua mensagem continua aqui — tente de novo ou chame no WhatsApp.',
      // Os avisos de cada campo. As chaves (vazio, curto, longo,
      // invalido) são as que o código devolve; os textos são seus.
      avisos: {
        nome: {
          vazio: 'Escreva o seu nome.',
          curto: 'Esse nome parece curto demais.',
          longo: 'Esse nome é comprido demais.',
        },
        email: {
          vazio: 'Escreva o seu e-mail, senão não temos como responder.',
          invalido: 'Esse e-mail parece incompleto.',
          longo: 'Esse e-mail é comprido demais.',
        },
        mensagem: {
          vazio: 'Escreva a sua mensagem.',
          curto: 'Conte um pouquinho mais, para a gente poder ajudar.',
          longo: 'A mensagem passou do tamanho. Resuma um pouco, por favor.',
        },
      },
    },
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
    botao: 'Baixar a demonstração',
    // O botão verde do cabeçalho. Ele só aparece se o WhatsApp estiver
    // preenchido lá embaixo em `contato` — apagou o número, some o botão.
    botaoContato: 'Falar no WhatsApp',
    // O mesmo botão em telas bem estreitas (abaixo de 420px), onde o texto
    // cheio empurraria o "Baixar a demo" para fora. Quem lê com leitor de
    // tela continua ouvindo o texto cheio acima, em qualquer largura.
    botaoContatoCurto: 'WhatsApp',
  },

  hero: {
    titulo: 'Seu filho aprende a ler brincando',
    // UM parágrafo só, e é de propósito. Antes eram dois, e eles diziam a
    // mesma coisa duas vezes — o que empurrava os botões para fora da tela
    // num notebook comum. Este aqui precisa carregar quatro informações e
    // nada mais: o que é, para que idade, que a DEMO é grátis e como se
    // chega ao jogo COMPLETO (licença para escolas, por aluno — desde
    // 3/11 é a única porta; a assinatura para família saiu com o plano de
    // negócios novo). Se for reescrever, não deixe parecer que o jogo
    // inteiro é gratuito — não é.
    subtitulo:
      'Um jogo de alfabetização para crianças de 6 a 8 anos. A demonstração com as três primeiras ilhas é gratuita; o jogo completo é licenciado para escolas, por aluno.',
    // Etiqueta pequena acima da logo. Vazia = não aparece nada.
    // Se um dia quiser de volta, escreva aqui dentro das aspas.
    selo: '',
    botaoPrincipal: 'Baixar a demonstração',
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
  // ilhas e, nas três que já estão prontas, as atividades que a
  // criança enfrenta na demo.
  //
  // Natureza, Deserto e Gelo estão prontas; as outras três aparecem
  // inteiras e coloridas,
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
  //                quando aquela ilha está escolhida. Hoje só a Natureza
  //                tem a lista escrita; como as plaquinhas estão desligadas
  //                (mostrarAtividades: false), isso não aparece na página.
  //                Uma ilha SEM atividades mostra,
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
    titulo: 'Três ilhas já estão prontas. Mais três estão a caminho.',
    texto:
      'A criança começa na Ilha da Natureza e segue pelo Deserto até o Gelo: são nove atividades, no ritmo dela e com os mascotes por perto. As outras três ainda estão sendo feitas — clique em cada uma para ver o que vem por aí.',
    rodape: 'Cada atividade vale até 3 estrelas — errou pouco, brilhou mais.',
    // O QUE APARECE QUANDO A ILHA ESCOLHIDA AINDA NÃO EXISTE.
    // Antes, clicar numa das ilhas que ainda vêm fazia as plaquinhas sumirem
    // e deixava um campo vazio enorme embaixo: a pessoa interagia e ganhava
    // MENOS página. Esta plaquinha ocupa esse lugar com algo honesto e com o
    // mesmo convite de sempre. Apague o bloco inteiro e volta a não aparecer
    // nada (nada quebra, a seção só encolhe de novo).
    futura: {
      texto:
        'Esta ilha ainda está sendo construída — a arte já existe, as atividades ainda não. Hoje dá para jogar inteiras a Natureza, o Deserto e o Gelo.',
      // É o mesmo convite do resto da página, e leva para o mesmo lugar: o
      // bloco de download. Enquanto o link do APK não existir, lá está o
      // "Em breve" desativado — que é o estado honesto, não um defeito.
      botao: 'Baixar a demonstração',
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
    // A ORDEM DESTA LISTA É A DO JOGO, e não uma escolha de layout.
    // No jogo as ilhas ficam num arco e são percorridas em ordem
    // CRONOLÓGICA — a criança só abre a seguinte quando termina a
    // anterior. O MapScreen do jogo diz isso no próprio comentário, e o
    // painel dos pais de lá as numera de 1 a 6:
    //   1 Natureza, 2 Deserto, 3 Gelo, 4 Ventos, 5 Fogo, 6 Lagos.
    // Até 2/11 o carrossel estava com Fogo e Gelo trocados e Lagos antes
    // dos Ventos, enquanto a prévia do Painel dos Pais mais abaixo NESTE
    // MESMO ARQUIVO já seguia a ordem certa — o site se contradizia.
    // Há teste guardando as duas listas em sincronia.
    lista: [
      {
        nome: 'Natureza',
        descricao: 'A criança explora a floresta e caça as vogais escondidas entre as árvores.',
        arte: '/images/ilha_natureza.png',
        disponivel: true,
        tema: 'natureza',
        // As três atividades desta ilha. O Deserto e o Gelo também têm
        // três cada, mas a lista só precisa existir aqui enquanto as
        // plaquinhas estiverem desligadas no painel.
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
        descricao: 'A criança cava a areia quente atrás das sílabas perdidas.',
        arte: '/images/ilha_deserto.png',
        disponivel: true,
        tema: 'deserto',
      },
      {
        nome: 'Gelo',
        descricao: 'A criança derrete o gelo para soltar as palavras congeladas.',
        arte: '/images/ilha_gelo.png',
        disponivel: true,
        tema: 'gelo',
      },
      {
        nome: 'Ventos',
        descricao: 'Um dia a criança vai subir com as pipas e agarrar as letras que voam no céu.',
        arte: '/images/ilha_vento.png',
        disponivel: false,
        tema: 'vento',
      },
      {
        nome: 'Fogo',
        descricao: 'Em breve a criança vai atravessar o vulcão juntando as letras que saem das brasas.',
        arte: '/images/ilha_fogo.png',
        disponivel: false,
        tema: 'fogo',
      },
      {
        nome: 'Lagos',
        descricao: 'Em breve a criança vai mergulhar fundo para pescar as palavras que boiam.',
        arte: '/images/ilha_lagos.png',
        disponivel: false,
        tema: 'lagos',
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
            { tipo: 'anel', titulo: 'Progresso geral', pct: 72, texto: 'concluiu 7 das 9 fases liberadas' },
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
      'Alfabetização de 6 a 8 anos em nove atividades, da Ilha da Natureza até a do Gelo: caçar as vogais, identificar as consoantes, descobrir com qual letra a palavra começa e mais',
    ],
    // COMO SE PAGA — do Plano de Negócios de 2/11/2026.
    // MUDOU EM 3/11: o plano passou a dizer "vendido APENAS para escolas
    // públicas e particulares". A porta "Famílias" (assinatura mensal),
    // que vinha do pitch de outubro, SAIU — e com ela a menção a
    // assinatura no herói, que virou contradição.
    // Para voltar a ter duas portas, basta acrescentar outro objeto em
    // `portas`; o bloco se reorganiza sozinho.
    modelo: {
      sobrancelha: 'Modelo de negócio',
      titulo: 'Como funciona o licenciamento',
      texto:
        'A escola licencia por aluno do 1º ao 3º ano e recebe o jogo instalado nos aparelhos que já tem, com formação para as professoras e acompanhamento durante o ano.',
      // OS NÚMEROS DO MERCADO continuam DESLIGADOS — decisão do Pietro em
      // 21/10, mantida em 3/11 mesmo com os dados novos do plano (34% das
      // crianças sem alfabetizar em 2025, 52% no RS, meta de 80% até 2030
      // pela Lei 15.247/2025). Lista vazia = a faixa some.
      numeros: [],
      fonte: '',
      portas: [
        {
          etiqueta: 'Para escolas e redes',
          destaque: true,
          mascote: '/images/lina.png',
          nome: 'Licença anual',
          plano: 'Por aluno do 1º ao 3º ano',
          // O MENSAL VEM JUNTO DE PROPÓSITO: é o número que faz uma
          // secretaria ver que cabe no orçamento.
          preco: 'R$ 30 por aluno, por ano',
          // o mesmo preço dito por mês, logo abaixo do anual
          precoMes: 'R$ 2,50 por aluno ao mês',
          precoVazio: 'Valor sob consulta',
          // CADA ITEM EM UMA LINHA SÓ. Os textos longos quebravam em duas
          // e três linhas e faziam a placa tomar 70% da tela do celular
          // (medido em 3/11). O detalhe de cada item fica para a conversa;
          // aqui é só a lista do que entra.
          itens: [
            'Instalação nos aparelhos da escola',
            'Cadastro das turmas com as professoras',
            'Formação para a equipe',
            'Acompanhamento por aluno',
            'Suporte o ano todo',
          ],
        },
      ],
      // O TESTE GRATUITO É O QUE TIRA O RISCO DE QUEM DECIDE, e é o
      // primeiro passo da venda no plano de negócios. Vazia ('') = some.
      parcerias:
        'Antes de assinar, a escola testa 30 dias de graça — com os alunos, nos aparelhos dela.',
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
    titulo: 'Baixe a demonstração gratuita',
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
      'Três ilhas completas',
      '9 atividades',
      'Painel dos Pais',
      'Sem anúncios',
    ],
    // O CONVITE DO FIM DO CARD.
    // Até 3/11 dizia "Dentro do jogo tem um botão para solicitar a licença
    // completa". Esse botão NÃO EXISTE MAIS, e a frase mandava a escola
    // procurar o que não há. Agora o convite leva para o "Fale com a
    // gente". O `rodapeLink` só vira link se houver contato preenchido lá
    // em cima; sem isso, fica só a pergunta.
    rodape: 'Quer o jogo completo na sua escola ou em casa?',
    rodapeLink: 'Fale com a gente',
    emBreve: 'Em breve',
    textoBotao: 'Baixar a demonstração (Android)',
    // Aviso de plataforma: a demo é um APK e não instala em iPhone.
    // Aparece sempre, com ou sem o link preenchido.
    plataforma: 'A demonstração é um aplicativo Android (APK). No iPhone não é possível instalar.',
    // A LINHA DOS DADOS, em português de pai, não de advogado: o jogo pede
    // cadastro, guarda o progresso em servidor e precisa de internet.
    // ESVAZIADA EM 3/11 a pedido do dono — o card estava com texto demais
    // antes do botão. A informação NÃO se perdeu: ela continua no rodapé
    // da página, em versão curta (ver `rodape.dados` mais abaixo), e a
    // versão longa, para a avaliação de LGPD da rede, está na seção das
    // escolas. Escrever um texto aqui dentro das aspas traz a linha de
    // volta para o card.
    dados: '',
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

    // -----------------------------------------------------------------
    // OS TELEFONES DA EQUIPE
    // O contato da página é por e-mail; estes números ficam aqui embaixo
    // para quem preferir falar direto. Cada pessoa precisa de nome E de
    // número COM o código do país (55) — sem ele o número fica curto
    // demais e a pessoa some da lista, em vez de virar um link morto.
    // Lista vazia = o bloco inteiro não aparece.
    // -----------------------------------------------------------------
    tituloEquipe: 'Falar direto com a gente',
    mensagemEquipe: 'Olá! Vi a página do Pequenos Smarters e quero saber mais.',
    equipe: [
      { nome: 'Rafaela de Oliveira Lopes dos Santos', whatsapp: '5551999000251' },
      { nome: 'Estefanie Oliveira Cardozo dos Santos', whatsapp: '5551999754680' },
    ],
  },
}
