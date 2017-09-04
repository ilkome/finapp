<template lang="pug">
div
  template(v-if="error")
    .error {{ error }}

  CategoryItemForm(
    :values="values",
    :onSubmit="$emit('onEditCategory', values)"
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
  }
}
</script>
