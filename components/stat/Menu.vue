<script>
export default {
  name: 'StatDashboardMenu',

  setup() {
    const { $store } = useNuxtApp()
    const activeTabStat = computed(() => $store.state.ui.activeTabStat)

    function onClickStatMenu(tabName) {
      $store.dispatch('ui/setActiveTabStat', tabName)
    }

    return {
      activeTabStat,
      onClickStatMenu,
    }
  },
}
</script>

<template lang="pug">
.overflow-hidden.rounded-md.bg-gray-50.dark_bg-dark4.dark_shadow
  .overflow-hidden.overflow-x-auto.flex.items-center.text-sm.text-center.max-w-md
    .cursor-pointer.px-4.py-3.grow.hocus_bg-gray-200.dark_hocus_bg-neutral-800(
      :class="{ '_active cursor-default text-blue3 dark_text-blue1 bg-gray-100 dark_bg-232323': activeTabStat === 'details' }"
      @click="onClickStatMenu('details')"
    ) {{ $t('stat.periods') }}

    .cursor-pointer.px-4.py-3.grow.hocus_bg-gray-200.dark_hocus_bg-neutral-800(
      :class="{ '_active cursor-default text-blue3 dark_text-blue1 bg-gray-100 dark_bg-232323': activeTabStat === 'expenses' }"
      @click="onClickStatMenu('expenses')"
    ) {{ $t('money.expenses') }}

    .cursor-pointer.px-4.py-3.grow.hocus_bg-gray-200.dark_hocus_bg-neutral-800(
      :class="{ '_active cursor-default text-blue3 dark_text-blue1 bg-gray-100 dark_bg-232323': activeTabStat === 'incomes' }"
      @click="onClickStatMenu('incomes')"
    ) {{ $t('money.incomes') }}

    .cursor-pointer.px-4.py-3.grow.hocus_bg-gray-200.dark_hocus_bg-neutral-800(
      :class="{ '_active cursor-default text-blue3 dark_text-blue1 bg-gray-100 dark_bg-232323': activeTabStat === 'trns' }"
      @click="onClickStatMenu('trns')"
    ) {{ $t('trns.shortTitle') }}

    .cursor-pointer.px-4.py-3.grow.flex-center.hocus_bg-gray-200.dark_hocus_bg-neutral-800(
      @click="$router.push('history')"
    )
      span {{ $t('trns.history') }}
      span.mdi.mdi-open-in-new.ml-1
</template>
