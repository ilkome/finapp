<script setup lang="ts">
import useFilter from '~/modules/filter/useFilter'

const { $store } = useNuxtApp()
const { setFilterCatsId } = useFilter()

const filterWalletsItems = computed(() => {
  let wallets = {}

  for (const walletId of $store.state.filter.walletsIds) {
    const wallet = $store.state.wallets.items[walletId]
    if (!wallet) break
    wallets = { ...wallets, [walletId]: wallet }
  }

  return wallets
})

const filterCatsItems = computed(() => {
  let cats = {}

  for (const catId of $store.state.filter.catsIds) {
    const cat = $store.state.categories.items[catId]
    if (!cat) break
    cats = { ...cats, [catId]: cat }
  }

  return cats
})

const onClickCategory = (catId) => {
  $store.commit('filter/removeFilterCatId', catId)
}

const onClearFilter = () => {
  $store.commit('filter/clearFilterCatsIds')
  $store.commit('filter/clearFilterWalletsIds')
}

function clearWalletFilter(walletId) {
  $store.commit('filter/removeFilterWalletId', walletId)
}
</script>

<template lang="pug">
.overflow-hidden.rounded(v-if="filterCatsItems || filterWalletsItems")
  .statTitle(class="!pb-3") {{ $t('base.filter') }}
  .safe.scrollbar.overflow-hidden.overflow-x-auto.flex.items-center
    //- Wallet
    template(v-if="filterWalletsItems")
      .cursor-pointer.relative.flex.flex-col.items-center.mr-3.py-2.px-3.bg-dark4.rounded-md.shadow.hocus_shadow-lg.hocus_bg-neutral-800(
        v-for="(walletItem, walletId) in filterWalletsItems"
        :key="walletId"
        @click="clearWalletFilter(walletId)"
      )
        .absolute.top-0.left-0.w-full(:style="{ height: '2px', background: walletItem.color }")
        .pr-2
          .-mb-1.text-xs {{ walletItem.name }}
          .text-sm
            Amount(
              :alwaysShowSymbol="false"
              :currency="walletItem.currency"
              :showBase="false"
              :value="$store.getters['wallets/walletsTotal'][walletId].base"
              vertical="left"
            )
          .absolute.top-1.right-1
            .text-sm.mdi.mdi-close

    //- Category
    template(v-if="filterCatsItems")
      .cursor-pointer.relative.mr-3.p-1.px-2.flex.items-center.gap-3.bg-gray-50.dark_bg-dark4.rounded-md.shadow.hocus_shadow-lg.hocus_bg-neutral-800(
        v-for="(catItem, catId) in filterCatsItems"
        :key="catId"
        @click="onClickCategory(catId)"
      )
        .text-2xl(
          :style="{ color: catItem.color }"
          :class="catItem.icon"
        )
        div
          .text-2xs(v-if="catItem.parentId") {{ $store.state.categories.items[catItem.parentId].name }}
          .text-sm.leading-none {{ catItem.name }}

        .mdi.mdi-close.opacity-70.text-lg.leading-none

    //- Clear
    .cursor-pointer.p-1.px-2.flex.items-center.gap-3.bg-gray-50.dark_bg-dark4.rounded-md.hocus_bg-gray-100.dark_hocus_bg-neutral-800.shadow.hocus_shadow-lg(
        class="dark_text-white/60"
        @click="onClearFilter"
      )
        .mdi.mdi-filter-remove-outline.text-2xl
        .pr-1.text-xs.leading-none {{ $t('filter.clear') }}
</template>
