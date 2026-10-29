import { describe, it, expect } from 'vitest'
import {
  limitarPct,
  statusValido,
  tendenciaValida,
  estadoIlhaValido,
  tracoDoAnel,
  SETAS,
} from '@/lib/medidas'

describe('limitarPct', () => {
  it('mantém valores dentro da faixa e arredonda', () => {
    expect(limitarPct(82)).toBe(82)
    expect(limitarPct(82.6)).toBe(83)
    expect(limitarPct('64')).toBe(64)
  })
  it('limita o que passa da faixa', () => {
    expect(limitarPct(140)).toBe(100)
    expect(limitarPct(-5)).toBe(0)
  })
  it('vira 0 para o que não é número', () => {
    expect(limitarPct(undefined)).toBe(0)
    expect(limitarPct(null)).toBe(0)
    expect(limitarPct('abc')).toBe(0)
    expect(limitarPct(NaN)).toBe(0)
  })
})

describe('statusValido', () => {
  it('aceita os três estados', () => {
    expect(statusValido('bem')).toBe('bem')
    expect(statusValido('evolucao')).toBe('evolucao')
    expect(statusValido('atencao')).toBe('atencao')
  })
  it('qualquer outra coisa vira "bem"', () => {
    expect(statusValido('zzz')).toBe('bem')
    expect(statusValido(undefined)).toBe('bem')
  })
})

describe('tendenciaValida', () => {
  it('aceita as três tendências e devolve null para o resto', () => {
    expect(tendenciaValida('sobe')).toBe('sobe')
    expect(tendenciaValida('estavel')).toBe('estavel')
    expect(tendenciaValida('desce')).toBe('desce')
    expect(tendenciaValida('lateral')).toBeNull()
    expect(tendenciaValida(undefined)).toBeNull()
  })
  it('tem uma seta para cada tendência', () => {
    expect(SETAS).toEqual({ sobe: '↑', estavel: '→', desce: '↓' })
  })
})

describe('estadoIlhaValido', () => {
  it('aceita ok, atual e bloq; o resto vira bloq', () => {
    expect(estadoIlhaValido('ok')).toBe('ok')
    expect(estadoIlhaValido('atual')).toBe('atual')
    expect(estadoIlhaValido('bloq')).toBe('bloq')
    expect(estadoIlhaValido('aberta')).toBe('bloq')
    expect(estadoIlhaValido(undefined)).toBe('bloq')
  })
})

describe('tracoDoAnel', () => {
  it('calcula a circunferência e o deslocamento do traço', () => {
    const { circunferencia, deslocamento } = tracoDoAnel(50, 40)
    expect(circunferencia).toBeCloseTo(2 * Math.PI * 40, 5)
    expect(deslocamento).toBeCloseTo(circunferencia / 2, 5)
  })
  it('0% é o traço todo escondido; 100% é o traço inteiro', () => {
    expect(tracoDoAnel(0, 40).deslocamento).toBeCloseTo(tracoDoAnel(0, 40).circunferencia, 5)
    expect(tracoDoAnel(100, 40).deslocamento).toBeCloseTo(0, 5)
  })
  it('limita o pct antes de calcular', () => {
    expect(tracoDoAnel(250, 40).deslocamento).toBeCloseTo(0, 5)
  })
})
