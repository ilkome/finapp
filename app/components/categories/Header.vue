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

        <div class="@lg:text-xl text-lg font-semibold">
          {{ props.category.name }}
        </div>
      </div>

      <div
        v-if="props.parentCategory"
        class="@lg:text-base flex items-center pt-[3px] text-xs font-medium leading-none text-2"
      >
        <div class="text-2xs text-4">
          •
        </div>

        <div
          class="flex items-center gap-2 rounded-lg px-3 py-1 hocus:bg-item-hover"
          @click="onParentClick"
        >
          {{ props.parentCategory.name }}
        </div>
      </div>
    </div>
  </UiHeaderTitle>
</template>
