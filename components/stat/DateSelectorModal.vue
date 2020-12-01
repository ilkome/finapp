<script>
export default {
  name: 'DateSelectorModal',

  data () {
    return {
      isShow: true,
      periodsNames: [{
        slug: 'day',
        icon: 'mdi mdi-weather-sunset-up',
        name: this.$t('dates.day.simple')
      }, {
        slug: 'week',
        icon: 'mdi mdi-calendar-week',
        name: this.$t('dates.week.simple')
      }, {
        slug: 'month',
        icon: 'mdi mdi-calendar',
        name: this.$t('dates.month.simple')
      }, {
        slug: 'year',
        icon: 'mdi mdi-calendar-star',
        name: this.$t('dates.year.simple')
      }]
    }
  },

  computed: {
    activePriodName () {
      return this.$store.state.filter.period
    }
  },

  methods: {
    onSelectPeriod (period) {
      this.$store.dispatch('filter/setPeriod', period)
      this.$emit('onClose')
    }
  }
}
</script>

<template lang="pug">
Portal(
  v-if="isShow"
  to="modal"
)
  ModalBottom(
    @onClose="$emit('onClose')"
    @afterClose="$emit('afterClose')"
  )
    template(slot="header")
      .modalBottom__header__title
        .ta_center
          Date

    .grid
      ModalButton(
        v-for="periodItem in periodsNames"
        :icon="periodItem.icon"
        :isActive="activePriodName === periodItem.slug"
        :key="periodItem.slug"
        :name="$t(`dates.${periodItem.slug}.simple`)"
        @onClick="onSelectPeriod(periodItem.slug)"
      )
      ModalButton(
        :isActive="activePriodName === 'all'"
        :name="$t('dates.all.simple')"
        icon="mdi mdi-database"
        @onClick="onSelectPeriod('all')"
      )
</template>

<style lang="stylus" scoped>
.ta_center
  display flex
  align-items center
  justify-content center
  text-align center

.grid
  display grid
  grid-template-columns repeat(auto-fit, minmax(75px, 1fr))
  grid-column-gap 0
  grid-row-gap $m7
</style>
