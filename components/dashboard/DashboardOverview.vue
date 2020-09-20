<script>
export default {
  name: 'DashboardOverview',

  computed: {
    statCurrentPeriod () {
      return this.$store.getters['stat/statCurrentPeriod']
    }
  }
}
</script>

<template lang="pug">
.overview
  h1 Overview
  pre {{ statCurrentPeriod.total }}
  pre {{ statCurrentPeriod.expenses }}
  pre {{ statCurrentPeriod.incomes }}

</template>

<style lang="stylus" scoped>
//
</style>
