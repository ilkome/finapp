import Vue3Toastify, { type ToastOptions, toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(Vue3Toastify, {
    autoClose: 5000,
    icon: false,
    limit: 3,
    multiple: true,
    position: toast.POSITION.TOP_LEFT,
    theme: 'auto',
    transition: 'zoom',
  } as ToastOptions)

  return {
    provide: { toast },
  }
})
