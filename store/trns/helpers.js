import localforage from 'localforage'

// save added trn to local
export const saveTrnToAddLaterLocal = async ({ id, values }) => {
  const trns = await localforage.getItem('finapp.trns.offline.update')
  await localforage.setItem('finapp.trns.offline.update', {
    ...trns,
    [id]: values
  })
}

// remove added trn from local
export const removeTrnToAddLaterLocal = async (id) => {
  const trns = await localforage.getItem('finapp.trns.offline.update') || {}
  console.log('removeTrnToAddLaterLocal', trns)
  if (trns[id]) {
    delete trns[id]
    await localforage.setItem('finapp.trns.offline.update', trns || {})
    console.log(trns)
  }
}

// save deleted trn to local
export const saveTrnIDforDeleteWhenClientOnline = async (id) => {
  const trnsIds = await localforage.getItem('finapp.trns.offline.delete') || []

  if (trnsIds.includes(id)) { return }

  await localforage.setItem('finapp.trns.offline.delete', [
    ...trnsIds,
    id
  ])
}

// remove deleted trn from local
export const removeTrnToDeleteLaterLocal = async (id) => {
  const trnsIds = await localforage.getItem('finapp.trns.offline.delete') || []
  const trnId = trnsIds.find(trnId => trnId === id)
  if (trnId) {
    await localforage.setItem('finapp.trns.offline.delete', [
      ...trnsIds.filter(trnId => trnId !== id)
    ])
  }
}
