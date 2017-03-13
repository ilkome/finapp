<template lang="pug">
  .filter
    .prev
      .fa.fa-chevron-left(@click="$store.dispatch('setNextPrevDate', 'prev')")
    .filterItem._date
      .fa.fa-clock-o
      .filterItemDate {{ $store.state.filter.date | date }}
    .prev
      .fa.fa-chevron-right(@click="$store.dispatch('setNextPrevDate', 'next')")
</template>
