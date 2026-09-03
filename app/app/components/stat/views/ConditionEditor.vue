<script setup lang="ts">
import { statContentWidthKey } from '~/components/stat/injectionKeys'

import type { ConditionField } from './conditionFields'
import type { Condition, ConditionComparator, ConditionGroup } from './types'

import { changeConditionField, getConditionField } from './conditionFields'

defineOptions({ name: 'StatViewsConditionEditor' })

const props = defineProps<{ depth?: number, modelValue: ConditionGroup, removable?: boolean }>()
const emit = defineEmits<{ 'remove': [], 'update:modelValue': [value: ConditionGroup] }>()
const { t } = useI18n()
const contentWidth = inject(statContentWidthKey, ref(null))
const comparators = ['<', '<=', '=', '!=', '>=', '>'].map(value => ({ label: value, value }))
const fields = computed(() => [
  { label: t('stat.views.conditions.fields.period'), value: 'period' },
  { label: t('stat.views.conditions.fields.contentWidth'), value: 'contentWidth' },
  { label: t('stat.views.conditions.fields.walletSelection'), value: 'walletSelection' },
  { label: t('stat.views.conditions.fields.categorySelection'), value: 'category' },
])
const operators = computed(() => [
  { label: t('stat.views.conditions.operators.and'), value: 'and' },
  { label: t('stat.views.conditions.operators.or'), value: 'or' },
])
const units = computed(() => ['day', 'week', 'month', 'year'].map(value => ({ label: t(`stat.views.conditions.units.${value}`), value })))
const selectUi = { content: 'z-[80]' }
function update(children: ConditionGroup['children']) {
  emit('update:modelValue', { ...props.modelValue, children })
}
function addCondition() {
  update([...props.modelValue.children, { comparator: '>', kind: 'categoryCount', scope: 'all', value: 0 }])
}
function replace(index: number, value: Condition | ConditionGroup) {
  update(props.modelValue.children.map((child, childIndex) => childIndex === index ? value : child))
}
function replaceField(index: number, condition: Condition, field: ConditionField) {
  replace(index, changeConditionField(condition, field, contentWidth.value))
}
function remove(index: number) {
  if (props.removable && props.modelValue.children.length === 1) {
    emit('remove')
    return
  }
  update(props.modelValue.children.filter((_, childIndex) => childIndex !== index))
}
function duplicate(index: number) {
  const child = props.modelValue.children[index]
  if (!child)
    return
  const copy = JSON.parse(JSON.stringify(child)) as Condition | ConditionGroup
  update([...props.modelValue.children.slice(0, index + 1), copy, ...props.modelValue.children.slice(index + 1)])
}
function conditionActionItems(index: number) {
  return [[
    { icon: 'i-lucide-copy', label: t('base.duplicate'), onSelect: () => duplicate(index) },
  ], [
    { color: 'error' as const, icon: 'i-lucide-trash-2', label: t('base.delete'), onSelect: () => remove(index) },
  ]]
}
</script>

<template>
  <div class="grid gap-2">
    <template v-for="(child, index) in modelValue.children" :key="index">
      <div v-if="'children' in child" class="grid gap-2">
        <USelect
          v-if="index > 0"
          class="w-20"
          :content="{ position: 'item-aligned' }"
          :items="operators"
          :modelValue="modelValue.operator"
          :ui="selectUi"
          :aria-label="t('stat.views.conditions.labels.operator')"
          @update:modelValue="$emit('update:modelValue', { ...modelValue, operator: $event as 'and' | 'or' })"
        />
        <StatViewsConditionEditor
          :depth="(depth ?? 0) + 1"
          :modelValue="child"
          removable
          @remove="remove(index)"
          @update:modelValue="replace(index, $event)"
        />
      </div>
      <div
        v-else
        class="relative min-w-0 pr-11"
      >
        <div class="flex min-w-0 flex-wrap items-center gap-1">
          <USelect
            v-if="index > 0"
            class="w-20 shrink-0"
            :content="{ position: 'item-aligned' }"
            :items="operators"
            :modelValue="modelValue.operator"
            :ui="selectUi"
            :aria-label="t('stat.views.conditions.labels.operator')"
            @update:modelValue="$emit('update:modelValue', { ...modelValue, operator: $event as 'and' | 'or' })"
          />
          <USelect class="min-w-32 grow" :content="{ position: 'item-aligned' }" :items="fields" :modelValue="getConditionField(child)" :ui="selectUi" :aria-label="t('stat.views.conditions.labels.field')" @update:modelValue="replaceField(index, child, $event as ConditionField)" />
          <StatViewsEntitySelectionEditor
            v-if="child.kind === 'walletSelection' || child.kind === 'categorySelection' || child.kind === 'categoryCount'"
            :modelValue="child"
            @update:modelValue="replace(index, $event)"
          />
          <template v-else>
            <USelect class="w-16 shrink-0" :content="{ position: 'item-aligned' }" :items="comparators" :modelValue="child.comparator" :ui="selectUi" :aria-label="t('stat.views.conditions.labels.comparator')" @update:modelValue="replace(index, { ...child, comparator: $event as ConditionComparator })" />
            <UInputNumber
              class="w-24 shrink-0"
              :decrement="false"
              :increment="false"
              :min="child.kind === 'period' ? 1 : 0"
              :modelValue="child.value"
              :ui="{ base: 'text-center' }"
              @update:modelValue="replace(index, { ...child, value: Number($event) })"
            />
            <USelect v-if="child.kind === 'period'" class="w-24 shrink-0" :content="{ position: 'item-aligned' }" :items="units" :modelValue="child.unit" :ui="selectUi" :aria-label="t('stat.views.conditions.labels.unit')" @update:modelValue="replace(index, { ...child, unit: $event as 'day' | 'week' | 'month' | 'year' })" />
            <span v-else-if="child.kind === 'contentWidth'" class="w-10 shrink-0 px-2 text-sm text-muted">px</span>
          </template>
        </div>
        <div class="absolute -top-1 -right-1 flex justify-end">
          <UDropdownMenu :items="conditionActionItems(index)" :content="{ align: 'end' }" :modal="false">
            <StatViewsMoreButton :ariaLabel="$t('base.moreOptions')" />
          </UDropdownMenu>
        </div>
      </div>
    </template>
    <div v-if="!removable">
      <StatConfigActionButton
        icon="i-lucide-plus"
        :label="t('stat.views.conditions.addCondition')"
        @click="addCondition"
      />
    </div>
  </div>
</template>
