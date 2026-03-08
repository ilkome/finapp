import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const appDir = fileURLToPath(new URL('./app', import.meta.url))
const rootDir = fileURLToPath(new URL('.', import.meta.url))

const alias = {
  '~': appDir,
  '~~': rootDir,
}

export default defineConfig({
  resolve: { alias },
  test: {
    projects: [
      {
        resolve: { alias },
        test: {
          exclude: ['app/**/*Store.test.ts', 'app/**/useStoreSync.test.ts'],
          include: ['app/**/*.test.ts', 'utils/**/*.test.ts', 'services/**/*.test.ts'],
          name: 'unit',
        },
      },
      {
        resolve: { alias },
        test: {
          environment: 'happy-dom',
          include: ['app/**/*Store.test.ts', 'app/**/useStoreSync.test.ts'],
          name: 'store',
          setupFiles: ['./app/test-utils/setup-store.ts'],
        },
      },
      {
        resolve: { alias },
        test: {
          environment: 'edge-runtime',
          include: ['convex/**/*.test.ts'],
          name: 'convex',
          setupFiles: ['./convex/test-utils/setup.ts'],
        },
      },
    ],
  },
})
