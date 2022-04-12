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
.my-4(class="max-w-[420px]")
  .pb-2.text-lg.leading-none.font-nunito.font-semibold.text-skin-item-base {{ $t('trns.inPeriodTitle') }}

  TrnsList(
    :incomes="statPage.activeTab === 'incomes'"
    :expenses="statPage.activeTab === 'expenses'"
    :size="12"
    classNames="md_grid-cols-1"
  )
</template>
