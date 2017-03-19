<template lang="pug">
  .filter
    .link(@click="$store.dispatch('setNextPrevDate', 'prev')")
      .fa.fa-chevron-left
    .filterItem._date
      .fa.fa-clock-o
      .filterItemDate {{ $store.state.filter.date | date }}
    .link(@click="$store.dispatch('setNextPrevDate', 'next')")
      .fa.fa-chevron-right
</template>
