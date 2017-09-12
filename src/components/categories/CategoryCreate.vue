<template lang="pug">
.panel._mb
  h4.title._mbs Create category
  template(v-if="error")
    .error {{ error }}

  CategoryItemForm(
    :values="values",
    v-on:onSubmit="addCategory"
  )
</template>

<script>
import CategoryItemForm from './CategoryForm.vue'

export default {
  components: { CategoryItemForm },

  data() {
    return {
      values: {
        name: '',
        color: '#000000',
        icon: '',
        parentId: ''
      },
      error: null
    }
  },

  methods: {
    async addCategory(values) {
      this.$store.commit('showLoader')
      this.error = null

      const formatedValues = {
        name: values.name.trim(),
        color: values.color.trim(),
        icon: values.icon ? values.icon.trim() : 'fa fa-industry',
        parentId: values.parentId ? values.parentId.trim() : 0
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

      await this.$store.dispatch('addCategory', formatedValues)
      this.values.name = ''
      this.values.color = '#000000'
      this.values.icon = ''
      this.values.parentId = 0
      this.$store.commit('closeLoader')
    }
  }

}
</script>
