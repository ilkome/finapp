<template lang="pug">
  .loginForm
    .loginForm__wrap
      .loginForm__in
        .loginForm__name Finapp
        .loginForm__error(v-if="error") {{ error }}
        .loginForm__action(@click.prevent="signInWithGoogle") Login with Google
      .loginForm__version
        div v6.1.1
        div
          a(href="http://ilko.me") Created with love by Ilya Komichev ilko.me

</template>


<script>
import firebase from 'firebase'

export default {
  data() {
    return {
      error: null
    }
  },

  methods: {
    signInWithGoogle() {
      const provider = new firebase.auth.GoogleAuthProvider()
      firebase.auth().signInWithRedirect(provider)
        .catch(error => {
          this.error = error.message
          console.log(error)
        })
    }
  }
}
</script>
