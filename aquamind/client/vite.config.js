import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  build: {
    modulePreload: {
      polyfill: false,
    },
  },
  plugins: [react()],
})
