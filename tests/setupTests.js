// Archivo de configuración para los tests (se ejecuta antes de cada suite)
// Provee un polyfill global para fetch y otras utilidades de test en jsdom.
import 'whatwg-fetch'
// Opcional: importar jest-dom matchers si se usan asserts en DOM
import '@testing-library/jest-dom'
