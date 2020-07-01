<script>
export default {
  name: 'IndexPage'
}
</script>

<template lang="pug">
Layout(v-if="$store.getters['user/userUid']")
</template>

<style lang="stylus" scoped>
// styles here
</style>
