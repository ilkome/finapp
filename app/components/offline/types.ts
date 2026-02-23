export type EntityType = 'categories' | 'trns' | 'userSettings' | 'wallets'

export type OfflineOp = {
  data?: Record<string, unknown>
  entity: EntityType
  id: string
  timestamp: number
  type: 'create' | 'delete' | 'update'
}
