import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import FormularioContato from '@/components/FormularioContato'

// ---------------------------------------------------------------------------
// A CAIXA DE MENSAGEM
//
// O QUE ESTES TESTES PROTEGEM, em ordem de importância:
//   1. a mensagem escrita NÃO SE PERDE quando o envio falha. Perder um
//      texto longo que alguém acabou de escrever é o pior desfecho
//      possível desta página;
//   2. sem chave no painel, a caixa não existe — formulário sem destino
//      engole a mensagem sem avisar;
//   3. robô é barrado sem incomodar gente;
//   4. os erros são todos mostrados de uma vez, e some ao corrigir.
// ---------------------------------------------------------------------------

const dados = {
  chave: 'chave-de-teste',
  titulo: 'Escreva para a gente',
  rotuloNome: 'Seu nome',
  rotuloEmail: 'Seu e-mail',
  rotuloMensagem: 'Sua mensagem',
  botao: 'Enviar mensagem',
  botaoEnviando: 'Enviando…',
  sucesso: 'Mensagem enviada!',
  falha: 'Não deu para enviar agora.',
  avisos: {
    nome: { vazio: 'Escreva o seu nome.', curto: 'Nome curto demais.' },
    email: { vazio: 'Escreva o seu e-mail.', invalido: 'E-mail incompleto.' },
    mensagem: { vazio: 'Escreva a sua mensagem.', curto: 'Conte mais um pouco.' },
  },
}

const MENSAGEM_LONGA =
  'Sou coordenadora de uma escola com oito turmas de alfabetização e gostaria de entender o licenciamento.'

const campo = (rotulo) => screen.getByLabelText(rotulo)
const enviar = () => fireEvent.click(screen.getByRole('button', { name: /enviar/i }))

