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
@import '~assets/stylus/variables'

.currencies
  display grid
  grid-template-columns repeat(auto-fill, minmax(100px, 1fr))
  grid-column-gap $m7
  grid-row-gap $m7

  &__item
    cursor pointer
    display flex
    align-items center
    justify-content center
    height 44px
    padding $m6
    text-align center
    border 1px solid var(--c-bg-6)
    border-radius $m4

    +media-hover()
      &:not(._active)
        background var(--c-bg-6)

    &._active
      cursor default
      color var(--c-font-1)
      background var(--c-blue-1)
      border none
</style>
