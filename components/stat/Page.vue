<script lang="ts">
import { useWindowSize } from '@vueuse/core'
export default {
  setup() {
    const { width } = useWindowSize()

    return { width }
  },

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
    LazyStatLaptopView(v-if="width >= 1024")
    LazyStatMobileView(v-else)

  LazyStatWelcomeActions(v-if="!$store.getters['trns/hasTrns']")
</template>
