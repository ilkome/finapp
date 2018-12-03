<script>
import ModalBottom from '@/components/modal/ModalBottom'

export default {
  components: {
    ModalBottom
  },

  methods: {
    handleCurrencySelect (currency) {
      this.$store.commit('hideBaseCurrenciesModal')
      this.$store.dispatch('setBaseCurrency', currency)
    }
  }
}
</script>

<template lang="pug">
  ModalBottom(
    :center="true"
    :show="$store.state.currencies.modal.show"
    title="Select base currency"
    v-on:onClose="$store.commit('hideBaseCurrenciesModal')")
    .inputText
      .currencies
        .currencies__item(
          v-for="(item, currency) in $store.state.currencies.items"
          :class="{ _active: $store.state.currencies.base === currency }"
          @click="handleCurrencySelect(currency)"
        ) {{ currency }}
</template>

<style lang="stylus" scoped>

</style>
