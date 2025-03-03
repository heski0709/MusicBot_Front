import vue from '@vitejs/plugin-vue'
import autoprefixer from 'autoprefixer'
import path from 'node:path'
import tailwind from 'tailwindcss'
import { defineConfig } from 'vite'
import Components from 'unplugin-vue-components/vite'

export default defineConfig({
  css: {
    postcss: {
      plugins: [tailwind(), autoprefixer()],
    },
  },
  plugins: [vue(), Components()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    },
  },
  server: {
    port: 3000
  }
})