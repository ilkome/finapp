<script>
import { formatDate } from '@/utils/formatDate'

export default {
  computed: {
    formatedDate () {
      const date = formatDate(this.$store.state.trnForm.values.date, 'full')
      return `${date.weekDay}, ${date.day} ${date.month}`
    }
  },

  methods: {
    handleChangeAmountType () {
    }
  }
}
</script>

<template lang="pug">
.trnFormDate(@click="$store.commit('toogleTrnFormModal', 'calendar')") {{ formatedDate }}
</template>

<style lang="stylus" scoped>
@import "~@/stylus/variables/margins"
@import "~@/stylus/variables/media"

.trnFormDate
  display flex
  align-items center
  justify-content center
  flex-grow 1
  padding $m8 $m9
  font-medium()
  text-align center
</style>
