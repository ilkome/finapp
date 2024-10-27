<script setup lang="ts">
import { colorsWithoutShades } from '~/components/color/colors'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'

const props = defineProps<{
  activeColor?: string
  icon?: string
  isCategory?: boolean
}>()

const emit = defineEmits<{
  click: [color: string]
}>()

const categoriesStore = useCategoriesStore()

function findCategoryIconByColor(color: string) {
  return categoriesStore.categoriesRootIds.map(id => categoriesStore.items[id]).find(c => c?.color === color)?.icon
}
</script>

<template>
  <div
    v-for="(colorsGroup, groupIdx) in colorsWithoutShades"
    :key="groupIdx"
    class="pb-1"
  >
    <div class="flex gap-1">
      <div
        v-for="(color, idx) in colorsGroup"
        :key="idx"
        class="w-full overflow-hidden rounded border-2 border-transparent"
        :class="[{ '!border-accent-1 !shadow': color === props.activeColor, 'pointer-events-none': !color }]"
        @click="emit('click', color)"
      >
        <div class="flex-center h-10" :style="{ background: color }">
          <div
            v-if="isCategory && (findCategoryIconByColor(color) || color === props.activeColor)"
            :class="props.activeColor === color ? props.icon : findCategoryIconByColor(color)"
            class="text-2xl"
          />
        </div>
      </div>
    </div>
  </div>
</template>
