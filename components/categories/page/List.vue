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
UiPage
  UiHeader
    UiHeaderTitle {{ $t('categories.name') }}
    template(#actions)
      UiHeaderLink(@click="$router.push('/categories/new')")
        UiIconAdd.group-hover_text-white.w-6.h-6

  //- List
  .pb-12.px-3
    CategoriesList(
      :ids="catsIds"
      @onClick="catId => $router.push(`/categories/${catId}`)"
    )

  template(#bottom)
    .pb-4.px-3.flex.justify-evenly.gap-6
      //- Create
      .cursor-pointer.grow.py-3.px-5.flex-center.rounded-full.text-sm.bg-skin-item-main-bg.hocus_bg-skin-item-main-hover(
        class="basis-1/2 max-w-[280px]"
        @click="$router.push('/categories/new')"
      ) {{ $t('categories.new') }}
</template>
