<template lang="pug">
router-link.trnItem(:to="`/trn/${trn.id}/edit`", :class="`account-${trn.accountId}`")
  .trnItem__el
    .icon(:class="`icon-${trn.categoryId}`"): .icon__pic
  .trnItem__el.trnItem__price(:class="trn.type === 1 ? 'income' : 'expense'")
    div(v-if="trn.currency != 'RUB'") {{ formatMoney(trn.amount, trn.currency) }}
    div {{ formatMoney(trn.amountRub) }}
  .trnItem__el(:class="trn.accountId === 1 ? 'c-tinkoff' : 'c-rub'") {{ trn.accountName }}
  router-link.trnItem__el._category(:to="`/categories/${trn.categoryId}`") {{ trn.categoryName }}
  a.trnItem__el._delete(@click.prevent="deleteTrn(trn.id)") Удалить
</template>


<script>
import formatMoney from '../../mixins/money'

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
