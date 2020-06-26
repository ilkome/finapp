<script>
import dayjs from 'dayjs'

import { formatDate } from '~/utils/formatDate'

export default {
  computed: {
    formatedDate () {
      const date = formatDate(this.$store.state.trnForm.values.date, 'full')
      return `${date.weekday}, ${date.day} ${date.month}`
    },

    isToday () {
      return dayjs().isSame(this.$store.state.trnForm.values.date, 'day')
    }
  },

  methods: {
    setPrevDay () {
      this.$store.commit('trnForm/setTrnFormValues', {
        date: dayjs(this.$store.state.trnForm.values.date).subtract(1, 'day').valueOf()
      })
    },
    setNextDay () {
      if (!this.isToday) {
        this.$store.commit('trnForm/setTrnFormValues', {
          date: dayjs(this.$store.state.trnForm.values.date).add(1, 'day').valueOf()
        })
      }
    }
  }
}
</script>

<template lang="pug">
.trnFormDate
  .trnFormDate__item._icon(@click="setPrevDay()"): .mdi.mdi-chevron-left
  .trnFormDate__item(@click="$store.commit('trnForm/toogleTrnFormModal', 'calendar')") {{ formatedDate }}
  .trnFormDate__item._icon(:class="{ _disable: isToday }" @click="setNextDay()"):  .mdi.mdi-chevron-right
</template>

<style lang="stylus" scoped>
@import "~assets/stylus/variables"

.trnFormDate
  display flex
  align-items center
  flex-grow 1
  height 100%
  font-weight 500
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
      color var(--c-font-4)
      font-size 28px

    &._disable
      opacity 0
</style>
