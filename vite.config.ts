import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [vue(), tailwindcss(), VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['brand/buffy-app-icon.svg', 'brand/buffy-apple-touch-icon.png'],
    manifest: {
      id: '/?source=pwa',
      name: 'buffy',
      short_name: 'buffy',
      description: '관광 정보와 현지 경험을 연결하는 부산 여행 커뮤니티',
      theme_color: '#14406F',
      background_color: '#ffffff',
      display: 'standalone',
      orientation: 'portrait-primary',
      scope: '/',
      start_url: '/',
      lang: 'ko',
      categories: ['travel', 'social'],
      icons: [
        { src: '/brand/buffy-icon-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: '/brand/buffy-icon-512x512.png', sizes: '512x512', type: 'image/png' },
        { src: '/brand/buffy-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
      shortcuts: [
        { name: '관광지', short_name: '관광지', url: '/attractions' },
        { name: '축제', short_name: '축제', url: '/festivals' },
        { name: '커뮤니티', short_name: '커뮤니티', url: '/boards' },
      ],
    },
  })],
  test: { environment: 'jsdom', globals: true, include: ['src/**/*.test.ts'] },
})
