<template lang="pug">
.trnItem(:class="{ _editable: trn.id === editedTrn, _padding: view !== 'small'}")
  //- Trns small
  //------------------------------------------------
  template(v-if="view === 'small'")
    .trnItem__content
      .trnItem__pic
        .icon._round(
          :style="{ background: trn.account.color }"
          :title="trn.account.name"
        )
          .icon__abbr {{ trn.account.name.charAt(0) }}{{ trn.account.name.charAt(1) }}

      .trnItem__price(:class="trn.type === 1 ? 'income' : 'expense'")
        div {{ formatMoney(trn.amountRub) }}
        div(v-if="trn.currency != 'RUB'") {{ formatMoney(trn.amount, trn.currency) }}

      .trnItem__cell
        .trnItem__line._date {{ formatDate(trn.date, 'D MMM YY') }}

      .trnItem__actions
        template(v-if="editedTrn && trn.id === editedTrn")
          .trnItem__action(@click.stop.prevent="$store.commit('closeTrnForm')").fa.fa-times-circle
        template(v-else)
          .trnItem__action(@click.stop.prevent="setEditTrn(trn.id)").fa.fa-pencil-square-o
        .trnItem__action(@click.prevent.stop="askQuestion(trn.id)").fa.fa-trash-o

    .trnItem__description(v-if="trn.description") {{ trn.description }}

  //- Trns big
  //------------------------------------------------
  template(v-else)
    .trnItem__content
      .trnItem__pic
        .icon(:style="`background: ${trn.categoryColor}`")
          div(:class="trn.categoryIcon")

      .trnItem__price(:class="trn.type === 1 ? 'income' : 'expense'")
        div {{ formatMoney(trn.amountRub) }}
        div(v-if="trn.currency != 'RUB'") {{ formatMoney(trn.amount, trn.currency) }}

      template(v-if="!$store.state.isMobile")
        .trnItem__cell
          .trnItem__line._date {{ formatDate(trn.date, 'D MMM YY') }}
        .trnItem__cell
          .trnItem__line {{ trn.accountName }}
      template(v-else)
        .trnItem__cell
          .trnItem__line._date {{ formatDate(trn.date, 'D MMM YY') }}
          .trnItem__line {{ trn.accountName }}

      .trnItem__actions
        template(v-if="editedTrn && trn.id === editedTrn")
          .trnItem__action(@click.stop.prevent="$store.commit('closeTrnForm')").fa.fa-times-circle
        template(v-else)
          .trnItem__action(@click.stop.prevent="setEditTrn(trn.id)").fa.fa-pencil-square-o
        .trnItem__action(@click.prevent.stop="askQuestion(trn.id)").fa.fa-trash-o

    .trnItem__description._big(v-if="trn.description") {{ trn.description }}

  .item__question(:class="{_visible: questionId === trn.id}")
    .item__el._question
      div Delete trn?
    .item__el._action(@click.prevent.stop="close()"): .fa.fa-ban
    .item__el._action(@click.prevent.stop="deleteTrn(trn.id)"): .fa.fa-check
</template>


<script>
import { mapGetters } from 'vuex'
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
    ...mapGetters(['accounts']),
    editedTrn() {
      return this.$store.state.trnForm.updateTrnId
    }
  },

  methods: {
    async deleteTrn(id) {
      this.$store.commit('showLoader')
      await this.$store.dispatch('deleteTrn', id)
      if (id === this.$store.state.trnForm.updateTrnId) {
        this.$store.commit('closeTrnForm')
      }
      this.questionId = null
      this.$store.commit('closeLoader')
      this.$notify({
        group: 'foo',
        title: 'Succesed',
        text: 'Trn was deleted.',
        type: 'success'
      })
      return
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
