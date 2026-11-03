import { describe, it, expect } from 'vitest'
import {
  LIMITES,
  validarNome,
  validarEmail,
  validarMensagem,
  validarFormulario,
  ehRobo,
  montarEnvio,
  ENDERECO_DO_SERVICO,
} from '@/lib/formulario'

// ---------------------------------------------------------------------------
// A VALIDAÇÃO DA CAIXA DE MENSAGEM
//
// Contas puras, sem DOM: dado o que a pessoa escreveu, o que está errado.
// As funções devolvem CHAVES de erro ('vazio', 'curto', 'invalido'), nunca
// frases prontas — quem escreve as frases é o painel de controle, como
// todo o texto do site. É isso que deixa a Rafa reescrever um aviso sem
// mexer em código.
// ---------------------------------------------------------------------------

describe('validarNome', () => {
  it('aceita um nome comum', () => {
    expect(validarNome('Rafaela')).toBeNull()
    expect(validarNome('Ana Lúcia de Sá')).toBeNull()
  })

  it('recusa vazio e só espaço', () => {
    expect(validarNome('')).toBe('vazio')
    expect(validarNome('   ')).toBe('vazio')
    expect(validarNome(undefined)).toBe('vazio')
  })

  it('recusa curto demais para ser um nome', () => {
    expect(validarNome('A')).toBe('curto')
  })

  it('recusa comprido demais', () => {
    expect(validarNome('a'.repeat(LIMITES.nome + 1))).toBe('longo')
  })
})

describe('validarEmail', () => {
  it('aceita endereços de verdade', () => {
    for (const bom of [
      'pessoa@escola.com.br',
      'nome.sobrenome@gmail.com',
      'a+marcador@dominio.co',
    ]) {
      expect(validarEmail(bom), `recusou ${bom}`).toBeNull()
    }
  })

  it('recusa vazio', () => {
    expect(validarEmail('')).toBe('vazio')
    expect(validarEmail(null)).toBe('vazio')
  })

  it('recusa o que não é endereço', () => {
    for (const ruim of ['pessoa', 'pessoa@', '@dominio.com', 'pessoa@dominio', 'a b@c.com']) {
      expect(validarEmail(ruim), `aceitou ${ruim}`).toBe('invalido')
    }
  })

  it('não implica em ser restritivo demais: endereço com acento no nome passa', () => {
    // recusar endereço válido é pior que deixar passar um inválido — quem
    // confere de verdade é o servidor de e-mail, não esta página
    expect(validarEmail('joão@dominio.com.br')).toBeNull()
  })
})

describe('validarMensagem', () => {
  it('aceita uma mensagem real', () => {
    expect(validarMensagem('Gostaria de saber o preço para a minha escola.')).toBeNull()
  })

  it('recusa vazio', () => {
    expect(validarMensagem('   ')).toBe('vazio')
  })

  it('recusa curto demais para dizer alguma coisa', () => {
    expect(validarMensagem('oi')).toBe('curto')
  })

  it('recusa um texto enorme', () => {
    expect(validarMensagem('a'.repeat(LIMITES.mensagem + 1))).toBe('longo')
  })
})

describe('validarFormulario', () => {
  const bom = {
    nome: 'Rafaela',
    email: 'rafa@escola.com.br',
    mensagem: 'Quero saber sobre o licenciamento para a minha escola.',
  }

  it('um preenchimento correto passa inteiro', () => {
    const r = validarFormulario(bom)
    expect(r.ok).toBe(true)
    expect(r.erros).toEqual({})
  })

  it('devolve TODOS os erros de uma vez, não um por vez', () => {
    // obrigar a pessoa a descobrir um erro a cada envio é hostil
    const r = validarFormulario({ nome: '', email: 'nada', mensagem: 'oi' })
    expect(r.ok).toBe(false)
    expect(Object.keys(r.erros).sort()).toEqual(['email', 'mensagem', 'nome'])
  })

  it('formulário vazio não quebra', () => {
    expect(validarFormulario({}).ok).toBe(false)
    expect(validarFormulario(undefined).ok).toBe(false)
  })
})

describe('ehRobo', () => {
  it('campo escondido preenchido é robô', () => {
    // pessoa nenhuma vê esse campo; quem preenche é programa
    expect(ehRobo('qualquer coisa')).toBe(true)
  })

  it('campo escondido vazio é gente', () => {
    expect(ehRobo('')).toBe(false)
    expect(ehRobo(undefined)).toBe(false)
    expect(ehRobo('   ')).toBe(false)
  })
})

describe('montarEnvio', () => {
  const dados = {
    chave: 'abc-123',
    nome: '  Rafaela  ',
    email: ' rafa@escola.com.br ',
    mensagem: '  Quero saber do preço.  ',
    assunto: 'Contato pelo site',
  }

  it('monta o pacote com a chave e os campos limpos', () => {
    const p = montarEnvio(dados)
    expect(p.access_key).toBe('abc-123')
    expect(p.name).toBe('Rafaela')
    expect(p.email).toBe('rafa@escola.com.br')
    expect(p.message).toBe('Quero saber do preço.')
    expect(p.subject).toBe('Contato pelo site')
  })

  it('o endereço do serviço é https', () => {
    // a mensagem leva nome e e-mail de alguém: não pode trafegar em claro
    expect(ENDERECO_DO_SERVICO).toMatch(/^https:\/\//)
  })

  it('sem chave não monta pacote nenhum', () => {
    expect(montarEnvio({ ...dados, chave: '' })).toBeNull()
    expect(montarEnvio({ ...dados, chave: undefined })).toBeNull()
  })
})
