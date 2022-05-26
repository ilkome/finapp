<script lang="ts">
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
  template(v-if="$store.getters['trns/hasTrns']")
    LazyStatView

  LazyStatWelcomeActions(v-if="!$store.getters['trns/hasTrns']")
</template>
