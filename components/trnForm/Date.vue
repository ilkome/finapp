<script>
import { formatDate } from '~/utils/formatDate'

export default {
  computed: {
    formattedDate() {
      const date = formatDate(this.$store.state.trnForm.values.date, 'full')
      return `${date.weekday} <br/> ${date.day} ${date.month}`
    },

    isToday() {
      return this.$day().isSame(this.$store.state.trnForm.values.date, 'day')
    },
  },

  methods: {
    setPrevDay() {
      this.$store.commit('trnForm/setTrnFormValues', {
        date: this.$day(this.$store.state.trnForm.values.date).subtract(1, 'day').valueOf(),
      })
    },
    setNextDay() {
      if (!this.isToday) {
        this.$store.commit('trnForm/setTrnFormValues', {
          date: this.$day(this.$store.state.trnForm.values.date).add(1, 'day').valueOf(),
        })
      }
    },
  },
}
</script>

<template lang="pug">
.trnFormDate.pb-2.px-2
  .shame1._arrow.bg-skin-item-main-bg.hocus_bg-skin-item-main-hover(
    @click="setPrevDay()"
  ): .mdi.mdi-chevron-left

  .cursor-pointer.py-2.px-3.flex-center.rounded-md.text-center.text-sm.leading-none.hocus_bg-skin-item-main-hover(
    v-html="formattedDate"
    @click="$store.commit('trnForm/showTrnFormModal', 'calendar')"
  )

  .flex
    .shame1._arrow.bg-skin-item-main-bg.hocus_bg-skin-item-main-hover(
      :class="{ 'opacity-30 !cursor-default' : isToday }"
      @click="setNextDay()"
    ): .mdi.mdi-chevron-right
</template>

<style lang="stylus" scoped>
.shame1
  cursor pointer
  display flex
  align-items center
  justify-content center
  width 58px
  height 58px
  padding $m7
  color var(--c-font-3)
  font-size 28px
  border 1px solid transparent
  border-radius 50%
  user-select none
  anim(100ms)

.trnFormDate
  display grid
  height 100%
  grid-template-columns auto 1fr auto
  grid-column-gap $m8
  text-align center

  &__item
    cursor pointer
    position relative
    display flex
    align-items center
    justify-content center
    width 44px
    height 44px
    padding $m7
    border 1px solid transparent
    border-radius $borderRadiusMd
    user-select none

    +media(400px)
      width 58px
      height 58px

    &._date
      display flex
      padding 0
      width 100%
      height auto
      flex-grow 1
      color var(--c-font-4)
      font-size 12px
      font-weight 400
      line-height 16px
      border-radius 50px
      border-color transparent

    &._arrow
      color var(--c-font-4)
      font-size 28px
      background var(--c-item-bg-main)
      border-radius 50%
      .mdi
        font-size 24px
</style>
