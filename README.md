# Landing page do Pequenos Smarters

Página única feita em Next.js para apresentar o jogo e distribuir a demo.

## Por onde começar (ordem de prioridade)

**Antes de qualquer apresentação, preencha `demo.url` e `video.src`.** Enquanto
esses dois estiverem vazios, os botões "Baixar a demo" do topo e do menu rolam
até um botão desativado escrito "Em breve", e "Ver o gameplay" rola até um
quadro de espera escrito "Gameplay em breve" — ou seja, a página promete duas
coisas que ela ainda não entrega, na frente da banca.

Depois, em ordem:

1. `demo.url` e `video.src` — **antes de apresentar**
2. `contato.email` e/ou `contato.whatsapp` — **antes de falar com qualquer escola**
3. `autoras[].foto` e `autoras[].email` — por último, são só enfeite

## Como editar o conteúdo

**Todo o texto e todos os links estão em `content/site.js`.** Abra o arquivo,
troque o que está entre aspas e salve.

Para mudar texto ou link, esse arquivo é o único lugar em que você precisa
mexer. Cores, espaçamentos e imagens ficam fora dele: as cores estão em
`app/globals.css`, e as imagens em `public/images/`.

Campo vazio não quebra a página — o pedaço some ou vira "em breve":

| O que falta | Onde preencher | O que acontece enquanto está vazio |
|---|---|---|
| Link do APK da demo | `demo.url` | Botão "Em breve", desativado, e o QR Code não aparece |
| Vídeo de gameplay | `video.src` | Aparece "Gameplay em breve" |
| E-mail de contato | `contato.email` | O cartão de e-mail não aparece |
| WhatsApp | `contato.whatsapp` | O cartão de WhatsApp não aparece |
| Fotos das autoras | `autoras[].foto` | Aparece um mascote no lugar |
| E-mail das autoras | `autoras[].email` | O nome aparece sem link embaixo |

### Quando faltam dois campos ao mesmo tempo

Alguns campos vazios mexem em mais de um lugar da página:

- **`demo.url` vazio** — além do botão virar "Em breve", o QR Code some junto.
  Ele só existe para levar ao APK; sem o link, não teria para onde apontar.
- **`contato.email` E `contato.whatsapp` os dois vazios** — a seção "Fale com a
  gente" some inteira, o link "Contato" desaparece do menu do topo, e o botão
  "Falar sobre licenciamento" (na seção das escolas) passa a levar para a seção
  de download, em vez de levar a um link morto.

### Colocar o link da demo (o APK)

É o campo mais importante da página — é para ele que ela existe.

1. Gere o APK com `eas build` (no repositório do jogo, não neste aqui)
2. O comando termina mostrando um link que acaba em `.apk`
3. Em `content/site.js`, escreva `url: 'https://...apk'` dentro de `demo`

Quando o link estiver preenchido, o botão "Em breve" vira um botão laranja de
download e o QR Code aparece sozinho embaixo dele.

A demo é um aplicativo **Android**. Não existe versão para iPhone, e a página
avisa isso embaixo do botão — não tire esse aviso.

### Colocar o vídeo

1. Salve o arquivo como `public/video/gameplay.mp4`
2. Em `content/site.js`, escreva `src: '/video/gameplay.mp4'`

Recomendação: até cerca de **20 MB** (60 a 90 segundos em 720p). O Vercel
limita arquivo a 100 MB no plano gratuito, e vídeo pesado trava em 4G.

### Preencher o WhatsApp

Escreva **só os números, com o código do país na frente**:

```
whatsapp: '5551999999999'
```

- `55` é o código do Brasil, `51` é o DDD, o resto é o número
- Pontuação pode entrar (`+55 (51) 99999-9999` funciona igual) — ela é removida
- São necessários **no mínimo 12 dígitos**

**Se você esquecer o `55` na frente, o cartão do WhatsApp simplesmente não
aparece.** Isso é de propósito: um número sem o código do país geraria um link
`wa.me` com cara de válido que abre uma conta que não existe. É melhor o cartão
sumir do que mandar a escola para o lugar errado.

### Colocar as fotos das autoras

1. Salve em `public/images/` (ex.: `rafaela.jpg`)
2. Em `content/site.js`, escreva `foto: '/images/rafaela.jpg'`

## Rodar na sua máquina

```bash
npm install
npm run dev
```

Abre em http://localhost:3000

## Testes

```bash
npm test
```

No Windows, se o comando acima falhar:

```bash
node node_modules/vitest/vitest.mjs run
```

## Publicar no Vercel

Este projeto não tem repositório git, então a publicação é manual — **toda
vez que você editar o `content/site.js`, precisa publicar de novo.**

```bash
npx vercel
```

Na primeira vez ele pede login e algumas confirmações (aceite os padrões).
Isso gera um endereço de teste. Para publicar de verdade:

```bash
npx vercel --prod
```

Se um dia o projeto for para o GitHub, dá para importar o repositório pelo
painel do Vercel em https://vercel.com e aí cada alteração publica sozinha.

**Sobre o ano no rodapé:** o "© 2026" é calculado na hora em que o site é
publicado, não na hora em que o visitante abre a página. Quando virar o ano,
ele só muda depois que você publicar de novo.
