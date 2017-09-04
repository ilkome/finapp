import firebase from 'firebase'
import { config } from './helpers/firebaseConfig'

export const app = firebase.initializeApp(config)
export const db = app.database()
export const getRef = async (uid, ref) => await db.ref(`users/${uid}/${ref}`)
