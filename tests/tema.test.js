import { describe, it, expect, beforeEach, vi } from 'vitest'

// O clima da página tem DOIS donos possíveis ao mesmo tempo: a rolagem e o
// carrossel das ilhas. Quem decide quem ganha é o lib/tema.js, e é esta a
// parte que mais tem como quebrar — daí este arquivo inteiro só para ela.
//
// O módulo guarda estado entre as chamadas, então cada teste recarrega uma
// cópia limpa dele.
async function carregar() {
  vi.resetModules()
  const mod = await import('@/lib/tema')
  document.documentElement.removeAttribute('data-tema')
  return mod
}

const climaDaPagina = () => document.documentElement.getAttribute('data-tema')

describe('quem manda no clima da página', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-tema')
  })

  it('a rolagem pinta a página com o clima da seção em cena', async () => {
    const { definirTemaDeRolagem } = await carregar()
    definirTemaDeRolagem('ceu')
    expect(climaDaPagina()).toBe('ceu')
  })

  it('o carrossel ganha da rolagem enquanto tiver algo a dizer', async () => {
    const { definirTemaDeRolagem, definirTemaDaIlha } = await carregar()
    definirTemaDeRolagem('ceu')
    definirTemaDaIlha('fogo')
    expect(climaDaPagina()).toBe('fogo')
  })

  it('a ordem das chamadas não muda o resultado: o carrossel ganha igual', async () => {
    const { definirTemaDeRolagem, definirTemaDaIlha } = await carregar()
    definirTemaDaIlha('gelo')
    definirTemaDeRolagem('ceu')
    expect(climaDaPagina()).toBe('gelo')
  })

  it('quando o carrossel devolve o comando, volta o clima da rolagem', async () => {
    const { definirTemaDeRolagem, definirTemaDaIlha, devolverOComando } = await carregar()
    definirTemaDeRolagem('ceu')
    definirTemaDaIlha('lagos')
    expect(climaDaPagina()).toBe('lagos')

    devolverOComando()
    expect(climaDaPagina()).toBe('ceu')
  })

  it('devolver o comando duas vezes seguidas não faz mal nenhum', async () => {
    const { definirTemaDaIlha, devolverOComando } = await carregar()
    definirTemaDaIlha('vento')
    devolverOComando()
    devolverOComando()
    expect(climaDaPagina()).toBe('ceu')
  })

  it('sem ninguém falar nada, a página fica no céu de sempre', async () => {
    const { devolverOComando, TEMA_PADRAO } = await carregar()
    devolverOComando()
    // o devolver não teve o que devolver, então o atributo nem foi escrito:
    // vale o que já veio no HTML
    expect(climaDaPagina()).toBeNull()
    expect(TEMA_PADRAO).toBe('ceu')
  })

  it('ir e voltar pela seção das ilhas nunca deixa a página no clima errado', async () => {
    const { definirTemaDeRolagem, definirTemaDaIlha, devolverOComando } = await carregar()

    // rolando até as ilhas
    definirTemaDeRolagem('ceu')
    definirTemaDaIlha('deserto')
    expect(climaDaPagina()).toBe('deserto')

    // trocando de ilha dentro da seção
    definirTemaDaIlha('fogo')
    expect(climaDaPagina()).toBe('fogo')

    // rolando para longe: o carrossel devolve e a rolagem reassume
    devolverOComando()
    definirTemaDeRolagem('ceu')
    expect(climaDaPagina()).toBe('ceu')

    // e voltando: a ilha que estava escolhida pinta de novo
    definirTemaDaIlha('fogo')
    expect(climaDaPagina()).toBe('fogo')
  })

  it('tema vazio ou errado cai no céu de sempre em vez de apagar a página', async () => {
    const { definirTemaDeRolagem, definirTemaDaIlha } = await carregar()
    definirTemaDaIlha('')
    definirTemaDeRolagem('')
    expect(climaDaPagina()).toBe('ceu')
  })
})
