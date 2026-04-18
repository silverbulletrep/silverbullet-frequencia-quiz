import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import viteCompression from 'vite-plugin-compression'
import { existsSync, createReadStream } from 'node:fs'
import { resolve } from 'node:path'

/**
 * Serve /chat-web/ como arquivos estáticos no dev server.
 * Em produção, essa pasta fica na raiz do domínio e é servida diretamente pelo Apache/Nginx.
 * Em dev, o Vite não serve arquivos fora de public/, então adicionamos este middleware.
 */
function serveStaticChatWeb(): Plugin {
  return {
    name: 'serve-chat-web',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith('/chat-web/')) return next()
        // Usa process.cwd() pois __dirname não é acessível em ESM puro sem shims
        const filePath = resolve(process.cwd(), req.url.slice(1)) // remove leading /
        if (existsSync(filePath)) {
          const ext = filePath.split('.').pop() || ''
          const mime: Record<string, string> = {
            html: 'text/html; charset=utf-8',
            js: 'application/javascript',
            css: 'text/css',
            png: 'image/png',
            webp: 'image/webp',
            svg: 'image/svg+xml',
          }
          res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream' })
          createReadStream(filePath).pipe(res)
        } else {
          next()
        }
      })
    },
  }
}

/**
 * SPA fallback for `vite preview --outDir dist`.
 * The built-in Vite fallback looks for dist/index.html (root),
 * but our index lives at dist/main/index.html due to outDir: 'dist/main'.
 * This plugin runs AFTER static file serving and returns the correct
 * index.html for any unmatched route under /main/.
 */
function previewSpaFallback(): Plugin {
  return {
    name: 'preview-spa-fallback',
    configurePreviewServer(server: { middlewares: { use: (fn: (req: import('node:http').IncomingMessage, res: import('node:http').ServerResponse) => void) => void } }) {
      return () => {
        server.middlewares.use((_req: import('node:http').IncomingMessage, res: import('node:http').ServerResponse) => {
          const index = resolve('dist/main/index.html')
          if (existsSync(index)) {
            res.writeHead(200, { 'Content-Type': 'text/html' })
            createReadStream(index).pipe(res)
          } else {
            res.writeHead(404)
            res.end('Not Found')
          }
        })
      }
    },
  }
}

export default defineConfig(({ command }) => ({
  base: command === 'serve' ? '/' : '/main/',
  build: {
    outDir: 'dist/main',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          const n = id.replace(/\\/g, '/')
          if (!n.includes('node_modules')) return

          if (
            n.includes('/react/') ||
            n.includes('/react-dom/') ||
            n.includes('/scheduler/')
          ) {
            return 'react'
          }

          if (n.includes('/react-router-dom/') || n.includes('/@remix-run/router/')) {
            return 'router'
          }



          if (
            n.includes('/i18next/') ||
            n.includes('/react-i18next/') ||
            n.includes('/i18next-http-backend/') ||
            n.includes('/i18next-browser-languagedetector/')
          ) {
            return 'i18n'
          }

          if (
            n.includes('/framer-motion/') ||
            n.includes('/lucide-react/') ||
            n.includes('/react-hook-form/') ||
            n.includes('/zustand/') ||
            n.includes('/react-hot-toast/') ||
            n.includes('/react-loading-skeleton/') ||
            n.includes('/react-transition-group/') ||
            n.includes('/react-player/') ||
            n.includes('/clsx/') ||
            n.includes('/tailwind-merge/')
          ) {
            return 'ui'
          }

          if (n.includes('/axios/')) {
            return 'http'
          }

          return 'vendor'
        },
      },
    },
  },
    plugins: [
    react({
      babel: {
        plugins: command === 'serve' ? ['react-dev-locator'] : [],
      },
    }),
    tsconfigPaths(),
    previewSpaFallback(),
    serveStaticChatWeb(),
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
  ],
  assetsInclude: ['**/*.glb'],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    port: 3006,
    strictPort: true,
    host: true,
    proxy: {
      '/eventos': {
        target: 'https://bkend-aquisicao-worker-redis-supabase.6jcwzd.easypanel.host',
        changeOrigin: true,
        secure: true,
      },
    },
  },
  optimizeDeps: {
    exclude: ['hostinger'],
  },
  esbuild: {
    drop: command === 'serve' ? [] : ['console', 'debugger'],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    css: { modules: { classNameStrategy: 'non-scoped' } },
    setupFiles: [],
    exclude: ['node_modules/**', '.aios-core/**'],
  },
}))
