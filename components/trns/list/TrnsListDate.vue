<script>
import { formatDate } from '~/utils/formatDate'

export default {
  props: {
    date: {
      type: String,
      required: true
    }
  },

  computed: {
    formatedDate () {
      return formatDate(this.date, 'full')
    }
  }
}
</script>

<template lang="pug">
.trnsListDate
  .trnsListDate__day {{ formatedDate.day }}
  .trnsListDate__weekday {{ formatedDate.weekday }}
  .trnsListDate__details
    .trnsListDate__month {{ formatedDate.month }}
    .trnsListDate__year {{ formatedDate.year }}
</template>

<style lang="stylus" scoped>
@import "~assets/stylus/variables/margins"

.trnsListDate
  display grid
  grid-template-columns minmax(0, max-content) minmax(0, max-content)
  grid-template-rows repeat(2, minmax(0, max-content))

  &__day
    grid-column 1 / 2
    grid-row 1 / 3
    padding-right 10px
    align-self center
    font-size 32px
    font-weight 500

  &__weekday
    padding-top 2px
    grid-column 2 / 3
    grid-row 1 / 2
    font-size 13px

  &__details
    grid-column 2 / 3
    grid-row 2 / 3
    display flex
    color var(--c-font-4)
    font-size 12px

  &__month
    margin-right $m4
</style>
