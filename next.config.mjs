/** @type {import('next').NextConfig} */
const nextConfig = {
  // SAÍDA AUTÔNOMA, para a imagem Docker do deploy.
  // Gera .next/standalone com o servidor e SÓ as dependências que ele usa
  // de verdade, em vez de carregar node_modules inteiro para dentro da
  // imagem. Quem consome isso é o Dockerfile na raiz.
  // Atenção: o standalone NÃO inclui public/ nem .next/static — os dois
  // são copiados à mão no Dockerfile, como a documentação do Next manda.
  output: 'standalone',
}

export default nextConfig
