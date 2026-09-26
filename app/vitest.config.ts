import vue from '@vitejs/plugin-vue'
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
        test: {
          exclude: ['app/**/*Store.test.ts', 'app/**/useStoreSync.test.ts', 'app/**/*.view.test.ts'],
          include: ['app/**/*.test.ts', 'utils/**/*.test.ts', 'services/**/*.test.ts'],
          name: 'unit',
        },
      },
      {
        plugins: [vue()],
        test: {
          environment: 'happy-dom',
          include: ['app/**/*.view.test.ts'],
          name: 'view',
          setupFiles: ['./app/test-utils/setup-view.ts'],
        },
      },
      {
        test: {
          environment: 'happy-dom',
          include: ['app/**/*Store.test.ts', 'app/**/useStoreSync.test.ts'],
          name: 'store',
          setupFiles: ['./app/test-utils/setup-store.ts'],
        },
      },
    ],
  },
})
