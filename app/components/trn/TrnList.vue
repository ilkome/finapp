<template lang="pug">
div
  h1 Операции
  TrnItem(v-for="trn in trns.slice(0, 10)", :trn="trn")
</template>

<script>
import { mapGetters } from 'vuex'
import formatMoney from '../../mixins/money'
import TrnItem from './TrnItem'

export default {
  mixins: [formatMoney],

  computed: {
    ...mapGetters(['trns'])
  },

  components: { TrnItem }
}
</script>
