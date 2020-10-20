<script>
export default {
  methods: {
    handleCurrencySelect (currency) {
      this.$store.commit('currencies/hideBaseCurrenciesModal')
      this.$store.dispatch('currencies/setBaseCurrency', currency)
    }
  }
}
</script>

<template lang="pug">
Portal(
  v-if="$store.state.currencies.modal.show"
  to="modal"
)
  ModalBottom(
    :center="true"
    :title="$t('currency.selectBaseTitle')"
    @onClose="$store.commit('currencies/hideBaseCurrenciesModal')"
  )
    .inputText
      .currencies
        .currencies__item(
          v-for="(item, currency) in $store.state.currencies.rates"
          :class="{ _active: $store.state.currencies.base === currency }"
          @click="handleCurrencySelect(currency)"
        ) {{ currency }}
</template>

<style lang="stylus" scoped>

</style>
