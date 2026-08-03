<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'

import type { TrnsViewType } from '~/components/trns/types'

defineProps<{
  filterBy: TrnsViewType | 'all'
  isAllTrnsWithDesc: boolean
  isShowFilterByDesc?: boolean
  isShowFilterByType?: boolean
  isShowWithDesc: boolean
  isTrnsWithDesc: boolean
  realTypesCount: number
  selectedCount: number
  typeFilterItems: TabsItem[]
}>()

const emit = defineEmits<{
  'setFilterBy': [type: TrnsViewType | 'all']
  'update:isShowWithDesc': [value: boolean]
}>()

const { t } = useI18n()
</script>

<template>
  <UiTabs
    v-if="isShowFilterByType && realTypesCount > 1"
    size="xs"
    class="mb-2"
    :items="typeFilterItems"
    :modelValue="filterBy"
    @update:modelValue="(v) => emit('setFilterBy', v as TrnsViewType | 'all')"
  />

  <div
    v-if="isShowFilterByDesc && isTrnsWithDesc && !isAllTrnsWithDesc && selectedCount > 0"
    class="relative"
  >
    <UiSwitchItem
      :checkboxValue="isShowWithDesc"
      :title="t('trns.filter.showTrnsWithDesc')"
      showCheckbox
      @click="emit('update:isShowWithDesc', !isShowWithDesc)"
    />
  </div>
</template>
