<script>
export default defineComponent({
  setup () {

  },

  head () {
    return {
      title: this.$t('categories.title')
    }
  }
})
</script>

<template lang="pug">
LayoutBaseWrap(:contentPadding="false")
  template(slot="content")
    .header {{ $t('categories.name') }}
    CategoriesListSlot(
      :ids="$store.getters['categories/categoriesRootIds']"
      v-slot="{ categories }"
    )
      .shame1
        CategoriesItemCategoryItem(
          v-for="category in categories"
          :category="category"
          :id="category.id"
          :key="category.id"
          @onClick="$store.dispatch('categories/showCategoryModal', category.id)"
        )

  template(slot="bottom")
    .buttons
      .button(@click="$store.dispatch('ui/setActiveTab', 'createCategory')") {{ $t('categories.new') }}
</template>

<style lang="stylus" scoped>
.shame1
  display grid
  grid-template-columns repeat(2, 1fr)
  grid-column-gap $m6
  grid-row-gap $m6
  padding 0 $m7

  +media(600px)
    grid-template-columns repeat(auto-fill, minmax(200px, 1fr))
    grid-column-gap $m6
    grid-row-gap $m6

.header
  header-title()

.buttons
  display flex
  gap $m8

.button
  button-base-1()
  margin-top $m7
</style>
