
import { defineConfig } from 'vite'
import { resolve } from 'path'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
    base: '/liquid-paperwallet/',
    plugins: [
        nodePolyfills(),
    ],
    esbuild: {
        minifyIdentifiers: false,
        keepNames: true,
    },
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html')
            },
        },
    }
})