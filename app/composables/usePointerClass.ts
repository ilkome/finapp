import { usePointer } from '@vueuse/core'

export function usePointerClass() {
  const { pointerType } = usePointer()

  const pointerClasses = computed(() => ({
    mouse: pointerType.value === 'mouse' || !pointerType.value,
    touch: pointerType.value === 'touch',
  }))

  return {
    pointerClasses,
  }
}
