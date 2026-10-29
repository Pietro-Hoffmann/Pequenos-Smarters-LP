import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Video from '@/components/Video'

const base = { poster: '/images/ilha_natureza.png', titulo: 'Veja o jogo em ação', emBreve: 'Gameplay em breve' }

describe('Video', () => {
  it('mostra o aviso de "em breve" quando não há arquivo', () => {
    const { container } = render(<Video video={{ ...base, src: '' }} />)
    expect(screen.getByText('Gameplay em breve')).toBeInTheDocument()
    expect(container.querySelector('video')).toBeNull()
  })

  // O telão escuro é certo COM vídeo e errado SEM: vazio, ele era a única
  // superfície escura de uma página de céu claro, e o olho ia direto para um
  // aviso de ausência. O estado vazio ganha o tratamento claro; o estado com
  // vídeo continua escuro.
  it('sem arquivo, o telão ganha o tratamento claro', () => {
    const { container } = render(<Video video={{ ...base, src: '' }} />)
    const telao = container.querySelector('section > div > div')
    expect(telao.className).toMatch(/telaoVazio/)
  })

  it('com arquivo, o telão continua escuro: moldura escura em volta de vídeo é certo', () => {
    const { container } = render(<Video video={{ ...base, src: '/video/gameplay.mp4' }} />)
    const telao = container.querySelector('section > div > div')
    expect(telao.className).not.toMatch(/telaoVazio/)
  })

  it('mostra o player quando há arquivo', () => {
    const { container } = render(<Video video={{ ...base, src: '/video/gameplay.mp4' }} />)
    const player = container.querySelector('video')
    expect(player).not.toBeNull()
    expect(player.getAttribute('src')).toBe('/video/gameplay.mp4')
    expect(player.getAttribute('poster')).toBe('/images/ilha_natureza.png')
    expect(screen.queryByText('Gameplay em breve')).toBeNull()
  })
})
