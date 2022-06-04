<script lang="ts">
export default defineComponent({
  props: ['error'],

  fetch() {
    if (Object.keys(this.$route.query).length > 0)
      this.$router.replace({ query: null })
  },

  computed: {
    statusCode() {
      return (this.error && this.error.statusCode) || 500
    },
  },
})
</script>

<template lang="pug">
.p-4
  h1 Error
  pre {{ error }}
  h1(@click="$router.push('/')") Go to home
</template>
