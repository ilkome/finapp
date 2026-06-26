import type { RecurrenceId } from '~/components/recurrences/types'

type Item = { color?: 'error', icon: string, label: string, onSelect: () => void }

/** Context-menu items for a recurrence row (mirrors useWalletMenuItems). */
export function useRecurrenceMenuItems() {
  const { t } = useI18n()

  return {
    cancel(id: RecurrenceId, onCancel: (id: RecurrenceId) => void): Item {
      return {
        icon: 'lucide:circle-x',
        label: t('recurrences.actions.cancel'),
        onSelect: () => onCancel(id),
      }
    },

    delete(id: RecurrenceId, onDelete: (id: RecurrenceId) => void): Item {
      return {
        color: 'error',
        icon: 'lucide:trash-2',
        label: t('base.delete'),
        onSelect: () => onDelete(id),
      }
    },

    edit(id: RecurrenceId, onEdit: (id: RecurrenceId) => void): Item {
      return {
        icon: 'lucide:pencil',
        label: t('base.edit'),
        onSelect: () => onEdit(id),
      }
    },

    pause(id: RecurrenceId, onPause: (id: RecurrenceId) => void): Item {
      return {
        icon: 'lucide:pause',
        label: t('recurrences.actions.pause'),
        onSelect: () => onPause(id),
      }
    },

    resume(id: RecurrenceId, onResume: (id: RecurrenceId) => void): Item {
      return {
        icon: 'lucide:play',
        label: t('recurrences.actions.resume'),
        onSelect: () => onResume(id),
      }
    },

    skipNext(id: RecurrenceId, onSkip: (id: RecurrenceId) => void): Item {
      return {
        icon: 'lucide:skip-forward',
        label: t('recurrences.actions.skipNext'),
        onSelect: () => onSkip(id),
      }
    },
  }
}
