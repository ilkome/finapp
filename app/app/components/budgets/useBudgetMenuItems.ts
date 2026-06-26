import type { BudgetId } from '~/components/budgets/types'

type Item = { color?: 'error', icon: string, label: string, onSelect: () => void }

/** Context-menu items for a budget row (mirrors useWalletMenuItems). */
export function useBudgetMenuItems() {
  const { t } = useI18n()

  return {
    archive(budgetId: BudgetId, onArchive: (id: BudgetId) => void): Item {
      return {
        icon: 'lucide:archive',
        label: t('budgets.archive'),
        onSelect: () => onArchive(budgetId),
      }
    },

    delete(budgetId: BudgetId, onDelete: (id: BudgetId) => void): Item {
      return {
        color: 'error',
        icon: 'lucide:trash-2',
        label: t('base.delete'),
        onSelect: () => onDelete(budgetId),
      }
    },

    edit(budgetId: BudgetId, onEdit: (id: BudgetId) => void): Item {
      return {
        icon: 'lucide:pencil',
        label: t('base.edit'),
        onSelect: () => onEdit(budgetId),
      }
    },

    history(budgetId: BudgetId, onHistory: (id: BudgetId) => void): Item {
      return {
        icon: 'lucide:chart-no-axes-column',
        label: t('budgets.history.action'),
        onSelect: () => onHistory(budgetId),
      }
    },

    move(budgetId: BudgetId, onMove: (id: BudgetId) => void): Item {
      return {
        icon: 'lucide:arrow-left-right',
        label: t('budgets.move.action'),
        onSelect: () => onMove(budgetId),
      }
    },

    unarchive(budgetId: BudgetId, onUnarchive: (id: BudgetId) => void): Item {
      return {
        icon: 'lucide:archive-restore',
        label: t('budgets.unarchive'),
        onSelect: () => onUnarchive(budgetId),
      }
    },
  }
}
