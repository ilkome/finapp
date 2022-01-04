<script>
import { toRefs, defineComponent } from '#app'
import useStatPage from '~/components/stat/useStatPage'
import useStat from '~/modules/stat/useStat'

export default defineComponent({
  props: {
    typeText: { type: String, required: true }
  },

  setup (props) {
    const { typeText } = toRefs(props)
    const { statPage } = useStatPage()
    const { moneyTypes } = useStat()
    const typeNumber = moneyTypes.find(t => t.id === typeText.value)?.type

    return {
      statPage,
      typeNumber
    }
  }
})
</script>

<template lang="pug">
.sticky.top-0.z-10.bg-3
  .py-3
    .statTitle.pb-2(v-if="statPage.activeTab !== typeText") {{ $t(`money.${typeText}`) }}
    .overflow-hidden.overflow-x-auto.scrollbar
      .flex.items-center
        //- Total
        .pr-6
          Amount(
            :currency="$store.state.currencies.base"
            :type="typeNumber"
            :value="statPage.current[typeText].total"
            size="xl"
            vertical="left"
          )

        //- Average
        LazyStatSummaryRowItemView(
          v-if="statPage.average[typeText] !== 0"
          :amount="statPage.average[typeText]"
          :title="$t(`money.average.${typeText}`)"
          :type="typeNumber"
        )

        //- Today
        LazyStatSummaryRowItemView(
          v-if="statToday && statToday[typeText].total !== 0"
          :amount="statToday[typeText].total"
          :title="$t('dates.day.today')"
          :type="typeNumber"
        )
</template>
