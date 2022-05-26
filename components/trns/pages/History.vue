<script setup lang="ts">
import useStatPage from '~/components/stat/useStatPage'
const { statPage } = useStatPage()
</script>

<script lang="ts">
export default defineComponent({
  head() {
    return {
      title: this.$t('trns.history'),
    }
  },
})
</script>

<template lang="pug">
.h-full.overflow.overflow-x-auto
  .py-6.px-2.font-nunito.text-neutral-800.dark_text-white.text-2xl.leading-none.font-semibold
    | {{ $t('trns.history') }}

  .px-2
    .pb-8(v-if="statPage.filter.isShow")
      LazyStatFilter

    .my-4.px-2.md_max-w-none(class="max-w-[420px]")
      TrnsListWithControl(:trnsIds="allTrnsWithFilter")
</template>
