import { statConfigOverlayOwnerKey } from '~/components/stat/injectionKeys'

export function resolveStatConfigOverlayOpen(activeOwnerId: string | null, ownerId: string | null) {
  return activeOwnerId !== null && (ownerId === null || activeOwnerId === ownerId)
}

export function useStatConfigOverlay() {
  const ownerId = inject(statConfigOverlayOwnerKey, null)
  const activeOwnerId = useState<string | null>('stat-config-overlay-owner', () => null)
  const isOpen = computed(() => resolveStatConfigOverlayOpen(activeOwnerId.value, ownerId))

  function close() {
    if (ownerId === null || activeOwnerId.value === ownerId)
      activeOwnerId.value = null
  }

  function open() {
    if (ownerId !== null)
      activeOwnerId.value = ownerId
  }

  return { close, isOpen, open }
}
