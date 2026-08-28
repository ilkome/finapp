export function useStatConfigOverlay() {
  const isOpen = useState<boolean>('stat-config-overlay-open', () => false)

  function close() {
    isOpen.value = false
  }

  function open() {
    isOpen.value = true
  }

  return { close, isOpen, open }
}
