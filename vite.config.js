import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    open: true, // Automatically open the browser when the server starts
    port: 5173, // Specify a default port
    host: true  // Allow external connections
  }
})
