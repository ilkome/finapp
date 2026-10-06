<script setup lang="ts">
import { canGoBack, navigateBackSkipping } from '~/composables/useNavigationHistory'

const { actionsAfterTitle = false, backSkipPattern, backTo, mobileAfterScrolls = false, sticky = true } = defineProps<{
  /** Actions right after the title instead of pushed to the right edge. */
  actionsAfterTitle?: boolean
  backSkipPattern?: RegExp
  backTo?: string
  mobileAfterScrolls?: boolean
  sticky?: boolean
}>()

const router = useRouter()
const rootElement = useTemplateRef<HTMLElement>('rootElement')
const mainElement = useTemplateRef<HTMLElement>('mainElement')

defineExpose({ mainElement, rootElement })

function onBack() {
  if (backTo && backSkipPattern) {
    navigateBackSkipping(router, backTo, backSkipPattern)
  }
  else if (canGoBack.value) {
    router.back()
  }
  else if (backTo) {
    router.replace(backTo)
  }
}
</script>

<template>
  <div
    ref="rootElement"
    class="bg-default/90 backdrop-blur"
    :class="[
      sticky && !mobileAfterScrolls && 'sticky top-0 z-20',
      sticky && mobileAfterScrolls && 'contents md:sticky md:top-0 md:z-20 md:block',
    ]"
  >
    <div
      ref="mainElement"
      data-ui-header-main
      class="grid max-w-7xl items-center px-2 pt-2 pb-px lg:px-4 lg:pt-6 2xl:px-8 2xl:pt-8"
      :class="[
        sticky && mobileAfterScrolls && 'sticky top-0 z-20 bg-default/90 backdrop-blur md:static md:bg-transparent md:backdrop-blur-none',
      ]"
    >
      <!-- min-h: the actions pill, so headers without actions keep the same height. -->
      <div class="flex min-h-12 grow items-center">
        <button
          v-if="backTo"
          type="button"
          :aria-label="$t('base.previous')"
          class="flex min-h-10.5 min-w-10.5 shrink-0 cursor-default items-center justify-center rounded-full interactive text-xl text-muted"
          @click="onBack"
        >
          <Icon name="lucide:arrow-left" size="20" />
        </button>

        <div class="min-w-0 overflow-x-auto">
          <slot />
        </div>

        <div
          v-if="$slots.actions"
          data-ui-header-actions
          class="ml-2 flex shrink-0 flex-nowrap items-center rounded-full border border-default/80 bg-default/20 p-0.5 dark:bg-neutral-800/50"
          :class="!actionsAfterTitle && 'ml-auto'"
        >
          <slot name="actions" />
        </div>
      </div>

      <div
        v-if="$slots.selected"
        class="grid"
      >
        <slot name="selected" />
      </div>
    </div>

    <div
      v-if="$slots.after"
      class="grid gap-2 pt-1 pb-2"
      :class="sticky && mobileAfterScrolls && 'bg-default/90 backdrop-blur md:bg-transparent md:backdrop-blur-none'"
    >
      <slot name="after" />
    </div>
  </div>
</template>
