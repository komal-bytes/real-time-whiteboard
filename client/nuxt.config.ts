// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/ui', '@nuxtjs/tailwindcss'],
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  app: {
    head: {
      script: [
        {
          src: "https://cdn.jsdelivr.net/npm/fabric@latest/dist/index.min.js",
          async: true, // Load asynchronously
          defer: true, // Load after HTML parsing
        },
      ]
    }
  }
})
