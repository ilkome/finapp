<template lang="pug">
router-link.item(:to="`/trn/${trn.id}/edit`", :class="`account-${trn.accountId}`")
  .item__el
    .icon(:class="`icon-${trn.categoryId}`"): .icon__pic
  .item__el.item__price._grow(:class="trn.type === 1 ? 'income' : 'expense'")
    div(v-if="trn.currency != 'RUB'") {{ formatMoney(trn.amount, trn.currency) }}
    div {{ formatMoney(trn.amountRub) }}
  .item__el._grow(:class="trn.accountId === 1 ? 'c-tinkoff' : 'c-rub'") {{ trn.accountName }}
  router-link.item__el._category._grow(:to="`/categories/${trn.categoryId}`") {{ trn.categoryName }}
  .item__el._link(@click.prevent.stop="deleteTrn(trn.id)"): .fa.fa-trash-o
</template>


<script>
import formatMoney from '../../mixins/formatMoney'

export default {
  mixins: [formatMoney],
  props: {
    trn: {
      type: Object,
      required: true
    }
  },

  methods: {
    deleteTrn(id) {
      this.$store.dispatch('deleteTrn', id)
    }
  }
}
</script>
