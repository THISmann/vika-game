module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/integration/**/*.test.js'],
  testTimeout: 30000,
  verbose: true,
  collectCoverage: false,
  // Les tests d'intégration nécessitent que les services soient démarrés
  // Ils ne doivent pas être exécutés dans CI/CD sans services
  bail: false
}

