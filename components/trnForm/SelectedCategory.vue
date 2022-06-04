<script setup lang="ts">
const { $store } = useNuxtApp()
const category = computed(() => $store.state.categories.items[$store.state.trnForm.values.categoryId])
const parentCategory = computed(() => $store.state.categories.items[category.value.parentId])
</script>

<template lang="pug">
.cursor-pointer.py-2.px-3.relative.gap-x-3.flex.items-center.rounded-md.bg-skin-item-main-bg.hocus_bg-skin-item-main-hover(
  v-if="category"
  @click="$store.commit('trnForm/showTrnFormModal', 'categories')"
)
  .w-8.h-8.flex.items-center.justify-center.rounded-full.text-xl.leading-none.text-neutral-50(
    :style="{ background: category.color }"
  ): div(:class="category.icon")

  .grow.truncate
    .text-xs.text-skin-item-base-down.dark_text-neutral-400(
      v-if="parentCategory"
    ) {{ parentCategory.name }}

    .leading-none.text-sm.text-neutral-700.dark_text-neutral-300 {{ category.name }}

  .mdi.mdi-dots-vertical.-mr-1.text-lg.text-skin-item-base-down
</template>
