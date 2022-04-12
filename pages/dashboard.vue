<script>
export default {
  head() {
    return {
      title: this.$t('stat.title'),
    }
  },
}
</script>

<template lang="pug">
.overflow-hidden.h-full
  LazyStat(v-if="$store.getters['trns/hasTrns']")
  LazyStatNoStatActions(v-if="!$store.getters['trns/hasTrns']")
</template>
