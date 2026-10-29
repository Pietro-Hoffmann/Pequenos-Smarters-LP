import { describe, it, expect } from 'vitest'
import { montarMailto, montarWhatsapp, temContato } from '@/lib/links'

describe('montarMailto', () => {
  it('devolve null quando não há e-mail', () => {
    expect(montarMailto('', 'Licenciamento')).toBeNull()
    expect(montarMailto(undefined, 'Licenciamento')).toBeNull()
  })

  it('monta o mailto com o assunto codificado', () => {
    expect(montarMailto('oi@exemplo.com', 'Licenciamento — Pequenos Smarters')).toBe(
      'mailto:oi@exemplo.com?subject=Licenciamento%20%E2%80%94%20Pequenos%20Smarters'
    )
  })

  it('tira os espaços sobrando que a dona pode digitar sem querer', () => {
    expect(montarMailto('  oi@exemplo.com  ', 'Licenciamento')).toBe(
      'mailto:oi@exemplo.com?subject=Licenciamento'
    )
  })

  it('devolve null quando só sobrou espaço em branco', () => {
    expect(montarMailto('   ', 'Licenciamento')).toBeNull()
  })
})

describe('montarWhatsapp', () => {
  it('devolve null quando não há número', () => {
    expect(montarWhatsapp('', 'oi')).toBeNull()
  })

  it('devolve null quando o número não tem dígito nenhum', () => {
    expect(montarWhatsapp('(  ) ---', 'oi')).toBeNull()
  })

  it('limpa a pontuação do número e codifica a mensagem', () => {
    expect(montarWhatsapp('+55 (51) 99999-9999', 'Olá! Quero saber mais')).toBe(
      'https://wa.me/5551999999999?text=Ol%C3%A1!%20Quero%20saber%20mais'
    )
  })

  it('tira os espaços sobrando em volta do número', () => {
    expect(montarWhatsapp('  5551999999999  ', 'oi')).toBe('https://wa.me/5551999999999?text=oi')
  })

  it('devolve null quando falta o código do país (menos de 12 dígitos)', () => {
    // (51) 99999-9999 tem 11 dígitos: sem o 55 na frente o wa.me levaria
    // a uma conta que não existe, então é melhor não mostrar o cartão.
    expect(montarWhatsapp('(51) 99999-9999', 'oi')).toBeNull()
    expect(montarWhatsapp('51999999999', 'oi')).toBeNull()
  })

  it('aceita o número a partir de 12 dígitos', () => {
    expect(montarWhatsapp('555199999999', 'oi')).toBe('https://wa.me/555199999999?text=oi')
  })
})

describe('temContato', () => {
  it('é falso quando os dois canais estão vazios', () => {
    expect(temContato({ email: '', whatsapp: '' })).toBe(false)
    expect(temContato(undefined)).toBe(false)
  })

  it('é verdadeiro com qualquer um dos dois preenchido', () => {
    expect(temContato({ email: 'oi@exemplo.com', whatsapp: '' })).toBe(true)
    expect(temContato({ email: '', whatsapp: '5551999999999' })).toBe(true)
  })

  it('é falso quando o WhatsApp está curto demais para virar link', () => {
    // combina com montarWhatsapp: se o cartão não vai aparecer, o link
    // "Contato" do menu também não pode aparecer.
    expect(temContato({ email: '', whatsapp: '51999999999' })).toBe(false)
  })
})
