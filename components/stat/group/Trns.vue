<script>
import { defineComponent } from '#app'
import useStatPage from '~/components/stat/useStatPage'

export default defineComponent({
  setup () {
    const { statPage } = useStatPage()

    return {
      statPage
    }
  }
})
</script>

<template lang="pug">
div
  .py-2
    .statTitle {{ $t('trns.inPeriodTitle') }}

  TrnsList(
    :incomes="statPage.activeTab === 'incomes'"
    :expenses="statPage.activeTab === 'expenses'"
    :size="12"
    classNames="md:grid-cols-1"
  )
</template>
