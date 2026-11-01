'use client'

import usarTelaDeClima from './climas/usarTelaDeClima'
import RECEITAS from './climas/receitas'
import estilos from './ClimaCanvas.module.css'

// ---------------------------------------------------------------------------
// A TELA DE DESENHO DO CLIMA DA ILHA ESCOLHIDA
//
// Começou como FolhasCanvas, só para a Natureza (31/10). Virou genérico
// quando o Deserto entrou (1/11): o laço e os freios estão no
// usarTelaDeClima.js, o jeito de cada clima está no receitas.js, e aqui só
// mora a escolha de qual receita vale para o tema que está em cena.
//
// O atributo do tema aqui se chama data-clima-TELA de propósito:
// data-clima já é da camada que varre a tela durante a troca, e os dois
// juntos no documento faziam um seletor pegar o outro.
//
// Tema sem receita não monta nada: devolve null, e aquele clima continua
// sendo pintado pelas camadas de CSS de sempre. É assim que Fogo, Gelo,
// Lagos e Vento seguem funcionando enquanto não chega a vez deles.
// ---------------------------------------------------------------------------
export default function ClimaCanvas({ tema }) {
  const receita = RECEITAS[tema] || null
  // o gancho é chamado sempre, com receita ou sem: regra dos hooks do React.
  // Sem receita ele não liga laço nenhum.
  const telaRef = usarTelaDeClima(receita)

  if (!receita) return null

  return (
    <canvas
      ref={telaRef}
      className={estilos.tela}
      data-testid="clima-tela"
      data-clima-tela={tema}
      aria-hidden="true"
    />
  )
}
