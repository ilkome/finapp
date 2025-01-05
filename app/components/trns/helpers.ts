import localforage from 'localforage'

import type { TrnId, Trns } from '~/components/trns/types'

// save added trn to local
export async function saveTrnToAddLaterLocal({ id, values }: Trns) {
  const trns: Trns = await localforage.getItem('finapp.trns.offline.update') || {}
  await localforage.setItem('finapp.trns.offline.update', {
    ...trns,
    [id]: values,
  })
}

// remove added trn from local
export async function removeTrnToAddLaterLocal(id: TrnId) {
  const trns: Trns = await localforage.getItem('finapp.trns.offline.update') || {}
  if (trns[id]) {
    delete trns[id]
    await localforage.setItem('finapp.trns.offline.update', trns || {})
  }
}

// save deleted trn to local
export async function saveTrnIdForDeleteWhenClientOnline(id: TrnId) {
  const ids: TrnId[] = await localforage.getItem('finapp.trns.offline.delete') ?? []

  if (ids?.includes(id))
    return

  ids?.push(id)
  await localforage.setItem('finapp.trns.offline.delete', ids)
}

// remove deleted trn from local
export async function removeTrnToDeleteLaterLocal(id: TrnId) {
  const ids: TrnId[] = await localforage.getItem('finapp.trns.offline.delete') ?? []

  const trnId = ids.find(trnId => trnId === id)
  if (!trnId)
    return

  const newIds = ids.filter(trnId => trnId !== id)
  await localforage.setItem('finapp.trns.offline.delete', newIds)
}
