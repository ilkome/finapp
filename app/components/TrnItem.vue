<template lang="pug">
.item(@click.stop="toogleTrn(trn.id)", :class="{_selected: selected, _editable: trn.id === editedTrn}")
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
    .item__el._action(@click.stop.prevent="setEditTrn(trn.id)"): .fa.fa-pencil-square-o
    .item__el._action(@click.prevent.stop="question(trn.id)"): .fa.fa-trash-o

  .item__question(:class="{_visible: questionId === trn.id}")
    .item__el._question Удалить транзакцию?
    .item__el._action(@click.prevent.stop="close()"): .fa.fa-ban
    .item__el._action(@click.prevent.stop="deleteTrn(trn.id)"): .fa.fa-check

  .item__loader(:class="{_visible: loadingId === trn.id}"): .fa.fa-spinner

  transition(name="slideToTop")
    .item__edit(v-if="trn.id === editedTrn")
      TrnEdit(:trn="trn")
</template>


<script>
import formatMoney from '../mixins/formatMoney'
import TrnEdit from './TrnEdit.vue'

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
      questionId: null,
      editedTrn: null
    }
  },

  methods: {
    async deleteTrn(id) {
      console.group('TrnItem: deleteTrn')
      this.$store.commit('showLoader')
      await this.$store.dispatch('deleteTrn', id)
      this.$store.commit('disableLoader')
      console.groupEnd()
    },

    question(accountId) {
      this.questionId = accountId
    },

    close() {
      this.questionId = null
    },

    setEditTrn(trnId) {
      if (trnId === this.editedTrn) {
        this.editedTrn = null
      } else {
        this.editedTrn = trnId
      }
    }
  },

  components: { TrnEdit }
}
</script>
