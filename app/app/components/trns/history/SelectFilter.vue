<script setup lang="ts">
const props = defineProps<{
  items: Array<{ label: string, value: string }>
  modelValue: string
  title: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const isOpen = ref(false)
const selectedLabel = computed(() => props.items.find(item => item.value === props.modelValue)?.label ?? props.title)

function select(value: string, close: () => void) {
  emit('update:modelValue', value)
  close()
}
</script>

<template>
  <BottomSheetOrDropdown
    :isOpen="isOpen"
    :title="props.title"
    isShowCloseBtn
    @closeModal="isOpen = false"
    @openModal="isOpen = true"
  >
    <template #trigger="{ isActive }">
      <UiTitleDropdown :isActive>
        <span class="text-nowrap">{{ selectedLabel }}</span>
      </UiTitleDropdown>
    </template>

    <template #content="{ close }">
      <div class="grid min-w-56 gap-0.5 p-2">
        <button
          v-for="item in props.items"
          :key="item.value"
          type="button"
          class="flex min-h-10.5 items-center gap-3 rounded-sm px-3 text-left text-sm hover:bg-elevated/50"
          @click="select(item.value, close)"
        >
          <span class="grow">{{ item.label }}</span>
          <Icon v-if="item.value === props.modelValue" name="lucide:check" class="text-primary" size="18" />
        </button>
      </div>
    </template>
  </BottomSheetOrDropdown>
</template>
