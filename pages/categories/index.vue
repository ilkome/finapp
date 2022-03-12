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
.h-full.overflow.overflow-x-auto
  .py-6.px-3.font-nunito.text-neutral-800.dark_text-white.text-2xl.leading-none.font-semibold
    | {{ $t('categories.name') }}

  .max-w-3xl
    .pb-4
      CategoriesListSlot(
        :ids="catsIds"
        v-slot="{ categories }"
      )
        .shame1.px-3
          CategoriesItemCategoryItem(
            v-for="category in categories"
            :category="category"
            :slider="() => ({})"
            :id="category.id"
            :key="category.id"
            @onClick="id => $router.push(`/categories/${category.id}`)"
          )

    .pb-4.px-3.flex.gap-4.pt-4
      .button(@click="$store.dispatch('ui/setActiveTab', 'createCategory')") {{ $t('categories.new') }}
</template>

<style lang="stylus" scoped>
.shame1
  display grid
  grid-template-columns repeat(2, 1fr)
  grid-column-gap $m6
  grid-row-gap $m6

  +media(600px)
    grid-template-columns repeat(auto-fill, minmax(200px, 1fr))
    grid-column-gap $m6
    grid-row-gap $m6
</style>
