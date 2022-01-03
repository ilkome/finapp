<script>
import { computed, useContext } from '@nuxtjs/composition-api'
import useFilter from '~/modules/filter/useFilter'

export default {
  setup () {
    const { store } = useContext()
    const { setCategoryFilter, setWalletFilter } = useFilter()

    const filterCategory = computed(() => store.state.categories.items[store.state.filter.categoryId])
    const filterParentCategory = computed(() => store.state.categories.items[filterCategory.value.parentId])
    const filterWallet = computed(() => store.state.wallets.items[store.state.filter.walletId])

    const onClearCategory = () => {
      console.log('onClearCategory')
      if (filterCategory.value.parentId)
        setCategoryFilter(filterCategory.value.parentId)
      else
        setCategoryFilter(null)
    }

    const onClearFilter = () => {
      setCategoryFilter(null)
      setWalletFilter(null)
    }

    return {
      setCategoryFilter,
      setWalletFilter,

      filterCategory,
      filterParentCategory,
      filterWallet,

      onClearFilter,
      onClearCategory
    }
  },

  methods: {
    clearCategoryFilter () {
      const nextCategoryId = this.filterCategory.parentId !== 0 ? this.filterCategory.parentId : null
      this.setCategoryFilter(nextCategoryId)
    },

    clearParentCategoryFilter () {
      this.setCategoryFilter(null)
    },

    clearWalletFilter () {
      this.setWalletFilter(null)
    }
  }
}
</script>

<template lang="pug">
.overflow-hidden.rounded.py-2
  .pb-2
    .statTitle {{ $t('base.filter') }}

  .safe.scrollbar.overflow-hidden.overflow-x-auto.flex.items-stretch(v-if="filterCategory || filterWallet")
    //- Wallet
    template(v-if="filterWallet")
      .overflow-hidden.cursor-pointer.relative.flex.flex-col.items-center.mr-3.py-2.px-3.bg-4.rounded-md(
        class="hocus:bg-neutral-800"
        @click="clearWalletFilter"
      )
        .absolute.top-0.left-0.w-full(:style="{ height: '2px', background: filterWallet.color }")
        .pr-2
          .-mb-1.text-xs.font4 {{ filterWallet.name }}
          .text-sm.font3
            Amount(
              :alwaysShowSymbol="false"
              :currency="filterWallet.currency"
              :showBase="false"
              :value="$store.getters['wallets/walletsTotal'][$store.state.filter.walletId].base"
              vertical="left"
            )
          .absolute.top-1.right-1
            .text-sm.font5.mdi.mdi-close

    //- Category
    template(v-if="filterCategory")
      .overflow-hidden.cursor-pointer.relative.flex.items-center.mr-3.py-2.px-3.bg-4.rounded-md(
        class="hocus:bg-neutral-800"
        @click="onClearCategory"
      )
        .text-2xl(
          :style="{ color: filterCategory.color }"
          :class="filterCategory.icon"
        )
        .flex.flex-col.pl-3.pr-2
          .-mb-1.text-xs.font4(v-if="filterCategory.parentId") {{ filterParentCategory.name }}
          .text-sm.font3 {{ filterCategory.name }}
        .absolute.top-1.right-1
          .text-sm.font5.mdi.mdi-close

    //- Clear
    .cursor-pointer.flex.items-center.px-4.text-xs.font3.bg-4.rounded-md(
      @click="onClearFilter"
      class="hocus:bg-neutral-800"
    ) {{ $t('filter.clear') }}
</template>
