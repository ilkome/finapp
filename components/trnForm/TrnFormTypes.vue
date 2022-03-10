<script>
export default {
  name: 'TrnFormTypes',

  setup() {
    const { $store } = useNuxtApp()

    const amountType = computed(() => $store.state.trnForm.values.amountType)

    function setAmountType(amountType) {
      $store.commit('trnForm/setTrnFormValues', {
        amountType,
      })
    }

    return {
      amountType,
      setAmountType,
    }
  },
}
</script>

<template lang="pug">
.px-4.pb-4.text-center
  .overflow-hidden.flex.items-center.text-sm.rounded-md.bg-gray-50.dark_bg-dark4.dark_shadow
    .cursor-pointer.px-5.py-3.grow.hocus_bg-gray-200.dark_hocus_bg-neutral-800(
      :class="{ '_active cursor-default text-blue3 dark_text-blue1 bg-gray-100 dark_bg-232323': amountType === 0 }"
      @click="() => setAmountType(0)"
    ) {{ $t('money.expenses') }}

    .cursor-pointer.px-5.py-3.grow.hocus_bg-gray-200.dark_hocus_bg-neutral-800(
      :class="{ '_active cursor-default text-blue3 dark_text-blue1 bg-gray-100 dark_bg-232323': amountType === 1 }"
      @click="() => setAmountType(1)"
    ) {{ $t('money.incomes') }}

    .cursor-pointer.px-5.py-3.grow.hocus_bg-gray-200.dark_hocus_bg-neutral-800(
      v-if="$store.getters['wallets/walletsSortedIds'].length > 1"
      :class="{ '_active cursor-default text-blue3 dark_text-blue1 bg-gray-100 dark_bg-232323': amountType === 2 }"
      @click="() => setAmountType(2)"
    ) {{ $t('trnForm.transferTitle') }}
</template>
