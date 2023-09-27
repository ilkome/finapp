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

export const updateData = (path, updates) => update(ref(db, path), updates)

export const removeData = path => remove(ref(db, path))

export const saveData = async (path, value) => await set(ref(db, path), value)

export const unsubscribeData = path => off(ref(db, path))
