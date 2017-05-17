<template lang="pug">
.trnsList
  transition(name="slide")
    template(v-if="trnsIdsForDelete.length > 0")
      div.remove
        a.btn._big(@click.prevent="removeSelectedTrns()") Удалить выбранные транзакции: {{trnsIdsForDelete.length}}
        //- a.btn(@click.prevent="clearSelectedTrns()") Отмена

  .items(v-for="(trns, date) of trnsList")
    h3.title._border {{ date | date }}
    .items__list
      TrnItem(v-for="trn in trns", :trn="trn", :key="trn.id", v-on:toogleTrn="toogleTrn")

</template>


<script>
import groupBy from 'lodash/groupBy'
import moment from 'moment'
import formatMoney from '../mixins/formatMoney'
import TrnItem from './TrnItem.vue'

export default {
  mixins: [formatMoney],

  props: {
    trns: {
      type: Array,
      required: true
    }
  },

  data() {
    return {
      trnsIdsForDelete: []
    }
  },

  computed: {
    trnsList() {
      return groupBy(this.trns, trn => moment(trn.date).format('D.MM.YY'))
    }
  },

  methods: {
    toogleTrn(id) {
      if (this.trnsIdsForDelete.indexOf(id) === -1) {
        this.trnsIdsForDelete.push(id)
      } else {
        this.trnsIdsForDelete.splice(this.trnsIdsForDelete.indexOf(id), 1)
      }
    },
    removeSelectedTrns() {
      this.$store.dispatch('deleteTrns', this.trnsIdsForDelete)
      this.trnsIdsForDelete = []
    },

    clearSelectedTrns() {
      this.trnsIdsForDelete = []
    }
  },

  components: { TrnItem }
}
</script>
