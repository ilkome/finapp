import localforage from 'localforage'
import type { TrnId } from '~/components/trns/types'

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
    console.log(trns)
  }
}

// save deleted trn to local
export async function saveTrnIDforDeleteWhenClientOnline(id: TrnId) {
  const ids: TrnId[] = await getLocalTrns(actions.delete)

  if (ids.includes(id))
    return

  ids.push(id)
  await localforage.setItem('finapp.trns.offline.delete', ids)
}

// remove deleted trn from local
export async function removeTrnToDeleteLaterLocal(id: TrnId) {
  const ids: TrnId[] = await getLocalTrns(actions.delete)
  const trnId = ids.find(trnId => trnId === id)
  if (!trnId)
    return

  await localforage.setItem('finapp.trns.offline.delete', [
    ...ids.filter(trnId => trnId !== id),
  ])
}
