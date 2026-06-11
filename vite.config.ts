import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './',
  server: { port: 3000 },
  build: {
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'index.html'),
        'src/content/content': resolve(__dirname, 'src/content/content.ts'),
        'src/background/service-worker': resolve(__dirname, 'src/background/service-worker.ts'),
      },
      output: {
        entryFileNames: '[name].js',
      },
    },
  },
})
