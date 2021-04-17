<script>
import { computed, useContext } from '@nuxtjs/composition-api'
import useMobileLayout from '~/components/layout/useMobileLayout'
import usePeriods from '~/components/periods/usePeriods'

export default {
  name: 'DateSelectorModal',

  setup () {
    const { store } = useContext()

    const { hidePeriodsNamesModal } = useMobileLayout()

    const { periodsNames } = usePeriods()
    function onSelectPeriod (period) {
      hidePeriodsNamesModal()
      store.dispatch('filter/setPeriod', period)
    }

    const filterPeriod = computed(() => store.state.filter.period)

    return {
      hidePeriodsNamesModal,

      periodsNames,
      onSelectPeriod,

      filterPeriod
    }
  }
}
</script>

<template lang="pug">
Portal(to="modal")
  ModalBottom(@onClose="hidePeriodsNamesModal")
    template(slot="header")
      .modalBottom__header__title
        .ta_center
          SharedDate

    .grid
      ModalButton(
        v-for="periodItem in periodsNames"
        :key="periodItem.slug"
        :icon="periodItem.icon"
        :isActive="filterPeriod === periodItem.slug"
        :name="$t(`dates.${periodItem.slug}.simple`)"
        @onClick="onSelectPeriod(periodItem.slug)"
      )
      ModalButton(
        :isActive="filterPeriod === 'all'"
        :name="$t('dates.all.simple')"
        icon="mdi mdi-database"
        @onClick="onSelectPeriod('all')"
      )
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables'

.ta_center
  display flex
  align-items center
  justify-content center
  text-align center

.grid
  display grid
  grid-template-columns repeat(auto-fit, minmax(100px, 1fr))
  grid-column-gap $m7
  grid-row-gap $m7
</style>
