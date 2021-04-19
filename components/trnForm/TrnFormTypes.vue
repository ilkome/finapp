<script>
import { computed, useContext } from '@nuxtjs/composition-api'

export default {
  name: 'TrnFormTypes',

  setup () {
    const { store } = useContext()

    const amountType = computed(() => store.state.trnForm.values.amountType)

    function setAmountType (amountType) {
      store.commit('trnForm/setTrnFormValues', {
        amountType
      })
    }

    return {
      amountType,
      setAmountType
    }
  }
}
</script>

<template lang="pug">
.trnFormTypes
  .menuItem._expenses(
    @click="() => setAmountType(0)"
    :class="{ _active: amountType === 0 }"
  ) {{ $t('money.expenses') }}

  .menuItem._incomes(
    @click="() => setAmountType(1)"
    :class="{ _active: amountType === 1 }"
  ) {{ $t('money.incomes') }}

  .menuItem(
    v-if="$store.getters['wallets/walletsSortedIds'].length > 1"
    @click="() => setAmountType(2)"
    :class="{ _active: amountType === 2 }"
  ) {{ $t('trnForm.transferTitle') }}
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables'

.trnFormTypes
  display flex
  justify-content center
  padding $m6

.menuItem
  cursor pointer
  margin 0 $m5
  padding $m6 $m8
  color var(--c-font-5)
  font-size 12px
  font-weight 500
  font-roboto()
  text-align center
  border 1px solid transparent
  border-radius 50px

  &:active
    color var(--c-font-2)
    background var(--c-blue-1)

  &._active
    cursor default
    color var(--c-font-3)
    background var(--c-bg-5)
    border 1px solid var(--c-bg-5)
</style>
