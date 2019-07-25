<script>
import moment from 'moment'

import { formatDate } from '@/utils/formatDate'

export default {
  computed: {
    formatedDate () {
      const date = formatDate(this.$store.state.trnForm.values.date, 'full')
      return `${date.weekday}, ${date.day} ${date.month}`
    },

    isToday () {
      return moment().isSame(this.$store.state.trnForm.values.date, 'day')
    }
  },

  methods: {
    setPrevDay () {
      this.$store.commit('setTrnFormValues', {
        date: moment(this.$store.state.trnForm.values.date).subtract(1, 'day').valueOf()
      })
    },
    setNextDay () {
      if (!this.isToday) {
        this.$store.commit('setTrnFormValues', {
          date: moment(this.$store.state.trnForm.values.date).add(1, 'day').valueOf()
        })
      }
    }
  }
}
</script>

<template lang="pug">
.trnFormDate
  .trnFormDate__item._icon(@click="setPrevDay()"): .mdi.mdi-chevron-left
  .trnFormDate__item(@click="$store.commit('toogleTrnFormModal', 'calendar')") {{ formatedDate }}
  .trnFormDate__item._icon(:class="{ _disable: isToday }" @click="setNextDay()"):  .mdi.mdi-chevron-right
</template>

<style lang="stylus" scoped>
@import "~@/stylus/variables"

.trnFormDate
  display flex
  align-items center
  flex-grow 1
  height 100%
  font-medium()
  text-align center

  &__item
    display flex
    align-items center
    justify-content center
    flex-grow 1
    height 100%

    &:hover
      @media $media-laptop
        background var(--c-bg-5)

    &:active
      background var(--c-bg-5)

    &._icon
      font-size 22px
      color var(--c-font-4)

    &._disable
      opacity .3
</style>
