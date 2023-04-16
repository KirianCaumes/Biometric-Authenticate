import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// eslint-disable-next-line import/no-extraneous-dependencies
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        basicSsl(),
    ],
    server: {
        https: true,
        host: true,
        open: false,
        port: 3000,
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
                changeOrigin: true,
                secure: false,
            },
        },
    },
})
