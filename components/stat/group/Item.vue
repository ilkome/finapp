<script setup lang="ts">
import useStatPage from '~/components/stat/useStatPage'
defineProps<{
  typeText: String
}>()
const { statPage } = useStatPage()
</script>

<template lang="pug">
div
  StatSumGroup(
    v-if="statPage.activeTab === 'details' || statPage.activeTab === 'balance'"
    :typeText="typeText"
  )

  .px-2.flex.flex-wrap.items-center.justify-between.gap-x-6
    StatViewConfig

  template(v-if="statPage.activeTab !== 'balance'")
    StatGroupEmpty(:typeText="typeText")
    StatGroupPie(:typeText="typeText")
    StatGroupVertical(:typeText="typeText")
    StatGroupRound(:typeText="typeText")
    StatGroupHorizontal(:typeText="typeText")

  template(v-if="statPage.activeTab === 'balance'")
    StatGroupBudget(:typeText="typeText")
</template>
