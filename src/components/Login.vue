<template lang="pug">
  .loginForm
    .loginForm__wrap
      .loginForm__in
        .loginForm__name Finapp
        .loginForm__action(@click.prevent="signInWithGoogle") Login with Google
      .loginForm__copy
        a(href="http://ilko.me").link Created with love by Ilya Komichev
</template>


<script>
import firebase from 'firebase'

export default {
  methods: {
    signInWithGoogle() {
      const provider = new firebase.auth.GoogleAuthProvider()
      firebase.auth().signInWithRedirect(provider)
        .catch(error => {
          this.$notify({
            group: 'foo',
            title: 'Error',
            text: error.message,
            type: 'error',
            duration: 10000
          })
        })
    }
  }
}
</script>
