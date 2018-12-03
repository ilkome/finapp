# Open source finance application
> Written with Vue.js and Firebase.

Finapp helps you to control personal finances easily and efficiently.

This is Finapp 2.0. For the 1.x see the [classic branch](https://github.com/ilkome/finapp/tree/classic).

## Demo
- https://themerise.com/
- https://ilko.me/finapp/

![Finapp 2.0.0](https://firebasestorage.googleapis.com/v0/b/finapp-17474.appspot.com/o/2.0.0%2Ffinapp-2.0.0-promo.png?alt=media&token=bce821da-f5fa-4e8a-be7a-8fc0ebfaf260)

## Setup

### Project setup
``` bash
# clone the repo
$ git clone https://github.com/ilkome/finapp.git finapp

# go into app's directory
$ cd finapp

# install app's dependencies
$ npm install
```

### Firebase setup
- Create a Firebase project in the [Firebase console](https://console.firebase.google.com/)
- Go to the Authentication tab and enable Google authentication.
- Go to the Database tab and enable Firestore.
- Select Realtime Database and go to Rules tab.
- Change rules to:
``` javascript
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth != null && auth.uid == $uid",
        ".write": "auth != null && auth.uid == $uid"
      }
    },
    "currencies": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```
- Go to the Project Overviw and click Add Firebase to your web app.
- You need to replace config in app's directory `/src/firebase.js` with your properties.
``` bash
apiKey: 'YOUR_CONFIG',
authDomain: 'YOUR_CONFIG',
databaseURL: 'YOUR_CONFIG',
projectId: 'YOUR_CONFIG',
storageBucket: 'YOUR_CONFIG',
messagingSenderId: 'YOUR_CONFIG'
```


## Development

#### Compiles and hot-reloads
``` bash
$ npm run dev
```

## Production
#### Compiles and minifies for production
``` bash
$ npm run build
```

## Upload to server
You can add your FTP config in app's directory `/src/ftp.config.js`

``` bash
# upload all files from dist folder
$ npm run upload

# upload only css, js, html files from dist folder
$ npm run upload-min
```

## Stay In Touch
I would like to speak with you about Finapp. I'm interesting to work in interesting modern projects.
- [Telegram](https://t.me/ilkome)
- [VK](https://www.vk.com/ilkome)
- [Facebook](https://www.facebook.com/ilkome)
