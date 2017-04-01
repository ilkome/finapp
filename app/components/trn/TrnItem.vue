<template lang="pug">
.item(@click="toogleTrn(trn.id)", :class="{_selected: selected}")
  .item__content
    router-link.item__el(
      :to="`/categories/${trn.categoryId}`",
      title="Перейти в категорию"
    )
      .icon._link(:class="`icon-${trn.categoryId}`"): .icon__pic

    .item__el._price(:class="trn.type === 1 ? 'income' : 'expense'")
      div(v-if="trn.currency != 'RUB'") {{ formatMoney(trn.amount, trn.currency) }}
      div {{ formatMoney(trn.amountRub) }}

    .item__el._account(:class="trn.accountId === 1 ? 'c-tinkoff' : 'c-rub'") {{ trn.accountName }}
    .item__el._category {{ trn.categoryName }}
    router-link.item__el._action(:to="`/trn/${trn.id}/edit`"): .fa.fa-pencil-square-o
    .item__el._action(@click.prevent.stop="question(trn.id)"): .fa.fa-trash-o

  .item__question(:class="{_visible: questionId === trn.id}")
    .item__el._question._grow Удалить транзакцию?
    .item__el._action(@click.prevent.stop="close()"): .fa.fa-ban
    .item__el._action(@click.prevent.stop="deleteTrn(trn.id)"): .fa.fa-check

  .item__loader(:class="{_visible: loadingId === trn.id}"): .fa.fa-spinner
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

  data() {
    return {
      selected: false,
      loading: false,
      loadingId: null,
      questionId: null
    }
  },

  methods: {
    toogleTrn(id) {
      this.selected = !this.selected
      this.$emit('toogleTrn', id)
    },
    deleteTrn(id) {
      this.$store.dispatch('deleteTrn', id)
    },
    question(accountId) {
      this.questionId = accountId
    },
    close() {
      this.questionId = null
    },
  }
}
</script>
