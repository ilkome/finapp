<template lang="pug">
.loading
  .loading__logo._spin
    svg(xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100")
      path(d="M92.48,7.69C117.38,32.6,61.89,32.06,61.89,50s55.49,17.38,30.58,42.28S68.11,61.68,50.19,61.68,32.81,117.17,7.91,92.26,38.49,67.9,38.49,50-17,32.6,7.91,7.69,32.27,38.28,50.19,38.28,67.57-17.22,92.48,7.69Z")

  template(v-if="showName")
    h1.loading__name Finapp
</template>

<script>
export default {
  props: {
    showName: {
      type: Boolean,
      default: true
    }
  }
}
</script>
