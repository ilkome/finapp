<script setup lang="ts">
const { $store } = useNuxtApp()
const categoriesRootIds = computed(() => $store.getters['categories/categoriesRootIds'])
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
        UiIconAdd.w-5.h-5.group-hover_text-white

  //- List
  .pt-1.pb-12.px-2
    CategoriesList(
      :ids="categoriesRootIds"
      @onClick="catId => $router.push(`/categories/${catId}`)"
    )

  template(#bottom)
    .pb-4.px-2.flex.justify-evenly.gap-6
      //- Create
      .cursor-pointer.grow.py-3.px-5.flex-center.rounded-full.text-sm.bg-skin-item-main-bg.hocus_bg-skin-item-main-hover(
        class="basis-1/2 max-w-[280px]"
        @click="$router.push('/categories/new')"
      ) {{ $t('categories.new') }}
</template>
