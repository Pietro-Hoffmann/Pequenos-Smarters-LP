import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import fs from 'node:fs'
import path from 'node:path'
import { site } from '@/content/site'
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

// ---------------------------------------------------------------------------
// O ARQUIVO DO VÍDEO (entrou em 3/11)
//
// A regra de estado vazio desta página é "ou existe de verdade, ou não
// existe": campo vazio mostra "Gameplay em breve" e pronto. O buraco que
// faltava fechar é o do MEIO — um caminho escrito no painel apontando
// para um arquivo que não está lá. Isso não cai em nenhum dos dois
// estados: o telão fica escuro, o player aparece, e o que a pessoa vê é
// um retângulo preto quebrado. É o pior dos três e era o único sem
// guarda.
// ---------------------------------------------------------------------------
describe('o arquivo apontado pelo painel de controle', () => {
  it('se há um caminho escrito, o arquivo existe mesmo em public/', () => {
    const src = site.video.src
    if (!src) return // vazio é um estado legítimo: cai no "em breve"
    expect(src.startsWith('/'), 'o caminho tem de começar com /').toBe(true)
    const noDisco = path.join(process.cwd(), 'public', src)
    expect(
      fs.existsSync(noDisco),
      'o painel aponta para ' + src + ', que não está em public/ — o telão ' +
        'vai mostrar um retângulo preto quebrado em vez do "em breve"',
    ).toBe(true)
  })

  it('a capa também existe', () => {
    const poster = site.video.poster
    if (!poster) return
    expect(fs.existsSync(path.join(process.cwd(), 'public', poster))).toBe(true)
  })

  it('o vídeo não trafega num tamanho que ninguém baixa', () => {
    // O original do celular tinha 830 MB (gravado a 90 quadros por
    // segundo). Acima de 100 MB o GitHub recusa o arquivo e o site nem
    // publica; bem antes disso já é cruel com quem abre pelo celular.
    const src = site.video.src
    if (!src) return
    const mb = fs.statSync(path.join(process.cwd(), 'public', src)).size / 1024 / 1024
    expect(mb, 'o vídeo passou de 60 MB — reduza antes de subir').toBeLessThan(60)
  })

  it('o player não baixa o vídeo sozinho, e não sequestra a tela no iPhone', () => {
    const { container } = render(<Video video={{ ...base, src: '/video/gameplay.mp4' }} />)
    const player = container.querySelector('video')
    expect(player.getAttribute('preload'), 'preload auto baixa tudo sem pedir').toBe('metadata')
    expect(player.hasAttribute('playsinline'), 'sem isto o Safari do iPhone abre em tela cheia').toBe(true)
    // pedido do dono em 3/11: ao acabar, recomeça sozinho
    expect(player.hasAttribute('loop'), 'o vídeo parou de repetir').toBe(true)
  })
})
