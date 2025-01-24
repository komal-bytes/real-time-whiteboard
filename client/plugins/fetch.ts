export default defineNuxtPlugin((nuxtApp) => {
  
    const $api = $fetch.create({
      baseURL: 'http://localhost:8787',
    })
  
    return {
      provide: {
        customFetch: $api
      }
    }
  })
  