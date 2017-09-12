<template lang="pug">
div
  template(v-if="error")
    .error {{ error }}

  CategoryItemForm(
    :values="values",
    v-on:onSubmit="onEditCategory"
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
    async onEditCategory(values) {
      this.$store.commit('showLoader')
      this.error = null

      const formatedValues = {
        id: values.id,
        name: values.name.trim(),
        color: values.color ? values.color.trim() : '#000000',
        icon: values.icon.trim(),
        parentId: values.parentId
      }

      const sameCategory = this.$store.state.categories.all
        .filter(category =>
          category.id === formatedValues.id &&
          category.name === formatedValues.name &&
          category.icon === formatedValues.icon &&
          category.parentId === formatedValues.parentId)

      if (sameCategory.length) {
        this.error = 'Same category is already exist!'
        this.$store.commit('closeLoader')
        return
      }

      await this.$store.dispatch('updateCategory', formatedValues)
      this.$emit('toogleEditCategory', false)
      this.$store.commit('closeLoader')
    }
  }
}
</script>
