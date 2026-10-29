'use client'

import { useEffect, useRef, useState } from 'react'
import estilos from './Nav.module.css'

export default function Nav({ dados, temContato = false }) {
  const [rolou, setRolou] = useState(false)
  const barra = useRef(null)

  useEffect(() => {
    function aoRolar() {
      setRolou(window.scrollY > 24)
    }
    aoRolar()
    window.addEventListener('scroll', aoRolar, { passive: true })
    return () => window.removeEventListener('scroll', aoRolar)
  }, [])

  // A BARRA PUBLICA A PRÓPRIA ALTURA EM --altura-barra.
  // Quem precisa disso é a camada de efeito do carrossel das ilhas, que
  // varre a tela ao trocar de ilha e tem de começar ABAIXO do cabeçalho —
  // senão a geada/rajada passa por cima da barra. A altura não é fixa: ao
  // rolar, o padding da barra encolhe (classe .rolou), e no celular a
  // logo muda de tamanho. Por isso ela é medida, não chutada.
  //
  // O NOME DA VARIÁVEL IMPORTA, E JÁ CUSTOU CARO.
  // Na primeira versão isto escrevia em --altura-nav — que o .conteudo
  // aqui do lado usa como min-height. Resultado: medir engordava a barra,
  // que era medida de novo, e a altura subia ~56px a cada quadro até
  // passar de 10.000px. Esta variável é SÓ DE SAÍDA: nada dentro do
  // cabeçalho pode consumi-la, senão o laço volta. Há teste para isso.
  // Altura zero (primeiro quadro, ou um ambiente de teste sem layout) não
  // é publicada: nesse caso vale a reserva escrita no CSS de quem usa.
  useEffect(() => {
    const elemento = barra.current
    if (!elemento) return undefined

    function medir() {
      const altura = elemento.offsetHeight
      if (altura > 0) {
        document.documentElement.style.setProperty('--altura-barra', `${altura}px`)
      }
    }

    medir()
    window.addEventListener('resize', medir)
    // BORDER-BOX, E NÃO O PADRÃO.
    // O que encolhe quando a página rola é o PADDING da barra (8px → 2px,
    // classe .rolou). O conteúdo dentro dela não muda de altura, então o
    // content-box — que é o que o ResizeObserver observa por padrão —
    // continua igual e o aviso nunca chega. Medido: a variável ficava um
    // passo atrasada (barra em 79px, variável ainda em 91px).
    const observador =
      typeof ResizeObserver === 'function' ? new ResizeObserver(medir) : null
    if (observador) observador.observe(elemento, { box: 'border-box' })

    return () => {
      window.removeEventListener('resize', medir)
      if (observador) observador.disconnect()
    }
  }, [rolou])

  const ancoras = temContato
    ? [...dados.ancoras, { href: '#contato', texto: dados.contato }]
    : dados.ancoras

  return (
    <header ref={barra} className={`${estilos.barra} ${rolou ? estilos.rolou : ''}`}>
      <div className={`container ${estilos.conteudo}`}>
        <a href="#topo" className={estilos.logo}>
          {/* a versão de 320px, e não a arte de 1.100px: aqui a logo ocupa
              140px de largura, então a arte cheia seria decodificação pura
              sem nada em troca na tela */}
          <img src="/images/logo_cabecalho.png" alt="Pequenos Smarters" width={320} height={163} />
        </a>
        <nav className={estilos.links} aria-label="Seções da página">
          {ancoras.map((a) => (
            <a key={a.href} href={a.href}>{a.texto}</a>
          ))}
        </nav>
        <a className={`botao botaoPrincipal ${estilos.cta}`} href="#baixar">{dados.botao}</a>
      </div>
    </header>
  )
}
