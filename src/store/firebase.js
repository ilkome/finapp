import firebase from 'firebase'
import firebaseConfig from './helpers/firebaseConfig'

export const app = firebase.initializeApp(firebaseConfig)
export const db = app.database()
export const getRef = async (uid, ref) => await db.ref(`users/${uid}/${ref}`)
