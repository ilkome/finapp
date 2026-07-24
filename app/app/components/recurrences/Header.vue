<script setup lang="ts">
import type { RecurrenceItem } from '~/components/recurrences/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'

const props = defineProps<{
  rule: RecurrenceItem
}>()

const { t } = useI18n()
const categoriesStore = useCategoriesStore()
const category = computed(() => categoriesStore.items?.[props.rule.categoryId])
</script>

<template>
  <UiHeaderTitle>
    <div class="flex min-w-0 items-center">
      <NuxtLink
        to="/recurrences"
        class="truncate text-lg font-medium text-muted no-underline hover:text-highlighted @lg:text-xl"
      >
        {{ t('recurrences.title') }}
      </NuxtLink>

      <span class="mx-1 text-lg text-muted @lg:text-xl">/</span>

      <span class="truncate">
        {{ category?.name ?? props.rule.categoryId }}
        <span v-if="props.rule.desc" class="text-muted"> · {{ props.rule.desc }}</span>
      </span>
    </div>
  </UiHeaderTitle>
</template>
