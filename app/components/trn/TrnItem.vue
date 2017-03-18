<template lang="pug">
router-link.trnItem(:to="`/trn/${trn.id}/edit`", :class="`account-${trn.accountId}`")
  .trnItem__el
    .icon(:class="`icon-${trn.categoryId}`"): .icon__pic
  .trnItem__el.trnItem__price(:class="trn.type === 1 ? 'income' : 'expense'")
    div(v-if="trn.currency != 'RUB'") {{ formatMoney(trn.amount, trn.currency) }}
    div {{ formatMoney(trn.amountRub) }}
  .trnItem__el(:class="trn.accountId === 1 ? 'c-tinkoff' : 'c-rub'") {{ trn.accountName }}
  .trnItem__el._category {{ trn.categoryName }}
  .trnItem__el._delete
    a(@click.prevent="deleteTrn(trn.id)") Удалить
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
