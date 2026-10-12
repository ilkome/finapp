import LayoutConfirmModal from '~/components/layout/ConfirmModal.vue'

type ConfirmProps = {
  confirmLabel?: string
  description?: string
  highlight?: string
  title?: string
}

export function useConfirm() {
  const overlay = useOverlay()

  async function ask(props: ConfirmProps = {}): Promise<boolean> {
    const modal = overlay.create(LayoutConfirmModal, { destroyOnClose: true })
    return (await modal.open(props)) === true
  }

  return { ask }
}
