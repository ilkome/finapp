<template lang="pug">
.trnItem(:class="trnClassName")
  router-link.items(:to="`trn/${trn.id}/edit`")
    .item
      .icon(:class="`icon-${trn.categoryId}`"): .icon__pic
    .item.right.aligned
      div(:class="trn.type === 1 ? 'income' : 'expense'") {{ formatMoney(trn.amount) }}
    .item
      div(:class="trn.accountId === 1 ? 'c-tinkoff' : 'c-rub'") {{ trn.accountName }}
    .item
      div {{ trn.categoryName }}
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

  computed: {
    trnClassName() {
      switch (this.trn.accountId) {
        case 1: return 'rub'
        case 2: return 'tinkoff'
        default: return 'def'
      }
    }
  }
}
</script>
