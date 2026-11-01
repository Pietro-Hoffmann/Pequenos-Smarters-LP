import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// jsdom não traz canvas de verdade: sem isto, toda montagem de um
// <canvas> cospe um "Not implemented" no console dos testes. Devolver
// null é o que um navegador muito antigo devolveria, e o componente das
// folhas já sabe lidar com isso. Quem precisa de um contexto de mentira
// para conferir o desenho (tests/folhas-canvas.test.js) põe o seu por cima.
if (typeof window !== 'undefined' && window.HTMLCanvasElement) {
  window.HTMLCanvasElement.prototype.getContext = () => null
}

afterEach(() => {
  cleanup()
})
