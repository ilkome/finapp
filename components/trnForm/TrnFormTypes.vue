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
.flex.justify-center
  .overflow-hidden.flex.items-center.bg-4.rounded-md
    .barItem.px-6.py-3.font5.text-sm(
      @click="() => setAmountType(0)"
      :class="{ _active: amountType === 0 }"
    ) {{ $t('money.expenses') }}

    .barItem.px-6.py-3.font5.text-sm(
      @click="() => setAmountType(1)"
      :class="{ _active: amountType === 1 }"
    ) {{ $t('money.incomes') }}

    .barItem.px-6.py-3.font5.text-sm(
      v-if="$store.getters['wallets/walletsSortedIds'].length > 1"
      @click="() => setAmountType(2)"
      :class="{ _active: amountType === 2 }"
    ) {{ $t('trnForm.transferTitle') }}
</template>
