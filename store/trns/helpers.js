import localforage from 'localforage'

// save added trn to local
export const saveTrnToAddLaterLocal = async ({ id, values }) => {
  const trns = await localforage.getItem('next.trns.offline.update')
  await localforage.setItem('next.trns.offline.update', {
    ...trns,
    [id]: values
  })
}

// remove added trn from local
export const removeTrnToAddLaterLocal = async (id) => {
  const trns = await localforage.getItem('next.trns.offline.update') || {}
  if (trns[id]) {
    delete trns[id]
    await localforage.setItem('next.trns.offline.update', trns || {})
  }
}

// save deleted trn to local
export const saveTrnToDeleteLaterLocal = async (id) => {
  const trnsIds = await localforage.getItem('next.trns.offline.delete') || []
  await localforage.setItem('next.trns.offline.delete', [
    ...trnsIds,
    id
  ])
}

// remove deleted trn from local
export const removeTrnToDeleteLaterLocal = async (id) => {
  const trnsIds = await localforage.getItem('next.trns.offline.delete') || []
  const trnId = trnsIds.find(trnId => trnId === id)
  if (trnId) {
    await localforage.setItem('next.trns.offline.delete', [
      ...trnsIds.filter(trnId => trnId !== id)
    ])
  }
}
