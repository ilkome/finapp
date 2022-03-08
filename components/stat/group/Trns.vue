<script>
import useStatPage from '~/components/stat/useStatPage'

export default defineComponent({
  setup() {
    const { statPage } = useStatPage()

    return {
      statPage,
    }
  },
})
</script>

<template lang="pug">
div(class="max-w-[420px]")
  .py-2
    .statTitle {{ $t('trns.inPeriodTitle') }}

  TrnsList(
    :incomes="statPage.activeTab === 'incomes'"
    :expenses="statPage.activeTab === 'expenses'"
    :size="12"
    classNames="md_grid-cols-1"
  )
</template>
