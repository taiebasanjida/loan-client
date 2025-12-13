import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // Proxy removed - using Vercel backend directly via axios baseURL
    // If you need to use local backend, uncomment and set target to 'http://localhost:5000'
    // proxy: {
    //   '/api': {
    //     target: 'https://loan-link-server-ten.vercel.app',
    //     changeOrigin: true,
    //   }
    // }
  }
})

