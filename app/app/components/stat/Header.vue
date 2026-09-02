<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue'

import type { CategoryId } from '~/components/categories/types'
import type { TrnId } from '~/components/trns/types'

import { statConfigOverlayOwnerKey } from '~/components/stat/injectionKeys'

// Defaults to true so pages that always have a breakdown need not pass it; an absent
// Boolean prop would cast to false and forward that to StatConfigView.
const props = withDefaults(defineProps<{
  backSkipPattern?: RegExp
  backTo?: string
  compactBottom?: boolean
  configCategories?: boolean
  configWallets?: boolean
  hasCategoryBreakdown?: boolean
  preCategoriesIds?: CategoryId[]
  sticky?: boolean
  trnsIds?: TrnId[]
}>(), {
  hasCategoryBreakdown: true,
  sticky: true,
})

const isPopoverOpen = ref(false)
provide(statConfigOverlayOwnerKey, useId())

type UiHeaderInstance = ComponentPublicInstance & {
  mainElement: HTMLElement | null
  rootElement: HTMLElement | null
}

const uiHeader = useTemplateRef<UiHeaderInstance>('uiHeader')
const stickyMainElement = computed(() => uiHeader.value?.mainElement)
const stickyRootElement = computed(() => uiHeader.value?.rootElement)

defineExpose({ stickyMainElement, stickyRootElement })
</script>

<template>
  <UiHeader
    ref="uiHeader"
    :backSkipPattern="backSkipPattern"
    :backTo="backTo"
    :compactBottom="props.compactBottom"
    :sticky="props.sticky"
  >
    <slot name="title" />

    <template #actions>
      <div class="flex items-center">
        <StatViewsModal />
        <StatConfigModal>
          <StatConfigView
            :hasCategoryBreakdown
            :hasTrnsConfig="!!configCategories && trnsIds !== undefined"
            :isShowWallets="!!configWallets"
          />
        </StatConfigModal>

        <BottomSheetOrDropdown
          v-if="$slots.popover"
          :isOpen="isPopoverOpen"
          @openModal="isPopoverOpen = true"
          @closeModal="isPopoverOpen = false"
        >
          <template #trigger>
            <UTooltip :text="$t('base.moreOptions')">
              <UiActionButton :ariaLabel="$t('base.moreOptions')">
                <Icon name="lucide:ellipsis-vertical" size="20" />
              </UiActionButton>
            </UTooltip>
          </template>

          <template #content="{ close }">
            <slot name="popover" :close />
          </template>
        </BottomSheetOrDropdown>
      </div>
    </template>
  </UiHeader>
</template>
