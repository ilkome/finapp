import { onMounted, onUnmounted } from 'nuxt-composition-api'

export default function (el = window, name, handler) {
  const remove = () => el && el.removeEventListener(name, handler)

  onMounted(() => el && el.addEventListener(name, handler))
  onUnmounted(remove)

  return remove
}
