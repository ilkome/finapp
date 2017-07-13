<template lang="pug">
.trnItem
  //- pre {{ questionId }}
  //- Trns for form
  //------------------------------------------------
  template(v-if="view === 'form'")
    .trnItem__content
      .grid._form
        router-link.grid__item._icon(
          :to="`/categories/${trn.categoryId}`",
          title="Перейти в категорию"
        )
          .icon._link(:class="`icon-${trn.categoryId}`"): .icon__pic
        .grid__item._price(:class="trn.type === 1 ? 'income' : 'expense'")
          div {{ formatMoney(trn.amountRub) }}
          div(v-if="trn.currency != 'RUB'") {{ formatMoney(trn.amount, trn.currency) }}
        .grid__item
          .grid__item__date {{ formatDate(trn.date, 'D MMM') }}
          .grid__item__account {{ trn.accountName }}
        .grid__item._description {{ trn.description }}
        .grid__item._action(@click.prevent.stop="askQuestion(trn.id)"): .fa.fa-trash-o


  //- Trns small
  //------------------------------------------------
  template(v-else-if="noDates")
    .trnItem__content
      .grid(:class="{_updated: trn.id === wasUpdatedTrn, _editable: trn.id === editedTrn}")
        .grid__item._price(:class="trn.type === 1 ? 'income' : 'expense'")
          div {{ formatMoney(trn.amountRub) }}
          div(v-if="trn.currency != 'RUB'") {{ formatMoney(trn.amount, trn.currency) }}
        .grid__item
          .grid__item__date {{ formatDate(trn.date, 'D MMM') }}
          .grid__item__account {{ trn.accountName }}
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
          title="Перейти в категорию"
        )
          .icon._link(:class="`icon-${trn.categoryId}`"): .icon__pic

        .item__el._price(:class="trn.type === 1 ? 'income' : 'expense'")
          div(v-if="trn.currency != 'RUB'") {{ formatMoney(trn.amount, trn.currency) }}
          div {{ formatMoney(trn.amountRub) }}
        .item__el._account(:class="trn.accountId === 1 ? 'c-tinkoff' : 'c-rub'") {{ trn.accountName }}
        .item__el._category {{ trn.categoryName }}
        template(v-if="editedTrn && trn.id === editedTrn")
          .item__el._action(@click.stop.prevent="$store.commit('closeTrnForm')").fa.fa-times-circle
        template(v-else)
          .item__el._action(@click.stop.prevent="setEditTrn(trn.id)").fa.fa-pencil-square-o
        .item__el._action(@click.prevent.stop="askQuestion(trn.id)"): .fa.fa-trash-o


  .item__question(:class="{_visible: questionId === trn.id}")
    .item__el._question
      div Удалить транзакцию?
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
    },
    noDates: {
      type: Boolean,
      required: false,
      default: false
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
      return this.$store.state.trnForm.isUpdateTrn
    },
    wasUpdatedTrn() {
      return this.$store.state.trnForm.wasUpdatedTrn
    }
  },

  methods: {
    async deleteTrn(id) {
      console.groupCollapsed('TrnItem: deleteTrn:', Number(id))
      this.$store.commit('showLoader')
      await this.$store.dispatch('deleteTrn', Number(id))
      if (id === this.$store.state.trnForm.isUpdateTrn) {
        this.$store.commit('closeTrnForm')
      }
      this.questionId = null
      this.$store.commit('disableLoader')
      console.groupEnd()
    },

    askQuestion(trnId) {
      this.questionId = trnId
    },

    close() {
      this.questionId = null
    },

    setEditTrn(trnId) {
      this.$store.commit('setTrnForm', { action: 'update', trnId })
    }
  }
}
</script>
