<script setup lang="ts">
import type { useWalletsStatistics } from '~/components/wallets/useWalletsStatistics'

const props = defineProps<{
  statistics: ReturnType<typeof useWalletsStatistics>
}>()

const { t } = useI18n()
</script>

<template>
  <UPopover
    :content="{ align: 'end', avoidCollisions: false, collisionPadding: 8, side: 'bottom', sideOffset: 4 }"
    :ui="{ content: 'z-[80] w-80 max-w-[calc(100vw-1rem)]' }"
  >
    <button
      type="button"
      :aria-label="t('props.statistics.hints')"
      class="ml-auto flex size-8 items-center justify-center rounded-sm text-muted group-hover:bg-accented hover:bg-accented"
      @click.stop
    >
      <Icon name="lucide:info" size="18" />
    </button>

    <template #content>
      <div
        class="scroller grid gap-3 overflow-y-auto p-3"
        style="max-height: var(--reka-popper-available-height, 60dvh)"
      >
        <div v-for="row in props.statistics.hintRows.value" :key="row.id">
          <UiText variant="navigation">
            {{ row.title }}
          </UiText>

          <UiText variant="meta" class="pt-1 leading-snug!">
            {{ row.hint }}
          </UiText>
        </div>
      </div>
    </template>
  </UPopover>
</template>
