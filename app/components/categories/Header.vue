<script setup lang="ts">
import type { CategoryItem } from '~/components/categories/types'

const props = defineProps<{
  category: CategoryItem
  parentCategory?: CategoryItem
}>()

const router = useRouter()

function onParentClick() {
  router.push(`/categories/${props.category.parentId}`)
}
</script>

<template>
  <UiHeaderTitle>
    <div class="-mx-3 flex items-center">
      <div
        class="flex items-center gap-2 rounded-lg px-3 py-1"
      >
        <Icon
          :name="props.category.icon"
          :style="{ color: props.category.color }"
          class="mt-[-2px] size-5"
        />

        <div class="text-lg font-semibold @lg:text-xl">
          {{ props.category.name }}
        </div>
      </div>

      <div
        v-if="props.parentCategory"
        class="text-2 flex items-center pt-[3px] text-xs leading-none font-medium @lg:text-base"
      >
        <div class="text-2xs text-4">
          •
        </div>

        <div
          class="flex items-center gap-2 rounded-lg px-3 py-1 hover:bg-[var(--item-5)]"
          @click="onParentClick"
        >
          {{ props.parentCategory.name }}
        </div>
      </div>
    </div>
  </UiHeaderTitle>
</template>
