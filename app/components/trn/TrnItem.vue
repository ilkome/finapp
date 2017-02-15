<template lang="pug">
  div
    router-link(:to="`trn/${trn.id}/edit`").items
      .item
        .icon(:class="`icon-${trn.categoryId}`"): .icon__pic
      .item.right.aligned
        div(:class="trn.type === 1 ? 'income' : 'expense'") {{ formatMoney(trn.amount) }}
        div {{ trn.date | date }}
      .item
        div {{ trn.categoryName }}
        div {{ trn.accountName }}
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
  }

}
</script>
