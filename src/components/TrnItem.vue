<template lang="pug">
.trnItem
  //- Trns small
  //------------------------------------------------
  template(v-if="view === 'small'")
    .trnItem__content
      .grid(:class="{_editable: trn.id === editedTrn}")
        .grid__item._price(:class="trn.type === 1 ? 'income' : 'expense'")
          div {{ formatMoney(trn.amountRub) }}
          div(v-if="trn.currency != 'RUB'") {{ formatMoney(trn.amount, trn.currency) }}
        .grid__item
          .grid__item__date {{ formatDate(trn.date, 'D MMM') }}
          router-link.grid__item__category(
            :to="`/categories/${trn.categoryId}`",
            title="Go to category"
          ) {{ trn.categoryName }}
          router-link.grid__item__account(
            :to="`/accounts/${trn.accountId}`",
            title="Go to account"
          ) {{ trn.accountName }}
        template(v-if="editedTrn && trn.id === editedTrn")
          .grid__item._action(@click.stop.prevent="$store.commit('closeTrnForm')").fa.fa-times-circle
        template(v-else)
          .grid__item._action(@click.stop.prevent="setEditTrn(trn.id)").fa.fa-pencil-square-o
        .grid__item._action(@click.prevent.stop="askQuestion(trn.id)").fa.fa-trash-o
        .grid__item._description(v-if="trn.description") {{ trn.description }}

  //- Trns big
  //------------------------------------------------
  template(v-else)
    .item(:class="{_selected: selected, _editable: trn.id === editedTrn}")
      .item__content
        router-link.item__el.item__pic(
          :to="`/categories/${trn.categoryId}`",
          title="Go to category"
        )
          .icon._link(:style="`background: ${trn.categoryColor}`")
            div(:class="trn.categoryIcon")

        .item__el._price(:class="trn.type === 1 ? 'income' : 'expense'")
          div(v-if="trn.currency != 'RUB'") {{ formatMoney(trn.amount, trn.currency) }}
          div {{ formatMoney(trn.amountRub) }}
        router-link.item__el._category(
          :to="`/accounts/${trn.accountId}`",
          title="Go to account"
        ) {{ trn.accountName }}
        router-link.item__el._account(
          :to="`/categories/${trn.categoryId}`",
          title="Go to category"
        ) {{ trn.categoryName }}
        template(v-if="editedTrn && trn.id === editedTrn")
          .item__el._action(@click.stop.prevent="$store.commit('closeTrnForm')").fa.fa-times-circle
        template(v-else)
          .item__el._action(@click.stop.prevent="setEditTrn(trn.id)").fa.fa-pencil-square-o
        .item__el._action(@click.prevent.stop="askQuestion(trn.id)"): .fa.fa-trash-o


  .item__question(:class="{_visible: questionId === trn.id}")
    .item__el._question
      div Delete trn?
    .item__el._action(@click.prevent.stop="close()"): .fa.fa-ban
    .item__el._action(@click.prevent.stop="deleteTrn(trn.id)"): .fa.fa-check
</template>


<script>
import formatDate from '../mixins/formatDate'
import formatMoney from '../mixins/formatMoney'

export default {
  mixins: [formatDate, formatMoney],
  props: {
    trn: {
      type: Object,
      required: true
    },
    view: {
      type: String,
      required: false
    }
  },

  data() {
    return {
      selected: false,
      questionId: false
    }
  },

  computed: {
    editedTrn() {
      console.log(this.$store.state.trnForm.isUpdateTrn)
      return this.$store.state.trnForm.isUpdateTrn
    }
  },

  methods: {
    async deleteTrn(id) {
      console.log('TrnItem: deleteTrn:', id)
      this.$store.commit('showLoader')
      await this.$store.dispatch('deleteTrn', id)
      if (id === this.$store.state.trnForm.isUpdateTrn) {
        this.$store.commit('closeTrnForm')
      }
      this.questionId = null
      this.$store.commit('closeLoader')
    },

    askQuestion(trnId) {
      this.questionId = trnId
    },

    close() {
      this.questionId = null
    },

    setEditTrn(trnId) {
      console.log(trnId)
      this.$store.commit('setTrnForm', { action: 'update', trnId })
    }
  }
}
</script>
