<script setup lang="ts">
const { $store } = useNuxtApp()

const catsIds = computed(() => $store.getters['categories/categoriesRootIds']?.sort((a, b) => {
  if ($store.state.categories.items[a].name < $store.state.categories.items[b].name) return -1
  if ($store.state.categories.items[a].name > $store.state.categories.items[b].name) return 1
  return 0
}))
</script>

<script lang="ts">
export default defineComponent({
  head() {
    return {
      title: this.$t('categories.title'),
    }
  },
})
</script>

<template lang="pug">
.overflow.overflow-x-auto.h-full.grid.max-w-3xl(
  class="md_pb-[52px] pb-[44px] lg_pb-0 grid-rows-[1fr_auto]"
)
  div
    //- Header
    //---------------------------------
    .flex
      //- Title
      .grow.py-6.px-3.font-nunito.text-neutral-800.dark_text-white.text-2xl.leading-none.font-semibold
        | {{ $t('categories.name') }}

      //- Actions
      .flex-center.gap-3.pr-3
        //- Add
        .cursor-pointer.group.w-10.h-10.flex-center.rounded-full.bg-gray-50.dark_bg-dark5.hocus-text-white.hocus_bg-blue2(
          @click="$store.dispatch('ui/setActiveTab', 'createCategory')"
        )
          svg.group-hover_text-white.w-6.h-6(xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12")
            path(fill="currentColor" d="M6 1.5a.5.5 0 0 0-1 0V5H1.5a.5.5 0 0 0 0 1H5v3.5a.5.5 0 0 0 1 0V6h3.5a.5.5 0 0 0 0-1H6V1.5Z")

    //- List
    //---------------------------------
    CategoriesListSlot(
      :ids="catsIds"
      v-slot="{ categories }"
    )
      .pb-12.px-3.grid.gap-y-1.gap-x-2.2sm_grid-cols-2.sm_gap-x-6
          CategoriesItemCategoryItem(
            v-for="category in categories"
            :category="category"
            :slider="() => ({})"
            :id="category.id"
            :key="category.id"
            @onClick="id => $router.push(`/categories/${category.id}`)"
          )

  .pb-4.px-3.flex.justify-evenly.gap-6
    //- Create
    .cursor-pointer.grow.py-3.px-5.flex-center.rounded-full.text-sm.bg-skin-item-main-bg.hocus_bg-skin-item-main-hover(
      class="basis-1/2 max-w-[280px]"
      @click="$store.dispatch('ui/setActiveTab', 'createCategory')"
    ) {{ $t('categories.new') }}
</template>
