'use client'

import { useEffect, useRef, useState } from 'react'
import estilos from './Trilha.module.css'

// ---------------------------------------------------------------------------
// A TRILHA DO JOGO TOCANDO NO SITE
//
// A REGRA QUE MANDA AQUI: navegador nenhum deixa áudio com som começar
// sozinho. Chrome, Safari, Firefox e Edge só liberam depois que o visitante
// interage com a página. Não há contorno honesto — o que dá para fazer é
// ficar ARMADO e entrar no primeiro toque, que foi a escolha do dono.
//
// Para o primeiro toque não virar susto, a música entra com o volume
// subindo do silêncio até o alvo em um segundo e meio.
//
// PESO: a música tem 4,3 MB, quase o dobro de todas as imagens do site
// somadas. Por isso o <audio> nasce SEM src e com preload="none": quem
// nunca liga o som não baixa um byte. O src só é escrito na hora de tocar.
//
// A escolha do visitante (ligado/desligado e volume) fica guardada no
// próprio navegador. Quem desligou não é importunado na visita seguinte:
// o primeiro toque nem chega a ser armado.
// ---------------------------------------------------------------------------

const CHAVE = 'ps-trilha'
const FADE_MS = 1500

// Lê a preferência guardada. Nunca pode derrubar a página: navegador em
// aba anônima, armazenamento cheio ou valor corrompido caem no padrão.
function lerPreferencia(volumePadrao) {
  if (typeof window === 'undefined') return { ligado: null, volume: volumePadrao }
  try {
    const cru = window.localStorage.getItem(CHAVE)
    if (!cru) return { ligado: null, volume: volumePadrao } // null = nunca escolheu
    const salvo = JSON.parse(cru)
    const volume = Number(salvo.volume)
    return {
      ligado: typeof salvo.ligado === 'boolean' ? salvo.ligado : null,
      volume: Number.isFinite(volume) ? Math.min(1, Math.max(0, volume)) : volumePadrao,
    }
  } catch {
    return { ligado: null, volume: volumePadrao }
  }
}

function gravarPreferencia(ligado, volume) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(CHAVE, JSON.stringify({ ligado, volume }))
  } catch {
    // aba anônima ou armazenamento bloqueado: a sessão funciona, só não lembra
  }
}

export default function Trilha({ dados }) {
  const volumePadrao = Number.isFinite(dados?.volumeInicial) ? dados.volumeInicial : 0.35
  const audioRef = useRef(null)
  const fadeRef = useRef(0)
  const [ligado, setLigado] = useState(false)
  const [volume, setVolume] = useState(volumePadrao)
  // a preferência só pode ser lida no navegador; no servidor ela não existe,
  // e ler durante o render daria diferença entre o HTML dos dois lados
  const [preferencia, setPreferencia] = useState(null)

  useEffect(() => {
    const p = lerPreferencia(volumePadrao)
    setPreferencia(p)
    setVolume(p.volume)
  }, [volumePadrao])

  // Sobe o volume do silêncio até o alvo. Sem isto, o primeiro toque do
  // visitante joga a música no volume cheio de uma vez.
  function subirVolume(alvo) {
    const el = audioRef.current
    if (!el) return
    cancelAnimationFrame(fadeRef.current)
    const inicio = performance.now()
    el.volume = 0
    const passo = (agora) => {
      const el2 = audioRef.current
      if (!el2) return
      const andado = Math.min(1, (agora - inicio) / FADE_MS)
      el2.volume = alvo * andado
      if (andado < 1) fadeRef.current = requestAnimationFrame(passo)
    }
    fadeRef.current = requestAnimationFrame(passo)
  }

  function tocar(comFade) {
    const el = audioRef.current
    if (!el) return
    // o src só entra agora: é isto que segura os 4,3 MB até alguém querer
    if (!el.getAttribute('src')) el.setAttribute('src', dados.arquivo)
    if (comFade) subirVolume(volume)
    else el.volume = volume
    const promessa = el.play()
    // o navegador pode recusar mesmo assim (política mais dura, aba muda):
    // recusa não quebra nada, só não toca
    if (promessa && typeof promessa.catch === 'function') {
      promessa.catch(() => setLigado(false))
    }
  }

  // O ARMAMENTO DO PRIMEIRO TOQUE.
  // Só arma se o visitante nunca escolheu, ou escolheu ligado. Quem
  // desligou fica em paz.
  useEffect(() => {
    if (!dados?.ativo || !preferencia) return undefined
    if (preferencia.ligado === false) return undefined

    const aoPrimeiroToque = () => {
      setLigado(true)
      tocar(true)
    }
    // { once: true } é o que garante o "só uma vez"
    document.addEventListener('pointerdown', aoPrimeiroToque, { once: true })
    return () => document.removeEventListener('pointerdown', aoPrimeiroToque)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dados?.ativo, preferencia])

  useEffect(() => () => cancelAnimationFrame(fadeRef.current), [])

  if (!dados?.ativo) return null

  function alternar() {
    const novo = !ligado
    setLigado(novo)
    gravarPreferencia(novo, volume)
    if (novo) {
      // o próprio clique já é a interação que o navegador exige
      tocar(true)
    } else {
      cancelAnimationFrame(fadeRef.current)
      audioRef.current?.pause()
    }
  }

  function mudarVolume(evento) {
    const novo = Number(evento.target.value)
    setVolume(novo)
    cancelAnimationFrame(fadeRef.current)
    if (audioRef.current) audioRef.current.volume = novo
    gravarPreferencia(ligado, novo)
  }

  const rotulo = ligado ? dados.rotuloDesligar : dados.rotuloLigar

  return (
    <div className={estilos.caixa} data-testid="trilha" data-ligado={ligado ? '1' : '0'}>
      {/* nasce mudo e sem fonte; quem escreve o src é tocar() */}
      <audio ref={audioRef} preload="none" loop aria-hidden="true" />

      <button type="button" className={estilos.botao} onClick={alternar} aria-label={rotulo} title={rotulo}>
        <span className={estilos.icone} aria-hidden="true">
          {ligado ? '🔊' : '🔈'}
        </span>
      </button>

      <label className={estilos.faixa}>
        <span className="visuallyHidden">{dados.rotuloVolume}</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={mudarVolume}
          aria-label={dados.rotuloVolume}
        />
      </label>
    </div>
  )
}
