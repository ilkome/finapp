import { initializeApp } from 'firebase/app'
import { getDatabase, ref, get, onValue, child, set, update, remove, off } from 'firebase/database'
import { getAuth } from 'firebase/auth'
import { config } from '~/services/firebaseConfig'

export const app = initializeApp(config)
export const db = getDatabase(app)
export const auth = getAuth(app)

export const getDataOnce = (path) => {
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

export const getDataAndWatch = (path, callback) => {
  onValue(ref(db, path), (snapshot) => {
    const data = snapshot.val()
    return callback(data)
  })
}

export const updateData = (path, updates) => update(ref(db, path), updates)

export const removeData = path => remove(ref(db, path))

export const saveData = (path, value) => set(ref(db, path), value)

export const unsubcribeData = path => off(ref(db, path))
