<p align="center"><img align="center" style="width:320px" src="https://finapp.ilko.me/icon.png"/></p><br/>

# Open source finance application
Finapp helps you to control personal finances easily and efficiently.

This is Finapp 3. For the 2.x see the [2 branch](https://github.com/ilkome/finapp).

# 🕹 Demo
[finapp.ilko.me](https://finapp.ilko.me/)


# 🏞 Screenshots
![Finapp 2.0.0](https://firebasestorage.googleapis.com/v0/b/finapp-17474.appspot.com/o/2.0.0%2Ffinapp-2.0.0-promo.png?alt=media&token=bce821da-f5fa-4e8a-be7a-8fc0ebfaf260)

# 🚀 Features
- Works offline on all devices (Service Worker): you can see all your data. Create, edit and delete transactions.
- Instant synchronization between all device (Firebase).
- Optimized for mobile and PC.
- Themes: dark and white.
- Support multiple currencies with auto conversion.

# 🦄 Technologies
- Vue
- Nuxt
- Stylus
- Tailwind
- Pug
- Firebase

# 📦 Setup

### Project setup

``` bash
# clone the repo
git clone https://github.com/ilkome/finapp.git finapp

# go into app's directory
cd finapp

# install dependencies
yarn
```

### Firebase setup

- Create a Firebase project in the [Firebase console](https://console.firebase.google.com/)
- Create Realtime Database
- Open Realtime Database and go to Rules tab.
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
    },
    "ratesUsd": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

- Go to the Project Overview and find `Get started by adding Firebase to your app` click to `web`.
- Register an app and you will get your config.
- You need to replace config in app's directory `services/firebase/config.js` with your config.

``` bash
apiKey: 'YOUR_CONFIG',
authDomain: 'YOUR_CONFIG',
databaseURL: 'YOUR_CONFIG',
projectId: 'YOUR_CONFIG',
storageBucket: 'YOUR_CONFIG',
messagingSenderId: 'YOUR_CONFIG'
```

### Enable Google Auth
- Go to `Authentication` page
- Click `Sign-in method` tab
- Add `Add new provider` and select Google

### Add your domain to Firebase Authorized domains
- Go to `Authentication` page
- Click `Sign-in method` tab
- Scroll to `Authorized domains` and click `Add domain`
- Add your domain name

### Open exchange rates setup
- Get your App ID at [openexchangerates.org](https://openexchangerates.org/signup/free)
- Rename `.env.example` to `.env`
- Set your App ID in `.env`
``` bash
OPEN_EXCHANGE_RATES=app_id
```

If you use netlify or similar services you need add OPEN_EXCHANGE_RATES to env variables.

## Development

### Compiles and hot-reloads

``` bash
yarn dev
```

## Production

### Compiles and minifies for production

This will give you `build` folder. You can upload files from this folder to any shared hosting.

``` bash
yarn build
```

## Upload static files to server

You can add your FTP config in app's directory `ftp.config.js`

``` bash
# upload all files from dist folder
yarn upload

# upload only css, js, html files from dist folder
yarn upload-min
```

# 🤪 Stay In Touch

I would like to speak with you about Finapp. I'm looking for awesome projects.

- [My Telegram](https://t.me/ilkome)

# 📄 License

[MIT License](https://github.com/ilkome/finapp/blob/main/LICENSE)