function preencher({ nome = 'Rafaela', email = 'rafa@escola.com.br', mensagem = MENSAGEM_LONGA } = {}) {
  fireEvent.change(campo('Seu nome'), { target: { value: nome } })
  fireEvent.change(campo('Seu e-mail'), { target: { value: email } })
  fireEvent.change(campo('Sua mensagem'), { target: { value: mensagem } })
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: true })))
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('a caixa de mensagem', () => {
  it('SEM CHAVE no painel de controle, a caixa não existe', () => {
    const { container } = render(<FormularioContato dados={{ ...dados, chave: '' }} />)
    expect(container.innerHTML).toBe('')
  })

  it('sem o bloco do formulário, nada quebra', () => {
    const { container } = render(<FormularioContato />)
    expect(container.innerHTML).toBe('')
  })

  it('manda a mensagem com a chave, para o endereço do serviço', async () => {
    render(<FormularioContato dados={dados} assunto="Contato pelo site" />)
    preencher()
    enviar()

    await waitFor(() => expect(fetch).toHaveBeenCalled())
    const [endereco, opcoes] = fetch.mock.calls[0]
    expect(endereco).toMatch(/^https:\/\//)
    const corpo = JSON.parse(opcoes.body)
    expect(corpo.access_key).toBe('chave-de-teste')
    expect(corpo.name).toBe('Rafaela')
    expect(corpo.email).toBe('rafa@escola.com.br')
    expect(corpo.message).toBe(MENSAGEM_LONGA)
    expect(corpo.subject).toBe('Contato pelo site')
  })

  it('deu certo: avisa e limpa a caixa', async () => {
    render(<FormularioContato dados={dados} />)
    preencher()
    enviar()

    await screen.findByText('Mensagem enviada!')
    expect(campo('Sua mensagem')).toHaveValue('')
    expect(campo('Seu nome')).toHaveValue('')
  })

  it('DEU ERRADO: a mensagem escrita CONTINUA NA CAIXA', async () => {
    // este é O teste desta tela. Limpar o formulário cedo demais faz a
    // pessoa perder o que escreveu quando a rede oscila.
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('rede caiu'))))
    render(<FormularioContato dados={dados} />)
    preencher()
    enviar()

    await screen.findByText('Não deu para enviar agora.')
    expect(campo('Sua mensagem'), 'a mensagem foi perdida').toHaveValue(MENSAGEM_LONGA)
    expect(campo('Seu nome')).toHaveValue('Rafaela')
    expect(campo('Seu e-mail')).toHaveValue('rafa@escola.com.br')
  })

  it('o serviço recusando também preserva a mensagem', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: false, status: 422 })))
    render(<FormularioContato dados={dados} />)
    preencher()
    enviar()

    await screen.findByText('Não deu para enviar agora.')
    expect(campo('Sua mensagem')).toHaveValue(MENSAGEM_LONGA)
  })

  it('mostra TODOS os erros de uma vez, e não envia nada', () => {
    render(<FormularioContato dados={dados} />)
    enviar()

    expect(screen.getByText('Escreva o seu nome.')).toBeInTheDocument()
    expect(screen.getByText('Escreva o seu e-mail.')).toBeInTheDocument()
    expect(screen.getByText('Escreva a sua mensagem.')).toBeInTheDocument()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('e-mail incompleto é barrado antes de sair', () => {
    render(<FormularioContato dados={dados} />)
    preencher({ email: 'rafa@' })
    enviar()
    expect(screen.getByText('E-mail incompleto.')).toBeInTheDocument()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('o aviso some assim que a pessoa começa a corrigir', () => {
    render(<FormularioContato dados={dados} />)
    enviar()
    expect(screen.getByText('Escreva o seu nome.')).toBeInTheDocument()

    fireEvent.change(campo('Seu nome'), { target: { value: 'R' } })
    expect(screen.queryByText('Escreva o seu nome.')).toBeNull()
  })

  it('o campo com erro é marcado para o leitor de tela', () => {
    render(<FormularioContato dados={dados} />)
    enviar()
    expect(campo('Seu nome')).toHaveAttribute('aria-invalid', 'true')
    expect(campo('Seu nome')).toHaveAttribute('aria-describedby')
  })

  it('ROBÔ é barrado, e sem aprender que foi barrado', async () => {
    // avisar que o envio foi recusado só ensinaria o robô a passar: ele
    // recebe exatamente a mesma tela de sucesso que uma pessoa
    render(<FormularioContato dados={dados} />)
    preencher()
    const escondido = document.querySelector('input[name="botcheck"]')
    expect(escondido, 'o campo contra robô sumiu').not.toBeNull()
    fireEvent.change(escondido, { target: { value: 'http://spam.example' } })
    enviar()

    await screen.findByText('Mensagem enviada!')
    expect(fetch, 'a mensagem do robô não pode sair').not.toHaveBeenCalled()
  })

  it('o campo contra robô fica fora do caminho do teclado', () => {
    render(<FormularioContato dados={dados} />)
    const escondido = document.querySelector('input[name="botcheck"]')
    expect(escondido).toHaveAttribute('tabindex', '-1')
    expect(escondido).toHaveAttribute('aria-hidden', 'true')
  })

  it('NÃO MANDA DUAS VEZES se o envio for disparado duas vezes seguidas', async () => {
    // O botão desabilitado já cobre o clique duplo no mouse (teste
    // abaixo). Esta trava é para o que ele NÃO cobre: o Enter repetido no
    // teclado, que dispara o envio do formulário direto, sem passar pelo
    // botão. Por isso o teste dispara o submit, e não o clique.
    // A trava é um ref e não o estado: `estado` só viraria 'enviando' no
    // próximo render, e os dois envios aconteceriam antes disso.
    let soltar
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise((r) => { soltar = () => r({ ok: true }) }))
    )
    render(<FormularioContato dados={dados} />)
    preencher()
    const formulario = screen.getByTestId('formulario-contato')
    fireEvent.submit(formulario)
    fireEvent.submit(formulario)

    expect(fetch, 'a mensagem saiu duas vezes').toHaveBeenCalledTimes(1)
    soltar()
    await screen.findByText('Mensagem enviada!')
  })

  it('enquanto envia, o botão muda de texto e os campos travam', async () => {
    let soltar
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise((r) => { soltar = () => r({ ok: true }) }))
    )
    render(<FormularioContato dados={dados} />)
    preencher()
    enviar()

    expect(screen.getByRole('button', { name: 'Enviando…' })).toBeDisabled()
    expect(campo('Sua mensagem')).toBeDisabled()
    soltar()
    await screen.findByText('Mensagem enviada!')
  })

  it('o desfecho é anunciado sem interromper quem usa leitor de tela', () => {
    render(<FormularioContato dados={dados} />)
    const aviso = screen.getByRole('status')
    expect(aviso).toHaveAttribute('aria-live', 'polite')
  })
})
