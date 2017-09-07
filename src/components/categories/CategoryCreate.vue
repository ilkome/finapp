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
    async addCategory() {
      this.$store.commit('showLoader')
      this.error = null

      const formatedValues = {
        name: this.values.name.trim(),
        color: this.values.color.trim(),
        icon: this.values.icon ? this.values.icon.trim() : 'fa fa-industry',
        parentId: this.values.parentId ? this.values.parentId.trim() : 0
      }

      const sameCategory = this.$store.state.categories.all
        .filter(category => category.name === formatedValues.name && category.parentId === formatedValues.parentId)

      if (sameCategory.length) {
        this.error = 'Same category already exist!'
        this.$store.commit('closeLoader')
        return
      }

      const result = await this.$store.dispatch('addCategory', formatedValues)
      if (result) {
        this.values.name = ''
        this.values.color = '#000000'
        this.values.icon = ''
        this.values.parentId = 0
        this.$store.commit('closeLoader')
      }
    }
  }

}
</script>
