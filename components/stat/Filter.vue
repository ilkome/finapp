<script setup lang="ts">
import type { CategoryID } from '~/components/categories/types'
const { $store } = useNuxtApp()

const filterWalletsItems = computed(() =>
  $store.state.filter.walletsIds
    .reduce((acc, id) => {
      acc[id] = $store.state.wallets.items[id]
      return acc
    }, {}),
)

const filterCatsItems = computed(() =>
  $store.state.filter.catsIds
    .reduce((acc, id) => {
      acc[id] = $store.state.categories.items[id]
      return acc
    }, {}),
)

const onClickCategory = (id: CategoryID) => {
  $store.commit('filter/removeFilterCatId', id)
}

const onClearFilter = () => {
  $store.commit('filter/clearFilterCatsIds')
  $store.commit('filter/clearFilterWalletsIds')
}
</script>

<template lang="pug">
.overflow-hidden(v-if="filterCatsItems || filterWalletsItems")
  .pb-3.text-lg.leading-none.font-nunito.font-semibold.text-skin-item-base {{ $t('base.filter') }}
  .safe.scrollbar.overflow-hidden.overflow-x-auto.flex.flex-wrap.items-center.gap-4
    //- Wallet
    template(v-if="filterWalletsItems")
      .overflow-hidden.cursor-pointer.relative.py-1.px-3.flex.flex-col.items-center.rounded-md.bg-skin-item-main-bg.hocus_bg-skin-item-main-hover.shadow.hocus_shadow-lg(
        v-for="(walletItem, walletId) in filterWalletsItems"
        :key="walletId"
        @click="$store.commit('filter/removeFilterWalletId', walletId)"
      )
        .absolute.top-0.left-0.w-full(:style="{ height: '2px', background: walletItem.color }")
        .pr-2
          .text-xs {{ walletItem.name }}
          .text-sm.text-skin-item-base
            Amount(
              :amount="$store.getters['wallets/walletsTotal'][walletId]"
              :currencyCode="walletItem.currency"
              :type="3"
              :isShowBaseRate="false"
              :isShowSign="false"
            )

          .absolute.top-1.right-1
            .text-sm.mdi.mdi-close

    //- Category
    template(v-if="filterCatsItems")
      .cursor-pointer.relative.py-1.px-3.flex.items-center.gap-3.rounded-md.bg-skin-item-main-bg.hocus_bg-skin-item-main-hover.shadow.hocus_shadow-lg(
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
    .cursor-pointer.py-1.px-3.flex.items-center.gap-3.rounded-md.bg-skin-item-main-bg.hocus_bg-skin-item-main-hover.shadow.hocus_shadow-lg(
        @click="onClearFilter"
      )
        .mdi.mdi-filter-remove-outline.text-2xl
        .pr-1.text-xs.leading-none {{ $t('filter.clear') }}
</template>
