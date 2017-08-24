<template lang="pug">
div
  template(v-if="error")
    .error {{ error }}

  CategoryItemForm(
    :values="values",
    :onSubmit="editCategory"
  )
</template>

<script>
import CategoryItemForm from './CategoryForm.vue'

export default {
  components: { CategoryItemForm },

  props: {
    values: {
      type: Object,
      required: true
    }
  },

  data() {
    return {
      error: null
    }
  },

  methods: {
    async editCategory() {
      this.$store.commit('showLoader')

      const formatedValues = {
        id: Number(this.values.id),
        name: this.values.name.trim(),
        color: this.values.color ? this.values.color.trim() : '#000000',
        icon: this.values.icon.trim(),
        parentId: Number(this.values.parentId)
      }

      const sameCategory = this.$store.state.categories.all
        .filter(category => category.name === formatedValues.name && category.parentId === formatedValues.parentId)

      if (sameCategory.length) {
        this.error = 'Same category already exist!'
        this.$store.commit('closeLoader')
        return
      }

      const result = await this.$store.dispatch('updateCategory', formatedValues)
      if (result) {
        this.editCategoryId = false
        this.editCategoryValues = null
        this.error = null
        this.$store.commit('closeLoader')
      }
    }
  }

}
</script>
