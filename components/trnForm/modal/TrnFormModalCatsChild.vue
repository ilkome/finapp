<script>
// TODO: setup
export default {
  data() {
    return {
      childSelected: false,
    }
  },

  computed: {
    id() {
      return this.$store.state.trnForm.showModalCategoryId
    },
    category() {
      return this.$store.state.categories.items[this.id]
    },
    childCategoriesIds() {
      return this.$store.getters['categories/getChildCategoriesIds'](this.id)
    },
  },

  methods: {
    handleCategoryClick(categoryId, close) {
      this.childSelected = true
      this.$store.commit('trnForm/setTrnFormValues', { categoryId })
      close()
    },

    afterClose() {
      if (this.childSelected)
        this.$store.commit('trnForm/closeTrnFormModal', 'categories')

      this.$store.commit('trnForm/closeTrnFormModal', 'categoriesChild')
      this.$store.commit('trnForm/setTrnFormModalCategoryId', null)
    },
  },
}
</script>

<template lang="pug">
TrnFormModal(@closed="afterClose")
  template(#header)
    template {{ $t('categories.title') }}

  template(#default="{ close }")
    template(v-if="id && category")
      .pb-3.px-3
        CategoriesList(
          :ids="childCategoriesIds"
          class="!gap-x-1"
          @onClick="catId => handleCategoryClick(catId, close)"
        )
</template>
