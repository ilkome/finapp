<script setup lang="ts">
import useMenuData from '~/components/layout/useMenuData'

withDefaults(defineProps<{
  isShowTitle?: boolean
}>(), {
  isShowTitle: true,
})

const { items } = useMenuData()
const { t } = useI18n()
</script>

<template>
  <div class="grid gap-[2px]">
    <UButton
      :ui="{ rounded: 'rounded-lg' }"
      class="transition-all duration-150 ease-in-out"
      size="lg"
      color="gray"
      icon=""
      variant="ghost"
    >
      {{ t("demo.mode.exit") }}
    </UButton>

    <LayoutMenuSidebarItem
      v-for="(item, menuId) in items"
      :key="menuId"
      :item
      :menuId
      :isShowTitle
    />
  </div>
</template>
