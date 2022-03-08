<script lang="ts">
export default defineComponent({
  head() {
    return {
      title: this.$t('wallets.title'),
    }
  },
})
</script>

<template lang="pug">
.h-full.overflow.overflow-x-auto
  .py-6.px-3.font-nunito.text-neutral-800.dark_text-white.text-2xl.leading-none.font-semibold
    | {{ $t('wallets.name') }}

  .pb-6.px-3
    .flex.gap-4.justify-between.items-center
      WalletsTotalAlt(
        isShowCredits
        isShowSavings
      )

  .pb-12
    WalletsList3(@onClick="id => $router.push(`/wallets/${id}`)")

  .pb-4.px-3.flex.gap-4
    //- Create
    .button(@click="$store.dispatch('ui/setActiveTab', 'createWallet')") {{ $t('wallets.new') }}
    //- Sort
    .button(@click="$store.dispatch('ui/setActiveTab', 'walletsSort')") {{ $t('base.sort') }}
</template>
