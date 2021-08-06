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
.trnFormDate
  .trnFormDate__item._icon(@click="setPrevDay()"): .mdi.mdi-chevron-left
  .trnFormDate__item._date(@click="$store.commit('trnForm/showTrnFormModal', 'calendar')") {{ formatedDate }}
  .flex
    .trnFormDate__item._icon(
      v-if="!isToday" @click="setNextDay()"
      style="marginRight: 16px"
    ): .mdi.mdi-chevron-right
    .trnFormDate__item._icon(
      :class="{ _desc: $store.state.trnForm.values.description }"
      @click="$store.commit('trnForm/showTrnFormModal', 'description')"
    )
      .mdi.mdi-comment-text-outline
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables'

.trnFormDate
  display grid
  height 100%
  grid-template-columns auto 1fr auto
  grid-column-gap $m8
  padding 0 $m7
  font-size 12px
  font-weight 500
  text-align center

  &__item
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
    anim()

    +media(400px)
      width 58px
      height 58px

    +media-hover()
      background var(--c-item-bg-hover)
      border 1px solid var(--c-item-bd-hover)

    &._date
      width 100%
      height auto
      flex-grow 1
      color var(--c-font-3)
      font-size 12px

    &._desc .mdi
      color var(--c-blue-1)

    &._icon
      color var(--c-font-4)
      font-size 28px
      background var(--c-bg-4)
      border-radius 50%

      .mdi
        font-size 18px

    &._disable
      opacity .4

      &:hover
      &:active
        background none
</style>
