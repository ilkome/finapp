<script setup lang="ts">
import type { MoneyTypeSlugNew } from '~/components/stat/types'

const props = defineProps<{
  active: MoneyTypeSlugNew
}>()

const emit = defineEmits<{
  click: [id: MoneyTypeSlugNew]
}>()

const { t } = useI18n()

const menu = computed(() => {
  const all: {
    id: MoneyTypeSlugNew
    name: string | unknown
  }[] = [{
    id: 'netIncome',
    name: t('money.netIncome'),
  }]

  all.push({
    id: 'expense',
    name: t('money.expense'),
  })
  all.push({
    id: 'income',
    name: t('money.income'),
  })
  all.push({
    id: 'sum',
    name: t('stat.summary'),
  })

  return all
})

function onClickStatMenu(tabName: MoneyTypeSlugNew) {
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
