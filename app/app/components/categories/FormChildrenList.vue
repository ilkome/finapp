<script setup lang="ts">
import type { CandidateGroups } from '~/components/categories/children'
import type { CategoryId } from '~/components/categories/types'

import { candidateGroupOrder, candidatesCount } from '~/components/categories/children'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'

const props = defineProps<{
  groups: CandidateGroups
  /** Any candidate before the search filter; tells "nothing to adopt" from "nothing matches". */
  hasCandidates: boolean
  selectedIds: CategoryId[]
}>()

const emit = defineEmits<{
  toggle: [id: CategoryId]
}>()

const { t } = useI18n()
const categoriesStore = useCategoriesStore()

function parentOf(id: CategoryId) {
  const parentId = categoriesStore.items[id]?.parentId
  return typeof parentId === 'string' ? categoriesStore.items[parentId] : undefined
}
</script>

<template>
  <UiEmpty v-if="!props.hasCandidates">
    {{ t('categories.form.children.noCandidates') }}
  </UiEmpty>

  <template v-else>
    <template v-for="group in candidateGroupOrder" :key="group">
      <div v-if="props.groups[group].length > 0" class="pb-2">
        <div class="px-3 pt-2 pb-1 text-xs tracking-wide text-muted uppercase">
          {{ t(`categories.form.children.group.${group}`) }}
        </div>

        <button
          v-for="id in props.groups[group]"
          :key="id"
          type="button"
          :aria-pressed="props.selectedIds.includes(id)"
          :class="cn('flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition hover:bg-elevated/50', props.selectedIds.includes(id) && 'bg-elevated/30')"
          @click="emit('toggle', id)"
        >
          <div :class="cn('flex size-5 shrink-0 items-center justify-center rounded border transition', props.selectedIds.includes(id) ? 'border-primary bg-primary' : 'border-default')">
            <Icon
              v-if="props.selectedIds.includes(id)"
              name="mdi:check"
              size="14"
              class="text-icon-primary"
            />
          </div>

          <UiIconBase
            :color="categoriesStore.items[id]?.color"
            :name="categoriesStore.items[id]?.icon ?? ''"
            invert
          />

          <CategoriesName
            stacked
            :category="categoriesStore.items[id]!"
            :parentCategory="parentOf(id)"
            :isShowParent="!!parentOf(id)"
          />
        </button>
      </div>
    </template>

    <UiEmpty v-if="candidatesCount(props.groups) === 0">
      {{ t('categories.form.children.noMatches') }}
    </UiEmpty>
  </template>
</template>
