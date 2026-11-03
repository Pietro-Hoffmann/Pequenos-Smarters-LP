'use client'

import { useId, useRef, useState } from 'react'
import {
  LIMITES,
  ENDERECO_DO_SERVICO,
  validarFormulario,
  ehRobo,
  montarEnvio,
} from '@/lib/formulario'
import estilos from './FormularioContato.module.css'

// ---------------------------------------------------------------------------
// A CAIXA DE MENSAGEM DO "FALE COM A GENTE"
//
// A página é estática e não tem servidor que mande e-mail. Quem manda é o
// Web3Forms: recebe o pacote com a chave e repassa para o e-mail dono
// dela. A chave mora no painel de controle e não dá acesso a nada além de
// mandar mensagem para aquele endereço — por isso ela pode viver no HTML.
//
// SEM CHAVE, A CAIXA NÃO EXISTE. É a mesma regra de honestidade do resto
// do site: um formulário sem destino engoliria a mensagem da pessoa sem
// avisar, e isso é pior do que não ter formulário.
//
// A DECISÃO QUE MAIS IMPORTA AQUI É O QUE ACONTECE QUANDO DÁ ERRADO. Se a
// rede cair ou o serviço recusar, o que a pessoa escreveu CONTINUA NA
// CAIXA. Perder um texto longo que alguém acabou de escrever é o pior
// desfecho possível, e é o que acontece quando se limpa o formulário cedo
// demais.
// ---------------------------------------------------------------------------

