import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/database'

export const app = firebase.initializeApp({
  apiKey: 'YOUR_CONFIG',
  authDomain: 'YOUR_CONFIG',
  databaseURL: 'YOUR_CONFIG',
  projectId: 'YOUR_CONFIG',
  storageBucket: 'YOUR_CONFIG',
  messagingSenderId: 'YOUR_CONFIG'
})

export const db = app.database()
