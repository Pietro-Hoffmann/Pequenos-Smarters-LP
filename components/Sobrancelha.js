// A etiqueta curtinha acima do título de cada seção.
// Texto vazio no painel de controle = a etiqueta some, sem deixar buraco.
export default function Sobrancelha({ texto }) {
  if (!texto) return null
  return <p className="sobrancelha" data-revelar>{texto}</p>
}