export default function FormularioContato({ dados, assunto }) {
  const id = useId()
  const [campos, setCampos] = useState({ nome: '', email: '', mensagem: '' })
  const [erros, setErros] = useState({})
  const [estado, setEstado] = useState('parado') // parado | enviando | enviado | falhou
  const avisoRef = useRef(null)
  // A TRAVA CONTRA DUPLO ENVIO É UM REF, E NÃO O ESTADO.
  // `estado` só vira 'enviando' no próximo render; dois cliques rápidos
  // acontecem antes disso e os DOIS veem 'parado' — a mensagem sairia
  // duas vezes. O ref muda na hora. É o mesmo erro que já custou caro no
  // laço de animação das ilhas: marcar depois é marcar tarde.
  const enviandoRef = useRef(false)

  if (!dados || !String(dados.chave ?? '').trim()) return null

  const avisos = dados.avisos || {}
  const textoDoErro = (campo) => {
    const chave = erros[campo]
    if (!chave) return null
    return (avisos[campo] && avisos[campo][chave]) || 'Confira este campo.'
  }

  function escrever(campo) {
    return (evento) => {
      const valor = evento.target.value
      setCampos((atual) => ({ ...atual, [campo]: valor }))
      // o aviso some assim que a pessoa começa a corrigir, em vez de
      // ficar piscando vermelho enquanto ela digita
      if (erros[campo]) {
        setErros((atual) => {
          const novo = { ...atual }
          delete novo[campo]
          return novo
        })
      }
    }
  }

  async function enviar(evento) {
    evento.preventDefault()
    if (enviandoRef.current) return

    // O CAMPO ESCONDIDO: se veio preenchido, é robô. A resposta é fingir
    // que deu certo — avisar que foi barrado só ensinaria o robô a passar.
    const escondido = evento.target.elements.botcheck
    if (ehRobo(escondido && escondido.value)) {
      setEstado('enviado')
      return
    }

    const conferido = validarFormulario(campos)
    if (!conferido.ok) {
      setErros(conferido.erros)
      setEstado('parado')
      return
    }

    const pacote = montarEnvio({ chave: dados.chave, ...campos, assunto })
    if (!pacote) return

    enviandoRef.current = true
    setEstado('enviando')
    try {
      const resposta = await fetch(ENDERECO_DO_SERVICO, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(pacote),
      })
      if (!resposta.ok) throw new Error('o serviço recusou')
      setEstado('enviado')
      // só aqui a caixa é limpa: depois de a mensagem ter saído de verdade
      setCampos({ nome: '', email: '', mensagem: '' })
    } catch (erro) {
      // a mensagem escrita FICA. É o ponto mais importante deste arquivo.
      setEstado('falhou')
    } finally {
      enviandoRef.current = false
    }
    // leva o foco ao aviso para quem usa leitor de tela saber o desfecho
    if (avisoRef.current) avisoRef.current.focus()
  }

  const enviando = estado === 'enviando'

  return (
    <form className={estilos.caixa} onSubmit={enviar} noValidate data-testid="formulario-contato">
      {dados.titulo && <h3 className={estilos.titulo}>{dados.titulo}</h3>}

      {/* O AVISO DE ERRO FICA FORA DO <label>, e isso não é detalhe de
          marcação. Dentro dele, o texto do erro entra no NOME ACESSÍVEL do
          campo: o leitor de tela passa a anunciar "Seu nome Escreva o seu
          nome" como se fosse o rótulo, e ainda repete o aviso pelo
          aria-describedby. O label leva só o rótulo; o aviso é amarrado
          ao campo por aria-describedby, que é para o que ele serve. */}
      <div className={estilos.linha}>
        <div className={estilos.campo}>
          <label className={estilos.rotulo} htmlFor={`${id}-nome`}>
            {dados.rotuloNome}
          </label>
          <input
            id={`${id}-nome`}
            name="nome"
            type="text"
            value={campos.nome}
            onChange={escrever('nome')}
            maxLength={LIMITES.nome}
            autoComplete="name"
            aria-invalid={erros.nome ? 'true' : undefined}
            aria-describedby={erros.nome ? `${id}-erro-nome` : undefined}
            disabled={enviando}
          />
          {erros.nome && (
            <span className={estilos.aviso} id={`${id}-erro-nome`}>
              {textoDoErro('nome')}
            </span>
          )}
        </div>

        <div className={estilos.campo}>
          <label className={estilos.rotulo} htmlFor={`${id}-email`}>
            {dados.rotuloEmail}
          </label>
          <input
            id={`${id}-email`}
            name="email"
            type="email"
            value={campos.email}
            onChange={escrever('email')}
            maxLength={LIMITES.email}
            autoComplete="email"
            aria-invalid={erros.email ? 'true' : undefined}
            aria-describedby={erros.email ? `${id}-erro-email` : undefined}
            disabled={enviando}
          />
          {erros.email && (
            <span className={estilos.aviso} id={`${id}-erro-email`}>
              {textoDoErro('email')}
            </span>
          )}
        </div>
      </div>

      <div className={estilos.campo}>
        <label className={estilos.rotulo} htmlFor={`${id}-mensagem`}>
          {dados.rotuloMensagem}
        </label>
        <textarea
          id={`${id}-mensagem`}
          name="mensagem"
          rows={5}
          value={campos.mensagem}
          onChange={escrever('mensagem')}
          maxLength={LIMITES.mensagem}
          placeholder={dados.dicaMensagem}
          aria-invalid={erros.mensagem ? 'true' : undefined}
          aria-describedby={erros.mensagem ? `${id}-erro-mensagem` : undefined}
          disabled={enviando}
        />
        {erros.mensagem && (
          <span className={estilos.aviso} id={`${id}-erro-mensagem`}>
            {textoDoErro('mensagem')}
          </span>
        )}
      </div>

      {/* O CAMPO ESCONDIDO contra robô. Fica fora da tela em vez de
          display:none porque alguns robôs ignoram campo escondido por
          display — e continua fora do caminho do teclado pelo tabIndex. */}
      <input
        className="visuallyHidden"
        type="text"
        name="botcheck"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      <div className={estilos.rodape}>
        <button type="submit" className="botao botaoPrincipal" disabled={enviando}>
          {enviando ? dados.botaoEnviando : dados.botao}
        </button>

        {/* aria-live para o desfecho ser anunciado sem interromper, e
            tabIndex -1 para o foco poder ser levado até aqui */}
        <p
          ref={avisoRef}
          className={estilos.desfecho}
          data-estado={estado}
          role="status"
          aria-live="polite"
          tabIndex={-1}
        >
          {estado === 'enviado' && dados.sucesso}
          {estado === 'falhou' && dados.falha}
        </p>
      </div>
    </form>
  )
}
