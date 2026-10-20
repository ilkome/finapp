<script setup lang="ts">
import type { CategoriesViewScope } from '~/composables/useCategoriesViewSettings'

import { useCategoriesViewSettings } from '~/composables/useCategoriesViewSettings'

const props = defineProps<{
  scope?: CategoriesViewScope
}>()

const { t } = useI18n()
const { backgroundType, childrenView, isRoundIcon, isShowChildrenCount } = useCategoriesViewSettings(props.scope)

const isOpen = ref(false)

const backgroundTypeItems = computed(() => ['category', 'standard'].map(value => ({
  label: t(`stat.config.categories.list.backgroundTypes.${value}`),
  value,
})))
const childrenViewItems = computed(() => ['list', 'grid'].map(value => ({
  label: t(`categories.view.childrenViews.${value}`),
  value,
})))
</script>

<template>
  <DrawerOrDropdown
    v-model:open="isOpen"
    align="end"
    isShowCloseBtn
    popoverBodyClass="md:pb-3!"
    popoverContentClass="z-[80] w-80 max-w-[calc(100vw-1rem)]"
    :title="t('stat.config.menu.label')"
  >
    <template #trigger>
      <slot name="trigger">
        <UTooltip :text="t('stat.config.menu.label')">
          <UiActionButton :ariaLabel="t('stat.config.menu.label')">
            <Icon name="lucide:settings-2" size="20" />
          </UiActionButton>
        </UTooltip>
      </slot>
    </template>

    <template #content>
      <div class="pb-3 md:pb-0">
        <StatConfigFieldRow :title="t('stat.config.categories.list.backgroundType')">
          <USelect
            data-reka-swipe-ignore
            class="w-40 shrink-0"
            :aria-label="t('stat.config.categories.list.backgroundType')"
            :content="{ position: 'item-aligned' }"
            :items="backgroundTypeItems"
            :modelValue="backgroundType"
            :ui="{ content: 'z-[90]' }"
            @update:modelValue="value => backgroundType = value as 'category' | 'standard'"
          />
        </StatConfigFieldRow>

        <StatConfigFieldRow :title="t('categories.view.childrenView')">
          <USelect
            data-reka-swipe-ignore
            class="w-40 shrink-0"
            :aria-label="t('categories.view.childrenView')"
            :content="{ position: 'item-aligned' }"
            :items="childrenViewItems"
            :modelValue="childrenView"
            :ui="{ content: 'z-[90]' }"
            @update:modelValue="value => childrenView = value as 'grid' | 'list'"
          />
        </StatConfigFieldRow>

        <UiSwitchItem
          :checkboxValue="isShowChildrenCount"
          :title="t('categories.view.showChildrenCount')"
          trailing
          @toggle="isShowChildrenCount = !isShowChildrenCount"
        />

        <UiSwitchItem
          :checkboxValue="isRoundIcon"
          :title="t('stat.catButtons.isRoundIcon')"
          trailing
          @toggle="isRoundIcon = !isRoundIcon"
        />
      </div>
    </template>
  </DrawerOrDropdown>
</template>
