<script setup lang="ts">
import useStatPage from '~/components/stat/useStatPage'
const { statPage } = useStatPage()
</script>

<template lang="pug">
div
  StatSumTotal(
    v-if="statPage.activeTab !== 'incomes' && statPage.activeTab !== 'expenses'"
    typeText="incomes"
  )

  StatSumGroup(
    v-if="statPage.activeTab === 'incomes'"
    typeText="incomes"
  )

  StatSumGroup(
    v-if="statPage.activeTab === 'expenses'"
    typeText="expenses"
  )
</template>
