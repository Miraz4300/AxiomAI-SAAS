import path from 'node:path'
import process from 'node:process'
import type { PluginOption } from 'vite'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

function setupPlugins({ VITE_GLOB_APP_PWA }: ImportMetaEnv): PluginOption[] {
  return [
    vue(),
    VITE_GLOB_APP_PWA === 'true' && VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        clientsClaim: true,
        skipWaiting: true,
      },
      manifest: {
        name: 'AxiomAI',
        short_name: 'AxiomAI',
        description: 'Generates human-like responses to text-based inputs powered by GPT',
      },
    }),
  ]
}

export default defineConfig((env) => {
  const viteEnv = loadEnv(env.mode, process.cwd()) as unknown as ImportMetaEnv

  return {
    resolve: {
      alias: { '@': path.resolve(process.cwd(), 'src') },
    },
    plugins: setupPlugins(viteEnv),
    server: {
      host: '0.0.0.0',
      port: 4300,
      open: false,
      proxy: {
        '/axiomnode': {
          target: viteEnv.VITE_APP_API_BASE_URL,
          changeOrigin: true,
          rewrite: path => path.replace('/axiomnode/', '/'),
        },
        '/uploads': {
          target: viteEnv.VITE_APP_API_BASE_URL,
          changeOrigin: true,
        },
      },
    },
    build: {
      reportCompressedSize: false,
      sourcemap: false,
      commonjsOptions: { ignoreTryCatch: false },
    },
  }
})
