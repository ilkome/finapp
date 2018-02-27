<template lang="pug">
.bottomFixedLinks
  .bottomFixedLinks__item(
    @click="$store.dispatch('setMobileDashboardActiveTab', 'summary')"
    :class="{ _active: mobileDashboardActiveTab === 'summary' }"
  )
    .bottomFixedLinks__item-icon: .mdi.mdi-chart-arc
    .bottomFixedLinks__item-text Summary

  .bottomFixedLinks__item(
    @click="$store.dispatch('setMobileDashboardActiveTab', 'expenses')"
    :class="{ _active: mobileDashboardActiveTab === 'expenses' }"
  )
    .bottomFixedLinks__item-icon: .mdi.mdi-database-minus
    .bottomFixedLinks__item-text Expences

  .bottomFixedLinks__item(
    @click="$store.dispatch('setMobileDashboardActiveTab', 'incomes')"
    :class="{ _active: mobileDashboardActiveTab === 'incomes' }"
  )
    .bottomFixedLinks__item-icon: .mdi.mdi-plus-circle-multiple-outline
    .bottomFixedLinks__item-text Incomes

  .bottomFixedLinks__item(
    @click="$store.dispatch('setMobileDashboardActiveTab', 'history')"
    :class="{ _active: mobileDashboardActiveTab === 'history' }"
  )
    .bottomFixedLinks__item-icon: .mdi.mdi-history
    .bottomFixedLinks__item-text History
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters(['mobileDashboardActiveTab'])
  }
}
</script>
