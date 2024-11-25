<script setup lang="ts">
import type { StatTabs } from '~/components/app/types'

const props = defineProps<{
  active: StatTabs
}>()

const emit = defineEmits<{
  click: [id: StatTabs]
}>()

const { t } = useI18n()

const menu = computed(() => {
  const all: {
    id: StatTabs
    idx: number
    name: string | unknown
  }[] = []

  all.push({
    id: 'netIncome',
    idx: 0,
    name: t('money.netIncome'),
  })
  all.push({
    id: 'sum',
    idx: 0,
    name: t('stat.summary'),
  })

  return all
})

function onClickStatMenu(tabName: StatTabs) {
  emit('click', tabName)
}

onMounted(() => {
  if (!menu.value.find(i => i.id === props.active)) {
    onClickStatMenu(menu.value[0].id)
  }
})

watch(() => props.active, () => {
  if (!menu.value.find(i => i.id === props.active)) {
    onClickStatMenu(menu.value[0].id)
  }
})
</script>

<template>
  <UiTabs2>
    <UiTabsItem5
      v-for="item in menu"
      :key="item.id"
      :isActive="item.id === props.active"
      class="text-nowrap"
      @click="onClickStatMenu(item.id)"
    >
      {{ item.name }}
    </UiTabsItem5>
  </UiTabs2>
</template>
