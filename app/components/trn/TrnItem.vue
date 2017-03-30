<template lang="pug">
.item._alt(@click="toogleTrn(trn.id)", :class="{_selected: selected}")
  .item__content
    .item__el
      .icon(:class="`icon-${trn.categoryId}`"): .icon__pic
    .item__el._price(:class="trn.type === 1 ? 'income' : 'expense'")
      div(v-if="trn.currency != 'RUB'") {{ formatMoney(trn.amount, trn.currency) }}
      div {{ formatMoney(trn.amountRub) }}
    .item__el._account(:class="trn.accountId === 1 ? 'c-tinkoff' : 'c-rub'") {{ trn.accountName }}
    router-link.item__el._category._grow(:to="`/categories/${trn.categoryId}`") {{ trn.categoryName }}
    router-link.item__el._edit._link(:to="`/trn/${trn.id}/edit`"): .fa.fa-pencil-square-o
    .item__el._link(@click.prevent.stop="question(trn.id)"): .fa.fa-trash-o

  .item__question(:class="{_visible: questionId === trn.id}")
    .item__el._question._grow Удалить транзакцию?
    .item__el._no(@click.prevent="close()"): .fa.fa-ban
    .item__el._yes(@click.prevent="deleteTrn(trn.id)"): .fa.fa-check

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
