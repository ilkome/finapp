<script>
import Layout from '~/components/layout/Layout'

export default {
  name: 'IndexPage',

  components: {
    Layout
  }
}
</script>

<template lang="pug">
Layout(v-if="$store.getters['user/userUid']")
</template>

<style lang="stylus" scoped>
// styles here
</style>
