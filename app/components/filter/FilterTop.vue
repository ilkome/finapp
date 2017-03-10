<template lang="pug">
  .filter
    .filterItem
      .fa.fa-chevron-left(@click="$store.dispatch('setNextPrevDate', 'prev')")
    .filterItem._date
      .fa.fa-clock-o
      .filterItemDate {{ $store.state.filter.date | date }}
    .filterItem
      .fa.fa-chevron-right(@click="$store.dispatch('setNextPrevDate', 'next')")
</template>

<style lang="stylus" scoped>
  @import "../../stylus/components"
  @import "filter"
</style>
