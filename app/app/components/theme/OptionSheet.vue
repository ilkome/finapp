<script setup lang="ts" generic="T extends string | number">
const props = defineProps<{
  items: { label: string, value: T }[]
  label: string
}>()

const model = defineModel<T>({ required: true })
const isOpen = ref(false)

const selected = computed(() => props.items.find(i => i.value === model.value))
</script>

<template>
  <div class="flex flex-col items-start gap-1">
    <span class="text-xs text-muted">{{ props.label }}</span>

    <BottomSheetOrDropdown
      :title="props.label"
      :isOpen="isOpen"
      isPassthrough
      dragClassesCustom="sheet-preview-border"
      isShowCloseBtn
      keyboardTrigger
      @openModal="isOpen = true"
      @closeModal="isOpen = false"
    >
      <template #trigger>
        <!-- Styled after USelectMenu so it sits next to the theme select. -->
        <UButton
          color="neutral"
          variant="ghost"
          size="lg"
          trailingIcon="i-lucide-chevron-down"
          class="min-h-10.5 min-w-40 justify-between bg-elevated/30 px-4 text-highlighted ring ring-accented ring-inset hover:bg-elevated/50"
          :ui="{ trailingIcon: 'text-dimmed' }"
        >
          <template #leading>
            <slot name="swatch" :value="model" />
          </template>
          {{ selected?.label }}
        </UButton>
      </template>

      <template #content>
        <div class="flex gap-2 overflow-x-auto px-1 py-2 md:flex-wrap" data-sheet-no-drag>
          <button
            v-for="item in props.items"
            :key="item.value"
            type="button"
            class="flex shrink-0 flex-col items-center gap-1 rounded-md interactive p-2 text-xs"
            :class="item.value === model ? 'bg-elevated text-default' : 'text-muted'"
            @click="model = item.value"
          >
            <slot name="swatch" :value="item.value" />
            {{ item.label }}
          </button>
        </div>
      </template>
    </BottomSheetOrDropdown>
  </div>
</template>
