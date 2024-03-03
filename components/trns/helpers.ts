import dayjs from 'dayjs'
import localforage from 'localforage'
import type { DateValueOf } from '~/components/date/types'
import type { TrnId, TrnItem } from '~/components/trns/types'

/**
 * Get the oldest Transaction date
 */
export function getOldestTrnDate(trnsItems: Record<TrnId, TrnItem>): DateValueOf {
  const startOfToday = dayjs().startOf('day').valueOf()
  const minDate = Math.min(...Object.values(trnsItems).map(trn => trn.date))
  return minDate || startOfToday
}

const rootPath = 'finapp3.trns.offline'

const actions = {
  delete: 'delete',
  update: 'update',
} as const

async function getLocalTrns(path: keyof typeof actions): Promise<TrnId[]> {
  const generatedPath = `${rootPath}.${path}` as const
  return await localforage.getItem(generatedPath) || []
}

// save added trn to local
export async function saveTrnToAddLaterLocal({ id, values }) {
  const trns = await localforage.getItem('finapp.trns.offline.update') || {}
  await localforage.setItem('finapp.trns.offline.update', {
    ...trns,
    [id]: values,
  })
}

// remove added trn from local
export async function removeTrnToAddLaterLocal(id) {
  const trns = await localforage.getItem('finapp.trns.offline.update') || {}
  if (trns[id]) {
    delete trns[id]
    await localforage.setItem('finapp.trns.offline.update', trns || {})
  }
}

// save deleted trn to local
export async function saveTrnIDforDeleteWhenClientOnline(id: TrnId) {
  const ids: TrnId[] = await localforage.getItem('finapp.trns.offline.delete')

  if (ids.includes(id))
    return

  ids.push(id)
  await localforage.setItem('finapp.trns.offline.delete', ids)
}

// remove deleted trn from local
export async function removeTrnToDeleteLaterLocal(id: TrnId) {
  const ids: TrnId[] = await localforage.getItem('finapp.trns.offline.delete')

  const trnId = ids.find(trnId => trnId === id)
  if (!trnId)
    return

  const newIds = ids.filter(trnId => trnId !== id)
  await localforage.setItem('finapp.trns.offline.delete', newIds)
}
