<script setup lang="ts">
const { $store, nuxt2Context: { i18n } } = useNuxtApp()
const categoriesRootIds = computed(() => $store.getters['categories/categoriesRootIds'])

useHead({
  title: i18n.t('categories.title'),
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
      @click="catId => $router.push(`/categories/${catId}`)"
    )

  template(#bottom)
    .pb-4.px-2.flex.justify-evenly.gap-6
      //- Create
      .cursor-pointer.grow.py-3.px-5.flex-center.rounded-full.text-sm.bg-item-main-bg.hocus_bg-item-main-hover(
        class="basis-1/2 max-w-[280px]"
        @click="$router.push('/categories/new')"
      ) {{ $t('categories.new') }}
</template>
