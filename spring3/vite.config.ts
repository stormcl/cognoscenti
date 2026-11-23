import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Relative asset urls, so the same dist works in any Tomcat folder.
  base: './',
  plugins: [react()],
  server: {
    proxy: {
      '/weaver/': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
