export type EntityType = 'categories' | 'trns' | 'userSettings' | 'wallets'

export type OfflineOpData = Record<string, unknown>

export type OfflineOp = {
  data?: OfflineOpData
  entity: EntityType
  id: string
  timestamp: number
  type: 'create' | 'delete' | 'update'
}

/** Accepted input for pushOfflineOp — allows typed domain objects */
export type OfflineOpInput = Omit<OfflineOp, 'data' | 'timestamp'> & {
  data?: Record<string, unknown>
}
