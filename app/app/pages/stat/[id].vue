<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'

defineOptions({ name: 'StatId' })
// Distinct key per id so each drilled category is its own keep-alive entry (a real
// navigation stack): the parent page stays in memory when you open a child.
definePageMeta({ key: route => route.path })

const route = useRoute()
const categoryId = computed(() => route.params.id as CategoryId)
</script>

<template>
  <StatDrilldown :categoryId="categoryId" />
</template>
