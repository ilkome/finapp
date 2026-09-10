<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { ComponentPublicInstance } from 'vue'

import { statConfigOverlayOwnerKey } from '~/components/stat/injectionKeys'
import { trnsSelectionKey } from '~/components/trns/injectionKeys'

// Defaults to true so pages that always have a breakdown need not pass it; an absent
// Boolean prop would cast to false and forward that to StatConfigView.
const props = withDefaults(defineProps<{
  backSkipPattern?: RegExp
  backTo?: string
  compactBottom?: boolean
  menuItems?: DropdownMenuItem[][]
  sticky?: boolean
}>(), {
  sticky: true,
})

const trnsSelection = inject(trnsSelectionKey, null)
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

    <template v-if="trnsSelection?.count.value" #selected>
      <TrnsSelectionBar />
    </template>

    <template #actions>
      <div class="flex items-center">
        <StatConfigModal>
          <StatConfigView />
        </StatConfigModal>

        <UDropdownMenu
          v-if="props.menuItems"
          :content="{ align: 'end' }"
          :items="props.menuItems"
          :modal="false"
        >
          <UTooltip :text="$t('base.moreOptions')">
            <UiActionButton :ariaLabel="$t('base.moreOptions')">
              <Icon name="lucide:ellipsis-vertical" size="20" />
            </UiActionButton>
          </UTooltip>
        </UDropdownMenu>
      </div>
    </template>
  </UiHeader>
</template>
