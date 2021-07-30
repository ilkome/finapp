<script>
import { ref, useContext } from '@nuxtjs/composition-api'
import usePeriods from '~/components/periods/usePeriods'

export default {
  name: 'DateMobileSelector',

  setup () {
    const { store } = useContext()
    const { periodsNames } = usePeriods()

    const visiblePeriodMenu = ref(false)

    const onSelectPeriod = period => store.dispatch('filter/setPeriod', period)

    return {
      visiblePeriodMenu,
      periodsNames,
      onSelectPeriod
    }
  }
}
</script>

<template lang="pug">
.dateSelector
  .dateSelector__in
    SharedContextMenu(
      :position="{ left: '-24px', top: true }"
      :visible="visiblePeriodMenu"
      @onClickOpener="visiblePeriodMenu = !visiblePeriodMenu"
    )
      template(slot="opener")
        .menuDots
          .menuDots__name: SharedDate(:type="2")
          .menuDots__dots: .mdi.mdi-dots-vertical

      template(slot="content")
        SharedContextMenuItem(
          v-for="periodItem in periodsNames"
          :key="periodItem.slug"
          :icon="periodItem.icon"
          :selected="filterPeriod === periodItem.slug"
          :title="$t(`dates.${periodItem.slug}.simple`)"
          @onClick="onSelectPeriod(periodItem.slug)"
          @onClose="visiblePeriodMenu = !visiblePeriodMenu"
        )
        SharedContextMenuItem(
          :selected="filterPeriod === 'all'"
          :title="$t('dates.all.simple')"
          icon="mdi mdi-database"
          @onClick="onSelectPeriod('all')"
          @onClose="visiblePeriodMenu = !visiblePeriodMenu"
        )
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables'

.hey
  max-width 200px

.dateSelector
  display flex
  align-items center
  justify-content center
  padding-top $m5

  &__in
    position relative

.menuDots
  cursor pointer
  display flex
  align-items center
  justify-content center
  padding $m6 $m8
  color var(--c-font-3)
  font-size 22px
  font-weight 500
  border-radius $m8
  anim()

  +media(600px)
    font-size 26px
    font-weight 600
    fontFamilyNunito()
    background none

  +media-hover()
    color var(--c-blue-1)

  &__dots
    margin-top -2px
    margin-right -5px
    padding-top 3px
    padding-left 4px
    color var(--c-font-2)
    font-size 16px

    +media(600px)
      padding-left 6px
      font-size 22px
</style>
