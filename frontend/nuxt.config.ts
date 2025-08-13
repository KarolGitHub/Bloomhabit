// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt'],
  css: ['~/assets/scss/main.scss'],
  app: {
    head: {
      title: 'Bloomhabit - Grow Your Best Self',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'Transform your habits into a beautiful garden. Watch them bloom with consistency and gently wilt when neglected.',
        },
        { name: 'theme-color', content: '#22c55e' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
        { name: 'apple-mobile-web-app-title', content: 'Bloomhabit' },
        { name: 'msapplication-TileColor', content: '#22c55e' },
        { name: 'msapplication-config', content: '/browserconfig.xml' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        {
          rel: 'apple-touch-icon',
          sizes: '180x180',
          href: '/apple-touch-icon.png',
        },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '32x32',
          href: '/favicon-32x32.png',
        },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '16x16',
          href: '/favicon-16x16.png',
        },
        { rel: 'manifest', href: '/site.webmanifest' },
        { rel: 'mask-icon', href: '/safari-pinned-tab.svg', color: '#22c55e' },
      ],
      script: [
        // Foundation JS for interactive components
        {
          src: 'https://cdn.jsdelivr.net/npm/foundation-sites@6.7.5/dist/js/foundation.min.js',
        },
      ],
    },
  },
  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE_URL || 'http://localhost:3000',
      appName: 'Bloomhabit',
      appVersion: '1.0.0',
    },
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@import "~/assets/scss/_foundation-settings.scss";',
        },
      },
    },
  },
  // PWA Configuration
  nitro: {
    prerender: {
      routes: ['/'],
    },
  },
  experimental: {
    payloadExtraction: false,
  },
});
