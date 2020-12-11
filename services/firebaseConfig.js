import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/database'

const config = {
  apiKey: 'AIzaSyAjJG6UrfA1FEzV8qbjmuk8wiUic0uWv-8',
  authDomain: 'finapp-17474.firebaseapp.com',
  databaseURL: 'https://finapp-17474.firebaseio.com',
  projectId: 'finapp-17474',
  storageBucket: 'finapp-17474.appspot.com',
  messagingSenderId: '1057184379213',
  appId: '1:1057184379213:web:8c728d0b7099f194'
}

export const app = firebase.apps.length
  ? firebase.app()
  : firebase.initializeApp(config)

export const db = app.database()
export const TIMESTAMP = firebase.database.ServerValue.TIMESTAMP
