<script setup lang="ts">
import type { FilterChip } from '~/components/filter/types'

const props = defineProps<{
  chips: FilterChip[]
}>()

const emit = defineEmits<{
  remove: [chip: FilterChip]
}>()

const itemClasses = 'shrink-0 rounded-md bg-elevated/30'
</script>

<template>
  <div class="flex shrink-0 gap-2">
    <UTooltip
      v-for="chip in props.chips"
      :key="chip.key"
      :text="chip.tooltip"
    >
      <WalletsItem
        v-if="chip.kind === 'wallet'"
        :class="itemClasses"
        :walletId="chip.walletId"
        :wallet="chip.wallet"
        insideClasses="min-h-9.5!"
        compact
        isShowIcon
        isShowCreditLimit
        @click="emit('remove', chip)"
      />
      <CategoriesItemView
        v-else-if="chip.kind === 'category'"
        :category="chip.category"
        :categoryId="chip.categoryId"
        :class="itemClasses"
        stacked
        insideClasses="min-h-9.5!"
        @click="emit('remove', chip)"
      />
      <UiText
        v-else
        as="button"
        type="button"
        class="flex min-h-9.5 grow-0! items-center gap-2 theme-rounded-control interactive bg-elevated px-3 pb-0"
        variant="control"
        @click="emit('remove', chip)"
      >
        <Icon :name="chip.icon" size="16" class="shrink-0 text-muted" />
        <span class="text-nowrap">{{ chip.label }}</span>
      </UiText>
    </UTooltip>
  </div>
</template>
