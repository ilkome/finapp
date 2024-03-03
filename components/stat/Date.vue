<script setup lang="ts">
import { getStyles } from '~/components/ui/classes'
import { useFilter } from '~/components/filter/useFilter'

const filterStore = useFilter()
const isShowDateSelector = ref(false)
</script>

<template lang="pug">
.z-10(
  :class="getStyles('item', ['link', 'rounded'])"
)
  //- Date
  .px-2.flex.items-center.text-lg(
    @click="isShowDateSelector = true"
  )
    .py-2.text-item-base-up.font-semibold.font-nunito.leading-none
      SharedDate(
        :date="filterStore.date"
        :period="filterStore.period"
      )

    .mdi.mdi-dots-vertical

  //- Selector
  LazyDateSelector(
    v-if="isShowDateSelector"
    @close="isShowDateSelector = false"
  )
</template>
