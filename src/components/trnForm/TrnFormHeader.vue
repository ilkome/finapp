<script>
import Amount from '@/components/amount/Amount'
import Icon from '@/components/icon/Icon'

export default {
  components: {
    Amount,
    Icon
  },

  computed: {
    category () {
      const categoryId = this.$store.state.trnForm.values.categoryId
      const categories = this.$store.state.categories.items
      return categories[categoryId]
    },
    values () {
      return this.$store.state.trnForm.values
    },
    wallet () {
      const walletId = this.$store.state.trnForm.values.walletId
      const wallets = this.$store.state.wallets.items
      return wallets[walletId]
    },
    showIcon () {
      for (const modal in this.$store.state.trnForm.modal) {
        if (this.$store.state.trnForm.modal[modal]) {
          return false
        }
      }
      return true
    }
  }
}
</script>

<template lang="pug">
.trnFormHeader
  //- Wallet
  template(v-if="wallet")
    .trnFormHeader__item(
      :style="{ background: wallet.color || $store.state.ui.defaultBgColor }"
      @click="$store.commit('toogleTrnFormModal', 'wallets')"
    )
      transition(name="slide")
        .trnFormHeader__icon(v-show="showIcon")
          Icon(
            :big="true"
            :color="wallet.color || $store.state.ui.defaultBgColor"
            :invert="true"
            icon="mdi mdi-credit-card-multiple"
          )
      div
        .trnFormHeader__name {{ wallet.name }}
        .trnFormHeader__total
          template(v-if="$store.getters.walletsTotal[values.walletId]")
            Amount(
              :value="$store.getters.walletsTotal[values.walletId].base"
              :currency="$store.state.currencies.base"
            )
          template(v-else)
            Amount(
              :value="0"
              :currency="$store.state.currencies.base"
            )

  //- Category
  template(v-if="category")
    .trnFormHeader__item(
      :style="{ background: category.color || $store.state.ui.defaultBgColor }"
      @click="$store.commit('toogleTrnFormModal', 'categories')"
    )
      transition(name="slide")
        .trnFormHeader__icon(v-show="showIcon")
          Icon(
            :big="true"
            :color="category.color || $store.state.ui.defaultBgColor"
            :icon="category.icon"
            :invert="true"
            :round="true"
          )
      .trnFormHeader__name {{ category.name }}
</template>
