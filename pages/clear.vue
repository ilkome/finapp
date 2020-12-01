<script>
import localforage from 'localforage'

export default {
  auth: false,

  data () {
    return {
      done: false
    }
  },

  mounted () {
    localforage.clear()
    this.done = true
  }
}
</script>

<template lang="pug">
div
  template(v-if="done") Ура, кеш почистился
  h1(@click="$router.push('/')") Index
</template>

<style lang="stylus" scoped>

</style>
