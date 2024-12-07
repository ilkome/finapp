<script setup lang="ts">
import { useTrnsStore } from '~/components/trns/useTrnsStore'

defineOptions({ name: 'Dashboard' })

const { t } = useI18n()
const trnsStore = useTrnsStore()

useHead({ title: t('stat.title') })

definePageMeta({
  scrollToTop() {
    setTimeout(() => document.getElementById('pageScroll')?.scrollTo(100, 0), 1)
    return false
  },
})

const scroll = ref(0)

onActivated(() => {
  setTimeout(() => {
    document.getElementById('pageScroll')?.scrollTo(scroll.value, scroll.value)
  }, 5)
})

onBeforeRouteLeave(() => {
  scroll.value = document.getElementById('pageScroll')?.scrollTop ?? 0
})
</script>

<template>
  <StatDashboard v-if="trnsStore.hasItems" />
  <LazyAppWelcome v-else />
</template>
