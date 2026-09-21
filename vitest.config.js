import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    exclude: ['**/e2e.test.js', 'node_modules/', 'test-results/'],
    coverage: {
      provider: 'v8',
      include: ['src/engine.js', 'src/game-data.js'],
      exclude: ['node_modules/'],
      thresholds: {
        auto: true,
        lines: 85,
        statements: 85,
        functions: 85,
        branches: 85,
      },
    },
  },
  server: {
    port: 8080,
    host: '0.0.0.0',
  },
});
