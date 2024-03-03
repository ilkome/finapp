import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { child, get, getDatabase, off, onValue, ref, remove, set, update } from 'firebase/database'
import { config } from '~/services/firebase/config'

export const app = initializeApp(config)
export const db = getDatabase(app)
export const auth = getAuth(app)

export function getDataOnce(path) {
  return new Promise((resolve) => {
    get(child(ref(db), path))
      .then((snapshot) => {
        if (snapshot)
          return resolve(snapshot.val())
        resolve(false)
      })
      .catch((error) => {
        console.log(error.message)
        resolve()
      })
  })
}

export function getDataAndWatch(path, callback) {
  onValue(ref(db, path), (snapshot) => {
    const data = snapshot.val()
    return callback(data)
  })
}

export function updateData(path, updates) {
  return update(ref(db, path), updates)
}

export function removeData(path) {
  return remove(ref(db, path))
}

export async function saveData(path, value) {
  return await set(ref(db, path), value)
}

export function unsubscribeData(path) {
  return off(ref(db, path))
}
