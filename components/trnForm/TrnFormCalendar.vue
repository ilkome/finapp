<script>
import { formatDate } from '~/utils/formatDate'

export default {
  computed: {
    formatedDate () {
      const date = formatDate(this.$store.state.trnForm.values.date, 'full')
      return `${date.weekday}, ${date.day} ${date.month}`
    },

    isToday () {
      return this.$day().isSame(this.$store.state.trnForm.values.date, 'day')
    }
  },

  methods: {
    setPrevDay () {
      this.$store.commit('trnForm/setTrnFormValues', {
        date: this.$day(this.$store.state.trnForm.values.date).subtract(1, 'day').valueOf()
      })
    },
    setNextDay () {
      if (!this.isToday) {
        this.$store.commit('trnForm/setTrnFormValues', {
          date: this.$day(this.$store.state.trnForm.values.date).add(1, 'day').valueOf()
        })
      }
    }
  }
}
</script>

<template lang="pug">
.trnFormMeta
  .trnFormMeta__date
    .trnFormDate
      .trnFormDate__item._icon(@click="setPrevDay()"): .mdi.mdi-chevron-left
      .trnFormDate__item._date(@click="$store.commit('trnForm/showTrnFormModal', 'calendar')") {{ formatedDate }}
      .trnFormDate__item._icon(:class="{ _disable: isToday }" @click="setNextDay()"):  .mdi.mdi-chevron-right

  .trnFormMeta__desc(
    @click="$store.commit('trnForm/showTrnFormModal', 'description')"
  )
    .mdi.mdi-comment-text-outline
    .dot(v-if="$store.state.trnForm.values.description")
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables'

.trnFormMeta
  display grid
  grid-template-columns repeat(5, minmax(10px, 1fr))
  padding 0 $m6
  border-top 1px solid var(--c-bg-3)

  @media $media-laptop
    color var(--c-font-4)
    border-top 0

  &__date
    grid-column 1/5
    grid-row 1/-1

  &__desc
    position relative
    padding $m6
    color var(--c-font-4)
    font-size 22px
    text-align center
    border-radius $m7

    +media-hover()
      background var(--c-bg-5)

    &._active
      color var(--c-font-1)

    .dot
      position absolute
      top $m7
      right $m7
      width 6px
      height 6px
      background var(--c-bg-9)
      border-radius 50%

.trnFormDate
  display grid
  height 100%
  grid-template-columns repeat(4, minmax(10px, 1fr))
  font-size 12px
  font-weight 500
  text-align center

  &__item
    display flex
    align-items center
    justify-content center
    flex-grow 1
    height 100%
    border-radius $m7

    &._date
      grid-column 2/4
      color var(--c-font-3)

    +media-hover()
      background var(--c-bg-5)

    &._icon
      color var(--c-font-4)
      font-size 28px

    &._disable
      opacity .4

      &:hover
      &:active
        background none
</style>
