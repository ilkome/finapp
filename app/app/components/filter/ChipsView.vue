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
      <CategoriesItem
        v-else-if="chip.kind === 'category'"
        :category="chip.category"
        :categoryId="chip.categoryId"
        :class="itemClasses"
        stacked
        insideClasses="min-h-9.5!"
        @click="emit('remove', chip)"
      />
      <button
        v-else
        type="button"
        :class="cn(itemClasses, 'flex min-h-9.5 items-center gap-2 interactive px-3 text-sm hover:bg-elevated/50')"
        @click="emit('remove', chip)"
      >
        <Icon :name="chip.icon" size="16" class="text-muted" />
        <span class="text-nowrap">{{ chip.label }}</span>
      </button>
    </UTooltip>
  </div>
</template>
